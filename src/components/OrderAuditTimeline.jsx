import { useEffect, useState } from 'react'
import { Clock, ArrowRight } from 'lucide-react'
import { auditService } from '../services/auditService'

const eventTypeConfig = {
  'order.status.changed': { label: 'Estado Cambiado', color: 'bg-gray-500', icon: '🔄' },
  'order.approved': { label: 'Orden Aprobada', color: 'bg-green-500', icon: '✅' },
  'order.manufacturing': { label: 'En Manufactura', color: 'bg-blue-500', icon: '🏭' },
  'order.finished': { label: 'Manufactura Completada', color: 'bg-purple-500', icon: '✨' },
  'order.delivered': { label: 'Orden Entregada', color: 'bg-emerald-500', icon: '📦' },
  'order.cancelled': { label: 'Orden Cancelada', color: 'bg-red-500', icon: '❌' },
  'inventory.planned': { label: 'Producción Planificada', color: 'bg-yellow-500', icon: '📋' },
  'inventory.manufacturing': { label: 'Producción Iniciada', color: 'bg-blue-500', icon: '🏭' },
  'inventory.finished': { label: 'Producción Completada', color: 'bg-green-500', icon: '✅' },
  'sale.pending': { label: 'Venta Pendiente', color: 'bg-yellow-500', icon: '⏳' },
  'sale.confirmed': { label: 'Venta Confirmada', color: 'bg-green-500', icon: '✅' },
  'sale.delivered': { label: 'Venta Entregada', color: 'bg-emerald-500', icon: '📦' },
  'stock.updated': { label: 'Stock Actualizado', color: 'bg-blue-500', icon: '📊' },
  'stock.reserved': { label: 'Stock Reservado', color: 'bg-orange-500', icon: '🔒' },
  'stock.released': { label: 'Stock Liberado', color: 'bg-green-500', icon: '🔓' },
  'internal.customer.sale.completed': { label: 'Venta Cliente Interno', color: 'bg-purple-500', icon: '💰' }
}

export default function OrderAuditTimeline({ orderId }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (orderId) {
      loadLogs()
    }
  }, [orderId])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const response = await auditService.getOrderLogs(orderId)
      setLogs(response.data.logs || [])
      setError(null)
    } catch (err) {
      console.error('Error loading audit logs:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Auditoría</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Auditoría</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No se pudo cargar el historial de auditoría</p>
        </div>
      </div>
    )
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Auditoría</h3>
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No hay eventos registrados para esta orden</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Historial de Auditoría</h3>
      
      <div className="relative">
        {/* Línea vertical del timeline */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        <div className="space-y-6">
          {logs.map((log, index) => {
            const config = eventTypeConfig[log.eventType] || { 
              label: log.eventType, 
              color: 'bg-gray-500', 
              icon: '📝' 
            }

            return (
              <div key={log.id} className="relative flex gap-4">
                {/* Marcador del timeline */}
                <div className={`flex-shrink-0 w-12 h-12 ${config.color} rounded-full flex items-center justify-center text-white text-xl z-10 shadow-lg`}>
                  {config.icon}
                </div>

                {/* Contenido */}
                <div className="flex-1 pb-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{config.label}</h4>
                        <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {new Date(log.createdAt).toLocaleString('es-CO', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Cambio de estado */}
                    {log.oldStatus && log.newStatus && (
                      <div className="flex items-center gap-2 mt-3 text-sm">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded font-medium">
                          {log.oldStatus}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className={`px-2 py-1 ${config.color} bg-opacity-10 rounded font-medium`}>
                          {log.newStatus}
                        </span>
                      </div>
                    )}

                    {/* Usuario */}
                    {log.userName && (
                      <div className="mt-2 text-xs text-gray-500">
                        Por: <span className="font-medium">{log.userName}</span>
                      </div>
                    )}

                    {/* Metadata */}
                    {log.metadata && log.metadata !== '{}' && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                          Ver detalles técnicos
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(JSON.parse(log.metadata), null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Resumen */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Total de eventos: <span className="font-semibold text-gray-900">{logs.length}</span>
        </p>
      </div>
    </div>
  )
}
