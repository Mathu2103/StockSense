import pandas as pd
import numpy as np
from datetime import datetime, date, timedelta
from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session

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
from app.config import settings

def run_monthly_forecasting(
    db: Session,
    target_month_str: str
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
    features_df = classify_product_demand(features_df, cleaned_df)

    # 5. Load safety stock percentage from DB settings if available
    safety_stock_pct = settings.SAFETY_STOCK_PERCENTAGE
    try:
        # Check system_settings table
        res = db.execute(text("SELECT value FROM system_settings WHERE key = 'safety_stock_percentage'")).first()
        if res:
            # Parse json/float
            safety_stock_pct = float(res[0])
    except Exception:
        pass

    # 6. Generate target month dates for forecasting
    # January has 31 days
    year = target_month_date.year
    month = target_month_date.month
    
    # Calculate days in this month
    if month == 12:
        next_month = date(year + 1, 1, 1)
    else:
        next_month = date(year, month + 1, 1)
    days_in_month = (next_month - target_month_date).days
    
    future_dates = pd.date_range(target_month_date, next_month - timedelta(days=1)).date
    
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
    active_future_discounts = discounts_df[
        (discounts_df["approval_status"] == "APPROVED") &
        ((discounts_df["start_date"].isnull()) | (discounts_df["start_date"] <= next_month - timedelta(days=1))) &
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
        
        # Exclude discontinued products from forecasting
        if status in ["DISCONTINUED", "INACTIVE"]:
            continue

        prod_hist = cleaned_df[cleaned_df["sku"] == sku]
        prod_features = features_df[features_df["sku"] == sku]

        if prod_features.empty:
            fail_count += 1
            print(f"Skipping forecasting for {sku}: no engineered features found.")
            continue

        feat_row = prod_features.iloc[0].to_dict()

        try:
            # A. Select the best model
            model_name, accuracy_score, model_instance = select_best_model(
                prod_hist, feat_row["demand_profile"], target_month_date.month
            )

            # B. Prepare future dates feature dataframe for this SKU
            prod_future_df = future_base_df.copy()
            prod_future_df["sku"] = sku
            prod_future_df["average_unit_price"] = float(prod["selling_price"])
            prod_future_df["discount_applied"] = False
            prod_future_df["discount_percentage"] = 0.0
            prod_future_df["discount_type"] = "NONE"

            # Check future discounts
            if not active_future_discounts.empty and not discount_mappings_df.empty:
                # Merge mappings with active discounts for this SKU
                sku_mappings = discount_mappings_df[discount_mappings_df["sku"] == sku]
                if not sku_mappings.empty:
                    sku_discounts = pd.merge(sku_mappings, active_future_discounts, on="discount_id", how="inner")
                    for _, disc in sku_discounts.iterrows():
                        d_start = disc["start_date"] or target_month_date
                        d_end = disc["end_date"] or (next_month - timedelta(days=1))
                        val = disc["discount_value"]
                        dtype = disc["type"]
                        
                        mask = (prod_future_df["date"] >= d_start) & (prod_future_df["date"] <= d_end)
                        prod_future_df.loc[mask, "discount_applied"] = True
                        prod_future_df.loc[mask, "discount_percentage"] = float(val)
                        prod_future_df.loc[mask, "discount_type"] = dtype

            # C. Predict daily demand and sum
            daily_predictions = model_instance.predict(prod_future_df)
            predicted_demand = int(max(0, np.sum(daily_predictions)))

            # D. Recommendations & Coverage
            current_stock = int(prod["current_stock"])
            avg_daily_sales = float(feat_row["average_daily_sales"])
            
            recommended_qty, stock_coverage, f_status = calculate_recommendation(
                predicted_demand, current_stock, safety_stock_pct, avg_daily_sales
            )

            # E. Generate explanation
            explanation = generate_forecast_explanation(
                feat_row, predicted_demand, current_stock, recommended_qty, stock_coverage, f_status
            )

            # F. Append rows
            analyses_rows.append({
                "sku": sku,
                "recent_30_day_sales": int(feat_row["recent_30_day_sales"]),
                "previous_30_day_sales": int(feat_row["previous_30_day_sales"]),
                "recent_growth_percent": float(feat_row["recent_growth_percent"]) if pd.notnull(feat_row["recent_growth_percent"]) else None,
                "three_month_average": float(feat_row["three_month_average"]),
                "six_month_average": float(feat_row["six_month_average"]),
                "same_month_historical_average": float(feat_row["same_month_historical_average"]) if pd.notnull(feat_row["same_month_historical_average"]) else None,
                "average_daily_sales": float(feat_row["average_daily_sales"]),
                "discount_uplift_percent": float(feat_row["discount_uplift_percent"]) if pd.notnull(feat_row["discount_uplift_percent"]) else None,
                "refund_quantity": int(feat_row["refund_quantity"]),
                "stock_out_estimate": int(feat_row["stock_out_estimate"]),
                "demand_trend": str(feat_row["demand_trend"]),
                "data_quality": str(feat_row["data_quality"])
            })

            forecasts_rows.append({
                "sku": sku,
                "current_stock_snapshot": current_stock,
                "stock_coverage_days": float(stock_coverage) if stock_coverage != 999.0 else None,
                "predicted_demand": predicted_demand,
                "recommended_quantity": recommended_qty,
                "selected_model": model_name,
                "accuracy_score": float(accuracy_score),
                "prediction_reason": explanation,
                "status": f_status
            })

            success_count += 1

        except Exception as err:
            fail_count += 1
            print(f"ERROR: Failed to generate forecast for SKU {sku}: {err}")

    # Return Run response and rows
    run_meta = {
        "targetMonth": target_month_date,
        "dataStartDate": date(2023, 1, 1),
        "dataEndDate": cutoff_date,
        "productsProcessed": success_count,
        "productsFailed": fail_count
    }

    return run_meta, analyses_rows, forecasts_rows
from sqlalchemy import text
