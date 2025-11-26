export default function OrdersByTypeChart({ data }) {
  if (!data) return null

  const typeConfig = {
    custom: { label: 'Producción por Demanda', color: 'bg-purple-500', icon: '🎨' },
    inventory: { label: 'Producción para Stock', color: 'bg-blue-500', icon: '📦' },
    sale: { label: 'Venta de Existente', color: 'bg-green-500', icon: '🛒' }
  }

  const total = Object.values(data).reduce((sum, val) => sum + val, 0)

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Órdenes por Tipo</h3>
      <div className="space-y-4">
        {Object.entries(data).map(([type, count]) => {
          const config = typeConfig[type]
          if (!config || count === 0) return null
          
          const percentage = total > 0 ? (count / total) * 100 : 0

          return (
            <div key={type} className="flex items-center gap-4">
              <div className="flex-shrink-0 text-3xl">{config.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{config.label}</span>
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${config.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}%</span>
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
