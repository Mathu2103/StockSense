import pandas as pd
import numpy as np
from datetime import datetime, date, timedelta
from typing import Dict, Any, List

def calculate_wape(actual: np.ndarray, predicted: np.ndarray) -> float:
    sum_actual = np.sum(actual)
    if sum_actual == 0:
        return 0.0 if np.sum(predicted) == 0 else 1.0
    return float(np.sum(np.abs(actual - predicted)) / sum_actual)

def calculate_mae(actual: np.ndarray, predicted: np.ndarray) -> float:
    return float(np.mean(np.abs(actual - predicted)))

def calculate_rmse(actual: np.ndarray, predicted: np.ndarray) -> float:
    return float(np.sqrt(np.mean((actual - predicted) ** 2)))

def run_backtest_on_product(
    product_history: pd.DataFrame,
    target_month: int,
    n_windows: int = 3
) -> Dict[str, Dict[str, float]]:
    """
    Executes walk-forward validation on product historical sales.
    Splits history into calendar month chunks.
    Evaluates candidate models across target validation months.
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
    model_window_errors = {m: [] for m in model_keys}
    
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
            
        actual_vals = val_df["net_qty_sold"].values
        
        # 1. Moving Average
        m_ma = MovingAverageModel(window_days=90).fit(train_df)
        p_ma = m_ma.predict(val_df)
        model_window_errors["Moving Average"].append((actual_vals, p_ma))
        
        # 2. Seasonal Naive
        m_sn = SeasonalNaiveModel().fit(train_df, v_month)
        p_sn = m_sn.predict(val_df)
        model_window_errors["Seasonal Naive"].append((actual_vals, p_sn))
        
        # 3. Linear Regression
        m_lr = LinearRegressionModel().fit(train_df)
        p_lr = m_lr.predict(val_df)
        model_window_errors["Linear Regression"].append((actual_vals, p_lr))
        
        # 4. Random Forest
        m_rf = RandomForestModel().fit(train_df)
        p_rf = m_rf.predict(val_df)
        model_window_errors["Random Forest"].append((actual_vals, p_rf))
        
        # 5. Gradient Boosting
        m_gb = GradientBoostingModel().fit(train_df)
        p_gb = m_gb.predict(val_df)
        model_window_errors["Gradient Boosting"].append((actual_vals, p_gb))
        
        # 6. Croston
        m_cr = CrostonModel().fit(train_df)
        p_cr = m_cr.predict(val_df)
        model_window_errors["Croston"].append((actual_vals, p_cr))
        
    results = {}
    for m in model_keys:
        window_metrics = model_window_errors[m]
        if not window_metrics:
            continue
            
        wapes = []
        maes = []
        rmses = []
        for actual, pred in window_metrics:
            wapes.append(calculate_wape(actual, pred))
            maes.append(calculate_mae(actual, pred))
            rmses.append(calculate_rmse(actual, pred))
            
        results[m] = {
            "WAPE": float(np.mean(wapes)),
            "MAE": float(np.mean(maes)),
            "RMSE": float(np.mean(rmses)),
            "stability": float(np.std(wapes)) if len(wapes) > 1 else 0.0,
            "window_count": len(wapes)
        }
        
    return results
