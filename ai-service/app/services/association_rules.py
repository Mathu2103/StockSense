import uuid
import datetime
import json
import pandas as pd
import numpy as np
from sqlalchemy import text
from sqlalchemy.orm import Session

def mine_association_rules(db: Session, cutoff_date: datetime.date = None, created_by: str = "SYSTEM") -> str:
    """
    Mines association rules from sales transaction data at product and category levels.
    """
    if cutoff_date is None:
        cutoff_date = datetime.date.today()

    print(f"Starting Association Rule Mining with Cutoff Date: {cutoff_date}")

    # 1. Load Settings
    settings_query = text("SELECT setting_key, setting_value FROM combo_business_settings WHERE is_active = true")
    settings = {r[0]: r[1] for r in db.execute(settings_query).fetchall()}

    history_months = int(settings.get("ASSOCIATION_HISTORY_MONTHS", 36))
    min_support = float(settings.get("MIN_SUPPORT", 0.005))
    min_confidence = float(settings.get("MIN_CONFIDENCE", 0.30))
    min_lift = float(settings.get("MIN_LIFT", 1.10))
    min_pair_count = int(settings.get("MIN_PAIR_COUNT", 20))
    large_basket_limit = int(settings.get("LARGE_BASKET_ITEM_LIMIT", 10))

    start_date = cutoff_date - datetime.timedelta(days=history_months * 30)

    # 2. Get Transaction Count (denominator for support)
    total_tx_query = text("""
        WITH basket_sizes AS (
            SELECT bill_id, SUM(qty) as total_qty
            FROM sales_bill_items
            GROUP BY bill_id
        )
        SELECT COUNT(b.id)
        FROM sales_bills b
        JOIN basket_sizes bs ON b.id = bs.bill_id
        WHERE b.draft = false
          AND b.created_at >= :start_date
          AND b.created_at <= :cutoff_date
          AND bs.total_qty <= :large_basket_limit
    """)
    total_transactions = db.execute(total_tx_query, {
        "start_date": start_date,
        "cutoff_date": cutoff_date,
        "large_basket_limit": large_basket_limit
    }).scalar() or 0

    if total_transactions == 0:
        print("No transactions found in selected period.")
        return None

    # Create run record
    run_id = str(uuid.uuid4())
    db.execute(text("""
        INSERT INTO product_association_runs (
            id, analysis_start_date, analysis_end_date, algorithm, minimum_support, 
            minimum_confidence, minimum_lift, transaction_count, product_count, 
            status, started_at, version, created_by
        ) VALUES (
            :id, :start, :end, 'FP_GROWTH_OR_COOCCURRENCE', :min_sup, :min_conf, :min_lift, :tx_count, 0,
            'RUNNING', :started_at, 1, :created_by
        )
    """), {
        "id": run_id,
        "start": start_date,
        "end": cutoff_date,
        "min_sup": min_support,
        "min_conf": min_confidence,
        "min_lift": min_lift,
        "tx_count": total_transactions,
        "started_at": datetime.datetime.now(),
        "created_by": created_by
    })
    db.commit()

    try:
        # 3. Load product items and their details per transaction
        items_query = text("""
            WITH basket_sizes AS (
                SELECT bill_id, SUM(qty) as total_qty
                FROM sales_bill_items
                GROUP BY bill_id
            )
            SELECT bi.bill_id, bi.sku, p.master_id as family_id, mc.category_id as category_id, b.created_at as sale_date
            FROM sales_bill_items bi
            JOIN sales_bills b ON bi.bill_id = b.id
            JOIN products p ON bi.sku = p.sku
            JOIN master_product_class mc ON p.master_id = mc.id
            JOIN basket_sizes bs ON bi.bill_id = bs.bill_id
            WHERE b.draft = false
              AND b.created_at >= :start_date
              AND b.created_at <= :cutoff_date
              AND bs.total_qty <= :large_basket_limit
        """)
        rows = db.execute(items_query, {
            "start_date": start_date,
            "cutoff_date": cutoff_date,
            "large_basket_limit": large_basket_limit
        }).fetchall()

        if not rows:
            raise ValueError("No sales items found to analyze.")

        df = pd.DataFrame(rows, columns=['bill_id', 'sku', 'family_id', 'category_id', 'sale_date'])
        
        # Calculate distinct products analyzed
        distinct_products = df['sku'].nunique()

        # Update product count in run record
        db.execute(text("UPDATE product_association_runs SET product_count = :pc WHERE id = :id"), {
            "pc": distinct_products,
            "id": run_id
        })
        db.commit()

        # Group items by bill_id
        transactions_dict = df.groupby('bill_id')['sku'].apply(list).to_dict()
        category_tx_dict = df.groupby('bill_id')['category_id'].apply(list).to_dict()

        # Count individual occurrences
        product_counts = df['sku'].value_counts().to_dict()
        category_counts = df['category_id'].value_counts().to_dict()

        # Mine product association rules
        # Using a highly-optimized co-occurrence counter for 2-itemsets (product pairs)
        pair_counts = {}
        pair_dates = {} # to track first and last observed dates
        
        # Correct pair generation loop:
        for bill_id, skus in transactions_dict.items():
            unique_skus = sorted(list(set(skus)))
            n = len(unique_skus)
            if n < 2:
                continue
            
            # Get date for this transaction
            tx_date = df[df['bill_id'] == bill_id]['sale_date'].iloc[0]
            if isinstance(tx_date, str):
                tx_date = datetime.datetime.strptime(tx_date.split(' ')[0], "%Y-%m-%d").date()
            elif isinstance(tx_date, datetime.datetime):
                tx_date = tx_date.date()

            for i in range(n):
                for j in range(i + 1, n):
                    p1, p2 = unique_skus[i], unique_skus[j]
                    pair = (p1, p2)
                    pair_counts[pair] = pair_counts.get(pair, 0) + 1
                    
                    if pair not in pair_dates:
                        pair_dates[pair] = {'first': tx_date, 'last': tx_date}
                    else:
                        if tx_date < pair_dates[pair]['first']:
                            pair_dates[pair]['first'] = tx_date
                        if tx_date > pair_dates[pair]['last']:
                            pair_dates[pair]['last'] = tx_date

        # Fetch product families for rule construction
        sku_to_family = df.set_index('sku')['family_id'].to_dict()

        # Process and write product rules
        rules_inserted = 0
        for (p1, p2), count in pair_counts.items():
            if count < min_pair_count:
                continue

            # Support
            support = count / total_transactions
            if support < min_support:
                continue

            p1_count = product_counts[p1]
            p2_count = product_counts[p2]

            # Calculate rule metrics (A -> B) and (B -> A)
            # Confidence A -> B
            conf_1 = count / p1_count
            # Confidence B -> A
            conf_2 = count / p2_count

            # Lift
            support_p1 = p1_count / total_transactions
            support_p2 = p2_count / total_transactions
            lift = support / (support_p1 * support_p2)

            if lift < min_lift:
                continue

            # We write rules both ways or as A-B pair with higher confidence.
            # To meet the design spec "Use a unique constraint for associationRunId + antecedentProductId + consequentProductId"
            # and "antecedentProductId, consequentProductId", we can store rules in BOTH directions if both meet min_confidence,
            # or store the one with higher confidence, or simply store both to represent directional rules.
            # Storing BOTH directions allows proper modeling of antecedent -> consequent directional affinity!
            
            for ant, cons, conf, rev_conf, ant_cnt, cons_cnt in [
                (p1, p2, conf_1, conf_2, p1_count, p2_count),
                (p2, p1, conf_2, conf_1, p2_count, p1_count)
            ]:
                if conf < min_confidence:
                    continue

                relationship_score = float(conf * lift * 10.0) # scaled score
                
                # Determine relationship status
                if relationship_score >= 15.0:
                    status = "STRONG"
                elif relationship_score >= 5.0:
                    status = "MODERATE"
                else:
                    status = "WEAK"

                # Calculate stability counts (mocked based on duration observed, or actual check)
                dates = pair_dates.get((min(p1, p2), max(p1, p2)))
                delta_days = (dates['last'] - dates['first']).days
                stability_months = max(1, int(delta_days / 30))
                stability_years = max(1, int(delta_days / 365))

                rule_id = str(uuid.uuid4())
                
                # Save to database
                db.execute(text("""
                    INSERT INTO product_association_rules (
                        id, association_run_id, antecedent_product_id, consequent_product_id, 
                        antecedent_family_id, consequent_family_id, pair_purchase_count, 
                        antecedent_purchase_count, consequent_purchase_count, support, 
                        confidence, reverse_confidence, lift, weighted_support, 
                        stability_month_count, stability_year_count, large_basket_ratio, 
                        category_compatibility_score, family_compatibility_score, substitute_risk_score, 
                        relationship_score, relationship_status, first_observed_date, last_observed_date, 
                        created_at
                    ) VALUES (
                        :id, :run_id, :ant, :cons, :ant_fam, :cons_fam, :count, :ant_cnt, :cons_cnt,
                        :sup, :conf, :rev_conf, :lift, :w_sup, :stab_m, :stab_y, 0.0, 1.0, 1.0, 0.0,
                        :score, :status, :first_obs, :last_obs, :created_at
                    )
                """), {
                    "id": rule_id,
                    "run_id": run_id,
                    "ant": ant,
                    "cons": cons,
                    "ant_fam": sku_to_family.get(ant),
                    "cons_fam": sku_to_family.get(cons),
                    "count": count,
                    "ant_cnt": ant_cnt,
                    "cons_cnt": cons_cnt,
                    "sup": float(support),
                    "conf": float(conf),
                    "rev_conf": float(rev_conf),
                    "lift": float(lift),
                    "w_sup": float(support * lift),
                    "stab_m": stability_months,
                    "stab_y": stability_years,
                    "score": relationship_score,
                    "status": status,
                    "first_obs": dates['first'],
                    "last_obs": dates['last'],
                    "created_at": datetime.datetime.now()
                })
                rules_inserted += 1

        db.commit()
        print(f"Product association rules mined: {rules_inserted}")

        # 4. Mine Category Associations
        category_pair_counts = {}
        for bill_id, cats in category_tx_dict.items():
            unique_cats = sorted(list(set(cats)))
            n = len(unique_cats)
            if n < 2:
                continue
            for i in range(n):
                for j in range(i + 1, n):
                    c1, c2 = unique_cats[i], unique_cats[j]
                    category_pair_counts[(c1, c2)] = category_pair_counts.get((c1, c2), 0) + 1

        cat_rules_inserted = 0
        for (c1, c2), count in category_pair_counts.items():
            support = count / total_transactions
            c1_count = category_counts[c1]
            c2_count = category_counts[c2]

            conf_1 = count / c1_count
            conf_2 = count / c2_count
            lift = support / ((c1_count / total_transactions) * (c2_count / total_transactions))

            # Store category rules bidirectionally
            for src, tgt, conf in [(c1, c2, conf_1), (c2, c1, conf_2)]:
                relationship_score = float(conf * lift * 10.0)
                if relationship_score >= 12.0:
                    status = "STRONG"
                elif relationship_score >= 4.0:
                    status = "MODERATE"
                else:
                    status = "WEAK"

                cat_assoc_id = str(uuid.uuid4())
                db.execute(text("""
                    INSERT INTO category_associations (
                        id, source_category_id, target_category_id, pair_count, support, 
                        confidence, lift, relationship_score, relationship_status, 
                        analysis_run_id, updated_at
                    ) VALUES (
                        :id, :src, :tgt, :count, :sup, :conf, :lift, :score, :status, :run_id, :updated_at
                    ) ON CONFLICT (analysis_run_id, source_category_id, target_category_id) DO UPDATE SET
                        pair_count = EXCLUDED.pair_count,
                        support = EXCLUDED.support,
                        confidence = EXCLUDED.confidence,
                        lift = EXCLUDED.lift,
                        relationship_score = EXCLUDED.relationship_score,
                        relationship_status = EXCLUDED.relationship_status,
                        updated_at = EXCLUDED.updated_at
                """), {
                    "id": cat_assoc_id,
                    "src": src,
                    "tgt": tgt,
                    "count": count,
                    "sup": float(support),
                    "conf": float(conf),
                    "lift": float(lift),
                    "score": relationship_score,
                    "status": status,
                    "run_id": run_id,
                    "updated_at": datetime.datetime.now()
                })
                cat_rules_inserted += 1

        db.commit()
        print(f"Category association rules mined: {cat_rules_inserted}")

        # Mark run as completed
        db.execute(text("""
            UPDATE product_association_runs 
            SET status = 'COMPLETED', completed_at = :completed_at 
            WHERE id = :id
        """), {
            "completed_at": datetime.datetime.now(),
            "id": run_id
        })
        db.commit()

        return run_id

    except Exception as ex:
        db.rollback()
        print(f"Error during rule mining: {str(ex)}")
        db.execute(text("""
            UPDATE product_association_runs 
            SET status = 'FAILED', completed_at = :completed_at, error_message = :err
            WHERE id = :id
        """), {
            "completed_at": datetime.datetime.now(),
            "err": str(ex)[:500],
            "id": run_id
        })
        db.commit()
        raise ex
