from typing import Tuple
import math

def calculate_recommendation(
    predicted_demand: int,
    current_stock: int,
    safety_stock_pct: float = 0.15,
    average_daily_sales: float = 0.0,
    confirmed_incoming_stock: int = 0
) -> Tuple[int, int, int, float, str]:
    """
    Calculates safety stock, required stock, recommended purchase quantity, coverage, and status.
    Returns: (safety_stock, required_stock, recommended_quantity, stock_coverage_days, status)
    """
    # 1. Safety stock
    safety_stock = int(math.ceil(predicted_demand * safety_stock_pct))
    
    # 2. Required stock
    required_stock = predicted_demand + safety_stock
    
    # 3. Recommended order quantity
    recommended_qty = max(0, required_stock - current_stock - confirmed_incoming_stock)
    
    # 4. Stock coverage days
    # Handle zero or near-zero daily sales safely
    if average_daily_sales > 0.001:
        stock_coverage = float(current_stock / average_daily_sales)
    else:
        stock_coverage = 999.0  # Infinite or very long coverage

    # 5. Status classification logic (Precedence: CRITICAL_ACTION > OVERSTOCK_RISK > SUFFICIENT)
    is_critical = (
        (current_stock < predicted_demand or current_stock < required_stock) and 
        recommended_qty > 0 and 
        (stock_coverage < 12.0 or current_stock == 0)
    )
    
    is_overstock = (
        current_stock > max(required_stock, 10) * 1.50 and 
        stock_coverage > 45.0 and
        not is_critical
    )
    
    if is_critical:
        status = "CRITICAL_ACTION"
    elif is_overstock:
        status = "OVERSTOCK_RISK"
    else:
        status = "SUFFICIENT"

    return safety_stock, required_stock, recommended_qty, stock_coverage, status
