import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SwagProvider } from '@/stores/useSwagStore'
import Layout from '@/components/Layout'
import AdminLayout from '@/components/AdminLayout'
import Index from '@/pages/Index'
import HistoryPage from '@/pages/History'
import ManageProducts from '@/pages/ManageProducts'
import NotFound from '@/pages/NotFound'
import Dashboard from '@/pages/admin/Dashboard'
import Inventory from '@/pages/admin/Inventory'
import Settings from '@/pages/admin/Settings'

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <TooltipProvider>
      <SwagProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public Storefront Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/historico" element={<HistoryPage />} />
            <Route path="/gerenciar" element={<ManageProducts />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </SwagProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
