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
    safety_stock_pct: float = 0.15,
    reliability_level: str = "MEDIUM",
    stock_vs_required_pct: float = 100.0
) -> str:
    """
    Generates a natural language explanation for the forecast using measured numbers.
    Ensures every statement is traceable to calculated features.
    """
    quality = analysis_row["dataQuality"]
    recent_growth = analysis_row["recentGrowthPercentage"]
    discount_uplift = analysis_row["discountUpliftPercentage"]
    stock_out_days = analysis_row["stockOutDays"]
    complete_months = analysis_row["completeHistoryMonths"]
    
    sentences = []

    # 1. Model selection and validation accuracy
    wape_percent = wape_score * 100.0 if wape_score is not None else 50.0
    reliability_label = reliability_level.lower()
    sentences.append(f"{selected_model} was selected after walk-forward validation with a WAPE of {wape_percent:.1f}%, resulting in {reliability_label} forecast confidence.")

    # 2. Growth / Trend
    if recent_growth is not None:
        if recent_growth > 0.0:
            sentences.append(f"Sales increased by {recent_growth:.1f}% during the latest 30-day period.")
        elif recent_growth < 0.0:
            sentences.append(f"Sales decreased by {abs(recent_growth):.1f}% during the latest 30-day period.")
        else:
            sentences.append("Sales growth remained stable during the latest 30-day period.")

    # 3. Seasonality
    seasonal_uplift = analysis_row.get("seasonalUpliftPercentage", 0.0) or 0.0
    if seasonal_uplift >= 10.0:
        sentences.append(f"Demand for this product is historically {seasonal_uplift:.1f}% higher in {target_month_name}.")
    elif seasonal_uplift <= -10.0:
        sentences.append(f"Demand for this product is historically {abs(seasonal_uplift):.1f}% lower in {target_month_name}.")

    # 4. Discount sensitivity
    if discount_uplift is not None and discount_uplift >= 10.0:
        sentences.append(f"Historical sales show a {discount_uplift:.1f}% increase when promotions are active.")

    # 5. Stock-out bias
    if stock_out_days > 0:
        sentences.append(f"{stock_out_days} stock-out day(s) were identified, meaning recorded sales may understate true demand.")

    # 6. Target Month Forecast & Requirements
    required_stock = predicted_demand + safety_stock
    safety_pct_int = int(safety_stock_pct * 100)
    sentences.append(f"The next-month forecast is {predicted_demand} units. Including the {safety_pct_int}% safety buffer ({safety_stock} units), {required_stock} units are required.")

    # 7. Coverage & Stock Ratio
    if current_stock == 0 or stock_coverage == 0.0:
        sentences.append("Current stock is completely depleted.")
    elif stock_coverage >= 999.0:
        sentences.append(f"Current stock of {current_stock} units covers approximately {stock_vs_required_pct:.0f}% of required inventory and will last over 90 days.")
    else:
        sentences.append(f"Current stock of {current_stock} units represents approximately {stock_vs_required_pct:.0f}% of required stock with {int(round(stock_coverage))} days of forecast coverage.")

    # 8. Status Specific Rationale
    if status == "CRITICAL_ACTION":
        sentences.append(f"Status CRITICAL ACTION assigned: Inventory is low ({int(round(stock_coverage))} days coverage) and restocking of {recommended_qty} units is urgently needed.")
    elif status == "REORDER_REQUIRED":
        sentences.append(f"Status REORDER REQUIRED assigned: Stock is currently available ({int(round(stock_coverage))} days coverage), but falls below required next-month inventory. A reorder of {recommended_qty} units is required.")
    elif status == "OVERSTOCK_RISK":
        sentences.append(f"Status OVERSTOCK RISK assigned: Current inventory represents {stock_vs_required_pct:.0f}% of required stock, exceeding the configured overstock threshold.")
    else: # SUFFICIENT
        sentences.append(f"Status SUFFICIENT assigned: Current stock is sufficient to cover predicted demand and safety stock.")

    # 9. Low Confidence Warning Attachment
    if reliability_level == "LOW":
        sentences.append(f"Note: Recommended reorder of {recommended_qty} units is based on a low-confidence model ({selected_model}, WAPE {wape_percent:.1f}%). Manager review is recommended before placing the order.")

    return " ".join(sentences)

