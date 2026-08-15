import { api } from './axiosInstance';

export interface ForecastRun {
  id: string;
  targetMonth: string;
  version?: number;
  triggerType?: string;
  requestedBy?: string;
  totalProducts?: number;
  successCount?: number;
  failureCount?: number;
  dataStartDate: string;
  dataEndDate: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface ProductForecastSummary {
  sku: string;
  barcode?: string;
  name: string;
  categoryName: string;
  currentStockSnapshot: number;
  stockCoverageDays?: number;
  predictedDemand: number;
  recommendedQuantity: number;
  selectedModel: string;
  accuracyScore?: number;
  predictionReason: string;
  status: 'CRITICAL_ACTION' | 'REORDER_REQUIRED' | 'SUFFICIENT' | 'OVERSTOCK_RISK';
}

export interface RunDetailsResponse {
  run: ForecastRun;
  forecasts: ProductForecastSummary[];
  totalCount: number;
  page: number;
  limit: number;
  statusCounts: Record<string, number>;
  reorderProductsCount?: number;
}

export interface ProductForecastDetail {
  sku: string;
  name: string;
  categoryName: string;
  currentStock: number;
  predictedDemand: number;
  safetyStock: number;
  requiredStock: number;
  recommendedQuantity: number;
  stockCoverageDays?: number;
  averageForecastDailyDemand?: number;
  stockVsRequiredPercentage?: number;
  status: 'CRITICAL_ACTION' | 'REORDER_REQUIRED' | 'SUFFICIENT' | 'OVERSTOCK_RISK';
  selectedModel: string;
  accuracyScore?: number;
  predictionReason: string;
  targetMonth: string;
  createdAt: string;
  
  // Backtesting & Monthly Validation
  mae?: number;
  rmse?: number;
  wape?: number;
  monthlyBias?: number;
  reliabilityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  
  // Analysis metrics
  recent30DaySales: number;
  previous30DaySales: number;
  recentGrowthPercent?: number;
  threeMonthAverage: number;
  sixMonthAverage: number;
  sameMonthHistoricalAverage?: number;
  averageDailySales: number;
  discountUpliftPercent?: number;
  refundQuantity: number;
  stockOutEstimate: number;
  demandTrend: string;
  primaryBehaviour: string;
  additionalBehaviourTags?: string[];
  dataQuality: 'GOOD' | 'MODERATE' | 'LIMITED';
}

export const aiDemandService = {
  async generateForecast(targetMonth: string, force: boolean = false) {
    const response = await api.post('/ai-demand/forecast', { targetMonth, force });
    return response.data;
  },

  async getLatestForecastRun(): Promise<ForecastRun | null> {
    const response = await api.get('/ai-demand/forecast/latest');
    return response.data.data;
  },

  async getForecastRunDetails(
    runId: string, 
    params: {
      search?: string;
      status?: string;
      category?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    } = {}
  ): Promise<RunDetailsResponse> {
    const response = await api.get(`/ai-demand/forecast/${runId}`, { params });
    return response.data.data;
  },

  async getProductForecastDetail(runId: string, sku: string): Promise<ProductForecastDetail> {
    const response = await api.get(`/ai-demand/forecast/${runId}/product/${sku}`);
    return response.data.data;
  },

  async getForecastHistory(): Promise<ForecastRun[]> {
    const response = await api.get('/ai-demand/forecast/history');
    return response.data.data;
  }
};
