import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { ROLES } from './config/permissions'

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
import UserPermissions from './pages/Admin/UserPermissions'

// Components
import Layout from './components/Layout/Layout'
import RoleRoute from './components/RoleRoute'

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* Dashboard - Solo Admin */}
          <Route index element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
              <Dashboard />
            </RoleRoute>
          } />
          
          {/* Analytics - Solo Admin */}
          <Route path="analytics" element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
              <DashboardAnalytics />
            </RoleRoute>
          } />
          
          {/* Categorías - Admin y Vendedor */}
          <Route path="categories" element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER]}>
              <Categories />
            </RoleRoute>
          } />
          <Route path="categories/:categoryId/products" element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER]}>
              <CategoryProducts />
            </RoleRoute>
          } />
          <Route path="categories/:categoryId/products/new" element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER]}>
              <ProductForm />
            </RoleRoute>
          } />
          
          {/* Productos - Admin y Vendedor */}
          <Route path="products/:id" element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER, ROLES.VIEWER]}>
              <ProductDetail />
            </RoleRoute>
          } />
          <Route path="products/:id/edit" element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER]}>
              <ProductForm />
            </RoleRoute>
          } />
          
          {/* Órdenes - Admin y Vendedor */}
          <Route path="orders" element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER]}>
              <Orders />
            </RoleRoute>
          } />
          <Route path="orders/new" element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER]}>
              <CreateOrder />
            </RoleRoute>
          } />
          <Route path="orders/:id" element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER, ROLES.VIEWER]}>
              <OrderDetail />
            </RoleRoute>
          } />
          
          {/* Clientes - Admin y Vendedor */}
          <Route path="customers" element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER]}>
              <Customers />
            </RoleRoute>
          } />
          <Route path="customers/new" element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER]}>
              <CustomerForm />
            </RoleRoute>
          } />
          <Route path="customers/:id" element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER, ROLES.VIEWER]}>
              <CustomerDetail />
            </RoleRoute>
          } />
          <Route path="customers/:id/edit" element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER]}>
              <CustomerForm />
            </RoleRoute>
          } />
          
          {/* Administración - Solo Super Admin */}
          <Route path="audit" element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <AuditLogs />
            </RoleRoute>
          } />
          <Route path="financial" element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <FinancialTransactions />
            </RoleRoute>
          } />
          <Route path="financial/new" element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <CreateTransaction />
            </RoleRoute>
          } />
          <Route path="permissions" element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <UserPermissions />
            </RoleRoute>
          } />
        </Route>

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

// Componente para proteger rutas (requiere autenticación)
function ProtectedRoute({ children }) {
  const { token } = useAuthStore()
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

export default App
