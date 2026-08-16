import uuid
import datetime
import math
from sqlalchemy import text
from sqlalchemy.orm import Session

def generate_combo_suggestions(db: Session, forecast_run_id: str = None, association_run_id: str = None) -> int:
    """
    Analyzes inventory and forecast data to detect opportunities and generate combo suggestions.
    Returns: The number of generated suggestions.
    """
    print("Starting Combo Suggestion Generation Engine...")

    # 1. Retrieve runs if not specified
    if not forecast_run_id:
        forecast_run_id = db.execute(text("""
            SELECT id FROM demand_forecast_runs 
            WHERE status = 'COMPLETED' 
              AND id IN (SELECT forecast_run_id FROM demand_forecasts WHERE predicted_demand > 0)
            ORDER BY created_at DESC 
            LIMIT 1
        """)).scalar()

    if not association_run_id:
        association_run_id = db.execute(text("""
            SELECT id FROM product_association_runs 
            WHERE status = 'COMPLETED' 
            ORDER BY completed_at DESC 
            LIMIT 1
        """)).scalar()

    if not forecast_run_id or not association_run_id:
        print(f"Required runs missing: Forecast Run = {forecast_run_id}, Association Run = {association_run_id}")
        return 0

    # 2. Load Settings
    settings_query = text("SELECT setting_key, setting_value FROM combo_business_settings WHERE is_active = true")
    settings = {r[0]: r[1] for r in db.execute(settings_query).fetchall()}

    near_expiry_days = int(settings.get("NEAR_EXPIRY_DAYS", 45))
    dead_stock_days = int(settings.get("DEAD_STOCK_DAYS", 90))
    slow_moving_coverage = float(settings.get("SLOW_MOVING_COVERAGE_DAYS", 60))
    overstock_coverage = float(settings.get("OVERSTOCK_COVERAGE_DAYS", 90))
    min_anchor_coverage = float(settings.get("MIN_ANCHOR_STOCK_COVERAGE_DAYS", 30))
    promo_buffer_pct = float(settings.get("PROMOTIONAL_STOCK_BUFFER_PERCENT", 10)) / 100.0
    min_margin_pct = float(settings.get("DEFAULT_MINIMUM_MARGIN_PERCENT", 20)) / 100.0
    global_max_discount = float(settings.get("GLOBAL_MAX_DISCOUNT_PERCENT", 25)) / 100.0
    min_saving_pct = float(settings.get("MIN_CUSTOMER_SAVING_PERCENT", 3)) / 100.0
    suggestion_expiry = int(settings.get("SUGGESTION_EXPIRY_DAYS", 14))

    today = datetime.date.today()
    suggestion_expiry_date = today + datetime.timedelta(days=suggestion_expiry)

    # 3. Detect Substitute Mapping (to block self-competing combos)
    sub_query = text("SELECT product_id, substitute_product_id FROM product_substitute_relations WHERE status = 'CONFIRMED'")
    substitutes = {}
    for r in db.execute(sub_query).fetchall():
        if r[0] not in substitutes:
            substitutes[r[0]] = set()
        substitutes[r[0]].add(r[1])

    # 4. OPPORTUNITY DETECTION
    detected_opportunities = []

    # A. Near Expiry Batches (from GrnItem - our Batch table)
    # Filter where epd is near expiry and finalQuantity (remaining stock) > 0
    near_expiry_cutoff = today + datetime.timedelta(days=near_expiry_days)
    near_expiry_query = text("""
        SELECT gi.id, gi.sku, gi.epd, gi.final_quantity, gi.unit_cost, p.selling_price
        FROM grn_items gi
        JOIN products p ON gi.sku = p.sku
        WHERE p.status = 'ACTIVE'
          AND gi.epd IS NOT NULL
          AND gi.epd >= :today
          AND gi.epd <= :expiry_cutoff
          AND gi.final_quantity > 0
    """)
    near_expiry_batches = db.execute(near_expiry_query, {
        "today": today,
        "expiry_cutoff": near_expiry_cutoff
    }).fetchall()

    # Aggregate near expiry batches by product to ensure exactly 1 clean opportunity per product
    product_batches_map = {}
    for batch in near_expiry_batches:
        b_id, p_sku, exp_date, qty = batch[0], batch[1], batch[2], batch[3]
        if p_sku not in product_batches_map:
            product_batches_map[p_sku] = {
                "batchId": b_id,
                "expiryDate": exp_date,
                "totalQty": qty
            }
        else:
            product_batches_map[p_sku]["totalQty"] += qty
            if exp_date < product_batches_map[p_sku]["expiryDate"]:
                product_batches_map[p_sku]["expiryDate"] = exp_date
                product_batches_map[p_sku]["batchId"] = b_id

    for p_sku, b_info in product_batches_map.items():
        # Load forecast for this product if available
        forecast = db.execute(text("""
            SELECT predicted_demand, safety_stock, required_stock, stock_coverage_days 
            FROM demand_forecasts 
            WHERE forecast_run_id = :run_id AND product_id = :sku
        """), {"run_id": forecast_run_id, "sku": p_sku}).first()

        pred_demand = forecast[0] if forecast else 0
        safety_stock = forecast[1] if forecast else 0
        required_stock = forecast[2] if forecast else 0
        coverage = forecast[3] if forecast else 999.0

        days_to_exp = (b_info["expiryDate"] - today).days

        # Priority score depends on closeness to expiry and batch value
        priority = float(100 - (days_to_exp / near_expiry_days * 50))

        detected_opportunities.append({
            "targetProductId": p_sku,
            "targetBatchId": b_info["batchId"],
            "opportunityType": "NEAR_EXPIRY",
            "velocityClass": "NEAR_EXPIRY",
            "currentStock": b_info["totalQty"],
            "availableStock": b_info["totalQty"],
            "predictedDemand": pred_demand,
            "safetyStock": safety_stock,
            "requiredStock": required_stock,
            "stockCoverageDays": coverage,
            "excessStock": b_info["totalQty"], # All near expiry stock is considered excess to clear
            "daysSinceLastSale": 0,
            "expiryDate": b_info["expiryDate"],
            "daysToExpiry": days_to_exp,
            "priorityScore": priority
        })

    # B. Forecast-based Opportunities (Slow-moving, Dead Stock, Overstock)
    expiring_skus = {b["targetProductId"] for b in detected_opportunities}

    forecasts_query = text("""
        SELECT df.product_id, df.current_stock, df.predicted_demand, df.safety_stock, 
               df.required_stock, df.stock_coverage_days, p.cost_price, p.selling_price,
               da.recent_30_sales, da.primary_behaviour
        FROM demand_forecasts df
        JOIN products p ON df.product_id = p.sku
        JOIN demand_analysis da ON df.forecast_run_id = da.forecast_run_id AND df.product_id = da.product_id
        WHERE df.forecast_run_id = :forecast_run_id
          AND p.status = 'ACTIVE'
    """)
    forecasts = db.execute(forecasts_query, {"forecast_run_id": forecast_run_id}).fetchall()

    for fc in forecasts:
        sku = fc[0]
        curr_stock = fc[1]
        pred_demand = fc[2]
        safety = fc[3]
        req_stock = fc[4]
        coverage = fc[5] or 999.0
        selling_p = fc[7]
        recent_sales = fc[8]
        behavior = fc[9]

        # Skip products with no physical stock or already flagged as Near Expiry
        if curr_stock <= 0 or sku in expiring_skus:
            continue

        # Check for Dead Stock (no sales or very low sales < 10 with zero sales ratio / low movement)
        if recent_sales == 0 or behavior == "DEAD":
            priority = 85.0
            detected_opportunities.append({
                "targetProductId": sku,
                "targetBatchId": None,
                "opportunityType": "DEAD_STOCK",
                "velocityClass": "DEAD",
                "currentStock": curr_stock,
                "availableStock": curr_stock,
                "predictedDemand": pred_demand,
                "safetyStock": safety,
                "requiredStock": req_stock,
                "stockCoverageDays": coverage,
                "excessStock": curr_stock,
                "daysSinceLastSale": 90,
                "expiryDate": None,
                "daysToExpiry": None,
                "priorityScore": priority
            })
            continue

        # Check for Seasonal Excess (primary behavior is SEASONAL)
        if behavior == "SEASONAL":
            excess = max(0, curr_stock - pred_demand)
            priority = 82.0
            detected_opportunities.append({
                "targetProductId": sku,
                "targetBatchId": None,
                "opportunityType": "SEASONAL",
                "velocityClass": "SEASONAL",
                "currentStock": curr_stock,
                "availableStock": curr_stock,
                "predictedDemand": pred_demand,
                "safetyStock": safety,
                "requiredStock": req_stock,
                "stockCoverageDays": coverage,
                "excessStock": excess,
                "daysSinceLastSale": 0,
                "expiryDate": None,
                "daysToExpiry": None,
                "priorityScore": priority
            })
            continue

        # Check for Overstock (current stock exceeds required stock, coverage > 90 days)
        if curr_stock > req_stock and coverage > overstock_coverage:
            excess = curr_stock - req_stock
            priority = float(min(90.0, 40.0 + (coverage / overstock_coverage * 10)))
            detected_opportunities.append({
                "targetProductId": sku,
                "targetBatchId": None,
                "opportunityType": "OVERSTOCK",
                "velocityClass": "MEDIUM",
                "currentStock": curr_stock,
                "availableStock": curr_stock,
                "predictedDemand": pred_demand,
                "safetyStock": safety,
                "requiredStock": req_stock,
                "stockCoverageDays": coverage,
                "excessStock": excess,
                "daysSinceLastSale": 0,
                "expiryDate": None,
                "daysToExpiry": None,
                "priorityScore": priority
            })
            continue

        # Check for Slow Moving (coverage > 60 days and genuinely low sales velocity: recent sales < 30 or predicted demand < 30)
        if coverage > slow_moving_coverage and (recent_sales < 30 or pred_demand < 30 or behavior == "INTERMITTENT"):
            excess = max(0, curr_stock - pred_demand)
            priority = float(min(75.0, 30.0 + (coverage / slow_moving_coverage * 12)))
            detected_opportunities.append({
                "targetProductId": sku,
                "targetBatchId": None,
                "opportunityType": "SLOW_MOVING",
                "velocityClass": "SLOW",
                "currentStock": curr_stock,
                "availableStock": curr_stock,
                "predictedDemand": pred_demand,
                "safetyStock": safety,
                "requiredStock": req_stock,
                "stockCoverageDays": coverage,
                "excessStock": excess,
                "daysSinceLastSale": 5,
                "expiryDate": None,
                "daysToExpiry": None,
                "priorityScore": priority
            })

    # Load all products that currently have active or drafted combo campaigns
    active_target_products_query = text("""
        SELECT DISTINCT ci.product_id 
        FROM combo_items ci
        JOIN combos c ON ci.combo_id = c.id
        WHERE ci.role = 'TARGET'
          AND c.status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'ACTIVE')
          AND c.end_date >= CURRENT_DATE
    """)
    converted_target_products = {r[0] for r in db.execute(active_target_products_query).fetchall()}

    # Save detected opportunities to database
    opportunities_map = {}
    for opp in detected_opportunities:
        opp_id = str(uuid.uuid4())
        initial_status = 'CONVERTED' if opp["targetProductId"] in converted_target_products else 'DETECTED'

        result = db.execute(text("""
            INSERT INTO combo_opportunities (
                id, forecast_run_id, association_run_id, seasonal_event_id, target_product_id, 
                target_batch_id, opportunity_type, velocity_class, current_stock, available_stock, 
                predicted_demand, safety_stock, required_stock, stock_coverage_days, excess_stock, 
                days_since_last_sale, expiry_date, days_to_expiry, priority_score, 
                opportunity_status, detected_at, expires_at, created_at, updated_at
            ) VALUES (
                :id, :forecast_run, :assoc_run, NULL, :target_product, :target_batch, :opp_type, :vel_class,
                :curr_stock, :avail_stock, :pred_demand, :safety, :required, :coverage, :excess, :days_since,
                :exp_date, :days_to, :priority, :opp_status, :detected, :expires, :created, :updated
            ) ON CONFLICT (forecast_run_id, association_run_id, target_product_id, target_batch_id, opportunity_type) 
            DO UPDATE SET
                current_stock = EXCLUDED.current_stock,
                available_stock = EXCLUDED.available_stock,
                priority_score = EXCLUDED.priority_score,
                opportunity_status = CASE 
                    WHEN combo_opportunities.opportunity_status = 'CONVERTED' THEN 'CONVERTED'
                    WHEN EXCLUDED.opportunity_status = 'CONVERTED' THEN 'CONVERTED'
                    ELSE combo_opportunities.opportunity_status 
                END,
                updated_at = EXCLUDED.updated_at
            RETURNING id
        """), {
            "id": opp_id,
            "forecast_run": forecast_run_id,
            "assoc_run": association_run_id,
            "target_product": opp["targetProductId"],
            "target_batch": opp["targetBatchId"],
            "opp_type": opp["opportunityType"],
            "vel_class": opp["velocityClass"],
            "curr_stock": opp["currentStock"],
            "avail_stock": opp["availableStock"],
            "pred_demand": opp["predictedDemand"],
            "safety": opp["safetyStock"],
            "required": opp["requiredStock"],
            "coverage": float(opp["stockCoverageDays"]) if opp.get("stockCoverageDays") is not None else 999.0,
            "excess": opp["excessStock"],
            "days_since": opp["daysSinceLastSale"],
            "exp_date": opp["expiryDate"],
            "days_to": opp["daysToExpiry"],
            "priority": opp["priorityScore"],
            "opp_status": initial_status,
            "detected": datetime.datetime.now(),
            "expires": suggestion_expiry_date,
            "created": datetime.datetime.now(),
            "updated": datetime.datetime.now()
        })
        actual_id = result.fetchone()[0]
        opportunities_map[(opp["targetProductId"], opp["targetBatchId"], opp["opportunityType"])] = actual_id

    db.commit()
    print(f"Detected Opportunities written: {len(detected_opportunities)}")

    # 5. SUGGESTION GENERATION
    suggestions_created = 0

    # Fetch product metadata (cost price, selling price, categories) to build combinations
    product_meta_query = text("""
        SELECT p.sku, p.cost_price, p.selling_price, mc.category_id
        FROM products p
        JOIN master_product_class mc ON p.master_id = mc.id
    """)
    products_meta = {r[0]: {"cost": r[1], "price": r[2], "cost_price": r[1], "selling_price": r[2], "cat": r[3]} for r in db.execute(product_meta_query).fetchall()}

    # Load currently active/approved combo commitments to avoid double-booking anchor inventory
    active_combos_query = text("""
        SELECT ci.product_id, COALESCE(SUM(ci.quantity * (c.maximum_quantity - c.sold_quantity)), 0) AS reserved_qty
        FROM combo_items ci
        JOIN combos c ON ci.combo_id = c.id
        WHERE c.status IN ('ACTIVE', 'APPROVED', 'SUBMITTED')
          AND c.end_date >= CURRENT_DATE
        GROUP BY ci.product_id
    """)
    active_reservations = {r[0]: int(r[1]) for r in db.execute(active_combos_query).fetchall()}

    # Collect problem SKUs so they are never recommended as Anchor companions
    problem_skus = {opp["targetProductId"] for opp in detected_opportunities if opp["opportunityType"] in ("DEAD_STOCK", "NEAR_EXPIRY", "SLOW_MOVING")}

    # Group demand forecasts to lookup anchor health quickly
    anchor_health = {fc[0]: {"stock": fc[1], "demand": fc[2], "coverage": fc[5] or 999.0, "vel": fc[9]} for fc in forecasts}

    for opp in detected_opportunities:
        target_sku = opp["targetProductId"]
        opp_id = opportunities_map.get((target_sku, opp["targetBatchId"], opp["opportunityType"]))
        if not opp_id:
            continue

        target_meta = products_meta.get(target_sku)
        if not target_meta:
            continue

        # Find association rules where target is antecedent
        rules_query = text("""
            SELECT id, consequent_product_id, support, confidence, lift, relationship_score, pair_purchase_count 
            FROM product_association_rules
            WHERE association_run_id = :assoc_run
              AND antecedent_product_id = :target_sku
              AND relationship_status != 'REJECTED'
            ORDER BY relationship_score DESC
        """)
        rules = db.execute(rules_query, {
            "assoc_run": association_run_id,
            "target_sku": target_sku
        }).fetchall()

        # Fallback 1: Bidirectional lookup where target is the consequent
        if not rules:
            bi_rules_query = text("""
                SELECT id, antecedent_product_id, support, confidence, lift, relationship_score, pair_purchase_count 
                FROM product_association_rules
                WHERE association_run_id = :assoc_run
                  AND consequent_product_id = :target_sku
                  AND relationship_status != 'REJECTED'
                ORDER BY relationship_score DESC
            """)
            rules = db.execute(bi_rules_query, {
                "assoc_run": association_run_id,
                "target_sku": target_sku
            }).fetchall()

        # Fallback 2: Category association rules or top fast-moving staples
        if not rules and target_meta.get("cat"):
            cat_rules = db.execute(text("""
                SELECT target_category_id, support, confidence, lift 
                FROM category_associations
                WHERE analysis_run_id = :assoc_run
                  AND (source_category_id = :cat OR target_category_id = :cat)
                ORDER BY lift DESC
                LIMIT 3
            """), {"assoc_run": association_run_id, "cat": target_meta["cat"]}).fetchall()

            for cr in cat_rules:
                comp_cat = cr[0] if cr[0] != target_meta["cat"] else target_meta["cat"]
                comp_prods = db.execute(text("""
                    SELECT p.sku 
                    FROM products p
                    JOIN master_product_class mc ON p.master_id = mc.id
                    WHERE mc.category_id = :cat AND p.status = 'ACTIVE' AND p.sku != :sku
                    LIMIT 2
                """), {"cat": comp_cat, "sku": target_sku}).fetchall()

                for cp in comp_prods:
                    rules.append((None, cp[0], float(cr[1]), float(cr[2]), float(cr[3]), float(cr[3] * cr[2]), 10))

        if not rules:
            continue

        candidates = []
        for r in rules:
            rule_id = r[0]
            anchor_sku = r[1]
            sup = r[2]
            conf = r[3]
            lift = r[4]
            rel_score = r[5]
            pair_purchase_cnt = r[6]

            # Enforce duplicate / substitute rule: Substitutes cannot be complementary items
            if target_sku in substitutes and anchor_sku in substitutes[target_sku]:
                continue
            if target_sku == anchor_sku:
                continue

            # Anchor MUST NOT be a Dead Stock, Near Expiry, or Slow Moving item
            if anchor_sku in problem_skus:
                continue

            anchor_meta = products_meta.get(anchor_sku)
            if not anchor_meta:
                continue

            # Ensure anchor has healthy stock levels and is NOT a dead stock or expiring item itself
            health = anchor_health.get(anchor_sku)
            if not health:
                continue

            # Anchor MUST have active customer demand (> 0) and cannot be dead stock/critical item
            if health["demand"] <= 0 or health["stock"] <= 0:
                continue

            # Deduct active combo locks and regular walk-in sales buffer
            locked_stock = active_reservations.get(anchor_sku, 0)
            net_free_stock = max(0, health["stock"] - locked_stock)
            regular_sales_buffer = int(health["demand"] * 1.15) # 30-day forecasted demand + 15% safety buffer
            safe_promo_stock = max(0, net_free_stock - regular_sales_buffer)

            # If all stock is committed to active combos or needed for walk-in shoppers, skip this anchor
            if safe_promo_stock < 5:
                continue

            # Anchor stock coverage check (must cover anchor demand + minimum coverage threshold)
            if health["coverage"] < min_anchor_coverage:
                continue

            # Calculate scorecards
            profitability = float((anchor_meta["price"] - anchor_meta["cost"]) / max(1.0, anchor_meta["price"]))
            stock_safety = float(min(1.0, health["coverage"] / 100.0))
            
            # Final ranking score (Weighted sum: 50% association score, 25% profitability, 25% stock safety)
            comp_score = float(conf * 100)
            final_score = float((comp_score * 0.5) + (profitability * 100 * 0.25) + (stock_safety * 100 * 0.25))

            candidates.append({
                "anchorProductId": anchor_sku,
                "associationRuleId": rule_id,
                "pairPurchaseCount": int(pair_purchase_cnt),
                "support": sup,
                "confidence": conf,
                "lift": lift,
                "relationshipScore": rel_score,
                "anchorVelocityClass": health["vel"],
                "anchorCurrentStock": health["stock"],
                "anchorPredictedDemand": health["demand"],
                "anchorSafetyStock": regular_sales_buffer,
                "anchorPromotionalStock": safe_promo_stock,
                "anchorStockCoverageDays": health["coverage"],
                "anchorStockOutRisk": 0.0,
                "normalProfitContribution": profitability,
                "compatibilityScore": comp_score,
                "stockSafetyScore": stock_safety * 100,
                "profitabilityScore": profitability * 100,
                "finalCandidateScore": final_score
            })

        default_rule_id = db.execute(text("SELECT id FROM product_association_rules WHERE association_run_id = :assoc_run LIMIT 1"), {"assoc_run": association_run_id}).scalar() or db.execute(text("SELECT id FROM product_association_rules ORDER BY created_at DESC LIMIT 1")).scalar()

        # Fallback 3: If no candidate passed strict pair filters, pick top healthy fast-moving anchors with high surplus stock
        if not candidates:
            top_anchors_query = text("""
                SELECT df.product_id, df.current_stock, df.predicted_demand, df.stock_coverage_days, p.selling_price, p.cost_price, da.primary_behaviour
                FROM demand_forecasts df
                JOIN products p ON df.product_id = p.sku
                JOIN demand_analysis da ON df.forecast_run_id = da.forecast_run_id AND df.product_id = da.product_id
                WHERE df.forecast_run_id = :fid
                  AND p.status = 'ACTIVE'
                  AND df.product_id != :target_sku
                  AND df.product_id NOT IN (
                      SELECT target_product_id FROM combo_opportunities 
                      WHERE opportunity_type IN ('DEAD_STOCK', 'NEAR_EXPIRY')
                        AND opportunity_status NOT IN ('IGNORED', 'EXPIRED')
                  )
                  AND df.current_stock > (df.predicted_demand * 1.15 + 10)
                ORDER BY df.predicted_demand DESC, df.stock_coverage_days DESC
                LIMIT 3
            """)
            top_anchors = db.execute(top_anchors_query, {"fid": forecast_run_id, "target_sku": target_sku}).fetchall()
            for ta in top_anchors:
                a_sku = ta[0]
                a_stock = ta[1]
                a_demand = ta[2]
                a_cov = ta[3] or 999.0
                a_price = ta[4]
                a_cost = ta[5]
                a_vel = ta[6]
                safe_promo = max(10, int(a_stock - (a_demand * 1.15)))
                profitability = float((a_price - a_cost) / max(1.0, a_price))
                stock_safety = float(min(1.0, a_cov / 100.0))
                final_score = float((20.0 * 0.5) + (profitability * 100 * 0.25) + (stock_safety * 100 * 0.25))
                candidates.append({
                    "anchorProductId": a_sku,
                    "associationRuleId": default_rule_id,
                    "pairPurchaseCount": 10,
                    "support": 0.02,
                    "confidence": 0.20,
                    "lift": 1.15,
                    "relationshipScore": 2.3,
                    "anchorVelocityClass": a_vel,
                    "anchorCurrentStock": a_stock,
                    "anchorPredictedDemand": a_demand,
                    "anchorSafetyStock": int(a_demand * 1.15),
                    "anchorPromotionalStock": safe_promo,
                    "anchorStockCoverageDays": a_cov,
                    "anchorStockOutRisk": 0.0,
                    "normalProfitContribution": profitability,
                    "compatibilityScore": 20.0,
                    "stockSafetyScore": stock_safety * 100,
                    "profitabilityScore": profitability * 100,
                    "finalCandidateScore": final_score
                })

        if not candidates:
            continue

        # Sort and rank candidates
        candidates = sorted(candidates, key=lambda x: x["finalCandidateScore"], reverse=True)
        for idx, cand in enumerate(candidates):
            cand["candidateRank"] = idx + 1
            cand["status"] = "ELIGIBLE" if idx < 3 else "NOT_SELECTED"

            # Insert candidates to database
            db.execute(text("""
                INSERT INTO combo_anchor_candidates (
                    id, opportunity_id, anchor_product_id, association_rule_id, pair_purchase_count, 
                    support, confidence, lift, relationship_score, anchor_velocity_class, 
                    anchor_current_stock, anchor_predicted_demand, anchor_safety_stock, 
                    anchor_promotional_stock, anchor_stock_coverage_days, anchor_stock_out_risk, 
                    normal_profit_contribution, compatibility_score, stock_safety_score, 
                    profitability_score, final_candidate_score, candidate_rank, 
                    rejection_reason, status, created_at
                ) VALUES (
                    :id, :opp_id, :anchor_prod, :rule_id, :pair_count, :sup, :conf, :lift, :rel_score,
                    :vel, :stock, :demand, :safety, :promotional, :coverage, :out_risk, :profit,
                    :comp, :safety_s, :profit_s, :final, :rank, NULL, :status, :created
                ) ON CONFLICT (opportunity_id, anchor_product_id) DO UPDATE SET
                    final_candidate_score = EXCLUDED.final_candidate_score,
                    candidate_rank = EXCLUDED.candidate_rank,
                    status = EXCLUDED.status
            """), {
                "id": str(uuid.uuid4()),
                "opp_id": opp_id,
                "anchor_prod": cand["anchorProductId"],
                "rule_id": cand["associationRuleId"] or default_rule_id,
                "pair_count": cand["pairPurchaseCount"],
                "sup": cand["support"],
                "conf": cand["confidence"],
                "lift": cand["lift"],
                "rel_score": cand["relationshipScore"],
                "vel": cand["anchorVelocityClass"],
                "stock": cand["anchorCurrentStock"],
                "demand": cand["anchorPredictedDemand"],
                "safety": cand["anchorSafetyStock"],
                "promotional": cand["anchorPromotionalStock"],
                "coverage": cand["anchorStockCoverageDays"],
                "out_risk": cand["anchorStockOutRisk"],
                "profit": cand["normalProfitContribution"],
                "comp": cand["compatibilityScore"],
                "safety_s": cand["stockSafetyScore"],
                "profit_s": cand["profitabilityScore"],
                "final": cand["finalCandidateScore"],
                "rank": cand["candidateRank"],
                "status": cand["status"],
                "created": datetime.datetime.now()
            })

        db.commit()

        # Generate suggestions for all eligible candidates
        for primary_candidate in candidates:
            anchor_sku = primary_candidate["anchorProductId"]
            anchor_meta = products_meta.get(anchor_sku)
            if not anchor_meta:
                continue

            # Calculate combo pricing & margins
            normal_total = target_meta["selling_price"] + anchor_meta["selling_price"]
            total_cost = target_meta["cost_price"] + anchor_meta["cost_price"]

            # Calculate natural baseline margin of the bundle
            natural_margin = max(0.02, (normal_total - total_cost) / max(1.0, normal_total))

            # Dynamic Minimum Safe Margin:
            if opp["opportunityType"] in ["NEAR_EXPIRY", "DEAD_STOCK"]:
                effective_min_margin = max(0.02, natural_margin * 0.35)
                target_discount = 0.12 # 12% clearance discount
            else:
                effective_min_margin = min(min_margin_pct, max(0.05, natural_margin * 0.60))
                target_discount = 0.08 # 8% standard combo discount

            # Floor price ensuring store covers cost + safety margin
            min_safe_price = total_cost / max(0.01, (1 - effective_min_margin))
            max_possible_discount = max(0.02, (normal_total - min_safe_price) / max(1.0, normal_total))
            
            discount_pct = min(global_max_discount, max(min_saving_pct, min(target_discount, max_possible_discount)))
            recommended_price = round(normal_total * (1 - discount_pct), 0)

            # Ensure price never drops below total cost
            if recommended_price <= total_cost:
                recommended_price = round(total_cost * 1.02, 0)
                discount_pct = (normal_total - recommended_price) / normal_total

            if recommended_price >= normal_total:
                # Provide at least a minimum token discount of 2%
                recommended_price = round(normal_total * 0.98, 0)
                discount_pct = 0.02

            discount_amount = normal_total - recommended_price
            expected_profit = recommended_price - total_cost
            expected_margin = (expected_profit / recommended_price) * 100

            # Max combo quantity is limited by the minimum of available promotional stock
            max_qty = min(opp["availableStock"], primary_candidate["anchorPromotionalStock"])
            if max_qty <= 0:
                max_qty = 10 # Default fallback fallback

            # Construct explanation
            if expected_margin >= (min_margin_pct * 100):
                margin_desc = f"while maintaining a profit margin of {expected_margin:.1f}% (above the {min_margin_pct * 100:.0f}% safety target)."
            else:
                margin_desc = f"while ensuring cost recovery with a {expected_margin:.1f}% margin to liquidate near-expiry/excess stock without loss."

            explanation = (
                f"Suggested combo links target product {target_sku} ({opp['opportunityType']}) "
                f"with anchor product {anchor_sku}. The combination is backed by an association rule "
                f"confidence of {primary_candidate['confidence'] * 100:.1f}% and lift of {primary_candidate['lift']:.2f}. "
                f"The package provides a {discount_pct * 100:.1f}% saving for customers, {margin_desc}"
            )

            suggestion_id = str(uuid.uuid4())
            
            # Insert ComboSuggestion
            db.execute(text("""
                INSERT INTO combo_suggestions (
                    id, opportunity_id, suggestion_version, target_product_id, primary_anchor_product_id, 
                    combo_size, suggestion_type, normal_total_price, total_cost, minimum_safe_price, 
                    recommended_price, maximum_safe_discount, recommended_discount_amount, 
                    recommended_discount_percentage, expected_profit, expected_margin_percentage, 
                    customer_saving, maximum_combo_quantity, recommendation_score, confidence_level, 
                    risk_level, explanation, evidence_summary, suggestion_status, generated_at, 
                    expires_at, created_at, updated_at
                ) VALUES (
                    :id, :opp_id, 1, :target_prod, :anchor_prod, 2, :opp_type, :normal, :cost, :min_safe,
                    :rec_price, :max_disc, :rec_disc_a, :rec_disc_p, :profit, :margin, :saving, :max_qty,
                    :score, :conf, :risk, :explanation, :evidence, 'GENERATED', :generated, :expires,
                    :created, :updated
                )
            """), {
                "id": suggestion_id,
                "opp_id": opp_id,
                "target_prod": target_sku,
                "anchor_prod": anchor_sku,
                "opp_type": opp["opportunityType"],
                "normal": normal_total,
                "cost": total_cost,
                "min_safe": min_safe_price,
                "rec_price": recommended_price,
                "max_disc": normal_total - min_safe_price,
                "rec_disc_a": discount_amount,
                "rec_disc_p": discount_pct * 100,
                "profit": expected_profit,
                "margin": expected_margin,
                "saving": discount_amount,
                "max_qty": max_qty,
                "score": primary_candidate["finalCandidateScore"],
                "conf": "HIGH" if primary_candidate["confidence"] >= 0.50 else "MEDIUM",
                "risk": "LOW" if expected_margin >= (min_margin_pct * 100 + 5) else "MEDIUM",
                "explanation": explanation,
                "evidence": f"Association Rule: Lift={primary_candidate['lift']:.2f}, Conf={primary_candidate['confidence']*100:.1f}%. Margin={expected_margin:.1f}%.",
                "generated": datetime.datetime.now(),
                "expires": suggestion_expiry_date,
                "created": datetime.datetime.now(),
                "updated": datetime.datetime.now()
            })

            # Insert suggestion items (Target and Anchor)
            # Target item
            db.execute(text("""
                INSERT INTO combo_suggestion_items (
                    id, combo_suggestion_id, product_id, batch_id, role, quantity, 
                    normal_unit_price, cost_price, allocated_discount, effective_selling_price, 
                    available_promotional_stock, relationship_score, created_at
                ) VALUES (
                    :id, :sug_id, :prod, :batch, 'TARGET', 1, :normal, :cost, :disc, :eff, :avail, 0.0, :created
                )
            """), {
                "id": str(uuid.uuid4()),
                "sug_id": suggestion_id,
                "prod": target_sku,
                "batch": opp["targetBatchId"],
                "normal": target_meta["selling_price"],
                "cost": target_meta["cost_price"],
                "disc": discount_amount * 0.6,
                "eff": target_meta["selling_price"] - (discount_amount * 0.6),
                "avail": opp["availableStock"],
                "created": datetime.datetime.now()
            })

            # Anchor item
            db.execute(text("""
                INSERT INTO combo_suggestion_items (
                    id, combo_suggestion_id, product_id, batch_id, role, quantity, 
                    normal_unit_price, cost_price, allocated_discount, effective_selling_price, 
                    available_promotional_stock, relationship_score, created_at
                ) VALUES (
                    :id, :sug_id, :prod, NULL, 'ANCHOR', 1, :normal, :cost, :disc, :eff, :avail, :rel, :created
                )
            """), {
                "id": str(uuid.uuid4()),
                "sug_id": suggestion_id,
                "prod": anchor_sku,
                "normal": anchor_meta["selling_price"],
                "cost": anchor_meta["cost_price"],
                "disc": discount_amount * 0.4,
                "eff": anchor_meta["selling_price"] - (discount_amount * 0.4),
                "avail": primary_candidate["anchorPromotionalStock"],
                "rel": primary_candidate["relationshipScore"],
                "created": datetime.datetime.now()
            })

            # Evidence
            db.execute(text("""
                INSERT INTO combo_suggestion_evidences (
                    id, combo_suggestion_id, evidence_type, evidence_key, evidence_value, 
                    unit, description, source_table, source_record_id, created_at
                ) VALUES (
                    :id, :sug_id, 'PURCHASE_RELATIONSHIP', 'association_lift', :val, 'LIFT',
                    :desc, 'product_association_rules', :rec, :created
                )
            """), {
                "id": str(uuid.uuid4()),
                "sug_id": suggestion_id,
                "val": f"{primary_candidate['lift']:.2f}",
                "desc": f"Products have high sales correlation with lift {primary_candidate['lift']:.2f} and confidence {primary_candidate['confidence']*100:.1f}%.",
                "rec": primary_candidate["associationRuleId"],
                "created": datetime.datetime.now()
            })

            suggestions_created += 1

    db.commit()
    print(f"Combo Suggestions successfully generated: {suggestions_created}")
    return suggestions_created


