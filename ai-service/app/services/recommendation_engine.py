from typing import Tuple
import math

def calculate_recommendation(
    predicted_demand: int,
    current_stock: int,
    safety_stock_pct: float = 0.15,
    average_daily_sales: float = 0.0,
    confirmed_incoming_stock: int = 0,
    target_month_days: int = 30
) -> Tuple[int, int, int, float, str, float, float]:
    """
    Calculates safety stock, required stock, recommended purchase quantity, coverage, status, stock vs required %, and forecast daily demand.
    Returns: (safety_stock, required_stock, recommended_quantity, stock_coverage_days, status, stock_vs_required_pct, forecast_daily_demand)
    """
    # 1. Safety stock = ceil(Predicted Monthly Demand * safety_stock_pct)
    safety_stock = int(math.ceil(predicted_demand * safety_stock_pct))
    
    # 2. Required stock = Predicted Monthly Demand + Safety Stock
    required_stock = predicted_demand + safety_stock
    
    # 3. Recommended order quantity = max(0, Required Stock - Current Stock - Confirmed Incoming Stock)
    recommended_qty = max(0, required_stock - current_stock - confirmed_incoming_stock)
    
    # 4. Forecast Coverage Days based on average forecast daily demand
    target_days = max(1, target_month_days)
    forecast_daily_demand = float(predicted_demand / target_days)
    
    if forecast_daily_demand > 0.0001:
        stock_coverage = float(current_stock / forecast_daily_demand)
    else:
        stock_coverage = 999.0  # Safe large representation for zero predicted demand
    
    # 5. Stock vs Required Percentage
    if required_stock > 0:
        stock_vs_required_pct = float(current_stock / required_stock * 100.0)
    else:
        stock_vs_required_pct = 100.0 if current_stock == 0 else 999.0

    # 6. Status classification logic (Precedence: CRITICAL_ACTION > REORDER_REQUIRED > OVERSTOCK_RISK > SUFFICIENT)
    is_critical = (
        current_stock < required_stock and 
        recommended_qty > 0 and 
        (stock_coverage < 12.0 or current_stock == 0)
    )
    
    is_reorder = (
        current_stock < required_stock and 
        recommended_qty > 0 and 
        stock_coverage >= 12.0
    )
    
    is_overstock = (
        current_stock > max(required_stock, 10) * 1.50 and 
        stock_coverage > 45.0 and
        not is_critical
    )
    
    if is_critical:
        status = "CRITICAL_ACTION"
    elif is_reorder:
        status = "REORDER_REQUIRED"
    elif is_overstock:
        status = "OVERSTOCK_RISK"
    else:
        status = "SUFFICIENT"

    return safety_stock, required_stock, recommended_qty, stock_coverage, status, stock_vs_required_pct, forecast_daily_demand

