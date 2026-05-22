import { createContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('stocksense_token')
    if (token) {
      try {
        setUser(jwtDecode(token))
      } catch {
        localStorage.removeItem('stocksense_token')
      }
    }
  }, [])

  const login = (token) => {
    localStorage.setItem('stocksense_token', token)
    setUser(jwtDecode(token))
  }

  const logout = () => {
    localStorage.removeItem('stocksense_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
