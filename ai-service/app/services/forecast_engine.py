import pandas as pd
import numpy as np
from datetime import datetime, date, timedelta
import calendar
from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.services.data_loader import (
    load_products_df,
    load_daily_sales_df,
    load_daily_refunds_df,
    load_daily_grn_df,
    load_daily_adjustments_df,
    load_discounts_df,
    load_discount_mappings_df
)
from app.services.data_cleaner import clean_and_merge_data
from app.services.feature_engineering import reconstruct_stock_history, calculate_product_features
from app.services.product_profiler import classify_product_demand
from app.services.model_selector import select_best_model
from app.services.recommendation_engine import calculate_recommendation
from app.services.explanation_engine import generate_forecast_explanation

# Configurable settings
DEFAULT_SAFETY_STOCK_PCT = 0.15
MAX_DISCOUNT_UPLIFT_CAP = 50.0  # Cap discount uplift at 50% to prevent demand inflation

def run_monthly_forecasting(
    db: Session,
    target_month_str: str,
    requested_by: str = None,
    trigger_type: str = "MANUAL"
) -> Tuple[Dict[str, Any], List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Runs the complete forecasting pipeline for the target month.
    """
    # 1. Parse target month
    try:
        if len(target_month_str) == 7:  # YYYY-MM
            target_month_date = datetime.strptime(target_month_str + "-01", "%Y-%m-%d").date()
        else:
            target_month_date = datetime.strptime(target_month_str, "%Y-%m-%d").date()
    except Exception as e:
        raise ValueError(f"Invalid target month format: {target_month_str}. Use YYYY-MM or YYYY-MM-DD.")

    # Data cutoff is the last day of the previous month
    cutoff_date = target_month_date - timedelta(days=1)
    cutoff_str = cutoff_date.strftime("%Y-%m-%d")
    d30_start = cutoff_date - timedelta(days=30)
    
    print(f"Running monthly forecasting for: {target_month_date} with data cutoff: {cutoff_str}")

    # 2. Load all historical data up to cutoff date
    products_df = load_products_df(db)
    sales_df = load_daily_sales_df(db, cutoff_str)
    refunds_df = load_daily_refunds_df(db, cutoff_str)
    grn_df = load_daily_grn_df(db, cutoff_str)
    adjustments_df = load_daily_adjustments_df(db, cutoff_str)
    discounts_df = load_discounts_df(db)
    discount_mappings_df = load_discount_mappings_df(db)

    # 3. Clean and merge into chronological daily panel
    cleaned_df = clean_and_merge_data(
        products_df, sales_df, refunds_df, grn_df, adjustments_df, 
        discounts_df, discount_mappings_df,
        start_date="2023-01-01", end_date=cutoff_str
    )

    # Reconstruct historical running stock levels
    cleaned_df = reconstruct_stock_history(cleaned_df, products_df)

    # 4. Calculate statistical demand features
    features_df = calculate_product_features(cleaned_df, target_month_date)

    # Classify demand profiles
    features_df = classify_product_demand(features_df)

    # 5. Load safety stock percentage from DB settings if available
    safety_stock_pct = DEFAULT_SAFETY_STOCK_PCT
    try:
        res = db.execute(text("SELECT value FROM system_settings WHERE key = 'safety_stock_percentage'")).first()
        if res:
            safety_stock_pct = float(res[0])
    except Exception:
        pass

    # 6. Generate target month dates for forecasting
    year = target_month_date.year
    month = target_month_date.month
    
    # Calculate days in the target month
    days_in_month = calendar.monthrange(year, month)[1]
    next_month_start = target_month_date + timedelta(days=days_in_month)
    
    future_dates = pd.date_range(target_month_date, next_month_start - timedelta(days=1)).date
    
    # Construct base future dataframe for predictions
    future_records = []
    for d in future_dates:
        future_records.append({
            "date": d,
            "dayOfWeek": d.weekday(),
            "month": d.month,
            "year": d.year,
            "weekendFlag": 1 if d.weekday() in [5, 6] else 0
        })
    future_base_df = pd.DataFrame(future_records)

    # Mappings of discounts in the target month (active approved discounts)
    active_future_discounts = pd.DataFrame()
    if not discounts_df.empty:
        active_future_discounts = discounts_df[
            (discounts_df["approval_status"] == "APPROVED") &
            ((discounts_df["start_date"].isnull()) | (discounts_df["start_date"] <= next_month_start - timedelta(days=1))) &
            ((discounts_df["end_date"].isnull()) | (discounts_df["end_date"] >= target_month_date))
        ]

    # Lists for database rows
    analyses_rows = []
    forecasts_rows = []

    success_count = 0
    fail_count = 0

    # 7. Loop over products to train and forecast
    for idx, prod in products_df.iterrows():
        sku = prod["sku"]
        status = prod["status"]
        
        # Exclude discontinued/inactive products from forecasting
        if status in ["DISCONTINUED", "INACTIVE"]:
            continue

        prod_hist = cleaned_df[cleaned_df["sku"] == sku]
        prod_features = features_df[features_df["productId"] == sku]

        if prod_features.empty:
            fail_count += 1
            print(f"Skipping forecasting for {sku}: no engineered features found.")
            continue

        feat_row = prod_features.iloc[0].to_dict()

        try:
            # A. Select the best model
            model_name, model_params, mae, rmse, wape, accuracy_score, reliability, model_instance = select_best_model(
                prod_hist, feat_row["primaryBehaviour"], target_month_date
            )

            # B. Prepare future dates feature dataframe for this SKU
            prod_future_df = future_base_df.copy()
            prod_future_df["sku"] = sku
            prod_future_df["average_unit_price"] = float(prod["selling_price"])
            prod_future_df["discount_applied"] = False
            prod_future_df["discount_percentage"] = 0.0
            prod_future_df["discount_type"] = "NONE"

            # Check future approved discounts overlapping the forecast month
            is_discounted_in_future = False
            discount_percentage_future = 0.0
            if not active_future_discounts.empty and not discount_mappings_df.empty:
                sku_mappings = discount_mappings_df[discount_mappings_df["sku"] == sku]
                if not sku_mappings.empty:
                    sku_discounts = pd.merge(sku_mappings, active_future_discounts, on="discount_id", how="inner")
                    for _, disc in sku_discounts.items() if hasattr(sku_discounts, "items") else sku_discounts.iterrows():
                        d_start = disc["start_date"] or target_month_date
                        d_end = disc["end_date"] or (next_month_start - timedelta(days=1))
                        val = disc["discount_value"]
                        dtype = disc["type"]
                        
                        mask = (prod_future_df["date"] >= d_start) & (prod_future_df["date"] <= d_end)
                        if mask.any():
                            prod_future_df.loc[mask, "discount_applied"] = True
                            prod_future_df.loc[mask, "discount_percentage"] = float(val)
                            prod_future_df.loc[mask, "discount_type"] = dtype
                            is_discounted_in_future = True
                            discount_percentage_future = float(val)

            # C. Predict daily demand and sum
            # If training data had zero sales on stock-out days, we could mask them (our model selector did that)
            daily_predictions = model_instance.predict(prod_future_df)
            predicted_demand = float(np.sum(daily_predictions))

            # D. Apply future discount sensitivity adjustments if baseline models were selected
            # (Moving Average and Seasonal Naive don't naturally learn from discount features)
            if is_discounted_in_future and model_name in ["Moving Average", "Seasonal Naive", "Croston"]:
                hist_uplift = feat_row.get("discountUpliftPercentage", 0.0) or 0.0
                if hist_uplift > 0.0:
                    # Cap uplift to prevent unrealistic demand inflation
                    uplift_to_apply = min(hist_uplift, MAX_DISCOUNT_UPLIFT_CAP)
                    predicted_demand = predicted_demand * (1.0 + (uplift_to_apply / 100.0))

            # Round predicted demand to integer
            predicted_demand = int(round(max(0.0, predicted_demand)))

            # E. Recommendations & Coverage
            current_stock = int(prod["current_stock"])
            # average daily demand = recent 30 sales / (30 - stockout days)
            recent_30_sales = float(feat_row["recent30Sales"])
            stock_out_days_last_30 = int(prod_hist[prod_hist["date"] >= d30_start]["stockOutFlag"].sum()) if 'stockOutFlag' in prod_hist.columns else 0
            usable_days_in_30 = max(1.0, 30.0 - stock_out_days_last_30)
            avg_daily_demand = float(recent_30_sales / usable_days_in_30)
            
            # Confirmed incoming stock from pending GRNs or orders (default 0)
            confirmed_incoming = 0
            
            safety_stock, required_stock, recommended_qty, stock_coverage, f_status = calculate_recommendation(
                predicted_demand, current_stock, safety_stock_pct, avg_daily_demand, confirmed_incoming
            )

            # F. Generate plain-English explanation
            target_month_name = calendar.month_name[month]
            explanation = generate_forecast_explanation(
                feat_row, predicted_demand, current_stock, safety_stock, recommended_qty, 
                stock_coverage, f_status, model_name, wape, target_month_name, safety_stock_pct
            )

            # G. Append rows mapped to schema
            analyses_rows.append({
                "productId": sku,
                "usableHistoryDays": int(feat_row["usableHistoryDays"]),
                "completeHistoryMonths": int(feat_row["completeHistoryMonths"]),
                "dataQuality": str(feat_row["dataQuality"]),
                "recent30Sales": int(feat_row["recent30Sales"]),
                "previous30Sales": int(feat_row["previous30Sales"]),
                "recentGrowthPercentage": float(feat_row["recentGrowthPercentage"]) if feat_row["recentGrowthPercentage"] is not None else None,
                "threeMonthAverage": float(feat_row["threeMonthAverage"]),
                "sixMonthAverage": float(feat_row["sixMonthAverage"]),
                "twelveMonthAverage": float(feat_row["twelveMonthAverage"]) if feat_row["twelveMonthAverage"] is not None else None,
                "sameMonthHistoricalAverage": float(feat_row["sameMonthHistoricalAverage"]) if feat_row["sameMonthHistoricalAverage"] is not None else None,
                "seasonalUpliftPercentage": float(feat_row["seasonalUpliftPercentage"]) if feat_row["seasonalUpliftPercentage"] is not None else None,
                "discountUpliftPercentage": float(feat_row["discountUpliftPercentage"]) if feat_row["discountUpliftPercentage"] is not None else None,
                "refundQuantity": int(feat_row["refundQuantity"]),
                "refundRate": float(feat_row["refundRate"]),
                "stockOutDays": int(feat_row["stockOutDays"]),
                "stockOutRatio": float(feat_row["stockOutRatio"]),
                "zeroSalesRatio": float(feat_row["zeroSalesRatio"]),
                "coefficientOfVariation": float(feat_row["coefficientOfVariation"]),
                "averageDemandInterval": float(feat_row["averageDemandInterval"]),
                "trendSlope": float(feat_row["trendSlope"]),
                "primaryBehaviour": str(feat_row["primaryBehaviour"]),
                "trendDirection": str(feat_row["trendDirection"]),
                "additionalBehaviourTags": feat_row["additionalBehaviourTags"],
                "analysisWarnings": feat_row["analysisWarnings"]
            })

            forecasts_rows.append({
                "productId": sku,
                "targetMonth": target_month_date,
                "currentStock": current_stock,
                "confirmedIncomingStock": confirmed_incoming,
                "predictedDemand": predicted_demand,
                "safetyStock": safety_stock,
                "requiredStock": required_stock,
                "recommendedOrderQuantity": recommended_qty,
                "stockCoverageDays": float(stock_coverage) if stock_coverage != 999.0 else None,
                "selectedModel": model_name,
                "modelParameters": model_params,
                "MAE": float(mae),
                "RMSE": float(rmse),
                "WAPE": float(wape),
                "accuracyScore": float(accuracy_score),
                "reliabilityLevel": str(reliability),
                "predictionReason": explanation,
                "status": f_status
            })

            success_count += 1

        except Exception as err:
            fail_count += 1
            print(f"ERROR: Failed to generate forecast for SKU {sku}: {err}")

    # Return Run metadata and rows
    run_meta = {
        "targetMonth": target_month_date,
        "dataStartDate": date(2023, 1, 1),
        "dataEndDate": cutoff_date,
        "productsProcessed": success_count,
        "productsFailed": fail_count,
        "configurationSnapshot": {
            "safetyStockPercentage": safety_stock_pct,
            "maxDiscountUpliftCap": MAX_DISCOUNT_UPLIFT_CAP,
            "historyStart": "2023-01-01"
        }
    }

    return run_meta, analyses_rows, forecasts_rows
