import { Router } from 'express'
import { login, refreshToken, logout, me, updateProfile, createUser, listUsers, toggleUserStatus } from '../controllers/authController.js'
import { authenticate, requireRole } from '../middlewares/authMiddleware.js'

const router = Router()

// Public routes
router.post('/login', login)
router.post('/refresh', refreshToken)
router.post('/logout', logout)

// Protected routes (any logged-in user)
router.get('/me', authenticate, me)
router.put('/profile', authenticate, updateProfile)

// Admin-only routes
router.post('/users', authenticate, requireRole('ADMIN'), createUser)
router.get('/users', authenticate, requireRole('ADMIN'), listUsers)
router.patch('/users/:id/toggle', authenticate, requireRole('ADMIN'), toggleUserStatus)

export default router
