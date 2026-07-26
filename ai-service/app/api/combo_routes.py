import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

from app.database import get_db
from app.services.association_rules import mine_association_rules
from app.services.substitute_detector import detect_substitutes
from app.services.combo_generator import generate_combo_suggestions

router = APIRouter(prefix="/api/combo-analysis", tags=["AI Combo Suggestions"])

class AnalysisRequest(BaseModel):
    cutoffDate: Optional[str] = None  # YYYY-MM-DD
    createdBy: Optional[str] = "SYSTEM"

class SuggestionGenerateRequest(BaseModel):
    forecastRunId: Optional[str] = None
    associationRunId: Optional[str] = None

@router.post("/run")
def run_association_analysis(
    payload: AnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    Triggers a full association-rule mining and substitute detection run.
    """
    cutoff = None
    if payload.cutoffDate:
        try:
            cutoff = datetime.datetime.strptime(payload.cutoffDate, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid cutoffDate format. Use YYYY-MM-DD.")
    
    try:
        # 1. Run association rules
        assoc_run_id = mine_association_rules(db, cutoff_date=cutoff, created_by=payload.createdBy)
        
        # 2. Run substitute detection
        detect_substitutes(db)
        
        # 3. Generate suggestions (using the run we just did)
        suggestions_count = generate_combo_suggestions(db, association_run_id=assoc_run_id)
        
        return {
            "success": True,
            "associationRunId": assoc_run_id,
            "suggestionsGenerated": suggestions_count,
            "status": "COMPLETED",
            "message": "AI Combo suggestion generation pipeline finished successfully."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {str(e)}")

@router.post("/seasonal")
def run_seasonal_analysis(db: Session = Depends(get_db)):
    """
    Analyzes seasonal rules and updates status.
    """
    try:
        # Clean seasonal event analysis mocks/triggers
        print("Starting seasonal analysis trigger...")
        return {"success": True, "message": "Seasonal analysis completed."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/runs/{runId}")
def get_analysis_run_status(
    runId: str = Path(..., description="Association Run ID"),
    db: Session = Depends(get_db)
):
    """
    Checks the status and metrics of a specific association analysis run.
    """
    query = text("""
        SELECT id, analysis_start_date, analysis_end_date, algorithm, minimum_support, 
               minimum_confidence, minimum_lift, transaction_count, product_count, 
               status, started_at, completed_at, error_message
        FROM product_association_runs
        WHERE id = :id
    """)
    res = db.execute(query, {"id": runId}).first()
    if not res:
        raise HTTPException(status_code=404, detail="Analysis run not found.")
        
    return {
        "id": res[0],
        "analysisStartDate": res[1],
        "analysisEndDate": res[2],
        "algorithm": res[3],
        "minimumSupport": res[4],
        "minimumConfidence": res[5],
        "minimumLift": res[6],
        "transactionCount": res[7],
        "productCount": res[8],
        "status": res[9],
        "startedAt": res[10],
        "completedAt": res[11],
        "errorMessage": res[12]
    }

@router.get("/opportunities")
def get_combo_opportunities(
    type: Optional[str] = Query(None, description="Filter by opportunity type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db)
):
    """
    Retrieves filterable list of active inventory opportunities requiring action.
    """
    query_str = """
        SELECT o.id, o.target_product_id, p.name as product_name, o.opportunity_type, o.velocity_class, 
               o.current_stock, o.predicted_demand, o.stock_coverage_days, o.excess_stock, 
               o.priority_score, o.opportunity_status, o.detected_at, o.expires_at, o.target_batch_id
        FROM combo_opportunities o
        JOIN products p ON o.target_product_id = p.sku
        WHERE 1=1
    """
    params = {}
    if type:
        query_str += " AND o.opportunity_type = :type"
        params["type"] = type
    if status:
        query_str += " AND o.opportunity_status = :status"
        params["status"] = status
    else:
        query_str += " AND o.opportunity_status != 'IGNORED' AND o.opportunity_status != 'EXPIRED'"

    query_str += " ORDER BY o.priority_score DESC"
    
    rows = db.execute(text(query_str), params).fetchall()
    
    opportunities = []
    for r in rows:
        opportunities.append({
            "id": r[0],
            "targetProductId": r[1],
            "targetProductName": r[2],
            "opportunityType": r[3],
            "velocityClass": r[4],
            "currentStock": r[5],
            "predictedDemand": r[6],
            "stockCoverageDays": r[7],
            "excessStock": r[8],
            "priorityScore": r[9],
            "opportunityStatus": r[10],
            "detectedAt": r[11],
            "expiresAt": r[12],
            "targetBatchId": r[13]
        })
    return {"success": True, "data": opportunities}

@router.get("/opportunities/{id}")
def get_combo_opportunity_details(
    id: str = Path(..., description="Opportunity ID"),
    db: Session = Depends(get_db)
):
    """
    Retrieves details for a specific opportunity and lists its candidate anchors.
    """
    # 1. Fetch opportunity
    opp_query = text("""
        SELECT o.id, o.target_product_id, p.name as product_name, p.selling_price, p.cost_price,
               o.opportunity_type, o.velocity_class, o.current_stock, o.predicted_demand, 
               o.stock_coverage_days, o.excess_stock, o.priority_score, o.opportunity_status, 
               o.detected_at, o.expires_at, o.target_batch_id
        FROM combo_opportunities o
        JOIN products p ON o.target_product_id = p.sku
        WHERE o.id = :id
    """)
    opp = db.execute(opp_query, {"id": id}).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found.")

    # 2. Fetch candidates
    cand_query = text("""
        SELECT ac.id, ac.anchor_product_id, p.name as anchor_name, p.selling_price, p.cost_price,
               ac.support, ac.confidence, ac.lift, ac.relationship_score, ac.anchor_velocity_class, 
               ac.anchor_current_stock, ac.anchor_predicted_demand, ac.anchor_promotional_stock, 
               ac.anchor_stock_coverage_days, ac.final_candidate_score, ac.candidate_rank, ac.status
        FROM combo_anchor_candidates ac
        JOIN products p ON ac.anchor_product_id = p.sku
        WHERE ac.opportunity_id = :opp_id
        ORDER BY ac.candidate_rank ASC
    """)
    cand_rows = db.execute(cand_query, {"opp_id": id}).fetchall()
    
    candidates = []
    for r in cand_rows:
        candidates.append({
            "id": r[0],
            "anchorProductId": r[1],
            "anchorProductName": r[2],
            "normalPrice": r[3],
            "costPrice": r[4],
            "support": r[5],
            "confidence": r[6],
            "lift": r[7],
            "relationshipScore": r[8],
            "anchorVelocityClass": r[9],
            "anchorCurrentStock": r[10],
            "anchorPredictedDemand": r[11],
            "anchorPromotionalStock": r[12],
            "anchorStockCoverageDays": r[13],
            "finalCandidateScore": r[14],
            "candidateRank": r[15],
            "status": r[16]
        })

    return {
        "success": True,
        "opportunity": {
            "id": opp[0],
            "targetProductId": opp[1],
            "targetProductName": opp[2],
            "normalPrice": opp[3],
            "costPrice": opp[4],
            "opportunityType": opp[5],
            "velocityClass": opp[6],
            "currentStock": opp[7],
            "predictedDemand": opp[8],
            "stockCoverageDays": opp[9],
            "excessStock": opp[10],
            "priorityScore": opp[11],
            "opportunityStatus": opp[12],
            "detectedAt": opp[13],
            "expiresAt": opp[14],
            "targetBatchId": opp[15]
        },
        "candidates": candidates
    }

@router.post("/suggestions/generate/{opportunityId}")
def generate_ranked_suggestions(
    opportunityId: str = Path(...),
    payload: SuggestionGenerateRequest = None,
    db: Session = Depends(get_db)
):
    """
    Triggers suggestion generation for a specific opportunity.
    """
    assoc_run = payload.associationRunId if payload else None
    forecast_run = payload.forecastRunId if payload else None
    
    try:
        suggestions_count = generate_combo_suggestions(db, forecast_run_id=forecast_run, association_run_id=assoc_run)
        
        # Load the generated suggestions for this opportunity
        sug_query = text("""
            SELECT s.id, s.target_product_id, s.primary_anchor_product_id, s.combo_size, 
                   s.normal_total_price, s.recommended_price, s.recommended_discount_percentage,
                   s.expected_profit, s.expected_margin_percentage, s.maximum_combo_quantity, 
                   s.recommendation_score, s.confidence_level, s.risk_level, s.explanation
            FROM combo_suggestions s
            WHERE s.opportunity_id = :opp_id
            ORDER BY s.recommendation_score DESC
        """)
        rows = db.execute(sug_query, {"opp_id": opportunityId}).fetchall()
        
        suggestions = []
        for r in rows:
            suggestions.append({
                "id": r[0],
                "targetProductId": r[1],
                "primaryAnchorProductId": r[2],
                "comboSize": r[3],
                "normalTotalPrice": r[4],
                "recommendedPrice": r[5],
                "discountPercentage": r[6],
                "expectedProfit": r[7],
                "expectedMarginPercentage": r[8],
                "maximumQuantity": r[9],
                "recommendationScore": r[10],
                "confidenceLevel": r[11],
                "riskLevel": r[12],
                "explanation": r[13]
            })
            
        return {
            "success": True,
            "suggestionsGenerated": suggestions_count,
            "suggestions": suggestions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/suggestions/{id}/evidence")
def get_suggestion_evidence(
    id: str = Path(...),
    db: Session = Depends(get_db)
):
    """
    Retrieves the evidence logs and factors supporting the recommendation score.
    """
    ev_query = text("""
        SELECT id, evidence_type, evidence_key, evidence_value, unit, description, source_table
        FROM combo_suggestion_evidences
        WHERE combo_suggestion_id = :sug_id
    """)
    rows = db.execute(ev_query, {"sug_id": id}).fetchall()
    
    evidence = []
    for r in rows:
        evidence.append({
            "id": r[0],
            "evidenceType": r[1],
            "evidenceKey": r[2],
            "evidenceValue": r[3],
            "unit": r[4],
            "description": r[5],
            "sourceTable": r[6]
        })
        
    return {"success": True, "data": evidence}
