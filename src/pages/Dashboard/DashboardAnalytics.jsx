import { RefreshCw } from 'lucide-react'
import { useAnalytics } from '../../hooks/useAnalytics'
import KPICard from '../../components/KPICard'
import Alert from '../../components/Alert'
import OrdersByStatusChart from '../../components/OrdersByStatusChart'
import OrdersByTypeChart from '../../components/OrdersByTypeChart'

export default function DashboardAnalytics() {
  const { data, loading, error } = useAnalytics(30000) // Actualizar cada 30 segundos

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
        <p className="text-gray-500">Cargando métricas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card bg-red-50 border-l-4 border-red-400">
        <div className="flex items-center gap-3">
          <span className="text-2xl">❌</span>
          <div>
            <h3 className="text-lg font-semibold text-red-900">Error al cargar métricas</h3>
            <p className="text-sm text-red-700 mt-1">{error.message || 'Ocurrió un error inesperado'}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Actualización automática cada 30 segundos
          </p>
        </div>
      </div>

      {/* Alertas */}
      {data.alerts && data.alerts.length > 0 && (
        <div className="space-y-3">
          {data.alerts.map((alert, index) => (
            <Alert key={index} {...alert} />
          ))}
        </div>
      )}

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {data.kpis && data.kpis.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrdersByStatusChart data={data.ordersByStatus} />
        <OrdersByTypeChart data={data.ordersByType} />
      </div>

      {/* Footer Info */}
      <div className="card bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Última actualización: {new Date().toLocaleTimeString('es-CO')}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>En vivo</span>
          </div>
        </div>
      </div>
    </div>
  )
}
