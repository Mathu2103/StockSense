import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import PublicLayout from '../components/layout/PublicLayout/PublicLayout'
import ProtectedRoute from '../components/shared/ProtectedRoute/ProtectedRoute'

// Public Pages
import HomePage from '../pages/public/HomePage'
import OffersPage from '../pages/public/OffersPage'
import ProductsPage from '../pages/public/ProductsPage'
import CategoryPage from '../pages/public/CategoryPage'

// Auth Pages
import LoginPage from '../pages/auth/LoginPage'
import UnauthorizedPage from '../pages/auth/UnauthorizedPage'

// Protected Route Groups
import AdminRoutes from './AdminRoutes'
import CashierRoutes from './CashierRoutes'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ══════════════════════════════════════════════
            PUBLIC AREA — No login required
            Wrapped in PublicLayout (Navbar + Footer)
        ══════════════════════════════════════════════ */}
        <Route element={<PublicLayout />}>
          <Route path="/"       element={<HomePage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
        </Route>

        {/* ══════════════════════════════════════════════
            AUTH PAGES — Standalone (no layout)
        ══════════════════════════════════════════════ */}
        <Route path="/login"        element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* ══════════════════════════════════════════════
            ADMIN (Protected: ADMIN role only)
        ══════════════════════════════════════════════ */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminRoutes />
            </ProtectedRoute>
          }
        />

        {/* ══════════════════════════════════════════════
            CASHIER POS (Protected: CASHIER + ADMIN)
        ══════════════════════════════════════════════ */}
        <Route
          path="/cashier/*"
          element={
            <ProtectedRoute allowedRoles={['CASHIER', 'ADMIN']}>
              <CashierRoutes />
            </ProtectedRoute>
          }
        />

        {/* ══════════════════════════════════════════════
            Unknown routes → Home
        ══════════════════════════════════════════════ */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}
