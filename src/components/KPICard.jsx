import { DollarSign, TrendingUp, CheckCircle, Percent, Package, ShoppingCart } from 'lucide-react'

const iconMap = {
  'dollar-sign': DollarSign,
  'trending-up': TrendingUp,
  'check-circle': CheckCircle,
  'percent': Percent,
  'package': Package,
  'shopping-cart': ShoppingCart
}

export default function KPICard({ label, value, format, icon }) {
  const Icon = iconMap[icon] || TrendingUp

  const formatValue = () => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value)
      case 'percentage':
        return `${value.toFixed(2)}%`
      default:
        return value.toLocaleString()
    }
  }

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary-100 rounded-lg">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{formatValue()}</p>
        </div>
      </div>
    </div>
  )
}
