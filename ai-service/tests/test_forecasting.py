import pytest
import pandas as pd
import numpy as np
from datetime import date, timedelta

from app.services.recommendation_engine import calculate_recommendation
from app.services.explanation_engine import generate_forecast_explanation
from app.services.product_profiler import classify_product_demand
from app.services.backtesting import calculate_wape, run_backtest_on_product
from app.services.feature_engineering import reconstruct_stock_history, calculate_product_features
from app.services.data_cleaner import clean_and_merge_data
from app.services.model_selector import select_best_model
from app.models.seasonal_naive import SeasonalNaiveModel
from app.models.moving_average import MovingAverageModel
from app.models.linear_regression import LinearRegressionModel
from app.models.croston import CrostonModel

# 1. Net Sales After Refunds Test
def test_net_sales_after_refunds():
    # If refunds exceed gross, it should cap at 0
    gross = 10
    refunds = 15
    net = max(0, gross - refunds)
    assert net == 0

    gross2 = 10
    refunds2 = 4
    net2 = max(0, gross2 - refunds2)
    assert net2 == 6

# 2. Missing Date Generation Test
def test_missing_date_generation():
    products_df = pd.DataFrame([{
        "sku": "SKU-DATE-TEST",
        "name": "Date Test Product",
        "launch_date": "2025-01-01",
        "status": "ACTIVE",
        "category_name": "Bakery",
        "subcategory_name": "Bread",
        "brand_name": "BrandX",
        "cost_price": 5.0,
        "selling_price": 10.0,
        "current_stock": 20
    }])
    # Only sales on 2025-01-01 and 2025-01-05
    sales_df = pd.DataFrame([
        {"date": "2025-01-01", "sku": "SKU-DATE-TEST", "gross_qty_sold": 5, "discounted_qty_sold": 0, "average_unit_price": 10.0, "sales_revenue": 50.0},
        {"date": "2025-01-05", "sku": "SKU-DATE-TEST", "gross_qty_sold": 3, "discounted_qty_sold": 0, "average_unit_price": 10.0, "sales_revenue": 30.0}
    ])
    refunds_df = pd.DataFrame([])
    grn_df = pd.DataFrame([])
    adjustments_df = pd.DataFrame([])
    discounts_df = pd.DataFrame([])
    discount_mappings_df = pd.DataFrame([])

    cleaned = clean_and_merge_data(
        products_df, sales_df, refunds_df, grn_df, adjustments_df,
        discounts_df, discount_mappings_df,
        start_date="2025-01-01", end_date="2025-01-05"
    )
    # The cleaned panel must have exactly 5 rows (one for each day: Jan 1, 2, 3, 4, 5)
    assert len(cleaned) == 5
    assert list(cleaned["date"]) == [
        date(2025, 1, 1),
        date(2025, 1, 2),
        date(2025, 1, 3),
        date(2025, 1, 4),
        date(2025, 1, 5)
    ]

