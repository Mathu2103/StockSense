import { Routes, Route } from 'react-router-dom'
import POSPage from '../pages/cashier/POSPage'

export default function CashierRoutes() {
  return (
    <Routes>
      <Route index element={<POSPage />} />
    </Routes>
  )
}
