import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Pages
import Login from './pages/Auth/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import DashboardAnalytics from './pages/Dashboard/DashboardAnalytics'
import Categories from './pages/Categories/Categories'
import CategoryProducts from './pages/Categories/CategoryProducts'
import ProductForm from './pages/Products/ProductForm'
import ProductDetail from './pages/Products/ProductDetail'
import Orders from './pages/Orders/Orders'
import OrderDetail from './pages/Orders/OrderDetail'
import CreateOrder from './pages/Orders/CreateOrder'
import Customers from './pages/Customers/Customers'
import CustomerForm from './pages/Customers/CustomerForm'
import CustomerDetail from './pages/Customers/CustomerDetail'
import AuditLogs from './pages/Audit/AuditLogs'
import FinancialTransactions from './pages/Financial/FinancialTransactions'
import CreateTransaction from './pages/Financial/CreateTransaction'

// Layout
import Layout from './components/Layout/Layout'

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<DashboardAnalytics />} />
          <Route path="categories" element={<Categories />} />
          <Route path="categories/:categoryId/products" element={<CategoryProducts />} />
          <Route path="categories/:categoryId/products/new" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/new" element={<CreateOrder />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/new" element={<CustomerForm />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="customers/:id/edit" element={<CustomerForm />} />
          <Route path="audit" element={<AdminRoute><AuditLogs /></AdminRoute>} />
          <Route path="financial" element={<AdminRoute><FinancialTransactions /></AdminRoute>} />
          <Route path="financial/new" element={<AdminRoute><CreateTransaction /></AdminRoute>} />
        </Route>

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

// Componente para proteger rutas
function ProtectedRoute({ children }) {
  const { token } = useAuthStore()
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Componente para proteger rutas de admin
function AdminRoute({ children }) {
  const { user } = useAuthStore()

  console.log("user", user)
  
  if (!user || user.Role !== 'SUPER_ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🔒 Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">Solo usuarios con rol SUPER_ADMIN pueden acceder a esta sección.</p>
          <Navigate to="/" replace />
        </div>
      </div>
    )
  }
  
  return children
}

export default App
