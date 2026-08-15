import pandas as pd
import numpy as np
from datetime import datetime, date, timedelta
from sklearn.linear_model import LinearRegression

# Configurable constants for data quality thresholds (in complete months)
MIN_MONTHS_GOOD = 12
MIN_MONTHS_MODERATE = 6

def reconstruct_stock_history(
    cleaned_df: pd.DataFrame, 
    products_df: pd.DataFrame
) -> pd.DataFrame:
    """
    Reconstructs running daily stock levels backwards from the final current_stock snapshot.
    Formula: Stock[t-1] = Stock[t] - GRN[t] - PosAdj[t] + NetSold[t] + NegAdj[t]
    If stock goes below 0, it raises a warning flag and is capped at 0.
    """
    reconstructed_records = []
    
    # Map final stock values
    final_stock_map = dict(zip(products_df["sku"], products_df["current_stock"]))
    
    for sku, group in cleaned_df.groupby("sku"):
        # Sort chronologically descending to work backwards
        group_sorted = group.sort_values("date", ascending=False).copy()
        
        current_val = final_stock_map.get(sku, 0)
        closings = []
        openings = []
        stock_out_flags = []
        warnings = []
        
        for idx, row in group_sorted.iterrows():
            closings.append(current_val)
            
            # Work backward to calculate opening stock for the day
            net_sold = row["net_qty_sold"]
            grn_rec = row["grn_qty_received"]
            pos_adj = row["pos_adjustment"]
            neg_adj = row["neg_adjustment"]
            
            opening = current_val - grn_rec - pos_adj + net_sold + neg_adj
            warning = None
            if opening < 0:
                warning = f"Negative stock detected on {row['date']} for SKU {sku}. Capped at 0."
                opening = 0
            
            openings.append(opening)
            warnings.append(warning)
            
            # stockOutFlag = true if opening stock <= 0 or closing stock <= 0
            stock_out = 1 if (opening <= 0 or current_val <= 0) else 0
            stock_out_flags.append(stock_out)
            
            # For the previous day, the closing stock is today's opening stock
            current_val = opening
            
        group_sorted["estimated_closing_stock"] = closings
        group_sorted["estimated_opening_stock"] = openings
        group_sorted["stockOutFlag"] = stock_out_flags
        group_sorted["stock_reconstruction_warning"] = warnings
        
        # Re-sort chronologically ascending
        reconstructed_records.append(group_sorted.sort_values("date"))
        
    return pd.concat(reconstructed_records)

