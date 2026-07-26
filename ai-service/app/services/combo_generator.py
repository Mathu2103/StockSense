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
            ORDER BY target_month DESC, created_at DESC 
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

    for batch in near_expiry_batches:
        # Load forecast for this product if available
        forecast = db.execute(text("""
            SELECT predicted_demand, safety_stock, required_stock, stock_coverage_days 
            FROM demand_forecasts 
            WHERE forecast_run_id = :run_id AND product_id = :sku
        """), {"run_id": forecast_run_id, "sku": batch[1]}).first()

        pred_demand = forecast[0] if forecast else 0
        safety_stock = forecast[1] if forecast else 0
        required_stock = forecast[2] if forecast else 0
        coverage = forecast[3] if forecast else 999.0

        days_to_exp = (batch[2] - today).days

        # Priority score depends on closeness to expiry and batch value
        priority = float(100 - (days_to_exp / near_expiry_days * 50))

        detected_opportunities.append({
            "targetProductId": batch[1],
            "targetBatchId": batch[0],
            "opportunityType": "NEAR_EXPIRY",
            "velocityClass": "NEAR_EXPIRY",
            "currentStock": batch[3],
            "availableStock": batch[3],
            "predictedDemand": pred_demand,
            "safetyStock": safety_stock,
            "requiredStock": required_stock,
            "stockCoverageDays": coverage,
            "excessStock": batch[3], # All near expiry stock is considered excess to clear
            "daysSinceLastSale": 0,
            "expiryDate": batch[2],
            "daysToExpiry": days_to_exp,
            "priorityScore": priority
        })

    # B. Forecast-based Opportunities (Slow-moving, Dead Stock, Overstock)
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

        # Skip products with no physical stock
        if curr_stock <= 0:
            continue

        # Check for Dead Stock (no sales in last 90 days / recent 30 is 0)
        # Note: if recent30Sales is 0, we flag as Dead stock risk
        if recent_sales == 0:
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

        # Check for Slow Moving (coverage > 60 days and behavior is INTERMITTENT or slow)
        if coverage > slow_moving_coverage and (behavior == "INTERMITTENT" or pred_demand < (curr_stock / 2)):
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

    # Save detected opportunities to database
    opportunities_map = {}
    for opp in detected_opportunities:
        opp_id = str(uuid.uuid4())
        db.execute(text("""
            INSERT INTO combo_opportunities (
                id, forecast_run_id, association_run_id, seasonal_event_id, target_product_id, 
                target_batch_id, opportunity_type, velocity_class, current_stock, available_stock, 
                predicted_demand, safety_stock, required_stock, stock_coverage_days, excess_stock, 
                days_since_last_sale, expiry_date, days_to_expiry, priority_score, 
                opportunity_status, detected_at, expires_at, created_at, updated_at
            ) VALUES (
                :id, :forecast_run, :assoc_run, NULL, :target_product, :target_batch, :opp_type, :vel_class,
                :curr_stock, :avail_stock, :pred_demand, :safety, :required, :coverage, :excess, :days_since,
                :exp_date, :days_to, :priority, 'NEW', :detected, :expires, :created, :updated
            ) ON CONFLICT (forecast_run_id, association_run_id, target_product_id, target_batch_id, opportunity_type) 
            DO UPDATE SET
                current_stock = EXCLUDED.current_stock,
                available_stock = EXCLUDED.available_stock,
                priority_score = EXCLUDED.priority_score,
                updated_at = EXCLUDED.updated_at
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
            "coverage": float(opp["stockCoverageDays"]),
            "excess": opp["excessStock"],
            "days_since": opp["daysSinceLastSale"],
            "exp_date": opp["expiryDate"],
            "days_to": opp["daysToExpiry"],
            "priority": opp["priorityScore"],
            "detected": datetime.datetime.now(),
            "expires": suggestion_expiry_date,
            "created": datetime.datetime.now(),
            "updated": datetime.datetime.now()
        })
        opportunities_map[(opp["targetProductId"], opp["targetBatchId"], opp["opportunityType"])] = opp_id

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
    products_meta = {r[0]: {"cost": r[1], "price": r[2], "cat": r[3]} for r in db.execute(product_meta_query).fetchall()}

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

            anchor_meta = products_meta.get(anchor_sku)
            if not anchor_meta:
                continue

            # Ensure anchor has healthy stock levels to support promotions
            health = anchor_health.get(anchor_sku)
            if not health:
                continue

            # Anchor stock coverage check (must cover anchor demand + minimum coverage threshold)
            if health["coverage"] < min_anchor_coverage or health["stock"] <= 0:
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
                "anchorSafetyStock": int(health["demand"] * 0.15),
                "anchorPromotionalStock": int(health["stock"] * (1 - promo_buffer_pct)),
                "anchorStockCoverageDays": health["coverage"],
                "anchorStockOutRisk": 0.0,
                "normalProfitContribution": profitability,
                "compatibilityScore": comp_score,
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
                "rule_id": cand["associationRuleId"],
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

        # Select primary candidate (rank 1) to build a suggestion
        primary_candidate = candidates[0]
        anchor_sku = primary_candidate["anchorProductId"]
        anchor_meta = products_meta[anchor_sku]

        # Calculate combo pricing & margins
        normal_total = target_meta["selling_price"] + anchor_meta["selling_price"]
        total_cost = target_meta["cost_price"] + anchor_meta["cost_price"]

        # Minimum Safe Price ensures profit is safe (margin >= configured min margin)
        # Formula: cost / (1 - min_margin_pct)
        min_safe_price = total_cost / (1 - min_margin_pct)

        # Recommended discount is based on opportunity urgency:
        # Near Expiry and Dead stock warrant higher discounts to dump stock.
        if opp["opportunityType"] in ["NEAR_EXPIRY", "DEAD_STOCK"]:
            discount_pct = 0.15 # 15% discount
        else:
            discount_pct = 0.08 # 8% discount

        # Apply global max discount constraints
        discount_pct = min(global_max_discount, max(min_saving_pct, discount_pct))
        recommended_price = normal_total * (1 - discount_pct)

        # Safe Margin check: if recommended price is lower than min safe price, clamp it
        if recommended_price < min_safe_price:
            recommended_price = min_safe_price
            discount_pct = (normal_total - recommended_price) / normal_total

        # Re-verify in case cost is too high relative to sales price
        if recommended_price >= normal_total:
            # Not possible to offer discount while preserving margin. Skip suggestion
            continue

        discount_amount = normal_total - recommended_price
        expected_profit = recommended_price - total_cost
        expected_margin = (expected_profit / recommended_price) * 100

        # Max combo quantity is limited by the minimum of available promotional stock
        max_qty = min(opp["availableStock"], primary_candidate["anchorPromotionalStock"])
        if max_qty <= 0:
            max_qty = 10 # Default fallback fallback

        # Construct explanation
        explanation = (
            f"Suggested combo links target product {target_sku} ({opp['opportunityType']}) "
            f"with anchor product {anchor_sku}. The combination is backed by an association rule "
            f"confidence of {primary_candidate['confidence'] * 100:.1f}% and lift of {primary_candidate['lift']:.2f}. "
            f"The package provides a {discount_pct * 100:.1f}% saving for customers, while guaranteeing "
            f"a profit margin of {expected_margin:.1f}% (above the {min_margin_pct * 100:.0f}% minimum safety threshold)."
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
            "disc": discount_amount * 0.6, # allocate 60% of discount to the target slow item
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
            "disc": discount_amount * 0.4, # allocate 40% of discount to anchor item
            "eff": anchor_meta["selling_price"] - (discount_amount * 0.4),
            "avail": primary_candidate["anchorPromotionalStock"],
            "rel": primary_candidate["relationshipScore"],
            "created": datetime.datetime.now()
        })

        # Insert evidences
        # Ev 1: Purchase Relationship
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

        # Ev 2: Overstock or Expiry depending on type
        db.execute(text("""
            INSERT INTO combo_suggestion_evidences (
                id, combo_suggestion_id, evidence_type, evidence_key, evidence_value, 
                unit, description, source_table, source_record_id, created_at
            ) VALUES (
                :id, :sug_id, :ev_type, :ev_key, :val, :unit, :desc, NULL, NULL, :created
            )
        """), {
            "id": str(uuid.uuid4()),
            "sug_id": suggestion_id,
            "ev_type": opp["opportunityType"],
            "ev_key": "stock_coverage_days" if opp["opportunityType"] != "NEAR_EXPIRY" else "days_to_expiry",
            "val": f"{opp['stockCoverageDays']:.1f}" if opp["opportunityType"] != "NEAR_EXPIRY" else str(opp["daysToExpiry"]),
            "unit": "DAYS",
            "desc": f"Target item exhibits excessive stock levels covering {opp['stockCoverageDays']:.1f} days of forecasted demand." if opp["opportunityType"] != "NEAR_EXPIRY" else f"Target batch is close to expiration in {opp['daysToExpiry']} days.",
            "created": datetime.datetime.now()
        })

        suggestions_created += 1

    db.commit()
    print(f"Combo Suggestions successfully generated: {suggestions_created}")
    return suggestions_created
