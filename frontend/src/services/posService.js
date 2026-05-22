import api from './api'

export const posService = {
  searchProduct: (query) => api.get('/pos/search', { params: { q: query } }),
  getProductByBarcode: (barcode) => api.get(`/pos/barcode/${barcode}`),
  createBill: (billData) => api.post('/pos/bill', billData),
  getBillHistory: (params) => api.get('/pos/bills', { params }),
}