def calculate_product_features(
    cleaned_df: pd.DataFrame,
    target_month_start: date
) -> pd.DataFrame:
    """
    Calculates statistical demand metrics for each product based on historical period.
    Ensures no data leakage by using only information before target_month_start.
    """
    # Filter data to end before target month to prevent data leakage
    hist_df = cleaned_df[cleaned_df["date"] < target_month_start].copy()
    
    max_hist_date = hist_df["date"].max()
    if pd.isnull(max_hist_date):
        raise ValueError("No historical data found before target month.")
        
    # Date windows for recent trends
    d30_start = max_hist_date - timedelta(days=29)
    d60_start = max_hist_date - timedelta(days=59)
    
    feature_records = []
    
    for sku, group in hist_df.groupby("sku"):
        group = group.sort_values("date")
        
        # Usable history metrics
        usable_history_days = len(group)
        
        # Calculate distinct complete months (group by year and month)
        group["year_month"] = group["date"].apply(lambda d: f"{d.year}-{d.month}")
        complete_history_months = group["year_month"].nunique()
        
        # Data quality classification
        if complete_history_months >= MIN_MONTHS_GOOD:
            data_quality = "GOOD"
        elif complete_history_months >= MIN_MONTHS_MODERATE:
            data_quality = "MODERATE"
        else:
            data_quality = "LIMITED"
            
        # Recent sales and growth
        g30 = group[group["date"] >= d30_start]
        recent_30_sales = int(g30["net_qty_sold"].sum())
        recent_refund_qty = int(g30["refunded_qty"].sum())
        
        gprev30 = group[(group["date"] >= d60_start) & (group["date"] < d30_start)]
        prev_30_sales = int(gprev30["net_qty_sold"].sum())
        
        # Monthly sales aggregations (completed calendar months)
        monthly_sales = group.groupby(["year", "month"])["net_qty_sold"].sum().reset_index()
        monthly_sales = monthly_sales.sort_values(["year", "month"])
        
        # Monthly Growth % = (Current Completed Month - Previous Completed Month) / Previous Completed Month * 100
        recent_growth = 0.0
        if len(monthly_sales) >= 2:
            curr_m_demand = float(monthly_sales.iloc[-1]["net_qty_sold"])
            prev_m_demand = float(monthly_sales.iloc[-2]["net_qty_sold"])
            if prev_m_demand == 0.0:
                recent_growth = 100.0 if curr_m_demand > 0.0 else 0.0
            else:
                recent_growth = float(((curr_m_demand - prev_m_demand) / prev_m_demand) * 100.0)
        elif prev_30_sales > 0:
            recent_growth = float(((recent_30_sales - prev_30_sales) / prev_30_sales) * 100.0)
        else:
            recent_growth = 100.0 if recent_30_sales > 0 else 0.0
            
        # Averages (3m, 6m, 12m)
        last_3 = monthly_sales.tail(3)["net_qty_sold"].tolist()
        three_month_avg = float(sum(last_3) / max(1, len(last_3)))
        
        last_6 = monthly_sales.tail(6)["net_qty_sold"].tolist()
        six_month_avg = float(sum(last_6) / max(1, len(last_6)))
        
        last_12 = monthly_sales.tail(12)["net_qty_sold"].tolist()
        twelve_month_avg = float(sum(last_12) / max(1, len(last_12))) if len(last_12) > 0 else None
        
        # Daily averages
        mean_sales = group["net_qty_sold"].mean()
        std_sales = group["net_qty_sold"].std()
        coefficient_of_variation = float(std_sales / mean_sales) if mean_sales > 0 else 0.0
        
        # Same month historical metrics
        target_m_num = target_month_start.month
        same_month_data = group[group["month"] == target_m_num]
        same_month_grouped = same_month_data.groupby("year")["net_qty_sold"].sum()
        
        # Return None when insufficient same-month historical data exists
        same_month_avg = float(same_month_grouped.mean()) if not same_month_grouped.empty else None
        overall_monthly_avg = float(monthly_sales["net_qty_sold"].mean()) if not monthly_sales.empty else 0.0
        
        # Seasonal uplift
        seasonal_uplift = 0.0
        if same_month_avg is not None and overall_monthly_avg > 0:
            seasonal_uplift = float(((same_month_avg - overall_monthly_avg) / overall_monthly_avg) * 100.0)
            
        # Number of years showing repeated seasonal behavior
        # (same month sales > overall monthly average of that year)
        repeated_seasonality_years = 0
        if not same_month_data.empty:
            yearly_averages = group.groupby("year")["net_qty_sold"].sum() / 12.0
            for yr, sales in same_month_data.groupby("year")["net_qty_sold"].sum().items():
                yr_avg = yearly_averages.get(yr, 0.0)
                if sales > yr_avg:
                    repeated_seasonality_years += 1
                    
        # Discount metrics
        discount_days = group[group["discount_applied"] == True]
        normal_days = group[group["discount_applied"] == False]
        
        discount_avg = discount_days["net_qty_sold"].mean() if not discount_days.empty else 0.0
        normal_avg = normal_days["net_qty_sold"].mean() if not normal_days.empty else 0.0
        
        discount_uplift = 0.0
        if normal_avg > 0 and discount_avg > 0:
            discount_uplift = float(((discount_avg - normal_avg) / normal_avg) * 100.0)
            
        # Count of unique discounts campaign count
        num_valid_discount_campaigns = 0
        if "discount_type" in group.columns:
            # count days where a campaign was active
            num_valid_discount_campaigns = int(group[group["discount_applied"] == True]["month"].nunique()) # proxy or unique count
            
        # Refund rates
        total_gross = group["gross_qty_sold"].sum()
        total_refund = group["refunded_qty"].sum()
        refund_rate = float(total_refund / total_gross) if total_gross > 0 else 0.0
        
        # Stock out metrics
        stock_out_days = int(group["stockOutFlag"].sum())
        stock_out_ratio = float(stock_out_days / usable_history_days) if usable_history_days > 0 else 0.0
        
        # Zero sales ratio (available/in-stock days with zero sales)
        in_stock_days = group[group["stockOutFlag"] == 0]
        zero_sales_ratio = 0.0
        if not in_stock_days.empty:
            zero_sales_ratio = float((in_stock_days["net_qty_sold"] == 0).sum() / len(in_stock_days))
            
        # Interval between non-zero sales
        non_zero_indices = group[group["net_qty_sold"] > 0].index
        if len(non_zero_indices) >= 2:
            intervals = np.diff(non_zero_indices)
            avg_demand_interval = float(np.mean(intervals))
        else:
            avg_demand_interval = float(usable_history_days) if len(non_zero_indices) == 1 else 0.0
            
        # Average non-zero demand quantity
        non_zero_sales = group[group["net_qty_sold"] > 0]["net_qty_sold"]
        avg_non_zero_demand = float(non_zero_sales.mean()) if not non_zero_sales.empty else 0.0
        
        # Monthly regression slope
        if len(monthly_sales) >= 2:
            X_trend = np.arange(len(monthly_sales)).reshape(-1, 1)
            y_trend = monthly_sales["net_qty_sold"].values
            reg = LinearRegression().fit(X_trend, y_trend)
            trend_slope = float(reg.coef_[0])
        else:
            trend_slope = 0.0
            
        # Warnings
        warnings = []
        negative_warnings = group[group["stock_reconstruction_warning"].notnull()]
        if not negative_warnings.empty:
            warnings.append(f"Estimated stock became negative and was capped on {len(negative_warnings)} days.")
            
        # Correction warning for missing stock movements
        if usable_history_days < 180:
            warnings.append("Low historical data duration. stock movements estimation has lower confidence.")
            
        feature_records.append({
            "productId": sku,
            "usableHistoryDays": usable_history_days,
            "completeHistoryMonths": complete_history_months,
            "dataQuality": data_quality,
            "recent30Sales": recent_30_sales,
            "previous30Sales": prev_30_sales,
            "recentGrowthPercentage": recent_growth,
            "threeMonthAverage": three_month_avg,
            "sixMonthAverage": six_month_avg,
            "twelveMonthAverage": twelve_month_avg,
            "sameMonthHistoricalAverage": same_month_avg,
            "seasonalUpliftPercentage": seasonal_uplift,
            "repeated_seasonality_years": repeated_seasonality_years,
            "discountUpliftPercentage": discount_uplift,
            "num_valid_discount_campaigns": num_valid_discount_campaigns,
            "refundQuantity": int(total_refund),
            "refundRate": refund_rate,
            "stockOutDays": stock_out_days,
            "stockOutRatio": stock_out_ratio,
            "zeroSalesRatio": zero_sales_ratio,
            "coefficientOfVariation": coefficient_of_variation,
            "averageDemandInterval": avg_demand_interval,
            "avg_non_zero_demand": avg_non_zero_demand,
            "trendSlope": trend_slope,
            "analysisWarnings": warnings
        })
        
    return pd.DataFrame(feature_records)
