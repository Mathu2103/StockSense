import jwt from 'jsonwebtoken'

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_fallback_secret'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_fallback_secret'

const ACCESS_EXPIRES_IN = '15m' // 15 minutes
const REFRESH_EXPIRES_IN = '7d' // 7 days

export interface JwtPayload {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'CASHIER' | 'INVENTORY_MANAGER'
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN })
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN })
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload
}
