import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text

def check_existing_run(db: Session, target_month) -> str:
    """
    Checks if a completed forecast run exists for the target month.
    Returns: run_id if exists, else None
    """
    query = text("""
    SELECT id FROM demand_forecast_runs 
    WHERE target_month = :target_month AND status = 'COMPLETED'
    LIMIT 1
    """)
    res = db.execute(query, {"target_month": target_month}).first()
    return res[0] if res else None

def delete_existing_run(db: Session, run_id: str):
    """
    Deletes an existing forecast run and its dependent analyses/forecasts (on delete cascade handles it).
    """
    query = text("DELETE FROM demand_forecast_runs WHERE id = :run_id")
    db.execute(query, {"run_id": run_id})
    db.commit()

def create_initial_run(db: Session, target_month, data_start, data_end) -> str:
    run_id = str(uuid.uuid4())
    query = text("""
    INSERT INTO demand_forecast_runs (id, target_month, data_start_date, data_end_date, status, started_at, created_at)
    VALUES (:id, :target_month, :data_start, :data_end, 'RUNNING', :started_at, :created_at)
    """)
    db.execute(query, {
        "id": run_id,
        "target_month": target_month,
        "data_start": data_start,
        "data_end": data_end,
        "started_at": datetime.now(),
        "created_at": datetime.now()
    })
    db.commit()
    return run_id

def mark_run_completed(db: Session, run_id: str):
    query = text("""
    UPDATE demand_forecast_runs
    SET status = 'COMPLETED', completed_at = :completed_at
    WHERE id = :id
    """)
    db.execute(query, {
        "id": run_id,
        "completed_at": datetime.now()
    })
    db.commit()

def mark_run_failed(db: Session, run_id: str, error_message: str):
    query = text("""
    UPDATE demand_forecast_runs
    SET status = 'FAILED', completed_at = :completed_at, error_message = :error_message
    WHERE id = :id
    """)
    db.execute(query, {
        "id": run_id,
        "completed_at": datetime.now(),
        "error_message": error_message
    })
    db.commit()

def save_analyses_and_forecasts(
    db: Session,
    run_id: str,
    analyses: list,
    forecasts: list
):
    # Insert analyses in batch
    for row in analyses:
        analysis_id = str(uuid.uuid4())
        query = text("""
        INSERT INTO demand_analysis (
            id, forecast_run_id, sku, recent_30_day_sales, previous_30_day_sales, 
            recent_growth_percent, three_month_average, six_month_average, 
            same_month_historical_average, average_daily_sales, discount_uplift_percent, 
            refund_quantity, stock_out_estimate, demand_trend, data_quality, created_at
        ) VALUES (
            :id, :run_id, :sku, :recent_30_day_sales, :previous_30_day_sales, 
            :recent_growth_percent, :three_month_average, :six_month_average, 
            :same_month_historical_average, :average_daily_sales, :discount_uplift_percent, 
            :refund_quantity, :stock_out_estimate, :demand_trend, :data_quality, :created_at
        )
        """)
        db.execute(query, {
            "id": analysis_id,
            "run_id": run_id,
            "sku": row["sku"],
            "recent_30_day_sales": row["recent_30_day_sales"],
            "previous_30_day_sales": row["previous_30_day_sales"],
            "recent_growth_percent": row["recent_growth_percent"],
            "three_month_average": row["three_month_average"],
            "six_month_average": row["six_month_average"],
            "same_month_historical_average": row["same_month_historical_average"],
            "average_daily_sales": row["average_daily_sales"],
            "discount_uplift_percent": row["discount_uplift_percent"],
            "refund_quantity": row["refund_quantity"],
            "stock_out_estimate": row["stock_out_estimate"],
            "demand_trend": row["demand_trend"],
            "data_quality": row["data_quality"],
            "created_at": datetime.now()
        })

    # Insert forecasts in batch
    for row in forecasts:
        forecast_id = str(uuid.uuid4())
        query = text("""
        INSERT INTO demand_forecasts (
            id, forecast_run_id, sku, current_stock_snapshot, stock_coverage_days, 
            predicted_demand, recommended_quantity, selected_model, accuracy_score, 
            prediction_reason, status, created_at
        ) VALUES (
            :id, :run_id, :sku, :current_stock_snapshot, :stock_coverage_days, 
            :predicted_demand, :recommended_quantity, :selected_model, :accuracy_score, 
            :prediction_reason, :status, :created_at
        )
        """)
        db.execute(query, {
            "id": forecast_id,
            "run_id": run_id,
            "sku": row["sku"],
            "current_stock_snapshot": row["current_stock_snapshot"],
            "stock_coverage_days": row["stock_coverage_days"],
            "predicted_demand": row["predicted_demand"],
            "recommended_quantity": row["recommended_quantity"],
            "selected_model": row["selected_model"],
            "accuracy_score": row["accuracy_score"],
            "prediction_reason": row["prediction_reason"],
            "status": row["status"],
            "created_at": datetime.now()
        })
    db.commit()
