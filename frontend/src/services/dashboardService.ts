import { api } from './axiosInstance';

export interface DashboardMetrics {
  grossSalesToday: number;
  salesPercentageChange: number;
  activeRegisters: number;
  activeStockAlerts: number;
  supermarketHealth: number;
  salesHourly: number[];
  topSellingProducts: Array<{
    name: string;
    total: number;
    qty: number;
  }>;
  registerActivity: Array<{
    num: string;
    user: string;
    sales: number;
    items: number;
    status: string;
  }>;
  recentActivity: Array<{
    type: 'SALE' | 'ADJUSTMENT';
    label: string;
    desc: string;
    user: string;
    time: string;
  }>;
}

export const dashboardService = {
  async getAdminDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await api.get<{ success: boolean; data: DashboardMetrics }>('/dashboard/admin');
    return response.data.data;
  }
};
