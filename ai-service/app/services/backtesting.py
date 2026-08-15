import pandas as pd
import numpy as np
from datetime import datetime, date, timedelta
from typing import Dict, Any, List

def calculate_monthly_wape(actual_monthly: np.ndarray, predicted_monthly: np.ndarray) -> float:
    sum_actual = float(np.sum(actual_monthly))
    if sum_actual == 0:
        return 0.0 if float(np.sum(predicted_monthly)) == 0 else 1.0
    return float(np.sum(np.abs(actual_monthly - predicted_monthly)) / sum_actual)

def calculate_monthly_mae(actual_monthly: np.ndarray, predicted_monthly: np.ndarray) -> float:
    return float(np.mean(np.abs(actual_monthly - predicted_monthly)))

def calculate_monthly_rmse(actual_monthly: np.ndarray, predicted_monthly: np.ndarray) -> float:
    return float(np.sqrt(np.mean((actual_monthly - predicted_monthly) ** 2)))

def calculate_monthly_bias(actual_monthly: np.ndarray, predicted_monthly: np.ndarray) -> float:
    """
    Monthly Bias = Average(Predicted Monthly Demand - Actual Monthly Demand)
    Positive Bias -> model usually over-forecasts
    Negative Bias -> model usually under-forecasts
    """
    return float(np.mean(predicted_monthly - actual_monthly))

def run_backtest_on_product(
    product_history: pd.DataFrame,
    target_month: int,
    n_windows: int = 3
) -> Dict[str, Dict[str, float]]:
    """
    Executes walk-forward validation on complete historical months.
    Compares total predicted monthly demand against actual monthly demand.
    Returns monthly WAPE, MAE, RMSE, and Bias for candidate models.
    """
    # Sort chronologically
    df_sorted = product_history.sort_values("date").copy()
    
    # Group by year and month to get chronological list of complete months
    monthly_groups = df_sorted.groupby(["year", "month"]).size().reset_index()
    monthly_groups = monthly_groups.sort_values(["year", "month"])
    
    total_months = len(monthly_groups)
    if total_months < 2:
        return {} # Insufficient data to evaluate
        
    # Scale validation window count based on data length
    if total_months < 6:
        n_windows = 1
    elif total_months < 9:
        n_windows = 2
        
    validation_months = monthly_groups.tail(n_windows)
    
    # Candidate models to evaluate
    model_keys = ["Moving Average", "Seasonal Naive", "Linear Regression", "Random Forest", "Gradient Boosting", "Croston"]
    model_window_results = {m: [] for m in model_keys}
    
    # Import model classes inside function to avoid circular imports
    from app.models.seasonal_naive import SeasonalNaiveModel
    from app.models.moving_average import MovingAverageModel
    from app.models.linear_regression import LinearRegressionModel
    from app.models.random_forest import RandomForestModel
    from app.models.gradient_boosting import GradientBoostingModel
    from app.models.croston import CrostonModel
    
    for idx, vm_row in validation_months.iterrows():
        v_year = int(vm_row["year"])
        v_month = int(vm_row["month"])
        
        # Training range: strictly before validation month
        train_df = df_sorted[
            (df_sorted["year"] < v_year) | 
            ((df_sorted["year"] == v_year) & (df_sorted["month"] < v_month))
        ].copy()
        
        # Validation range: the specific target month
        val_df = df_sorted[
            (df_sorted["year"] == v_year) & (df_sorted["month"] == v_month)
        ].copy()
        
        if train_df.empty or val_df.empty:
            continue
            
        actual_monthly_demand = float(val_df["net_qty_sold"].sum())
        
        # 1. Moving Average
        m_ma = MovingAverageModel(window_days=90).fit(train_df)
        pred_ma = float(np.sum(m_ma.predict(val_df)))
        model_window_results["Moving Average"].append((actual_monthly_demand, pred_ma))
        
        # 2. Seasonal Naive
        m_sn = SeasonalNaiveModel().fit(train_df, v_month)
        pred_sn = float(np.sum(m_sn.predict(val_df)))
        model_window_results["Seasonal Naive"].append((actual_monthly_demand, pred_sn))
        
        # 3. Linear Regression
        m_lr = LinearRegressionModel().fit(train_df)
        pred_lr = float(np.sum(m_lr.predict(val_df)))
        model_window_results["Linear Regression"].append((actual_monthly_demand, pred_lr))
        
        # 4. Random Forest
        m_rf = RandomForestModel().fit(train_df)
        pred_rf = float(np.sum(m_rf.predict(val_df)))
        model_window_results["Random Forest"].append((actual_monthly_demand, pred_rf))
        
        # 5. Gradient Boosting
        m_gb = GradientBoostingModel().fit(train_df)
        pred_gb = float(np.sum(m_gb.predict(val_df)))
        model_window_results["Gradient Boosting"].append((actual_monthly_demand, pred_gb))
        
        # 6. Croston
        m_cr = CrostonModel().fit(train_df)
        pred_cr = float(np.sum(m_cr.predict(val_df)))
        model_window_results["Croston"].append((actual_monthly_demand, pred_cr))
        
    results = {}
    for m in model_keys:
        window_pairs = model_window_results[m]
        if not window_pairs:
            continue
            
        actuals = np.array([p[0] for p in window_pairs])
        preds = np.array([p[1] for p in window_pairs])
        
        wape = calculate_monthly_wape(actuals, preds)
        mae = calculate_monthly_mae(actuals, preds)
        rmse = calculate_monthly_rmse(actuals, preds)
        bias = calculate_monthly_bias(actuals, preds)
        
        # Window-level WAPEs for stability check
        window_wapes = [
            calculate_monthly_wape(np.array([act]), np.array([prd]))
            for act, prd in window_pairs
        ]
        
        results[m] = {
            "WAPE": float(wape),
            "MAE": float(mae),
            "RMSE": float(rmse),
            "Bias": float(bias),
            "stability": float(np.std(window_wapes)) if len(window_wapes) > 1 else 0.0,
            "window_count": len(window_pairs)
        }
        
    return results
