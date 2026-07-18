import pytest
import pandas as pd
import numpy as np
from datetime import date, timedelta

from app.services.recommendation_engine import calculate_recommendation
from app.services.explanation_engine import generate_forecast_explanation
from app.services.product_profiler import classify_product_demand
from app.services.backtesting import calculate_wape
from app.models.seasonal_naive import SeasonalNaiveModel
from app.models.moving_average import MovingAverageModel
from app.models.linear_regression import LinearRegressionModel
from app.models.croston import CrostonModel

def test_wape_calculation():
    actual = np.array([10, 20, 30, 0, 50])
    predicted = np.array([12, 18, 35, 5, 45])
    wape = calculate_wape(actual, predicted)
    assert round(wape, 4) == 0.1727

def test_recommendation_logic():
    # safety stock 15%, predicted 100, current stock 80, recommended = max(0, 100 + 15 - 80) = 35
    recommended_qty, stock_coverage, status = calculate_recommendation(
        predicted_demand=100,
        current_stock=80,
        safety_stock_pct=0.15,
        average_daily_sales=5.0
    )
    assert recommended_qty == 35
    assert stock_coverage == 16.0
    assert status == "CRITICAL_ACTION" # Recommended quantity > 0

    # Overstock Risk: stock is 300, predicted is 100 (300 > 150), coverage is 300/5 = 60 days (> 45 days)
    _, _, status_over = calculate_recommendation(
        predicted_demand=100,
        current_stock=300,
        safety_stock_pct=0.15,
        average_daily_sales=5.0
    )
    assert status_over == "OVERSTOCK_RISK"

def test_explanation_engine():
    analysis_row = {
        "sku": "SKU-TEST-1",
        "demand_trend": "GROWING",
        "data_quality": "HIGH",
        "recent_growth_percent": 0.20,
        "recent_30_day_sales": 150,
        "three_month_average": 4.0,
        "same_month_historical_average": 200.0,
        "discount_uplift_percent": 0.25,
        "stock_out_estimate": 0,
        "total_days_history": 365
    }
    
    explanation = generate_forecast_explanation(
        analysis_row=analysis_row,
        predicted_demand=180,
        current_stock=50,
        recommended_qty=157,
        stock_coverage=10.0,
        status="CRITICAL_ACTION"
    )
    
    assert "increased by 20.0%" in explanation
    assert "highly seasonal" in explanation
    assert "restock of 157 units" in explanation

def test_models():
    history_records = []
    start_d = date(2025, 1, 1)
    for i in range(120):
        d = start_d + timedelta(days=i)
        history_records.append({
            "date": d,
            "net_qty_sold": 5 if d.weekday() in [5, 6] else 2, # weekend demand
            "month": d.month,
            "year": d.year,
            "dayOfWeek": d.weekday()
        })
    df = pd.DataFrame(history_records)
    
    # Test Moving Average
    ma = MovingAverageModel(window_days=30).fit(df)
    future_dates = pd.DataFrame([{"date": date(2025, 5, 1)}])
    preds = ma.predict(future_dates)
    assert len(preds) == 1
    assert preds[0] > 0
