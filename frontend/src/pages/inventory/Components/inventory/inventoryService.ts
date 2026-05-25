import axios from 'axios'
import type { Product, RestockAlert } from '../../types'

/*
  inventoryService
  - Purpose: Small adapter for inventory-related API calls used by the Inventory UI.
  - Why: Centralizes endpoints (products, adjustments, restock suggestions) so pages
    call this adapter instead of using axios directly; simplifies mocking during UI development.
  - Note: Calls expect backend endpoints; during early UI work you can replace these with
    local mocks or the frontend mock server.
*/

const API_URL = import.meta.env.VITE_NODE_API_URL || 'http://localhost:5000/api'
const api = axios.create({ baseURL: API_URL, withCredentials: true, headers: { 'Content-Type': 'application/json' } })

export const inventoryService = {
  async getProducts(params = {}) {
    try {
      const res = await api.get('/products', { params })
      return res.data
    } catch (err) {
      return Promise.reject(err)
    }
  },

  async getProduct(id: string) {
    const res = await api.get(`/products/${id}`)
    return res.data
  },

  async createProduct(payload: Partial<Product>) {
    const res = await api.post('/products', payload)
    return res.data
  },

  async updateProduct(id: string, payload: Partial<Product>) {
    const res = await api.put(`/products/${id}`, payload)
    return res.data
  },

  async adjustStock(payload: { productId: string; qtyChange: number; reason: string }) {
    const res = await api.post('/inventory/adjust', payload)
    return res.data
  },

  async getRestockSuggestions() {
    const res = await api.get<RestockAlert[]>('/inventory/restock-suggestions')
    return res.data
  }
}
