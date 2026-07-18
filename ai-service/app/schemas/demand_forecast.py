from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import List, Optional, Any, Dict

class ForecastRequest(BaseModel):
    targetMonth: str = Field(..., description="Target forecasting month format YYYY-MM-DD or YYYY-MM")
    force: Optional[bool] = Field(False, description="Force forecast regeneration even if already completed")

class ForecastRunResponse(BaseModel):
    runId: str
    targetMonth: str
    status: str
    productsProcessed: int
    productsFailed: int
    startedAt: Optional[datetime] = None
    completedAt: Optional[datetime] = None
    errorMessage: Optional[str] = None

class LatestRunResponse(BaseModel):
    id: str
    targetMonth: date
    dataStartDate: date
    dataEndDate: date
    status: str
    startedAt: Optional[datetime]
    completedAt: Optional[datetime]
    errorMessage: Optional[str]
    createdAt: datetime

class ProductForecastSummary(BaseModel):
    sku: str
    name: str
    categoryName: str
    currentStockSnapshot: int
    stockCoverageDays: Optional[float]
    predictedDemand: int
    recommendedQuantity: int
    selectedModel: str
    accuracyScore: Optional[float]
    predictionReason: str
    status: str

class RunDetailsResponse(BaseModel):
    run: LatestRunResponse
    forecasts: List[ProductForecastSummary]
    totalCount: int
    page: int
    limit: int
    statusCounts: Dict[str, int] = {}

class ProductForecastDetail(BaseModel):
    sku: str
    name: str
    categoryName: str
    currentStock: int
    predictedDemand: int
    recommendedQuantity: int
    stockCoverageDays: Optional[float]
    status: str
    selectedModel: str
    accuracyScore: Optional[float]
    predictionReason: str
    targetMonth: date
    createdAt: datetime
    
    # Analysis fields
    recent30DaySales: int
    previous30DaySales: int
    recentGrowthPercent: Optional[float]
    threeMonthAverage: float
    sixMonthAverage: float
    sameMonthHistoricalAverage: Optional[float]
    averageDailySales: float
    discountUpliftPercent: Optional[float]
    refundQuantity: int
    stockOutEstimate: int
    demandTrend: str
    dataQuality: str
