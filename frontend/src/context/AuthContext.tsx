import { createContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'
import { authService, AuthUser } from '../services/authService'
import { setAccessToken } from '../services/axiosInstance'

interface AuthContextType {
  user: AuthUser | null
  login: (token: string, user: AuthUser) => void
  logout: () => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount, try to fetch user. If a valid refresh cookie exists, 
  // the axios interceptor will handle getting a new access token.
  useEffect(() => {
    const initAuth = async () => {
      // Only attempt to fetch if we know the user was previously logged in
      const wasLoggedIn = localStorage.getItem('stocksense_logged_in') === 'true'
      
      if (!wasLoggedIn) {
        setIsLoading(false)
        return
      }

      try {
        // Proactively refresh the token first to get it into memory.
        // This avoids the initial 401 error on /me that scares developers in the console.
        const refreshRes = await axios.post(
          `${import.meta.env.VITE_NODE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        setAccessToken(refreshRes.data.data.token)

        // Now that we have the access token in memory, /me will succeed directly!
        const userData = await authService.getMe()
        setUser(userData)
      } catch {
        // Not logged in or refresh token expired
        setUser(null)
        localStorage.removeItem('stocksense_logged_in')
      } finally {
        setIsLoading(false)
      }
    }
    initAuth()
  }, [])

  const login = (newToken: string, newUser: AuthUser) => {
    localStorage.setItem('stocksense_logged_in', 'true')
    setAccessToken(newToken)
    setUser(newUser)
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.error('Logout failed', err)
    } finally {
      localStorage.removeItem('stocksense_logged_in')
      setAccessToken(null)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  )
}
