import { api } from './axiosInstance';

export interface GeneratedReportPayload {
  name: string;
  category: string;
  format: 'pdf' | 'excel' | 'csv';
}

export interface GeneratedReport {
  id: string;
  name: string;
  category: string;
  format: string;
  status: string;
  createdAt: string;
}

export const ReportService = {
  getReportHistory: async (): Promise<GeneratedReport[]> => {
    const response = await api.get('/reports/history');
    return response.data.data;
  },

  createReportLog: async (data: GeneratedReportPayload): Promise<GeneratedReport> => {
    const response = await api.post('/reports/history', data);
    return response.data.data;
  },

  clearReportHistory: async (): Promise<void> => {
    await api.delete('/reports/history');
  }
};
