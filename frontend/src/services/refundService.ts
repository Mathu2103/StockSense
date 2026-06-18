import { api } from './axiosInstance';

export interface RefundItemPayload {
  sku: string;
  qty: number;
  refundValue: number;
}

export interface RefundPayload {
  originalBillId: string;
  refundItems: RefundItemPayload[];
}

export const RefundService = {
  createRefund: async (data: RefundPayload) => {
    const response = await api.post('/refunds', data);
    return response.data;
  },

  getRefundHistory: async () => {
    const response = await api.get('/refunds/history');
    return response.data;
  }
};
