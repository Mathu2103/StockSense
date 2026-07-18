from typing import Tuple

def calculate_recommendation(
    predicted_demand: int,
    current_stock: int,
    safety_stock_pct: float = 0.15,
    average_daily_sales: float = 0.0
) -> Tuple[int, float, str]:
    """
    Calculates the recommended purchase quantity, stock coverage, and forecast status.
    Returns: (recommended_quantity, stock_coverage_days, status)
    """
    # 1. Stock coverage calculation
    # Handle zero or near-zero sales safely
    if average_daily_sales > 0.001:
        stock_coverage = float(current_stock / average_daily_sales)
    else:
        stock_coverage = 999.0  # Represents a large value (or essentially more than 90 days)

    # 2. Safety stock and recommended quantity
    # safety_stock = predicted_demand * safety_stock_pct
    safety_stock = int(predicted_demand * safety_stock_pct)
    
    # confirmed_incoming_stock is set to 0 due to database schema limitations
    confirmed_incoming_stock = 0
    
    recommended_qty = max(0, predicted_demand + safety_stock - current_stock - confirmed_incoming_stock)

    # 3. Status classification logic (Precedence: CRITICAL_ACTION > OVERSTOCK_RISK > SUFFICIENT)
    # Critical Action conditions:
    # - Stock coverage is below 12 days
    # - Current stock is less than predicted demand
    # - Recommended quantity is above zero
    is_critical = (
        stock_coverage < 12.0 or 
        current_stock < predicted_demand or 
        recommended_qty > 0 or 
        current_stock == 0
    )
    
    # Overstock Risk conditions:
    # - Current stock is more than 150% of predicted demand AND stock coverage is more than 45 days
    is_overstock = (
        current_stock > (predicted_demand * 1.5) and 
        stock_coverage > 45.0 and
        not is_critical
    )
    
    if is_critical:
        status = "CRITICAL_ACTION"
    elif is_overstock:
        status = "OVERSTOCK_RISK"
    else:
        status = "SUFFICIENT"

    return recommended_qty, stock_coverage, status
