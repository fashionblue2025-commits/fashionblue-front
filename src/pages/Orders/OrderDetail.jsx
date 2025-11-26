import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, Truck, Calendar, FileText } from 'lucide-react'
import { orderService } from '../../services/orderService'
import { useOrderStatus } from '../../hooks/useOrderStatus'
import OrderAuditTimeline from '../../components/OrderAuditTimeline'
import { useAuthStore } from '../../store/authStore'

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const { allowedStatuses, changeStatus, loading: statusLoading } = useOrderStatus(id)

  useEffect(() => {
    loadOrder()
  }, [id])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const response = await orderService.getOrder(id)
      setOrder(response.data)
    } catch (error) {
      console.error('Error loading order:', error)
      alert('Error al cargar la orden')
      navigate('/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeStatus = async (newStatus) => {
    const confirmMessage = getConfirmMessage(newStatus)
    if (!window.confirm(confirmMessage)) return

    try {
      const updatedOrder = await changeStatus(newStatus)
      if (updatedOrder) {
        setOrder(updatedOrder)
      } else {
        await loadOrder()
      }
    } catch (error) {
      console.error('Error changing status:', error)
      alert(error.response?.data?.message || 'Error al cambiar el estado')
    }
  }

  // Mapeo de estados a configuración de UI
  const getStatusConfig = (status) => {
    const configs = {
      APPROVED: { label: 'Aprobar', icon: CheckCircle, color: 'green' },
      MANUFACTURING: { label: 'Iniciar Producción', icon: CheckCircle, color: 'blue' },
      FINISHED: { label: 'Finalizar Producción', icon: CheckCircle, color: 'green' },
      DELIVERED: { label: 'Marcar como Entregada', icon: Truck, color: 'purple' },
      CONFIRMED: { label: 'Confirmar', icon: CheckCircle, color: 'green' },
      CANCELLED: { label: 'Cancelar', icon: XCircle, color: 'red' },
      PLANNED: { label: 'Planificar', icon: Calendar, color: 'blue' },
      PENDING: { label: 'Pendiente', icon: Calendar, color: 'yellow' },
      QUOTE: { label: 'Cotización', icon: FileText, color: 'blue' }
    }
    return configs[status] || { label: status, icon: CheckCircle, color: 'gray' }
  }

  // Obtener acciones disponibles desde allowedStatuses
  const getAvailableActions = () => {
    return allowedStatuses.map(status => ({
      status,
      ...getStatusConfig(status)
    }))
  }

  const getConfirmMessage = (status) => {
    const messages = {
      APPROVED: '¿Estás seguro de aprobar esta orden? Se crearán los productos automáticamente.',
      MANUFACTURING: '¿Estás seguro de iniciar la producción?',
      FINISHED: '¿Estás seguro de finalizar la producción? Se incrementará el stock.',
      DELIVERED: '¿Estás seguro de marcar como entregada? Se descontará el stock.',
      CONFIRMED: '¿Estás seguro de confirmar esta venta?',
      CANCELLED: '¿Estás seguro de cancelar esta orden?'
    }
    return messages[status] || '¿Estás seguro de realizar esta acción?'
  }


  const getStatusBadge = (status) => {
    const statusConfig = {
      QUOTE: { label: 'Cotización', className: 'bg-blue-100 text-blue-800' },
      APPROVED: { label: 'Aprobada', className: 'bg-green-100 text-green-800' },
      MANUFACTURING: { label: 'En Producción', className: 'bg-yellow-100 text-yellow-800' },
      FINISHED: { label: 'Finalizada', className: 'bg-purple-100 text-purple-800' },
      DELIVERED: { label: 'Entregada', className: 'bg-gray-100 text-gray-800' },
      PLANNED: { label: 'Planificada', className: 'bg-blue-100 text-blue-800' },
      PENDING: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: 'Confirmada', className: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Cancelada', className: 'bg-red-100 text-red-800' },
    }
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Orden no encontrada</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{order.orderNumber}</h1>
            <p className="text-gray-500 mt-1">{order.customerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getAvailableActions().length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              No hay acciones disponibles (estado final)
            </p>
          ) : (
            getAvailableActions().map((action) => {
              const Icon = action.icon
              const colorClasses = {
                green: 'bg-green-50 text-green-600 hover:bg-green-100',
                blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
                purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
                red: 'bg-red-50 text-red-600 hover:bg-red-100',
                yellow: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
                gray: 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }
              return (
                <button
                  key={action.status}
                  onClick={() => handleChangeStatus(action.status)}
                  disabled={statusLoading}
                  className={`btn ${colorClasses[action.color]} flex items-center gap-2 ${
                    statusLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {statusLoading ? 'Cambiando...' : action.label}
                </button>
              )
            })
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información de la Orden */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Información de la Orden
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Número de Orden</p>
                <p className="text-lg font-semibold text-gray-900">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <div className="mt-1">{getStatusBadge(order.status)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cliente</p>
                <p className="text-lg font-semibold text-gray-900">{order.customerName}</p>
                {order.customerId && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                    💰 Cliente Interno
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Vendedor</p>
                <p className="text-lg font-semibold text-gray-900">{order.sellerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha de Orden</p>
                <p className="text-gray-900">
                  {new Date(order.orderDate).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha Estimada de Entrega</p>
                <p className="text-gray-900">
                  {order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }):"N/A"}
                </p>
              </div>
            </div>
            {order.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Notas</p>
                <p className="text-gray-900 whitespace-pre-wrap">{order.notes}</p>
              </div>
            )}
            
            {/* Información de Cliente Interno */}
            {order.customerId && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💰</span>
                    <div>
                      <h3 className="text-sm font-semibold text-purple-900">Cliente Interno - Registro Contable Automático</h3>
                      <p className="text-xs text-purple-700 mt-1">
                        Al marcar esta orden como <strong>ENTREGADA</strong>, se creará automáticamente una transacción de deuda por <strong>${(order.totalAmount - order.discount).toLocaleString()}</strong> en el sistema contable del cliente.
                      </p>
                      {order.status === 'DELIVERED' && (
                        <p className="text-xs text-green-700 mt-2 font-medium">
                          ✓ Transacción de deuda creada automáticamente
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Items */}
          {order.items && order.items.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Productos ({order.items.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Color/Talla
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Cantidad
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Precio Unit.
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items.map((item) => {
                      const quantityReserved = item.quantityReserved || 0
                      const toManufacture = item.quantity - quantityReserved
                      

                      
                      return (
                        <tr key={item.id}>
                          <td className="px-4 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {item.product?.name || item.productName}
                              </p>
                              {item.product?.sku && (
                                <p className="text-xs text-gray-500">
                                  SKU: {item.product.sku}
                                </p>
                              )}

                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm">
                              {item.color && (
                                <p className="text-gray-900">{item.color}</p>
                              )}
                              {item.size && (
                                <p className="text-gray-500">Talla: {item.size.value}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="text-sm font-medium text-gray-900">
                              {item.quantity}
                            </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm text-gray-900">
                            ${item.unitPrice.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm font-semibold text-gray-900">
                            ${item.subtotal.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Resumen */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${order.totalAmount.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Descuento</span>
                  <span>-${order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-bold text-primary-600">
                    ${(order.totalAmount - order.discount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información Adicional
            </h3>
            <div className="space-y-3 text-sm">
            
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500">Creada</p>
                  <p className="text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('es-CO')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500">Última Actualización</p>
                  <p className="text-gray-900">
                    {new Date(order.updatedAt).toLocaleDateString('es-CO')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Timeline - Solo para SUPER_ADMIN */}
        {user?.Role === 'SUPER_ADMIN' && (
          <OrderAuditTimeline orderId={id} />
        )}
      </div>
    </div>
  )
}
