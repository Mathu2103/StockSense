import pandas as pd
from typing import Dict, Any, Tuple
from app.services.backtesting import run_backtest_on_product
from app.models.seasonal_naive import SeasonalNaiveModel
from app.models.moving_average import MovingAverageModel
from app.models.linear_regression import LinearRegressionModel
from app.models.random_forest import RandomForestModel
from app.models.gradient_boosting import GradientBoostingModel
from app.models.croston import CrostonModel

def select_best_model(
    product_history: pd.DataFrame,
    demand_profile: str,
    target_month: int
) -> Tuple[str, float, Any]:
    """
    Evaluates candidate models via backtesting and selects the best fitted model instance.
    Returns: (model_name, accuracy_score, fitted_model_instance)
    """
    # 1. Check data sufficiency
    n_days = len(product_history)
    
    if demand_profile == "LIMITED_HISTORY" or n_days < 45:
        # Limited history fallback: use simple Moving Average (30-day window)
        model = MovingAverageModel(window_days=30).fit(product_history)
        # Accuracy score is low confidence (e.g., 0.5)
        return "Moving Average (Limited Data)", 0.50, model

    # 2. Run backtesting
    backtest_errs = run_backtest_on_product(product_history, target_month, validation_days=30)
    
    # 3. Handle model eligibility by profile
    eligible_models = ["Moving Average", "Seasonal Naive", "Linear Regression", "Random Forest", "Gradient Boosting"]
    if demand_profile == "INTERMITTENT":
        eligible_models.append("Croston")
        
    best_model_name = "Moving Average"
    best_wape = 999.0
    
    for model_name in eligible_models:
        if model_name in backtest_errs:
            wape = backtest_errs[model_name]["WAPE"]
            if wape < best_wape:
                best_wape = wape
                best_model_name = model_name

    # 4. Parsimonious rule: complex models must beat baseline by at least 5% WAPE
    baseline_wape = backtest_errs.get("Moving Average", {}).get("WAPE", 999.0)
    
    # If the chosen best is a complex model (Random Forest / Gradient Boosting)
    if best_model_name in ["Random Forest", "Gradient Boosting"]:
        # If it doesn't beat baseline by at least 5% relative improvement
        if best_wape >= baseline_wape * 0.95:
            best_model_name = "Moving Average"
            best_wape = baseline_wape

    # 5. Fit the final selected model on the entire historical dataset
    if best_model_name == "Seasonal Naive":
        model_instance = SeasonalNaiveModel().fit(product_history, target_month)
    elif best_model_name == "Linear Regression":
        model_instance = LinearRegressionModel().fit(product_history)
    elif best_model_name == "Random Forest":
        model_instance = RandomForestModel().fit(product_history)
    elif best_model_name == "Gradient Boosting":
        model_instance = GradientBoostingModel().fit(product_history)
    elif best_model_name == "Croston":
        model_instance = CrostonModel().fit(product_history)
    else:
        # Default/Moving Average
        best_model_name = "Moving Average"
        model_instance = MovingAverageModel().fit(product_history)

    # Accuracy Score = max(0, 1 - WAPE)
    accuracy_score = max(0.0, 1.0 - best_wape) if best_wape != 999.0 else 0.50

    return best_model_name, accuracy_score, model_instance
