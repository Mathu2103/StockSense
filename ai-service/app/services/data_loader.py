import pandas as pd
from sqlalchemy import text
from sqlalchemy.orm import Session

def load_products_df(db: Session) -> pd.DataFrame:
    query = """
    SELECT p.sku, p.name, p.current_stock, p.reorder_level, p.target_capacity, p.status, p.seasonal,
           p.created_at as launch_date, p.updated_at, c.name as category_name, sc.name as subcategory_name,
           b.name as brand_name, p.cost_price, p.selling_price
    FROM products p
    JOIN master_product_class mc ON p.master_id = mc.id
    JOIN categories c ON mc.category_id = c.category_id
    LEFT JOIN sub_categories sc ON mc.subcategory_id = sc.subc_id
    JOIN brands b ON mc.brand_id = b.id
    """
    return pd.read_sql(text(query), db.bind)

def load_daily_sales_df(db: Session, end_date: str) -> pd.DataFrame:
    query = """
    SELECT DATE(b.created_at) as date, bi.sku, 
           SUM(bi.qty)::integer as gross_qty_sold,
           SUM(CASE WHEN bi.discount_id IS NOT NULL THEN bi.qty ELSE 0 END)::integer as discounted_qty_sold,
           AVG(bi.unit_price) as average_unit_price,
           SUM(bi.total) as sales_revenue
    FROM sales_bill_items bi
    JOIN sales_bills b ON bi.bill_id = b.id
    WHERE b.draft = false AND b.created_at <= :end_date
    GROUP BY DATE(b.created_at), bi.sku
    """
    return pd.read_sql(text(query), db.bind, params={"end_date": end_date})

def load_daily_refunds_df(db: Session, end_date: str) -> pd.DataFrame:
    query = """
    SELECT DATE(r.created_at) as date, ri.sku,
           SUM(ri.qty)::integer as refunded_qty
    FROM sales_refund_items ri
    JOIN sales_refunds r ON ri.refund_id = r.id
    WHERE r.created_at <= :end_date
    GROUP BY DATE(r.created_at), ri.sku
    """
    return pd.read_sql(text(query), db.bind, params={"end_date": end_date})

def load_daily_grn_df(db: Session, end_date: str) -> pd.DataFrame:
    query = """
    SELECT DATE(g.grn_date) as date, gi.sku,
           SUM(gi.added_quantity)::integer as grn_qty_received
    FROM grn_items gi
    JOIN goods_receiving_notes g ON gi.grn_id = g.id
    WHERE g.grn_date <= :end_date
    GROUP BY DATE(g.grn_date), gi.sku
    """
    return pd.read_sql(text(query), db.bind, params={"end_date": end_date})

def load_daily_adjustments_df(db: Session, end_date: str) -> pd.DataFrame:
    query = """
    SELECT DATE(created_at) as date, sku,
           SUM(qty_changed)::integer as adjustment_qty
    FROM stock_adjustments
    WHERE created_at <= :end_date
    GROUP BY DATE(created_at), sku
    """
    return pd.read_sql(text(query), db.bind, params={"end_date": end_date})

def load_discounts_df(db: Session) -> pd.DataFrame:
    query = """
    SELECT id as discount_id, name, type, discount_value, combo_price, min_bill_amount, start_date, end_date, approval_status
    FROM discounts
    WHERE approval_status = 'APPROVED'
    """
    return pd.read_sql(text(query), db.bind)

def load_discount_mappings_df(db: Session) -> pd.DataFrame:
    query_seasonal = """
    SELECT discount_id, sku, 'SEASONAL_OR_DAILY' as mapping_type
    FROM seasonal_or_daily_products
    """
    query_combo = """
    SELECT discount_id, sku, 'COMBO' as mapping_type
    FROM discount_combo_items
    """
    df_s = pd.read_sql(text(query_seasonal), db.bind)
    df_c = pd.read_sql(text(query_combo), db.bind)
    return pd.concat([df_s, df_c], ignore_index=True)
