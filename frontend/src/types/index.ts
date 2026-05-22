/**
 * StockSense — TypeScript Definitions
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CASHIER' | 'CUSTOMER';
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  lowStockThreshold: number;
  expiryDate?: string;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  barcode: string;
}

export interface Bill {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'CASH' | 'CARD' | 'ONLINE';
  createdAt: string;
  cashierId: string;
}

export interface RestockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  predictedDemand: number;
  suggestedReorderQty: number;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