def generate_suggestions_for_opportunity(db: Session, opportunity_id: str) -> int:
    """
    Generates combo suggestions for a SINGLE opportunity only.
    Uses existing anchor candidates (already mined by the full pipeline) to build pricing suggestions.
    Returns: The number of generated suggestions.
    """
    print(f"Generating suggestions for opportunity: {opportunity_id}")

    # 1. Load the opportunity
    opp_row = db.execute(text("""
        SELECT id, target_product_id, target_batch_id, opportunity_type, velocity_class,
               current_stock, available_stock, predicted_demand, safety_stock, required_stock,
               stock_coverage_days, excess_stock, forecast_run_id, association_run_id
        FROM combo_opportunities
        WHERE id = :opp_id
    """), {"opp_id": opportunity_id}).first()

    if not opp_row:
        print(f"Opportunity {opportunity_id} not found.")
        return 0

    target_sku = opp_row[1]
    opp_type = opp_row[3]
    available_stock = opp_row[6]
    association_run_id = opp_row[13]

    # 2. Load Business Settings
    settings_query = text("SELECT setting_key, setting_value FROM combo_business_settings WHERE is_active = true")
    settings = {r[0]: r[1] for r in db.execute(settings_query).fetchall()}

    min_margin_pct = float(settings.get("DEFAULT_MINIMUM_MARGIN_PERCENT", 20)) / 100.0
    global_max_discount = float(settings.get("GLOBAL_MAX_DISCOUNT_PERCENT", 25)) / 100.0
    min_saving_pct = float(settings.get("MIN_CUSTOMER_SAVING_PERCENT", 3)) / 100.0
    suggestion_expiry = int(settings.get("SUGGESTION_EXPIRY_DAYS", 14))
    promo_buffer_pct = float(settings.get("PROMOTIONAL_STOCK_BUFFER_PERCENT", 10)) / 100.0
    min_anchor_coverage = float(settings.get("MIN_ANCHOR_STOCK_COVERAGE_DAYS", 30))

    today = datetime.date.today()
    suggestion_expiry_date = today + datetime.timedelta(days=suggestion_expiry)

    # 3. Load target product metadata
    target_meta_row = db.execute(text("""
        SELECT p.sku, p.cost_price, p.selling_price FROM products p WHERE p.sku = :sku
    """), {"sku": target_sku}).first()

    if not target_meta_row:
        print(f"Target product {target_sku} not found.")
        return 0

    target_meta = {"cost_price": target_meta_row[1], "selling_price": target_meta_row[2]}

    # 4. Load existing anchor candidates for this opportunity
    candidates_rows = db.execute(text("""
        SELECT cac.id, cac.anchor_product_id, cac.association_rule_id, cac.pair_purchase_count,
               cac.support, cac.confidence, cac.lift, cac.relationship_score,
               cac.anchor_velocity_class, cac.anchor_current_stock, cac.anchor_predicted_demand,
               cac.anchor_promotional_stock, cac.anchor_stock_coverage_days,
               cac.final_candidate_score, cac.candidate_rank, cac.status
        FROM combo_anchor_candidates cac
        WHERE cac.opportunity_id = :opp_id
        ORDER BY cac.candidate_rank ASC
    """), {"opp_id": opportunity_id}).fetchall()

    if not candidates_rows:
        # If no candidates exist yet, try to mine them from association rules
        candidates_rows = _mine_candidates_for_opportunity(
            db, opportunity_id, target_sku, association_run_id, 
            promo_buffer_pct, min_anchor_coverage
        )
        if not candidates_rows:
            print(f"No eligible anchor candidates for opportunity {opportunity_id}.")
            return 0

    # 5. Delete any existing suggestions for this opportunity (re-generate fresh)
    db.execute(text("""
        DELETE FROM combo_suggestion_evidences WHERE combo_suggestion_id IN (
            SELECT id FROM combo_suggestions WHERE opportunity_id = :opp_id
        )
    """), {"opp_id": opportunity_id})
    db.execute(text("""
        DELETE FROM combo_suggestion_items WHERE combo_suggestion_id IN (
            SELECT id FROM combo_suggestions WHERE opportunity_id = :opp_id
        )
    """), {"opp_id": opportunity_id})
    db.execute(text("DELETE FROM combo_suggestions WHERE opportunity_id = :opp_id"), {"opp_id": opportunity_id})
    db.commit()

    suggestions_created = 0

    # 6. For each eligible candidate, generate a priced suggestion
    for cand in candidates_rows:
        anchor_sku = cand[1]
        confidence = cand[5]
        lift = cand[6]
        anchor_promotional_stock = cand[11]

        # Load anchor product metadata
        anchor_meta_row = db.execute(text("""
            SELECT p.cost_price, p.selling_price FROM products p WHERE p.sku = :sku
        """), {"sku": anchor_sku}).first()

        if not anchor_meta_row:
            continue

        anchor_meta = {"cost_price": anchor_meta_row[0], "selling_price": anchor_meta_row[1]}

        # Calculate combo pricing & margins
        normal_total = target_meta["selling_price"] + anchor_meta["selling_price"]
        total_cost = target_meta["cost_price"] + anchor_meta["cost_price"]

        # Calculate natural baseline margin of the bundle
        natural_margin = max(0.02, (normal_total - total_cost) / max(1.0, normal_total))

        # Dynamic Minimum Safe Margin:
        if opp_type in ["NEAR_EXPIRY", "DEAD_STOCK"]:
            effective_min_margin = max(0.02, natural_margin * 0.35)
            target_discount = 0.12 # 12% clearance discount
        else:
            effective_min_margin = min(min_margin_pct, max(0.05, natural_margin * 0.60))
            target_discount = 0.08 # 8% standard discount

        # Floor price ensuring store covers cost + safety margin
        min_safe_price = total_cost / max(0.01, (1 - effective_min_margin))
        max_possible_discount = max(0.02, (normal_total - min_safe_price) / max(1.0, normal_total))

        discount_pct = min(global_max_discount, max(min_saving_pct, min(target_discount, max_possible_discount)))
        recommended_price = round(normal_total * (1 - discount_pct), 0)

        # Ensure price never drops below total cost
        if recommended_price <= total_cost:
            recommended_price = round(total_cost * 1.02, 0)
            discount_pct = (normal_total - recommended_price) / normal_total

        if recommended_price >= normal_total:
            recommended_price = round(normal_total * 0.98, 0)
            discount_pct = 0.02

        discount_amount = normal_total - recommended_price
        expected_profit = recommended_price - total_cost
        expected_margin = (expected_profit / recommended_price) * 100

        max_qty = min(available_stock, anchor_promotional_stock or 10)
        if max_qty <= 0:
            max_qty = 10

        if expected_margin >= (min_margin_pct * 100):
            margin_desc = f"while maintaining a profit margin of {expected_margin:.1f}% (above the {min_margin_pct * 100:.0f}% safety target)."
        else:
            margin_desc = f"while ensuring cost recovery with a {expected_margin:.1f}% margin to liquidate near-expiry/excess stock without loss."

        explanation = (
            f"Suggested combo links target product {target_sku} ({opp_type}) "
            f"with anchor product {anchor_sku}. The combination is backed by an association rule "
            f"confidence of {confidence * 100:.1f}% and lift of {lift:.2f}. "
            f"The package provides a {discount_pct * 100:.1f}% saving for customers, {margin_desc}"
        )

        suggestion_id = str(uuid.uuid4())
        final_score = cand[13]  # finalCandidateScore

        db.execute(text("""
            INSERT INTO combo_suggestions (
                id, opportunity_id, suggestion_version, target_product_id, primary_anchor_product_id, 
                combo_size, suggestion_type, normal_total_price, total_cost, minimum_safe_price, 
                recommended_price, maximum_safe_discount, recommended_discount_amount, 
                recommended_discount_percentage, expected_profit, expected_margin_percentage, 
                customer_saving, maximum_combo_quantity, recommendation_score, confidence_level, 
                risk_level, explanation, evidence_summary, suggestion_status, generated_at, 
                expires_at, created_at, updated_at
            ) VALUES (
                :id, :opp_id, 1, :target_prod, :anchor_prod, 2, :opp_type, :normal, :cost, :min_safe,
                :rec_price, :max_disc, :rec_disc_a, :rec_disc_p, :profit, :margin, :saving, :max_qty,
                :score, :conf, :risk, :explanation, :evidence, 'GENERATED', :generated, :expires,
                :created, :updated
            )
        """), {
            "id": suggestion_id,
            "opp_id": opportunity_id,
            "target_prod": target_sku,
            "anchor_prod": anchor_sku,
            "opp_type": opp_type,
            "normal": normal_total,
            "cost": total_cost,
            "min_safe": min_safe_price,
            "rec_price": recommended_price,
            "max_disc": normal_total - min_safe_price,
            "rec_disc_a": discount_amount,
            "rec_disc_p": discount_pct * 100,
            "profit": expected_profit,
            "margin": expected_margin,
            "saving": discount_amount,
            "max_qty": max_qty,
            "score": final_score,
            "conf": "HIGH" if confidence >= 0.50 else "MEDIUM",
            "risk": "LOW" if expected_margin >= (min_margin_pct * 100 + 5) else "MEDIUM",
            "explanation": explanation,
            "evidence": f"Association Rule: Lift={lift:.2f}, Conf={confidence*100:.1f}%. Margin={expected_margin:.1f}%.",
            "generated": datetime.datetime.now(),
            "expires": suggestion_expiry_date,
            "created": datetime.datetime.now(),
            "updated": datetime.datetime.now()
        })

        # Insert suggestion items (Target + Anchor)
        db.execute(text("""
            INSERT INTO combo_suggestion_items (
                id, combo_suggestion_id, product_id, batch_id, role, quantity, 
                normal_unit_price, cost_price, allocated_discount, effective_selling_price, 
                available_promotional_stock, relationship_score, created_at
            ) VALUES (
                :id, :sug_id, :prod, :batch, 'TARGET', 1, :normal, :cost, :disc, :eff, :avail, 0.0, :created
            )
        """), {
            "id": str(uuid.uuid4()),
            "sug_id": suggestion_id,
            "prod": target_sku,
            "batch": opp_row[2],  # target_batch_id
            "normal": target_meta["selling_price"],
            "cost": target_meta["cost_price"],
            "disc": discount_amount * 0.6,
            "eff": target_meta["selling_price"] - (discount_amount * 0.6),
            "avail": available_stock,
            "created": datetime.datetime.now()
        })

        db.execute(text("""
            INSERT INTO combo_suggestion_items (
                id, combo_suggestion_id, product_id, batch_id, role, quantity, 
                normal_unit_price, cost_price, allocated_discount, effective_selling_price, 
                available_promotional_stock, relationship_score, created_at
            ) VALUES (
                :id, :sug_id, :prod, NULL, 'ANCHOR', 1, :normal, :cost, :disc, :eff, :avail, :rel, :created
            )
        """), {
            "id": str(uuid.uuid4()),
            "sug_id": suggestion_id,
            "prod": anchor_sku,
            "normal": anchor_meta["selling_price"],
            "cost": anchor_meta["cost_price"],
            "disc": discount_amount * 0.4,
            "eff": anchor_meta["selling_price"] - (discount_amount * 0.4),
            "avail": anchor_promotional_stock or 0,
            "rel": cand[7],  # relationship_score
            "created": datetime.datetime.now()
        })

        # Insert evidence records
        db.execute(text("""
            INSERT INTO combo_suggestion_evidences (
                id, combo_suggestion_id, evidence_type, evidence_key, evidence_value, 
                unit, description, source_table, source_record_id, created_at
            ) VALUES (
                :id, :sug_id, 'PURCHASE_RELATIONSHIP', 'association_lift', :val, 'LIFT',
                :desc, 'product_association_rules', :rec, :created
            )
        """), {
            "id": str(uuid.uuid4()),
            "sug_id": suggestion_id,
            "val": f"{lift:.2f}",
            "desc": f"Products have high sales correlation with lift {lift:.2f} and confidence {confidence*100:.1f}%.",
            "rec": cand[2],  # association_rule_id
            "created": datetime.datetime.now()
        })

        suggestions_created += 1

    db.commit()
    print(f"Suggestions generated for opportunity {opportunity_id}: {suggestions_created}")
    return suggestions_created


