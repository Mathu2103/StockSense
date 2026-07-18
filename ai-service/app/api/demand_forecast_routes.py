from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from datetime import datetime, date

from app.database import get_db
from app.schemas.demand_forecast import (
    ForecastRequest, 
    ForecastRunResponse,
    LatestRunResponse,
    RunDetailsResponse,
    ProductForecastDetail,
    ProductForecastSummary
)
from app.services.forecast_engine import run_monthly_forecasting
from app.services.db_operations import (
    check_existing_run,
    delete_existing_run,
    create_initial_run,
    mark_run_completed,
    mark_run_failed,
    save_analyses_and_forecasts
)

router = APIRouter(prefix="/api/ai-demand", tags=["AI Demand Forecasting"])

@router.post("/forecast", response_model=ForecastRunResponse)
def generate_forecast(
    payload: ForecastRequest,
    db: Session = Depends(get_db)
):
    target_month_str = payload.targetMonth
    # Parse target month
    try:
        if len(target_month_str) == 7:  # YYYY-MM
            target_month_date = datetime.strptime(target_month_str + "-01", "%Y-%m-%d").date()
        else:
            target_month_date = datetime.strptime(target_month_str, "%Y-%m-%d").date()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid target month format. Use YYYY-MM or YYYY-MM-DD.")

    # Check duplicates
    existing_run_id = check_existing_run(db, target_month_date)
    if existing_run_id and not payload.force:
        # Return existing completed run details
        query = text("""
        SELECT r.id, r.target_month, r.status, r.started_at, r.completed_at, r.error_message,
               (SELECT COUNT(*)::integer FROM demand_forecasts WHERE forecast_run_id = r.id) as processed
        FROM demand_forecast_runs r
        WHERE r.id = :run_id
        """)
        res = db.execute(query, {"run_id": existing_run_id}).first()
        if res:
            return {
                "runId": res[0],
                "targetMonth": str(res[1]),
                "status": res[2],
                "productsProcessed": res[6],
                "productsFailed": 0,
                "startedAt": res[3],
                "completedAt": res[4],
                "errorMessage": res[5]
            }

    if existing_run_id and payload.force:
        # Delete old run
        delete_existing_run(db, existing_run_id)

    # Cutoff date is end of previous month
    cutoff_date = target_month_date - timedelta(days=1)
    data_start = date(2023, 1, 1)

    # Create running execution header
    run_id = create_initial_run(db, target_month_date, data_start, cutoff_date)

    try:
        # Execute pipeline
        run_meta, analyses, forecasts = run_monthly_forecasting(db, target_month_str)
        
        # Save results in one transaction block
        save_analyses_and_forecasts(db, run_id, analyses, forecasts)
        
        # Mark as completed
        mark_run_completed(db, run_id)
        
        return {
            "runId": run_id,
            "targetMonth": str(target_month_date),
            "status": "COMPLETED",
            "productsProcessed": run_meta["productsProcessed"],
            "productsFailed": run_meta["productsFailed"],
            "startedAt": datetime.now(),
            "completedAt": datetime.now()
        }
        
    except Exception as e:
        mark_run_failed(db, run_id, str(e))
        return {
            "runId": run_id,
            "targetMonth": str(target_month_date),
            "status": "FAILED",
            "productsProcessed": 0,
            "productsFailed": 0,
            "errorMessage": str(e)
        }

@router.get("/forecast/latest", response_model=Optional[LatestRunResponse])
def get_latest_forecast_run(db: Session = Depends(get_db)):
    query = text("""
    SELECT id, target_month, data_start_date, data_end_date, status, started_at, completed_at, error_message, created_at
    FROM demand_forecast_runs
    WHERE status = 'COMPLETED'
    ORDER BY target_month DESC, created_at DESC
    LIMIT 1
    """)
    res = db.execute(query).first()
    if not res:
        return None
    return {
        "id": res[0],
        "targetMonth": res[1],
        "dataStartDate": res[2],
        "dataEndDate": res[3],
        "status": res[4],
        "startedAt": res[5],
        "completedAt": res[6],
        "errorMessage": res[7],
        "createdAt": res[8]
    }

