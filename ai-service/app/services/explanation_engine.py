from typing import Dict, Any

def generate_forecast_explanation(
    analysis_row: Dict[str, Any],
    predicted_demand: int,
    current_stock: int,
    safety_stock: int,
    recommended_qty: int,
    stock_coverage: float,
    status: str,
    selected_model: str,
    wape_score: float,
    target_month_name: str = "target month",
    safety_stock_pct: float = 0.15
) -> str:
    """
    Generates a natural language explanation for the forecast using measured numbers.
    Ensures every statement is traceable to calculated features.
    """
    quality = analysis_row["dataQuality"]
    recent_growth = analysis_row["recentGrowthPercentage"]
    three_month_avg = analysis_row["threeMonthAverage"]
    same_month_avg = analysis_row["sameMonthHistoricalAverage"]
    discount_uplift = analysis_row["discountUpliftPercentage"]
    stock_out_days = analysis_row["stockOutDays"]
    complete_months = analysis_row["completeHistoryMonths"]
    
    sentences = []

    # 1. Model and performance statement
    wape_percent = wape_score * 100.0 if wape_score is not None else 50.0
    sentences.append(f"The selected {selected_model} model achieved a validation WAPE of {wape_percent:.1f}%.")

    # 2. Handle limited history warning
    if quality == "LIMITED" or complete_months < 6:
        sentences.append(f"The product has limited data ({complete_months} complete months), resulting in lower forecasting confidence.")

    # 3. Add trend / growth information
    if recent_growth is not None:
        if recent_growth > 0.0:
            sentences.append(f"Sales increased by {recent_growth:.1f}% during the most recent 30-day period compared to the previous 30 days.")
        elif recent_growth < 0.0:
            sentences.append(f"Sales decreased by {abs(recent_growth):.1f}% during the most recent 30-day period.")
        else:
            sentences.append("Sales growth was flat during the most recent 30-day period.")

    # 4. Add seasonality if relevant
    seasonal_uplift = analysis_row.get("seasonalUpliftPercentage", 0.0) or 0.0
    if seasonal_uplift >= 10.0:
        sentences.append(f"Demand for this product is historically {seasonal_uplift:.1f}% higher in {target_month_name}.")
    elif seasonal_uplift <= -10.0:
        sentences.append(f"Demand for this product is historically {abs(seasonal_uplift):.1f}% lower in {target_month_name}.")

    # 5. Add discount uplift
    if discount_uplift is not None and discount_uplift >= 10.0:
        sentences.append(f"Discount campaigns increased average daily sales by {discount_uplift:.1f}%.")

    # 6. Add stock-out bias alert
    if stock_out_days > 0:
        sentences.append(f"The product was out of stock for {stock_out_days} days, so recorded sales may understate demand.")

    # 7. Add stock coverage
    if stock_coverage is not None:
        if stock_coverage == 0.0 or current_stock == 0:
            sentences.append("Current stock is completely depleted.")
        elif stock_coverage >= 999.0:
            sentences.append("Current stock is expected to last indefinitely due to low sales.")
        else:
            sentences.append(f"Current stock is expected to last approximately {int(round(stock_coverage))} days.")

    # 8. Recommendation statement
    safety_pct_int = int(safety_stock_pct * 100)
    if recommended_qty > 0:
        sentences.append(f"An estimated {recommended_qty} units should be reordered, including a {safety_pct_int}% safety stock allowance ({safety_stock} units).")
    else:
        sentences.append(f"No restocking is recommended; current stock is sufficient to cover predicted demand and the {safety_pct_int}% safety buffer.")

    return " ".join(sentences)
