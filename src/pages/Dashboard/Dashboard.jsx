import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Clock,
  Plus,
  ArrowRight,
  Shield,
  DollarSign
} from 'lucide-react'
import { orderService } from '../../services/orderService'
import { productService } from '../../services/productService'
import { useAuthStore } from '../../store/authStore'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    lowStock: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Cargar órdenes
      const ordersResponse = await orderService.getOrders()
      const orders = ordersResponse.data || []
      
      // Cargar productos
      const productsResponse = await productService.getProducts()
      const products = productsResponse.data || []
      
      // Calcular estadísticas
      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'QUOTE' || o.status === 'APPROVED').length,
        totalProducts: products.length,
        lowStock: products.filter(p => p.stock < 10).length,
      })
      
      // Órdenes recientes (últimas 5)
      setRecentOrders(orders.slice(0, 5))
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: 'Total Órdenes',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      name: 'Órdenes Pendientes',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      name: 'Productos',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      name: 'Stock Bajo',
      value: stats.lowStock,
      icon: TrendingUp,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
  ]

  const getStatusBadge = (status) => {
    const badges = {
      QUOTE: 'badge badge-gray',
      APPROVED: 'badge badge-primary',
      IN_PRODUCTION: 'badge badge-warning',
      FINISHED: 'badge badge-success',
      DELIVERED: 'badge badge-success',
      CANCELLED: 'badge badge-danger',
    }
    return badges[status] || 'badge badge-gray'
  }

  const getStatusText = (status) => {
    const texts = {
      QUOTE: 'Cotización',
      APPROVED: 'Aprobada',
      IN_PRODUCTION: 'En Producción',
      FINISHED: 'Terminada',
      DELIVERED: 'Entregada',
      CANCELLED: 'Cancelada',
    }
    return texts[status] || status
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Bienvenido a Fashion Blue</p>
        </div>
        <div className="flex items-center gap-3">
          {user?.Role === 'SUPER_ADMIN' && (
            <>
              <Link
                to="/financial"
                className="btn btn-secondary flex items-center gap-2"
              >
                <DollarSign className="w-5 h-5" />
                Finanzas
              </Link>
              <Link
                to="/audit"
                className="btn btn-secondary flex items-center gap-2"
              >
                <Shield className="w-5 h-5" />
                Auditoría
              </Link>
            </>
          )}
          <Link
            to="/orders/new"
            className="btn btn-gradient flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva Orden
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card card-hover">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.bgColor} rounded-lg p-3`}>
                  <Icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Órdenes Recientes</h2>
          <Link
            to="/orders"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
          >
            Ver todas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay órdenes</h3>
            <p className="mt-1 text-sm text-gray-500">Comienza creando una nueva orden.</p>
            <div className="mt-6">
              <Link 
                to="/orders/new" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Nueva Orden
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(order.status)}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.totalAmount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/orders/${order.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Ver detalles
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
