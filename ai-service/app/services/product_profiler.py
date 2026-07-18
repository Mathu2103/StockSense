import pandas as pd
import json

def classify_product_demand(
    features_df: pd.DataFrame
) -> pd.DataFrame:
    """
    Identifies demand behaviors using multi-label classification.
    Calculates primaryBehaviour, trendDirection, and additionalBehaviourTags.
    """
    primary_behaviours = []
    trend_directions = []
    additional_tags = []
    
    for idx, row in features_df.iterrows():
        tags = []
        
        # 1. Usable history check
        complete_months = row["completeHistoryMonths"]
        growth = row["recentGrowthPercentage"]
        cv = row["coefficientOfVariation"]
        three_avg = row["threeMonthAverage"]
        six_avg = row["sixMonthAverage"]
        slope = row["trendSlope"]
        zero_sales_ratio = row["zeroSalesRatio"]
        seasonal_uplift = row["seasonalUpliftPercentage"]
        discount_uplift = row["discountUpliftPercentage"]
        repeated_seasonality_years = row.get("repeated_seasonality_years", 0)
        
        # Trend Direction
        if growth is not None:
            if growth >= 15.0 and slope > 0:
                trend_dir = "UP"
            elif growth <= -15.0 and slope < 0:
                trend_dir = "DOWN"
            else:
                trend_dir = "FLAT"
        else:
            trend_dir = "FLAT"
            
        # Behavior Tag checks
        # LIMITED_HISTORY
        if complete_months < 6:
            tags.append("LIMITED_HISTORY")
            
        # INTERMITTENT
        if zero_sales_ratio >= 0.70:
            tags.append("INTERMITTENT")
            
        # SEASONAL
        if seasonal_uplift >= 20.0 and (repeated_seasonality_years >= 2 or complete_months < 24):
            tags.append("SEASONAL")
            
        # TRENDING_UP
        if growth is not None and growth >= 15.0 and three_avg >= six_avg * 1.10 and slope > 0:
            tags.append("TRENDING_UP")
            
        # TRENDING_DOWN
        if growth is not None and growth <= -15.0 and three_avg < six_avg and slope < 0:
            tags.append("TRENDING_DOWN")
            
        # DISCOUNT_SENSITIVE
        if discount_uplift >= 25.0:
            tags.append("DISCOUNT_SENSITIVE")
            
        # HIGH_VARIABILITY
        if cv >= 0.75:
            tags.append("HIGH_VARIABILITY")
            
        # STABLE (if no other tags match, or explicitly matches stable criteria)
        is_stable_growth = growth is not None and abs(growth) <= 10.0
        is_stable_cv = cv <= 0.30
        is_stable_avgs = abs(three_avg - six_avg) / max(1.0, six_avg) <= 0.15
        
        if is_stable_growth and is_stable_cv and is_stable_avgs:
            tags.append("STABLE")
            
        # If no tags matched, mark as STABLE
        if not tags:
            tags.append("STABLE")
            
        # Assign primary behavior (prioritized hierarchy)
        if "LIMITED_HISTORY" in tags:
            primary = "LIMITED_HISTORY"
        elif "INTERMITTENT" in tags:
            primary = "INTERMITTENT"
        elif "SEASONAL" in tags:
            primary = "SEASONAL"
        elif "TRENDING_UP" in tags:
            primary = "TRENDING_UP"
        elif "TRENDING_DOWN" in tags:
            primary = "TRENDING_DOWN"
        elif "HIGH_VARIABILITY" in tags:
            primary = "HIGH_VARIABILITY"
        elif "DISCOUNT_SENSITIVE" in tags:
            primary = "DISCOUNT_SENSITIVE"
        else:
            primary = "STABLE"
            
        # Remove primary behavior from additional tags to avoid duplication
        add_tags = [t for t in tags if t != primary]
        
        primary_behaviours.append(primary)
        trend_directions.append(trend_dir)
        additional_tags.append(add_tags)
        
    features_df["primaryBehaviour"] = primary_behaviours
    features_df["trendDirection"] = trend_directions
    features_df["additionalBehaviourTags"] = additional_tags
    
    return features_df
