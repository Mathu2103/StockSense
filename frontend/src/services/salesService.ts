import { api } from './axiosInstance';

export interface BillItemPayload {
  sku: string;
  qty: number;
  unitPrice: number;
  total: number;
  discountId?: string | null;
  discountValue?: number;
}

export interface BillPayload {
  subtotal: number;
  totalDiscount: number;
  totalBill: number;
  paymentMethod: 'CASH' | 'CARD' | 'ONLINE';
  totalQty: number;
  draft?: boolean;
  items: BillItemPayload[];
  resumeDraftId?: string | null;
}

export const SalesService = {
  createBill: async (data: BillPayload) => {
    const response = await api.post('/sales/bill', data);
    return response.data;
  },

  getSalesHistory: async () => {
    const response = await api.get('/sales/history');
    return response.data;
  },

  getDraftBills: async () => {
    const response = await api.get('/sales/drafts');
    return response.data;
  },

  deleteDraftBill: async (id: string) => {
    const response = await api.delete(`/sales/drafts/${id}`);
    return response.data;
  }
};
