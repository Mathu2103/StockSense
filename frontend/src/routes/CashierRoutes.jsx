import { Routes, Route } from 'react-router-dom'
import POSPage from '../pages/cashier/POSPage'
import BillingPage from '../pages/cashier/BillingPage'

export default function CashierRoutes() {
  return (
    <Routes>
      <Route index element={<POSPage />} />
      <Route path="billing" element={<BillingPage />} />
    </Routes>
  )
}
