import pandas as pd
import numpy as np
from datetime import datetime

def clean_and_merge_data(
    products_df: pd.DataFrame,
    sales_df: pd.DataFrame,
    refunds_df: pd.DataFrame,
    grn_df: pd.DataFrame,
    adjustments_df: pd.DataFrame,
    discounts_df: pd.DataFrame,
    discount_mappings_df: pd.DataFrame,
    start_date: str = "2023-01-01",
    end_date: str = "2025-12-31"
) -> pd.DataFrame:
    # 1. Ensure correct data types and parse dates
    sales_df["date"] = pd.to_datetime(sales_df["date"]).dt.date
    refunds_df["date"] = pd.to_datetime(refunds_df["date"]).dt.date
    grn_df["date"] = pd.to_datetime(grn_df["date"]).dt.date
    adjustments_df["date"] = pd.to_datetime(adjustments_df["date"]).dt.date

    if not discounts_df.empty:
        discounts_df["start_date"] = pd.to_datetime(discounts_df["start_date"]).dt.date
        discounts_df["end_date"] = pd.to_datetime(discounts_df["end_date"]).dt.date

    start_d = pd.to_datetime(start_date).date()
    end_d = pd.to_datetime(end_date).date()

    # 2. Merge Sales and Refunds to get Net Quantity
    sales_merged = pd.merge(sales_df, refunds_df, on=["date", "sku"], how="outer")
    sales_merged["gross_qty_sold"] = sales_merged["gross_qty_sold"].fillna(0).astype(int)
    sales_merged["refunded_qty"] = sales_merged["refunded_qty"].fillna(0).astype(int)
    sales_merged["net_qty_sold"] = sales_merged["gross_qty_sold"] - sales_merged["refunded_qty"]

    # 3. Merge GRN and Adjustments
    inv_activity = pd.merge(grn_df, adjustments_df, on=["date", "sku"], how="outer")
    inv_activity["grn_qty_received"] = inv_activity["grn_qty_received"].fillna(0).astype(int)
    inv_activity["adjustment_qty"] = inv_activity["adjustment_qty"].fillna(0).astype(int)

    # Combine all activities
    daily_activity = pd.merge(sales_merged, inv_activity, on=["date", "sku"], how="outer")
    daily_activity["gross_qty_sold"] = daily_activity["gross_qty_sold"].fillna(0).astype(int)
    daily_activity["refunded_qty"] = daily_activity["refunded_qty"].fillna(0).astype(int)
    daily_activity["net_qty_sold"] = daily_activity["net_qty_sold"].fillna(0).astype(int)
    daily_activity["grn_qty_received"] = daily_activity["grn_qty_received"].fillna(0).astype(int)
    daily_activity["adjustment_qty"] = daily_activity["adjustment_qty"].fillna(0).astype(int)

    # 4. Generate a complete daily panel (date range x active products)
    all_dates = pd.date_range(start_d, end_d).date
    
    panel_records = []
    
    for idx, prod in products_df.iterrows():
        sku = prod["sku"]
        launch_date = pd.to_datetime(prod["launch_date"]).date()
        status = prod["status"]
        
        # Discontinued handling (discontinued date is in seed catalog, but in schema we can estimate or check)
        # Let's say if product status is DISCONTINUED/INACTIVE, we can extract its last activity or discontinuation date.
        # In our generated catalog, we set launchDate and discontinuationDate.
        # Wait, since the DB Products table does not store launchDate or discontinuationDate explicitly (only status),
        # how can we identify launch and discontinuation dates from the DB?
        # - Launch date: can be approximated by the first GRN date, or Product.createdAt. Let's use `prod["launch_date"]` since we populated it!
        # - Discontinuation date: if status is DISCONTINUED or INACTIVE, the last transaction date can represent discontinuation date, or we can look at the last bill/activity date.
        # Let's find the last date of activity for discontinued products in daily_activity
        discont_d = None
        if status in ["DISCONTINUED", "INACTIVE"]:
            prod_act = daily_activity[daily_activity["sku"] == sku]
            if not prod_act.empty:
                discont_d = prod_act["date"].max()

        prod_dates = [d for d in all_dates if d >= launch_date]
        if discont_d:
            prod_dates = [d for d in prod_dates if d <= discont_d]

        for d in prod_dates:
            panel_records.append({"date": d, "sku": sku})

    panel_df = pd.DataFrame(panel_records)
    
    # Merge panel with daily activity
    cleaned_df = pd.merge(panel_df, daily_activity, on=["date", "sku"], how="left")
    
    # Fill missing values for days with no activity
    cleaned_df["gross_qty_sold"] = cleaned_df["gross_qty_sold"].fillna(0).astype(int)
    cleaned_df["refunded_qty"] = cleaned_df["refunded_qty"].fillna(0).astype(int)
    cleaned_df["net_qty_sold"] = cleaned_df["net_qty_sold"].fillna(0).astype(int)
    cleaned_df["grn_qty_received"] = cleaned_df["grn_qty_received"].fillna(0).astype(int)
    cleaned_df["adjustment_qty"] = cleaned_df["adjustment_qty"].fillna(0).astype(int)
    cleaned_df["average_unit_price"] = cleaned_df["average_unit_price"].fillna(0.0)
    cleaned_df["sales_revenue"] = cleaned_df["sales_revenue"].fillna(0.0)

    # Merge product details into panel
    cleaned_df = pd.merge(cleaned_df, products_df[["sku", "name", "category_name", "subcategory_name", "brand_name", "cost_price", "selling_price"]], on="sku", how="left")

    # 5. Map discounts
    cleaned_df["discount_applied"] = False
    cleaned_df["discount_percentage"] = 0.0
    cleaned_df["discount_type"] = "NONE"

    if not discounts_df.empty and not discount_mappings_df.empty:
        # Merge mappings with discounts
        full_discounts = pd.merge(discount_mappings_df, discounts_df, on="discount_id", how="inner")
        
        # Merge with cleaned daily sales
        for idx, disc in full_discounts.iterrows():
            sku = disc["sku"]
            disc_start = disc["start_date"]
            disc_end = disc["end_date"]
            val = disc["discount_value"]
            dtype = disc["type"]
            
            mask = (cleaned_df["sku"] == sku) & (cleaned_df["date"] >= disc_start) & (cleaned_df["date"] <= disc_end)
            cleaned_df.loc[mask, "discount_applied"] = True
            cleaned_df.loc[mask, "discount_percentage"] = float(val)
            cleaned_df.loc[mask, "discount_type"] = dtype

    # 6. Add calendar features
    cleaned_df["date"] = pd.to_datetime(cleaned_df["date"])
    cleaned_df["dayOfWeek"] = cleaned_df["date"].dt.dayofweek # 0=Monday, 6=Sunday
    cleaned_df["month"] = cleaned_df["date"].dt.month
    cleaned_df["year"] = cleaned_df["date"].dt.year
    cleaned_df["weekendFlag"] = cleaned_df["dayOfWeek"].isin([5, 6]).astype(int)
    cleaned_df["date"] = cleaned_df["date"].dt.date # Convert back to date object

    return cleaned_df
