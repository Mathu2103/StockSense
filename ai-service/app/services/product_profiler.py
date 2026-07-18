import pandas as pd

def classify_product_demand(
    features_df: pd.DataFrame,
    daily_df: pd.DataFrame
) -> pd.DataFrame:
    """
    Classifies each product into a specific demand profile.
    """
    profiles = []
    
    for idx, row in features_df.iterrows():
        sku = row["sku"]
        total_days = row["total_days_history"]
        growth = row["recent_growth_percent"]
        uplift = row["discount_uplift_percent"]
        three_month_avg = row["three_month_average"]
        same_month_avg = row["same_month_historical_average"]
        avg_daily = row["average_daily_sales"]
        
        # Pull daily sales for standard deviation calculation
        prod_daily = daily_df[daily_df["sku"] == sku]["net_qty_sold"]
        mean_sales = prod_daily.mean()
        std_sales = prod_daily.std()
        coef_variation = (std_sales / mean_sales) if mean_sales > 0 else 0.0
        
        # Classification criteria
        if total_days < 90:
            profile = "LIMITED_HISTORY"
        elif avg_daily < 0.6 and (prod_daily == 0).mean() > 0.65:
            profile = "INTERMITTENT"
        elif uplift is not None and uplift > 0.40:
            profile = "DISCOUNT_SENSITIVE"
        elif same_month_avg is not None and three_month_avg > 0 and (same_month_avg / (three_month_avg * 3.0) > 1.35 or same_month_avg / (three_month_avg * 3.0) < 0.65):
            profile = "SEASONAL"
        elif growth is not None and growth > 0.15:
            profile = "TRENDING_UP"
        elif growth is not None and growth < -0.15:
            profile = "TRENDING_DOWN"
        elif coef_variation > 1.2:
            profile = "HIGH_VARIABILITY"
        else:
            profile = "STABLE"
            
        profiles.append(profile)
        
    features_df["demand_profile"] = profiles
    return features_df
