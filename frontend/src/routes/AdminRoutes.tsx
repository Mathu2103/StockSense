import { Routes, Route } from 'react-router-dom'
import DashboardPage from '../pages/admin/Dashboard/DashboardPage'
import InventoryPage from '../pages/inventory/Dashboard/InventoryPage'
import SettingsPage from '../pages/admin/settings/Settings'
import ReportsPage from '../pages/admin/Reports/Reports'

export default function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
      <Route path="inventory" element={<InventoryPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="reports" element={<ReportsPage />} />
    </Routes>
  )
}
