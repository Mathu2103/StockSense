import pandas as pd
from typing import Dict, Any

def generate_forecast_explanation(
    analysis_row: Dict[str, Any],
    predicted_demand: int,
    current_stock: int,
    recommended_qty: int,
    stock_coverage: float,
    status: str
) -> str:
    """
    Generates a natural language explanation for the forecast using measured numbers.
    """
    sku = analysis_row["sku"]
    trend = analysis_row["demand_trend"]
    quality = analysis_row["data_quality"]
    recent_growth = analysis_row["recent_growth_percent"]
    recent_30_sales = analysis_row["recent_30_day_sales"]
    three_month_avg = analysis_row["three_month_average"]
    same_month_avg = analysis_row["same_month_historical_average"]
    discount_uplift = analysis_row["discount_uplift_percent"]
    stock_out = analysis_row["stock_out_estimate"]
    
    sentences = []

    # 1. Handle limited history first
    if quality == "POOR" or analysis_row.get("total_days_history", 365) < 90:
        days = analysis_row.get("total_days_history", 80)
        sentences.append(f"This product has only {days} usable sales days.")
        sentences.append("The forecast therefore combines recent demand with category baseline sales and is marked as lower confidence.")
        if current_stock == 0:
            sentences.append("Immediate restocking is recommended to build inventory history.")
        return " ".join(sentences)

    # 2. Add trend / growth information
    if recent_growth is not None:
        growth_pct = recent_growth * 100
        if growth_pct > 10:
            sentences.append(f"Net sales increased by {growth_pct:.1f}% during the most recent 30 days compared with the previous 30 days.")
        elif growth_pct < -10:
            sentences.append(f"Net sales declined by {abs(growth_pct):.1f}% during the most recent 30 days.")
        else:
            diff_from_avg = 0.0
            if three_month_avg > 0:
                diff_from_avg = abs((recent_30_sales - (three_month_avg * 30)) / (three_month_avg * 30)) * 100
            sentences.append(f"Recent sales remained within {diff_from_avg:.1f}% of the three-month average.")

    # 3. Add seasonality
    if same_month_avg is not None and three_month_avg > 0:
        seasonal_uplift = ((same_month_avg / (three_month_avg * 30)) - 1.0) * 100
        if seasonal_uplift > 10:
            sentences.append(f"Historically, January demand is highly seasonal, averaging {seasonal_uplift:.1f}% above normal months.")
        elif seasonal_uplift < -10:
            sentences.append(f"Historically, January demand averages {abs(seasonal_uplift):.1f}% below normal months.")

    # 4. Add discount uplift
    if discount_uplift is not None and discount_uplift > 0.15:
        uplift_pct = discount_uplift * 100
        sentences.append(f"Approved discount periods have historically boosted daily sales by {uplift_pct:.1f}%.")

    # 5. Add stock coverage and recommendation status
    if status == "CRITICAL_ACTION":
        if stock_coverage is not None:
            if stock_coverage == 0:
                sentences.append("Current stock is completely depleted.")
            else:
                sentences.append(f"Current stock covers approximately {int(stock_coverage)} days.")
        sentences.append(f"An immediate restock of {recommended_qty} units is required to prevent upcoming stock-outs.")
    elif status == "OVERSTOCK_RISK":
        excess_pct = 0
        if predicted_demand > 0:
            excess_pct = int(((current_stock - predicted_demand) / predicted_demand) * 100)
        if stock_coverage is not None:
            sentences.append(f"Current inventory is {excess_pct}% higher than predicted demand and is expected to last over {int(stock_coverage)} days.")
        else:
            sentences.append(f"Current inventory is {excess_pct}% higher than predicted demand.")
        sentences.append("Reduce next purchase quantity and monitor expiry exposure.")
    else:
        # SUFFICIENT
        if stock_coverage is not None:
            sentences.append(f"Current stock is expected to last {int(stock_coverage)} days and covers next month's demand safely.")
        else:
            sentences.append("Current stock covers next month's predicted demand safely.")
        sentences.append("No immediate action is required.")

    # 6. Add stock-out bias alert if significant
    if stock_out > 5:
        sentences.append(f"Note: sales velocity was likely suppressed by {stock_out} stock-out days during the last 30 days.")

    return " ".join(sentences)