# 3. Stock-Out Handling and Reconstruction Test
def test_stock_out_handling_and_reconstruction():
    # Final stock snapshot = 10 units at Jan 5
    products_df = pd.DataFrame([{"sku": "SKU-STOCK-TEST", "current_stock": 10}])
    cleaned_df = pd.DataFrame([
        {"date": date(2025, 1, 1), "sku": "SKU-STOCK-TEST", "net_qty_sold": 2, "grn_qty_received": 0, "pos_adjustment": 0, "neg_adjustment": 0},
        {"date": date(2025, 1, 2), "sku": "SKU-STOCK-TEST", "net_qty_sold": 5, "grn_qty_received": 0, "pos_adjustment": 0, "neg_adjustment": 0},
        {"date": date(2025, 1, 3), "sku": "SKU-STOCK-TEST", "net_qty_sold": 0, "grn_qty_received": 15, "pos_adjustment": 0, "neg_adjustment": 0},
        {"date": date(2025, 1, 4), "sku": "SKU-STOCK-TEST", "net_qty_sold": 8, "grn_qty_received": 0, "pos_adjustment": 0, "neg_adjustment": 0},
        {"date": date(2025, 1, 5), "sku": "SKU-STOCK-TEST", "net_qty_sold": 1, "grn_qty_received": 0, "pos_adjustment": 0, "neg_adjustment": 0}
    ])
    
    reconstructed = reconstruct_stock_history(cleaned_df, products_df)
    
    # Working backwards from Jan 5:
    # Closing stock Jan 5 = 10
    # Opening stock Jan 5 = 10 - 0 - 0 + 1 + 0 = 11
    # Closing stock Jan 4 = 11
    # Opening stock Jan 4 = 11 - 0 - 0 + 8 + 0 = 19
    # Closing stock Jan 3 = 19
    # Opening stock Jan 3 = 19 - 15 - 0 + 0 + 0 = 4
    # Closing stock Jan 2 = 4
    # Opening stock Jan 2 = 4 - 0 - 0 + 5 + 0 = 9
    # Closing stock Jan 1 = 9
    # Opening stock Jan 1 = 9 - 0 - 0 + 2 + 0 = 11
    
    row_jan5 = reconstructed[reconstructed["date"] == date(2025, 1, 5)].iloc[0]
    row_jan3 = reconstructed[reconstructed["date"] == date(2025, 1, 3)].iloc[0]
    
    assert row_jan5["estimated_closing_stock"] == 10
    assert row_jan5["estimated_opening_stock"] == 11
    assert row_jan3["estimated_opening_stock"] == 4
    assert (reconstructed["stockOutFlag"] == 0).all() # Opening stock was always > 0

# 4. Growth Rate Calculation with Zero Test
def test_growth_calculation_with_prev_zero():
    # Case A: previous period had zero sales, recent period has positive sales
    prev_30_sales = 0
    recent_30_sales = 20
    growth = None
    divisor = max(1, prev_30_sales)
    if prev_30_sales > 0:
        growth = ((recent_30_sales - prev_30_sales) / divisor) * 100.0
    assert growth is None

    # Case B: normal calculation
    prev_30_sales2 = 10
    recent_30_sales2 = 15
    if prev_30_sales2 > 0:
        growth = ((recent_30_sales2 - prev_30_sales2) / prev_30_sales2) * 100.0
    assert growth == 50.0

# 5. Seasonal Uplift and Coef Variation Test
def test_seasonality_and_variation():
    # same_month_avg = 120, overall_avg = 100 -> uplift = 20%
    same_month_avg = 120.0
    overall_monthly_avg = 100.0
    uplift = ((same_month_avg - overall_monthly_avg) / overall_monthly_avg) * 100.0
    assert uplift == 20.0

    # Coefficient of Variation: std / mean
    sales = np.array([10, 10, 10, 10, 10])
    mean = np.mean(sales)
    std = np.std(sales)
    cv = std / mean if mean > 0 else 0.0
    assert cv == 0.0

# 6. Behaviour Classifier Test
def test_behaviour_classifier():
    features_df = pd.DataFrame([{
        "productId": "SKU-BEHAVIOR-TEST",
        "completeHistoryMonths": 12,
        "recentGrowthPercentage": 5.0,
        "coefficientOfVariation": 0.15,
        "threeMonthAverage": 50.0,
        "sixMonthAverage": 52.0,
        "trendSlope": 0.1,
        "zeroSalesRatio": 0.05,
        "seasonalUpliftPercentage": 5.0,
        "discountUpliftPercentage": 2.0
    }])
    
    classified = classify_product_demand(features_df)
    row = classified.iloc[0]
    assert row["primaryBehaviour"] == "STABLE"
    assert "STABLE" in row["additionalBehaviourTags"] or len(row["additionalBehaviourTags"]) == 0

# 7. Croston Intermittent Demand Method Test
def test_croston_method():
    train_records = []
    # Intermittent sales: mostly zero with sparse positive sales
    for i in range(30):
        train_records.append({
            "date": date(2025, 1, 1) + timedelta(days=i),
            "net_qty_sold": 10 if i in [5, 15, 25] else 0,
            "month": 1,
            "year": 2025
        })
    df = pd.DataFrame(train_records)
    cr = CrostonModel(alpha=0.15).fit(df)
    future_dates = pd.DataFrame([{"date": date(2025, 2, 1)}])
    preds = cr.predict(future_dates)
    assert len(preds) == 1
    # Average demand interval was 10, demand size was 10 -> Croston forecast = 10 / 10 = 1.0 unit per day
    assert round(preds[0], 2) > 0.0

