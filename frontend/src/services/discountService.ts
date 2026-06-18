import { api } from './axiosInstance';

export interface DiscountPayload {
  name: string;
  type: 'SEASONAL' | 'DAILY' | 'COMBO' | 'BILL';
  discountValue: number;
  comboPrice?: number;
  minBillAmount?: number;
  label?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  dailyStartTime?: string;
  dailyEndTime?: string;
  applicableDate?: string;
  productIds?: string[];
  comboItems?: {
    productId: string;
    minQty: number;
  }[];
  isActive?: boolean;
  approvalStatus?: 'DRAFT' | 'APPROVED';
}

export const DiscountService = {
  getDiscounts: async () => {
    const response = await api.get('/discounts');
    return response.data;
  },

  createDiscount: async (data: DiscountPayload) => {
    const response = await api.post('/discounts', data);
    return response.data;
  },

  updateDiscount: async (id: string, data: Partial<DiscountPayload>) => {
    const response = await api.put(`/discounts/${id}`, data);
    return response.data;
  },

  deleteDiscount: async (id: string) => {
    const response = await api.delete(`/discounts/${id}`);
    return response.data;
  },

  toggleStatus: async (id: string, data: { isActive?: boolean; approvalStatus?: 'DRAFT' | 'APPROVED' }) => {
    const response = await api.patch(`/discounts/${id}/status`, data);
    return response.data;
  }
};
