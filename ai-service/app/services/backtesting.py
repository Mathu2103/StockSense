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
    validation_days: int = 30
) -> Dict[str, Dict[str, float]]:
    """
    Splits history into train/validate, runs candidate models, and evaluates WAPE, MAE, RMSE.
    """
    results = {}
    
    # Sort chronologically
    df_sorted = product_history.sort_values("date").copy()
    n = len(df_sorted)
    
    if n < validation_days + 15:
        # Insufficient data to backtest, return defaults
        return results

    # Split
    split_idx = n - validation_days
    train_df = df_sorted.iloc[:split_idx]
    val_df = df_sorted.iloc[split_idx:]
    
    # Target values
    actual_vals = val_df["net_qty_sold"].values
    
    # Import models here to prevent circular imports
    from app.models.seasonal_naive import SeasonalNaiveModel
    from app.models.moving_average import MovingAverageModel
    from app.models.linear_regression import LinearRegressionModel
    from app.models.random_forest import RandomForestModel
    from app.models.gradient_boosting import GradientBoostingModel
    from app.models.croston import CrostonModel
    
    # 1. Seasonal Naive
    m_sn = SeasonalNaiveModel().fit(train_df, target_month)
    p_sn = m_sn.predict(val_df)
    results["Seasonal Naive"] = {
        "WAPE": calculate_wape(actual_vals, p_sn),
        "MAE": calculate_mae(actual_vals, p_sn),
        "RMSE": calculate_rmse(actual_vals, p_sn)
    }
    
    # 2. Moving Average
    m_ma = MovingAverageModel().fit(train_df)
    p_ma = m_ma.predict(val_df)
    results["Moving Average"] = {
        "WAPE": calculate_wape(actual_vals, p_ma),
        "MAE": calculate_mae(actual_vals, p_ma),
        "RMSE": calculate_rmse(actual_vals, p_ma)
    }

    # 3. Linear Regression
    m_lr = LinearRegressionModel().fit(train_df)
    p_lr = m_lr.predict(val_df)
    results["Linear Regression"] = {
        "WAPE": calculate_wape(actual_vals, p_lr),
        "MAE": calculate_mae(actual_vals, p_lr),
        "RMSE": calculate_rmse(actual_vals, p_lr)
    }

    # 4. Random Forest
    m_rf = RandomForestModel().fit(train_df)
    p_rf = m_rf.predict(val_df)
    results["Random Forest"] = {
        "WAPE": calculate_wape(actual_vals, p_rf),
        "MAE": calculate_mae(actual_vals, p_rf),
        "RMSE": calculate_rmse(actual_vals, p_rf)
    }

    # 5. Gradient Boosting
    m_gb = GradientBoostingModel().fit(train_df)
    p_gb = m_gb.predict(val_df)
    results["Gradient Boosting"] = {
        "WAPE": calculate_wape(actual_vals, p_gb),
        "MAE": calculate_mae(actual_vals, p_gb),
        "RMSE": calculate_rmse(actual_vals, p_gb)
    }

    # 6. Croston (only if profile is Intermittent or has zero sales days)
    m_cr = CrostonModel().fit(train_df)
    p_cr = m_cr.predict(val_df)
    results["Croston"] = {
        "WAPE": calculate_wape(actual_vals, p_cr),
        "MAE": calculate_mae(actual_vals, p_cr),
        "RMSE": calculate_rmse(actual_vals, p_cr)
    }

    return results
