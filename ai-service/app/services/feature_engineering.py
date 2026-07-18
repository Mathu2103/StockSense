import pandas as pd
import numpy as np
from datetime import datetime, date, timedelta

def reconstruct_stock_history(
    cleaned_df: pd.DataFrame, 
    products_df: pd.DataFrame
) -> pd.DataFrame:
    """
    Reconstructs running daily stock levels backwards from the final current_stock snapshot.
    Formula: Stock[t-1] = Stock[t] + NetQtySold[t] - GrnQtyReceived[t] - AdjustmentQty[t]
    """
    reconstructed_records = []
    
    # Map final stock values
    final_stock_map = dict(zip(products_df["sku"], products_df["current_stock"]))
    
    for sku, group in cleaned_df.groupby("sku"):
        # Sort chronologically descending to work backwards
        group_sorted = group.sort_values("date", ascending=False).copy()
        
        current_val = final_stock_map.get(sku, 0)
        stocks = []
        
        for idx, row in group_sorted.iterrows():
            stocks.append(current_val)
            # Work backward to calculate stock for previous day
            net_sold = row["net_qty_sold"]
            grn_rec = row["grn_qty_received"]
            adj = row["adjustment_qty"]
            current_val = max(0, current_val + net_sold - grn_rec - adj)
            
        group_sorted["running_stock"] = stocks
        # Re-sort chronologically ascending
        reconstructed_records.append(group_sorted.sort_values("date"))
        
    return pd.concat(reconstructed_records)

def calculate_product_features(
    cleaned_df: pd.DataFrame,
    target_month_start: date
) -> pd.DataFrame:
    """
    Calculates statistical demand metrics for each product based on historical period.
    """
    # Filter data to end before target month to prevent data leakage
    hist_df = cleaned_df[cleaned_df["date"] < target_month_start].copy()
    
    max_hist_date = hist_df["date"].max()
    if pd.isnull(max_hist_date):
        raise ValueError("No historical data found before target month.")
        
    # Date windows
    d30_start = max_hist_date - timedelta(days=29)
    d60_start = max_hist_date - timedelta(days=59)
    
    feature_records = []
    
    for sku, group in hist_df.groupby("sku"):
        # Sort ascending
        group = group.sort_values("date")
        
        # 1. Recent 30-day net sales
        g30 = group[group["date"] >= d30_start]
        recent_30_sales = int(g30["net_qty_sold"].sum())
        refund_quantity = int(g30["refunded_qty"].sum())
        
        # 2. Previous 30-day net sales (days -60 to -30)
        gprev30 = group[(group["date"] >= d60_start) & (group["date"] < d30_start)]
        prev_30_sales = int(gprev30["net_qty_sold"].sum())
        
        # 3. Growth rate
        recent_growth = None
        if prev_30_sales > 0:
            recent_growth = float((recent_30_sales - prev_30_sales) / prev_30_sales)
        elif recent_30_sales > 0:
            recent_growth = 1.0  # +100% if went from 0 to positive
            
        # 4. Monthly averages (3m, 6m)
        three_month_sales = group[group["date"] >= (max_hist_date - timedelta(days=89))]["net_qty_sold"].sum()
        three_month_avg = float(three_month_sales / 3.0)
        
        six_month_sales = group[group["date"] >= (max_hist_date - timedelta(days=179))]["net_qty_sold"].sum()
        six_month_avg = float(six_month_sales / 6.0)
        
        # 5. Daily average
        average_daily_sales = float(recent_30_sales / 30.0)
        
        # 6. Same month historical average
        # Target month is usually 1 (January). Find same month in previous years
        target_m_num = target_month_start.month
        same_month_sales = group[group["month"] == target_m_num]
        
        same_month_avg = None
        if not same_month_sales.empty:
            # Average monthly sales for the target month
            same_month_grouped = same_month_sales.groupby("year")["net_qty_sold"].sum()
            same_month_avg = float(same_month_grouped.mean())
            
        # 7. Discount uplift
        discount_days = group[group["discount_applied"] == True]
        normal_days = group[group["discount_applied"] == False]
        
        discount_uplift = None
        if not discount_days.empty and not normal_days.empty:
            avg_disc = discount_days["net_qty_sold"].mean()
            avg_norm = normal_days["net_qty_sold"].mean()
            if avg_norm > 0:
                discount_uplift = float((avg_disc - avg_norm) / avg_norm)
                
        # 8. Stock out estimate (days with 0 running stock in last 30 days)
        # Check if running_stock is present
        stock_out_estimate = 0
        if "running_stock" in g30.columns:
            stock_out_estimate = int((g30["running_stock"] == 0).sum())
            
        # 9. Demand Trend & Data Quality classification
        demand_trend = "STABLE"
        if recent_growth is not None:
            if recent_growth > 0.12:
                demand_trend = "GROWING"
            elif recent_growth < -0.12:
                demand_trend = "DECLINING"
                
        total_history_days = len(group)
        data_quality = "HIGH"
        if total_history_days < 90:
            data_quality = "POOR"
        elif total_history_days < 180:
            data_quality = "MEDIUM"

        feature_records.append({
            "sku": sku,
            "recent_30_day_sales": recent_30_sales,
            "previous_30_day_sales": prev_30_sales,
            "recent_growth_percent": recent_growth,
            "three_month_average": three_month_avg,
            "six_month_average": six_month_avg,
            "same_month_historical_average": same_month_avg,
            "average_daily_sales": average_daily_sales,
            "discount_uplift_percent": discount_uplift,
            "refund_quantity": refund_quantity,
            "stock_out_estimate": stock_out_estimate,
            "demand_trend": demand_trend,
            "data_quality": data_quality,
            "total_days_history": total_history_days
        })
        
    return pd.DataFrame(feature_records)
