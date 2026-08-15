import { Routes, Route } from 'react-router-dom'
import POSPage from '../pages/cashier/POSPage'
import CashierCombos from '../pages/cashier/CashierCombos'

export default function CashierRoutes() {
  return (
    <Routes>
      <Route index element={<POSPage />} />
      <Route path="pos" element={<POSPage />} />
      <Route path="combos" element={<CashierCombos />} />
    </Routes>
  )
}
