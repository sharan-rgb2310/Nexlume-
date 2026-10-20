import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminApp from './admin/AdminApp.jsx'
import StockDashboard from './App.jsx'

export default function RootApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StockDashboard />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