@router.get("/forecast/month/{month}", response_model=Optional[LatestRunResponse])
def get_forecast_run_by_month(
    month: str = Path(..., description="Target month in YYYY-MM format"),
    db: Session = Depends(get_db)
):
    try:
        target_month_date = datetime.strptime(month + "-01", "%Y-%m-%d").date()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM.")

    query = text("""
    SELECT id, target_month, data_start_date, data_end_date, status, started_at, completed_at, error_message, created_at
    FROM demand_forecast_runs
    WHERE target_month = :target_month AND status = 'COMPLETED'
    ORDER BY created_at DESC
    LIMIT 1
    """)
    res = db.execute(query, {"target_month": target_month_date}).first()
    if not res:
        return None
    return {
        "id": res[0],
        "targetMonth": res[1],
        "dataStartDate": res[2],
        "dataEndDate": res[3],
        "status": res[4],
        "startedAt": res[5],
        "completedAt": res[6],
        "errorMessage": res[7],
        "createdAt": res[8]
    }

@router.get("/forecast/{runId}", response_model=RunDetailsResponse)
def get_forecast_run_details(
    runId: str,
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    sortBy: str = Query("predictedDemand"),
    sortOrder: str = Query("desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1),
    db: Session = Depends(get_db)
):
    # Fetch run header
    run_query = text("""
    SELECT id, target_month, data_start_date, data_end_date, status, started_at, completed_at, error_message, created_at
    FROM demand_forecast_runs
    WHERE id = :run_id
    """)
    run_res = db.execute(run_query, {"run_id": runId}).first()
    if not run_res:
        raise HTTPException(status_code=404, detail="Forecast run not found.")

    run_obj = {
        "id": run_res[0],
        "targetMonth": run_res[1],
        "dataStartDate": run_res[2],
        "dataEndDate": run_res[3],
        "status": run_res[4],
        "startedAt": run_res[5],
        "completedAt": run_res[6],
        "errorMessage": run_res[7],
        "createdAt": run_res[8]
    }

    # Base query for product forecasts
    sql_base = """
    FROM demand_forecasts df
    JOIN products p ON df.sku = p.sku
    JOIN master_product_class mc ON p.master_id = mc.id
    JOIN categories c ON mc.category_id = c.category_id
    WHERE df.forecast_run_id = :run_id
    """
    
    filters = []
    params = {"run_id": runId}

    if search:
        filters.append("(p.sku ILIKE :search OR p.name ILIKE :search)")
        params["search"] = f"%{search}%"
    if status:
        filters.append("df.status = :status")
        params["status"] = status
    if category:
        filters.append("c.name = :category")
        params["category"] = category

    if filters:
        sql_base += " AND " + " AND ".join(filters)

    # Get count
    count_query = text("SELECT COUNT(*)::integer " + sql_base)
    total_count = db.execute(count_query, params).scalar()

    # Apply sorting mapping to columns to prevent injection
    sort_cols = {
        "predictedDemand": "df.predicted_demand",
        "recommendedQuantity": "df.recommended_quantity",
        "stockCoverage": "df.stock_coverage_days",
        "currentStock": "df.current_stock_snapshot",
        "productName": "p.name",
        "sku": "p.sku",
        "accuracyScore": "df.accuracy_score"
    }
    
    sort_col = sort_cols.get(sortBy, "df.predicted_demand")
    sort_dir = "DESC" if sortOrder.lower() == "desc" else "ASC"

    # Fetch data
    offset = (page - 1) * limit
    params["limit"] = limit
    params["offset"] = offset

    fetch_sql = f"""
    SELECT df.sku, p.name, c.name as category_name, df.current_stock_snapshot, 
           df.stock_coverage_days, df.predicted_demand, df.recommended_quantity, 
           df.selected_model, df.accuracy_score, df.prediction_reason, df.status
    {sql_base}
    ORDER BY {sort_col} {sort_dir} NULLS LAST
    LIMIT :limit OFFSET :offset
    """

    res = db.execute(text(fetch_sql), params).fetchall()
    
    forecasts = []
    for r in res:
        forecasts.append({
            "sku": r[0],
            "name": r[1],
            "categoryName": r[2],
            "currentStockSnapshot": r[3],
            "stockCoverageDays": r[4],
            "predictedDemand": r[5],
            "recommendedQuantity": r[6],
            "selectedModel": r[7],
            "accuracyScore": r[8],
            "predictionReason": r[9],
            "status": r[10]
        })

    # Get status totals for the ENTIRE run (no search/status/category filters)
    status_count_query = text("""
    SELECT df.status, COUNT(*)::integer as cnt
    FROM demand_forecasts df
    WHERE df.forecast_run_id = :run_id
    GROUP BY df.status
    """)
    status_rows = db.execute(status_count_query, {"run_id": runId}).fetchall()
    status_counts = {r[0]: r[1] for r in status_rows}

    return {
        "run": run_obj,
        "forecasts": forecasts,
        "totalCount": total_count,
        "page": page,
        "limit": limit,
        "statusCounts": status_counts
    }

@router.get("/forecast/{runId}/product/{sku}", response_model=ProductForecastDetail)
def get_product_forecast_detail(
    runId: str,
    sku: str,
    db: Session = Depends(get_db)
):
    query = text("""
    SELECT df.sku, p.name, c.name as category_name, df.current_stock_snapshot, 
           df.predicted_demand, df.recommended_quantity, df.stock_coverage_days, 
           df.status, df.selected_model, df.accuracy_score, df.prediction_reason, 
           r.target_month, df.created_at,
           da.recent_30_day_sales, da.previous_30_day_sales, da.recent_growth_percent,
           da.three_month_average, da.six_month_average, da.same_month_historical_average,
           da.average_daily_sales, da.discount_uplift_percent, da.refund_quantity,
           da.stock_out_estimate, da.demand_trend, da.data_quality
    FROM demand_forecasts df
    JOIN demand_forecast_runs r ON df.forecast_run_id = r.id
    JOIN products p ON df.sku = p.sku
    JOIN master_product_class mc ON p.master_id = mc.id
    JOIN categories c ON mc.category_id = c.category_id
    JOIN demand_analysis da ON da.forecast_run_id = r.id AND da.sku = p.sku
    WHERE df.forecast_run_id = :run_id AND df.sku = :sku
    """)
    
    res = db.execute(query, {"run_id": runId, "sku": sku}).first()
    if not res:
        raise HTTPException(status_code=404, detail="Product forecast details not found.")

    return {
        "sku": res[0],
        "name": res[1],
        "categoryName": res[2],
        "currentStock": res[3],
        "predictedDemand": res[4],
        "recommendedQuantity": res[5],
        "stockCoverageDays": res[6],
        "status": res[7],
        "selectedModel": res[8],
        "accuracyScore": res[9],
        "predictionReason": res[10],
        "targetMonth": res[11],
        "createdAt": res[12],
        
        # Analysis
        "recent30DaySales": res[13],
        "previous30DaySales": res[14],
        "recentGrowthPercent": res[15],
        "threeMonthAverage": res[16],
        "sixMonthAverage": res[17],
        "sameMonthHistoricalAverage": res[18],
        "averageDailySales": res[19],
        "discountUpliftPercent": res[20],
        "refundQuantity": res[21],
        "stockOutEstimate": res[22],
        "demandTrend": res[23],
        "dataQuality": res[24]
    }

from datetime import timedelta
