import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, ArrowRight, Calendar, User, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { auditService } from '../../services/auditService'

const eventTypes = [
  { value: '', label: 'Todos los eventos' },
  { value: 'order.status.changed', label: 'Estado Cambiado' },
  { value: 'order.approved', label: 'Orden Aprobada' },
  { value: 'order.manufacturing', label: 'En Manufactura' },
  { value: 'order.finished', label: 'Manufactura Completada' },
  { value: 'order.delivered', label: 'Orden Entregada' },
  { value: 'order.cancelled', label: 'Orden Cancelada' },
  { value: 'stock.updated', label: 'Stock Actualizado' },
  { value: 'stock.reserved', label: 'Stock Reservado' },
  { value: 'stock.released', label: 'Stock Liberado' },
  { value: 'internal.customer.sale.completed', label: 'Venta Cliente Interno' }
]

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  
  const [filters, setFilters] = useState({
    eventType: '',
    orderId: '',
    userId: '',
    startDate: '',
    endDate: '',
    limit: 50,
    offset: 0
  })

  useEffect(() => {
    loadLogs()
    loadStats()
  }, [filters])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const response = await auditService.getLogs(filters)
      setLogs(response.data.logs || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      console.error('Error loading audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await auditService.getStats()
      setStats(response.data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, offset: 0 }))
  }

  const handlePageChange = (newOffset) => {
    setFilters(prev => ({ ...prev, offset: newOffset }))
  }

  const getEventBadgeColor = (eventType) => {
    if (eventType.includes('approved')) return 'badge-success'
    if (eventType.includes('cancelled')) return 'badge-danger'
    if (eventType.includes('delivered')) return 'badge-success'
    if (eventType.includes('manufacturing')) return 'badge-primary'
    if (eventType.includes('finished')) return 'badge-info'
    return 'badge-gray'
  }

  const currentPage = Math.floor(filters.offset / filters.limit) + 1
  const totalPages = Math.ceil(total / filters.limit)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sistema de Auditoría</h1>
        <p className="text-gray-500 mt-1">Registro completo de eventos del sistema</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Eventos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.today?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Esta Semana</p>
                <p className="text-2xl font-bold text-gray-900">{stats.week?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <User className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Aprobaciones</p>
                <p className="text-2xl font-bold text-gray-900">{stats.criticalEvents?.approvals?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Evento
            </label>
            <select
              value={filters.eventType}
              onChange={(e) => handleFilterChange('eventType', e.target.value)}
              className="input"
            >
              {eventTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Orden
            </label>
            <input
              type="text"
              value={filters.orderId}
              onChange={(e) => handleFilterChange('orderId', e.target.value)}
              placeholder="Ej: ORD-2024-001"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID de Usuario
            </label>
            <input
              type="number"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              placeholder="Ej: 5"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setFilters({
              eventType: '',
              orderId: '',
              userId: '',
              startDate: '',
              endDate: '',
              limit: 50,
              offset: 0
            })}
            className="btn btn-secondary text-sm"
          >
            Limpiar Filtros
          </button>
          <p className="text-sm text-gray-500">
            Mostrando {logs.length} de {total.toLocaleString()} eventos
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron eventos</h3>
            <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orden
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cambio de Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        #{log.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${getEventBadgeColor(log.eventType)}`}>
                          {log.eventType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/orders/${log.orderId}`}
                          className="text-primary-600 hover:text-primary-900 font-medium"
                        >
                          {log.orderNumber || `#${log.orderId}`}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {log.oldStatus || log.newStatus ? (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">{log.oldStatus}</span>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{log.newStatus}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {log.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.userName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.createdAt).toLocaleString('es-CO', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(filters.offset - filters.limit)}
                  disabled={filters.offset === 0}
                  className="btn btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(filters.offset + filters.limit)}
                  disabled={filters.offset + filters.limit >= total}
                  className="btn btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm text-gray-500">
                Página {currentPage} de {totalPages} ({total.toLocaleString()} eventos totales)
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
