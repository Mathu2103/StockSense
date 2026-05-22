import api from './api'

export const analyticsService = {
  getSalesSummary: (range) => api.get('/analytics/sales', { params: { range } }),
  getTopProducts: () => api.get('/analytics/top-products'),
  getRevenueChart: (range) => api.get('/analytics/revenue', { params: { range } }),
  getRestockAlerts: () => api.get('/analytics/restock-alerts'),
}

