import axios from 'axios'
import { NODE_API_URL } from '../config/env'

const api = axios.create({
  baseURL: NODE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('stocksense_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-redirect on 401 Unauthorized
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('stocksense_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
