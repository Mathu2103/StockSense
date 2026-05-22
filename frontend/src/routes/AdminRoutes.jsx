import { Routes, Route } from 'react-router-dom'
import DashboardPage from '../pages/admin/DashboardPage'
import AnalyticsPage from '../pages/admin/AnalyticsPage'
import RestockAlertsPage from '../pages/admin/RestockAlertsPage'
import InventoryPage from '../pages/inventory/InventoryPage'
import AddProductPage from '../pages/inventory/AddProductPage'
import EditProductPage from '../pages/inventory/EditProductPage'

export default function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
      <Route path="analytics" element={<AnalyticsPage />} />
      <Route path="restock-alerts" element={<RestockAlertsPage />} />
      <Route path="inventory" element={<InventoryPage />} />
      <Route path="inventory/add" element={<AddProductPage />} />
      <Route path="inventory/edit/:id" element={<EditProductPage />} />
    </Routes>
  )
}
