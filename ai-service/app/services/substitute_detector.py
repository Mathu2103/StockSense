import uuid
import datetime
import pandas as pd
from sqlalchemy import text
from sqlalchemy.orm import Session

def detect_substitutes(db: Session):
    """
    Identifies substitute products using multiple heuristic sources and writes them to the database.
    """
    print("Starting Substitute Product Detection...")

    # 1. Load active products
    query = text("""
        SELECT p.sku, p.master_id, p.selling_price, p.cost_price, 
               mc.category_id, mc.subcategory_id, mc.brand_id
        FROM products p
        JOIN master_product_class mc ON p.master_id = mc.id
        WHERE p.status = 'ACTIVE'
    """)
    rows = db.execute(query).fetchall()
    if not rows:
        print("No products found to analyze.")
        return

    products_df = pd.DataFrame(rows, columns=[
        'sku', 'master_id', 'selling_price', 'cost_price', 
        'category_id', 'subcategory_id', 'brand_id'
    ])

    substitutes_to_save = []

    # Helper function to queue substitutes
    def add_substitute_pair(p1, p2, source, score, status):
        # We save bidirectionally to simplify lookup queries
        substitutes_to_save.append({
            "product_id": p1,
            "substitute_product_id": p2,
            "source": source,
            "score": score,
            "status": status
        })
        substitutes_to_save.append({
            "product_id": p2,
            "substitute_product_id": p1,
            "source": source,
            "score": score,
            "status": status
        })

    # Method 1: PRODUCT_FAMILY (Variants of the same MasterProductClass)
    # E.g. Same family, different sizes/flavors - almost always pure substitutes!
    grouped_by_family = products_df.groupby('master_id')
    for family_id, group in grouped_by_family:
        skus = group['sku'].tolist()
        n = len(skus)
        if n < 2:
            continue
        for i in range(n):
            for j in range(i + 1, n):
                add_substitute_pair(skus[i], skus[j], "PRODUCT_FAMILY", 1.0, "CONFIRMED")

    # Method 2: CATEGORY_SIMILARITY & Brand/Price Similarity
    # Same subcategory, same brand, similar prices (within 20%) -> Very likely substitutes
    grouped_by_subcat = products_df.groupby(['subcategory_id', 'brand_id'])
    for (subcat_id, brand_id), group in grouped_by_subcat:
        if pd.isna(subcat_id) or pd.isna(brand_id):
            continue
        skus = group['sku'].tolist()
        n = len(skus)
        if n < 2:
            continue
        for i in range(n):
            p1_row = group.iloc[i]
            for j in range(i + 1, n):
                p2_row = group.iloc[j]
                
                # If they are already PRODUCT_FAMILY substitutes, skip
                if p1_row['master_id'] == p2_row['master_id']:
                    continue

                # Check price proximity (selling price within 20%)
                price_diff = abs(p1_row['selling_price'] - p2_row['selling_price']) / max(1.0, p1_row['selling_price'])
                if price_diff <= 0.20:
                    add_substitute_pair(p1_row['sku'], p2_row['sku'], "CATEGORY_SIMILARITY", 0.8, "POSSIBLE")

    # Method 3: TRANSACTION_PATTERN (Rarely bought together, high volume)
    # We fetch individual sales frequencies vs co-occurrence frequencies
    # If they are rarely/never bought in the same bill, they are mutually exclusive -> substitutes!
    sales_count_query = text("""
        SELECT sku, COUNT(DISTINCT bill_id) as tx_count
        FROM sales_bill_items bi
        JOIN sales_bills b ON bi.bill_id = b.id
        WHERE b.draft = false
        GROUP BY sku
    """)
    sales_counts = {r[0]: r[1] for r in db.execute(sales_count_query).fetchall()}

    cooccurrence_query = text("""
        SELECT bi1.sku as sku1, bi2.sku as sku2, COUNT(DISTINCT bi1.bill_id) as pair_count
        FROM sales_bill_items bi1
        JOIN sales_bill_items bi2 ON bi1.bill_id = bi2.bill_id AND bi1.sku < bi2.sku
        JOIN sales_bills b ON bi1.bill_id = b.id
        WHERE b.draft = false
        GROUP BY bi1.sku, bi2.sku
    """)
    cooccurrences = {}
    for r in db.execute(cooccurrence_query).fetchall():
        cooccurrences[(r[0], r[1])] = r[2]

    # Analyze pairs in same subcategory to see if they are transaction substitutes
    subcat_groups = products_df.groupby('subcategory_id')
    for subcat_id, group in subcat_groups:
        if pd.isna(subcat_id):
            continue
        skus = group['sku'].tolist()
        n = len(skus)
        if n < 2:
            continue
        for i in range(n):
            s1 = skus[i]
            count1 = sales_counts.get(s1, 0)
            if count1 < 30: # Only analyze items with decent sales history
                continue
            for j in range(i + 1, n):
                s2 = skus[j]
                count2 = sales_counts.get(s2, 0)
                if count2 < 30:
                    continue

                # Check if they are already added
                is_already_added = any(
                    (x['product_id'] == s1 and x['substitute_product_id'] == s2) or 
                    (x['product_id'] == s2 and x['substitute_product_id'] == s1)
                    for x in substitutes_to_save
                )
                if is_already_added:
                    continue

                pair = (min(s1, s2), max(s1, s2))
                pair_count = cooccurrences.get(pair, 0)

                # Mutual exclusivity: how often do they co-occur relative to individual sales?
                # E.g. if A is sold 100 times, B is sold 80 times, and they co-occur only 1 time:
                # overlap ratio = 1 / min(100, 80) = 1.25%
                overlap_ratio = pair_count / min(count1, count2)

                # If overlap ratio is extremely low (< 2%), they are mutually exclusive substitutes
                if overlap_ratio < 0.02:
                    add_substitute_pair(s1, s2, "TRANSACTION_PATTERN", 0.75, "POSSIBLE")

    # 2. Write to PostgreSQL using upsert pattern
    inserted_or_updated = 0
    for sub in substitutes_to_save:
        sub_id = str(uuid.uuid4())
        db.execute(text("""
            INSERT INTO product_substitute_relations (
                id, product_id, substitute_product_id, detection_source, substitute_score, status, created_at, updated_at
            ) VALUES (
                :id, :p1, :p2, :src, :score, :status, :created, :updated
            ) ON CONFLICT (product_id, substitute_product_id) DO UPDATE SET
                detection_source = EXCLUDED.detection_source,
                substitute_score = EXCLUDED.substitute_score,
                status = EXCLUDED.status,
                updated_at = EXCLUDED.updated_at
        """), {
            "id": sub_id,
            "p1": sub["product_id"],
            "p2": sub["substitute_product_id"],
            "src": sub["source"],
            "score": sub["score"],
            "status": sub["status"],
            "created": datetime.datetime.now(),
            "updated": datetime.datetime.now()
        })
        inserted_or_updated += 1

    db.commit()
    print(f"Substitute detection complete. Saved {inserted_or_updated} relations (including bidirectional entries).")
