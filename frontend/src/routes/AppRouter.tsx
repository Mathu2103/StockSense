import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import PublicLayout from '../components/layout/PublicLayout/PublicLayout'
import ProtectedRoute from '../components/shared/ProtectedRoute/ProtectedRoute'

// Public Pages
import HomePage     from '../pages/public/HomePage'
import OffersPage   from '../pages/public/OffersPage'
import ProductsPage from '../pages/public/ProductsPage'
import CategoryPage from '../pages/public/CategoryPage'
import AboutUsPage from '../pages/public/AboutUsPage'

// Auth Pages
import LoginPage        from '../pages/auth/LoginPage'
import UnauthorizedPage from '../pages/auth/UnauthorizedPage'

// Inventory Pages (ADMIN + INVENTORY_MANAGER)
import InventoryPage        from '../pages/inventory/InventoryPage'
import InventoryAnalytics   from '../pages/inventory/InventoryAnalytics'
import ProductManagement    from '../pages/inventory/ProductManagement'
import AddNewProduct        from '../pages/inventory/AddNewProduct'
import Category             from '../pages/inventory/Categories'
import InventoryAdjustments from '../pages/inventory/InventoryAdjustments'
import Suppliers            from '../pages/inventory/Suppliers'
import PurchaseRecords      from '../pages/inventory/PurchaseRecords'
import ProcurementManagement from '../pages/inventory/ProcurementManagement'
import StockMovements       from '../pages/inventory/StockMovements'
import Alerts               from '../pages/inventory/Alerts'
import Reports              from '../pages/inventory/Reports'
import Settings             from '../pages/inventory/Settings'

// Protected Route Groups
import AdminRoutes   from './AdminRoutes'
import CashierRoutes from './CashierRoutes'

const INVENTORY_ROLES = ['ADMIN', 'INVENTORY_MANAGER']
const CASHIER_ROLES   = ['ADMIN', 'CASHIER']

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ══════════════════════════════════════════════
            PUBLIC AREA — No login required
        ══════════════════════════════════════════════ */}
        <Route element={<PublicLayout />}>

          <Route path="/"       element={<HomePage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/about" element={<AboutUsPage />} />

        </Route>

        {/* ══════════════════════════════════════════════
            AUTH PAGES — Standalone (no layout)
        ══════════════════════════════════════════════ */}
        <Route path="/login"        element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* ══════════════════════════════════════════════
            INVENTORY MODULE (ADMIN + INVENTORY_MANAGER)
        ══════════════════════════════════════════════ */}
        <Route path="/inventory" element={
          <ProtectedRoute allowedRoles={INVENTORY_ROLES}><InventoryPage /></ProtectedRoute>
        } />
        <Route path="/inventory-analytics" element={
          <ProtectedRoute allowedRoles={INVENTORY_ROLES}><InventoryAnalytics /></ProtectedRoute>
        } />
        <Route path="/manage-products" element={
          <ProtectedRoute allowedRoles={INVENTORY_ROLES}><ProductManagement /></ProtectedRoute>
        } />
        <Route path="/manage-products/new" element={
          <ProtectedRoute allowedRoles={INVENTORY_ROLES}><AddNewProduct /></ProtectedRoute>
        } />
        <Route path="/categories" element={
          <ProtectedRoute allowedRoles={INVENTORY_ROLES}><Category /></ProtectedRoute>
        } />
        <Route path="/inventory-adjustments" element={
          <ProtectedRoute allowedRoles={INVENTORY_ROLES}><InventoryAdjustments /></ProtectedRoute>
        } />
        <Route path="/suppliers" element={
          <ProtectedRoute allowedRoles={INVENTORY_ROLES}><ProcurementManagement /></ProtectedRoute>
        } />
        <Route path="/purchase-records" element={
          <ProtectedRoute allowedRoles={INVENTORY_ROLES}><ProcurementManagement /></ProtectedRoute>
        } />
        <Route path="/procurement" element={
          <ProtectedRoute allowedRoles={INVENTORY_ROLES}><ProcurementManagement /></ProtectedRoute>
        } />
        <Route path="/stock-movements" element={
          <ProtectedRoute allowedRoles={INVENTORY_ROLES}><StockMovements /></ProtectedRoute>
        } />
        <Route path="/alerts" element={
          <ProtectedRoute allowedRoles={INVENTORY_ROLES}><Alerts /></ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={INVENTORY_ROLES}><Reports /></ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={INVENTORY_ROLES}><Settings /></ProtectedRoute>
        } />

        {/* ══════════════════════════════════════════════
            ADMIN PANEL (ADMIN only)
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
            CASHIER POS (ADMIN + CASHIER)
        ══════════════════════════════════════════════ */}
        <Route
          path="/cashier/*"
          element={
            <ProtectedRoute allowedRoles={CASHIER_ROLES}>
              <CashierRoutes />
            </ProtectedRoute>
          }
        />

        {/* Unknown routes → Home */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}