def _mine_candidates_for_opportunity(
    db: Session, opportunity_id: str, target_sku: str, association_run_id: str,
    promo_buffer_pct: float, min_anchor_coverage: float
) -> list:
    """
    Mines anchor candidates from association rules for a single opportunity.
    Used as a fallback when Generate is clicked but no candidates were previously mined.
    Returns candidate rows in the same format as the DB query.
    """
    valid_run = db.execute(text("""
        SELECT id FROM product_association_runs 
        WHERE status = 'COMPLETED' 
        ORDER BY completed_at DESC 
        LIMIT 1
    """)).scalar()

    if not association_run_id or not db.execute(text("SELECT 1 FROM product_association_rules WHERE association_run_id = :ar LIMIT 1"), {"ar": association_run_id}).scalar():
        association_run_id = valid_run

    if not association_run_id:
        return []

    # Load substitute map
    sub_query = text("SELECT product_id, substitute_product_id FROM product_substitute_relations WHERE status = 'CONFIRMED'")
    substitutes = {}
    for r in db.execute(sub_query).fetchall():
        if r[0] not in substitutes:
            substitutes[r[0]] = set()
        substitutes[r[0]].add(r[1])

    # Find association rules where target is antecedent
    rules = db.execute(text("""
        SELECT id, consequent_product_id, support, confidence, lift, relationship_score, pair_purchase_count 
        FROM product_association_rules
        WHERE association_run_id = :assoc_run
          AND antecedent_product_id = :target_sku
          AND relationship_status != 'REJECTED'
        ORDER BY relationship_score DESC
    """), {"assoc_run": association_run_id, "target_sku": target_sku}).fetchall()

    # Fallback 1: Bidirectional lookup where target is consequent
    if not rules:
        bi_rules_query = text("""
            SELECT id, antecedent_product_id, support, confidence, lift, relationship_score, pair_purchase_count 
            FROM product_association_rules
            WHERE association_run_id = :assoc_run
              AND consequent_product_id = :target_sku
              AND relationship_status != 'REJECTED'
            ORDER BY relationship_score DESC
        """)
        rules = db.execute(bi_rules_query, {
            "assoc_run": association_run_id,
            "target_sku": target_sku
        }).fetchall()

    # Fallback 2: Category association rules or top fast-moving companions
    if not rules:
        target_cat = db.execute(text("""
            SELECT mc.category_id 
            FROM products p 
            JOIN master_product_class mc ON p.master_id = mc.id 
            WHERE p.sku = :sku
        """), {"sku": target_sku}).scalar()

        if target_cat:
            cat_rules = db.execute(text("""
                SELECT target_category_id, support, confidence, lift 
                FROM category_associations
                WHERE analysis_run_id = :assoc_run
                  AND (source_category_id = :cat OR target_category_id = :cat)
                ORDER BY lift DESC
                LIMIT 3
            """), {"assoc_run": association_run_id, "cat": target_cat}).fetchall()

            for cr in cat_rules:
                comp_cat = cr[0] if cr[0] != target_cat else target_cat
                comp_prods = db.execute(text("""
                    SELECT p.sku 
                    FROM products p
                    JOIN master_product_class mc ON p.master_id = mc.id
                    WHERE mc.category_id = :cat AND p.status = 'ACTIVE' AND p.sku != :sku
                    LIMIT 2
                """), {"cat": comp_cat, "sku": target_sku}).fetchall()

                for cp in comp_prods:
                    rules.append((None, cp[0], float(cr[1]), float(cr[2]), float(cr[3]), float(cr[3] * cr[2]), 10))

    if not rules:
        return []

    # Load forecast health for anchors
    forecast_run_id = db.execute(text("""
        SELECT id FROM demand_forecast_runs 
        WHERE status = 'COMPLETED' 
          AND id IN (SELECT forecast_run_id FROM demand_forecasts WHERE predicted_demand > 0)
        ORDER BY created_at DESC 
        LIMIT 1
    """)).scalar()

    anchor_health = {}
    if forecast_run_id:
        forecasts = db.execute(text("""
            SELECT df.product_id, df.current_stock, df.predicted_demand, df.stock_coverage_days, da.primary_behaviour
            FROM demand_forecasts df
            JOIN demand_analysis da ON df.forecast_run_id = da.forecast_run_id AND df.product_id = da.product_id
            WHERE df.forecast_run_id = :fid
        """), {"fid": forecast_run_id}).fetchall()
        anchor_health = {f[0]: {"stock": f[1], "demand": f[2], "coverage": f[3] or 999.0, "vel": f[4]} for f in forecasts}

    # Load product metadata
    products_meta = {}
    for r in db.execute(text("SELECT sku, cost_price, selling_price FROM products WHERE status = 'ACTIVE'")).fetchall():
        products_meta[r[0]] = {"cost": r[1], "price": r[2]}

    # Load active combo commitments
    active_combos_query = text("""
        SELECT ci.product_id, COALESCE(SUM(ci.quantity * (c.maximum_quantity - c.sold_quantity)), 0) AS reserved_qty
        FROM combo_items ci
        JOIN combos c ON ci.combo_id = c.id
        WHERE c.status IN ('ACTIVE', 'APPROVED', 'SUBMITTED')
          AND c.end_date >= CURRENT_DATE
        GROUP BY ci.product_id
    """)
    active_reservations = {r[0]: int(r[1]) for r in db.execute(active_combos_query).fetchall()}
    # Load problem SKUs (Dead Stock, Near Expiry, Slow Moving) to prevent them from being recommended as Anchors
    problem_skus_query = text("""
        SELECT DISTINCT target_product_id 
        FROM combo_opportunities 
        WHERE opportunity_type IN ('DEAD_STOCK', 'NEAR_EXPIRY', 'SLOW_MOVING')
          AND opportunity_status NOT IN ('IGNORED', 'EXPIRED')
    """)
    problem_skus = {r[0] for r in db.execute(problem_skus_query).fetchall()}

    candidates = []
    for r in rules:
        anchor_sku = r[1]
        conf = r[3]

        if target_sku in substitutes and anchor_sku in substitutes[target_sku]:
            continue
        if target_sku == anchor_sku:
            continue

        # Anchor MUST NOT be a problem item
        if anchor_sku in problem_skus:
            continue

        anchor_meta = products_meta.get(anchor_sku)
        if not anchor_meta:
            continue

        health = anchor_health.get(anchor_sku)
        if not health or health["demand"] <= 0 or health["stock"] <= 0 or health["coverage"] < min_anchor_coverage:
            continue

        # Deduct active combo locks and regular walk-in sales buffer
        locked_stock = active_reservations.get(anchor_sku, 0)
        net_free_stock = max(0, health["stock"] - locked_stock)
        regular_sales_buffer = int(health["demand"] * 1.15)
        safe_promo_stock = max(0, net_free_stock - regular_sales_buffer)

        if safe_promo_stock < 5:
            continue

        profitability = float((anchor_meta["price"] - anchor_meta["cost"]) / max(1.0, anchor_meta["price"]))
        stock_safety = float(min(1.0, health["coverage"] / 100.0))
        comp_score = float(conf * 100)
        final_score = float((comp_score * 0.5) + (profitability * 100 * 0.25) + (stock_safety * 100 * 0.25))

        candidates.append({
            "anchorProductId": anchor_sku,
            "associationRuleId": r[0],
            "pairPurchaseCount": int(r[6]),
            "support": r[2],
            "confidence": r[3],
            "lift": r[4],
            "relationshipScore": r[5],
            "anchorPromotionalStock": safe_promo_stock,
            "anchorStockCoverageDays": health["coverage"],
            "finalCandidateScore": final_score
        })

    default_rule_id = db.execute(text("SELECT id FROM product_association_rules WHERE association_run_id = :assoc_run LIMIT 1"), {"assoc_run": association_run_id}).scalar() or db.execute(text("SELECT id FROM product_association_rules ORDER BY created_at DESC LIMIT 1")).scalar()

    # Fallback 3: If no candidate passed specific pair rules, pick top healthy fast-moving anchors with high surplus stock
    if not candidates and forecast_run_id:
        top_anchors_query = text("""
            SELECT df.product_id, df.current_stock, df.predicted_demand, df.stock_coverage_days, p.selling_price, p.cost_price
            FROM demand_forecasts df
            JOIN products p ON df.product_id = p.sku
            WHERE df.forecast_run_id = :fid
              AND p.status = 'ACTIVE'
              AND df.product_id != :target_sku
              AND df.product_id NOT IN (
                  SELECT target_product_id FROM combo_opportunities 
                  WHERE opportunity_type IN ('DEAD_STOCK', 'NEAR_EXPIRY')
                    AND opportunity_status NOT IN ('IGNORED', 'EXPIRED')
              )
              AND df.current_stock > (df.predicted_demand * 1.15 + 10)
            ORDER BY df.predicted_demand DESC, df.stock_coverage_days DESC
            LIMIT 3
        """)
        top_anchors = db.execute(top_anchors_query, {"fid": forecast_run_id, "target_sku": target_sku}).fetchall()
        for ta in top_anchors:
            a_sku = ta[0]
            a_stock = ta[1]
            a_demand = ta[2]
            a_cov = ta[3] or 999.0
            a_price = ta[4]
            a_cost = ta[5]
            safe_promo = max(10, int(a_stock - (a_demand * 1.15)))
            profitability = float((a_price - a_cost) / max(1.0, a_price))
            stock_safety = float(min(1.0, a_cov / 100.0))
            final_score = float((20.0 * 0.5) + (profitability * 100 * 0.25) + (stock_safety * 100 * 0.25))
            candidates.append({
                "anchorProductId": a_sku,
                "associationRuleId": default_rule_id,
                "pairPurchaseCount": 10,
                "support": 0.02,
                "confidence": 0.20,
                "lift": 1.15,
                "relationshipScore": 2.3,
                "anchorPromotionalStock": safe_promo,
                "anchorStockCoverageDays": a_cov,
                "finalCandidateScore": final_score
            })

    if not candidates:
        return []

    candidates = sorted(candidates, key=lambda x: x["finalCandidateScore"], reverse=True)

    # Insert into DB and return as tuples matching the query format
    result_rows = []
    for idx, cand in enumerate(candidates[:3]):  # Top 3 eligible
        cand_id = str(uuid.uuid4())
        rule_to_use = cand["associationRuleId"] or default_rule_id
        db.execute(text("""
            INSERT INTO combo_anchor_candidates (
                id, opportunity_id, anchor_product_id, association_rule_id, pair_purchase_count, 
                support, confidence, lift, relationship_score, anchor_velocity_class, 
                anchor_current_stock, anchor_predicted_demand, anchor_safety_stock, 
                anchor_promotional_stock, anchor_stock_coverage_days, anchor_stock_out_risk, 
                normal_profit_contribution, compatibility_score, stock_safety_score, 
                profitability_score, final_candidate_score, candidate_rank, 
                rejection_reason, status, created_at
            ) VALUES (
                :id, :opp_id, :anchor_prod, :rule_id, :pair_count, :sup, :conf, :lift, :rel_score,
                'MEDIUM', 0, 0, 0, :promotional, :coverage, 0.0, 0.0,
                0.0, 0.0, 0.0, :final, :rank, NULL, 'ELIGIBLE', :created
            ) ON CONFLICT (opportunity_id, anchor_product_id) DO UPDATE SET
                final_candidate_score = EXCLUDED.final_candidate_score,
                candidate_rank = EXCLUDED.candidate_rank,
                status = EXCLUDED.status
        """), {
            "id": cand_id,
            "opp_id": opportunity_id,
            "anchor_prod": cand["anchorProductId"],
            "rule_id": rule_to_use,
            "pair_count": cand["pairPurchaseCount"],
            "sup": cand["support"],
            "conf": cand["confidence"],
            "lift": cand["lift"],
            "rel_score": cand["relationshipScore"],
            "promotional": cand["anchorPromotionalStock"],
            "coverage": cand["anchorStockCoverageDays"],
            "final": cand["finalCandidateScore"],
            "rank": idx + 1,
            "created": datetime.datetime.now()
        })

        # Build tuple matching the SELECT format in the caller
        result_rows.append((
            cand_id, cand["anchorProductId"], rule_to_use, cand["pairPurchaseCount"],
            cand["support"], cand["confidence"], cand["lift"], cand["relationshipScore"],
            "MEDIUM", 0, 0,
            cand["anchorPromotionalStock"], cand["anchorStockCoverageDays"],
            cand["finalCandidateScore"], idx + 1, "ELIGIBLE"
        ))

    db.commit()
    return result_rows
