import axios from 'axios'

const API_URL = import.meta.env.VITE_NODE_API_URL || 'http://localhost:5000/api'

// ── Axios Instance ────────────────────────────────────────────────────
// withCredentials: true is REQUIRED to send the HttpOnly refresh cookie
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
})

// Variable to hold the current access token in memory
let currentAccessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token
}

export const getAccessToken = () => currentAccessToken

// ── Request Interceptor ───────────────────────────────────────────────
api.interceptors.request.use((config) => {
  if (currentAccessToken) {
    config.headers.Authorization = `Bearer ${currentAccessToken}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// ── Response Interceptor (Auto-Refresh Logic) ─────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true // Mark as retried to prevent infinite loops

      try {
        // Attempt to refresh the token using the HttpOnly cookie
        const res = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true } // Must send cookie
        )

        const newAccessToken = res.data.data.token
        setAccessToken(newAccessToken) // Update memory

        // Update the failed request with the new token and retry it
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // If refresh fails (e.g., refresh token expired), clear memory and force login
        setAccessToken(null)
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