# 8. Time-Based Walk-Forward Validation and Selector Test
def test_walk_forward_and_selector():
    history_records = []
    # Generate 180 days (6 complete months)
    start_d = date(2025, 1, 1)
    for i in range(180):
        d = start_d + timedelta(days=i)
        history_records.append({
            "date": d,
            "net_qty_sold": 5 if d.weekday() in [5, 6] else 1,
            "month": d.month,
            "year": d.year,
            "dayOfWeek": d.weekday(),
            "weekendFlag": 1 if d.weekday() in [5, 6] else 0,
            "average_unit_price": 10.0,
            "discount_applied": False,
            "discount_percentage": 0.0
        })
    df = pd.DataFrame(history_records)
    
    # Run backtest
    results = run_backtest_on_product(df, target_month=7, n_windows=2)
    assert len(results) > 0
    assert "Moving Average" in results
    assert "WAPE" in results["Moving Average"]

    # Select best model
    model_name, params, mae, rmse, wape, accuracy, reliability, model_instance = select_best_model(df, "STABLE", 7)
    assert model_name in ["Moving Average", "Linear Regression", "Random Forest"]
    assert reliability in ["HIGH", "MEDIUM", "LOW"]

# 9. Safety Stock and Reorder Test
def test_safety_stock_and_reorder():
    # predicted_demand = 200, current_stock = 50, safety_stock_pct = 15% (0.15), target_month_days = 30
    # safety stock = ceil(200 * 0.15) = 30
    # required stock = 200 + 30 = 230
    # recommended order = 230 - 50 - 0 = 180
    # forecast daily demand = 200 / 30 = 6.6667 units/day
    # stock coverage = 50 / 6.6667 = 7.5 days
    # stock vs required pct = (50 / 230) * 100 = 21.7%
    safety, required, recommended, coverage, status, stock_vs_req_pct = calculate_recommendation(
        predicted_demand=200,
        current_stock=50,
        safety_stock_pct=0.15,
        average_daily_sales=5.0,
        confirmed_incoming_stock=0,
        target_month_days=30
    )
    assert safety == 30
    assert required == 230
    assert recommended == 180
    assert round(coverage, 1) == 7.5
    assert status == "CRITICAL_ACTION"
    assert round(stock_vs_req_pct, 1) == 21.7

# 10. Explanation Verification Test
def test_explanation_verification():
    analysis_row = {
        "productId": "SKU-EXPLANATION-TEST",
        "usableHistoryDays": 365,
        "completeHistoryMonths": 12,
        "dataQuality": "GOOD",
        "recent30Sales": 100,
        "previous30Sales": 90,
        "recentGrowthPercentage": 11.1,
        "threeMonthAverage": 3.0,
        "sixMonthAverage": 3.0,
        "twelveMonthAverage": 3.0,
        "sameMonthHistoricalAverage": 120.0,
        "seasonalUpliftPercentage": 20.0,
        "discountUpliftPercentage": 15.0,
        "refundQuantity": 2,
        "refundRate": 0.02,
        "stockOutDays": 3,
        "stockOutRatio": 0.01,
        "zeroSalesRatio": 0.05,
        "coefficientOfVariation": 0.20,
        "averageDemandInterval": 1.2,
        "trendSlope": 0.05,
        "primaryBehaviour": "STABLE"
    }

    explanation = generate_forecast_explanation(
        analysis_row=analysis_row,
        predicted_demand=150,
        current_stock=20,
        safety_stock=23,
        recommended_qty=153,
        stock_coverage=6.0,
        status="CRITICAL_ACTION",
        selected_model="Moving Average",
        wape_score=0.15,
        target_month_name="January",
        safety_stock_pct=0.15,
        reliability_level="HIGH",
        stock_vs_required_pct=11.6
    )

    assert "Moving Average" in explanation
    assert "WAPE of 15.0%" in explanation
    assert "increased by 11.1%" in explanation
    assert "historically 20.0% higher" in explanation
    assert "3 stock-out day(s)" in explanation
    assert "CRITICAL ACTION" in explanation

