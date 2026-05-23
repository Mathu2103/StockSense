import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import PublicLayout from '../components/layout/PublicLayout/PublicLayout'
import ProtectedRoute from '../components/shared/ProtectedRoute/ProtectedRoute'

// Public Pages
import HomePage from '../pages/public/HomePage'
import OffersPage from '../pages/public/OffersPage'
import ProductsPage from '../pages/public/ProductsPage'

// Auth Pages
import LoginPage from '../pages/auth/LoginPage'
import UnauthorizedPage from '../pages/auth/UnauthorizedPage'

import InventoryPage from '../pages/inventory/InventoryPage'
import InventoryAnalytics from '../pages/inventory/InventoryAnalytics'
import ProductManagement from '../pages/inventory/ProductManagement'
import AddNewProduct from '../pages/inventory/AddNewProduct'
import Category from '../pages/inventory/Categories'
import InventoryAdjustments from '../pages/inventory/InventoryAdjustments'
import Suppliers from '../pages/inventory/Suppliers'
import PurchaseRecords from '../pages/inventory/PurchaseRecords'
import StockMovements from '../pages/inventory/StockMovements'
import Alerts from '../pages/inventory/Alerts'
import Reports from '../pages/inventory/Reports'
import Settings from '../pages/inventory/Settings'
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
        </Route>

        {/* ══════════════════════════════════════════════
            AUTH PAGES — Standalone (no layout)
        ══════════════════════════════════════════════ */}
        <Route path="/login"        element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/inventory"    element={<InventoryPage />} />
        <Route path="/inventory-analytics" element={<InventoryAnalytics />} />
        <Route path="/manage-products"     element={<ProductManagement />} />
        <Route path="/manage-products/new" element={<AddNewProduct />} />
        <Route path="/categories"   element={<Category />} />
        <Route path="/inventory-adjustments" element={<InventoryAdjustments />} />
        <Route path="/suppliers"            element={<Suppliers />} />
        <Route path="/purchase-records"     element={<PurchaseRecords />} />
        <Route path="/stock-movements"      element={<StockMovements />} />
        <Route path="/alerts"               element={<Alerts />} />
        <Route path="/reports"              element={<Reports />} />
        <Route path="/settings"             element={<Settings />} />
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
