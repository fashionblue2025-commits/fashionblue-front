export default function OrdersByStatusChart({ data }) {
  if (!data) return null

  const statusConfig = {
    quote: { label: 'Cotización', color: 'bg-yellow-500' },
    approved: { label: 'Aprobada', color: 'bg-green-500' },
    manufacturing: { label: 'En Producción', color: 'bg-blue-500' },
    finished: { label: 'Finalizada', color: 'bg-purple-500' },
    delivered: { label: 'Entregada', color: 'bg-emerald-500' },
    cancelled: { label: 'Cancelada', color: 'bg-red-500' }
  }

  const total = Object.values(data).reduce((sum, val) => sum + val, 0)

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Órdenes por Estado</h3>
      <div className="space-y-3">
        {Object.entries(data).map(([status, count]) => {
          const config = statusConfig[status]
          if (!config || count === 0) return null
          
          const percentage = total > 0 ? (count / total) * 100 : 0

          return (
            <div key={status}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{config.label}</span>
                <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${config.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Total</span>
          <span className="text-lg font-bold text-gray-900">{total}</span>
        </div>
      </div>
    </div>
  )
}
