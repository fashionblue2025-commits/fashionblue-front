import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

export default function BalanceCards({ balance, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="card animate-pulse">
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!balance) return null

  const cards = [
    {
      title: 'Total Ingresos',
      amount: balance.totalIncome,
      icon: TrendingUp,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-600',
      trend: 'positive'
    },
    {
      title: 'Total Gastos',
      amount: balance.totalExpenses,
      icon: TrendingDown,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      textColor: 'text-red-600',
      trend: 'negative'
    },
    {
      title: 'Balance Neto',
      amount: balance.balance,
      icon: DollarSign,
      bgColor: balance.balance >= 0 ? 'bg-blue-100' : 'bg-orange-100',
      iconColor: balance.balance >= 0 ? 'text-blue-600' : 'text-orange-600',
      textColor: balance.balance >= 0 ? 'text-blue-600' : 'text-orange-600',
      trend: balance.balance >= 0 ? 'positive' : 'negative'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div key={index} className="card card-hover">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className={`text-3xl font-bold ${card.textColor}`}>
                  {card.trend === 'negative' && card.title !== 'Balance Neto' ? '-' : ''}
                  ${Math.abs(card.amount).toLocaleString('es-CO')}
                </p>
              </div>
              <div className={`${card.bgColor} rounded-lg p-3`}>
                <Icon className={`w-8 h-8 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
