import { api, setAccessToken } from './axiosInstance'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'CASHIER' | 'INVENTORY_MANAGER'
}

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: AuthUser
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    setAccessToken(response.data.data.token) // Save token in memory
    return response.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
    setAccessToken(null) // Clear memory token
  },

  async getMe(): Promise<AuthUser> {
    const response = await api.get<{ success: boolean; data: AuthUser }>('/auth/me')
    return response.data.data
  },
}
