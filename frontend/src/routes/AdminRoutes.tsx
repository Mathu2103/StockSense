import { Routes, Route } from 'react-router-dom'
import DashboardPage from '../pages/admin/DashboardPage'
import InventoryPage from '../pages/inventory/Dashboard/InventoryPage'

export default function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
      <Route path="inventory" element={<InventoryPage />} />
    </Routes>
  )
}
