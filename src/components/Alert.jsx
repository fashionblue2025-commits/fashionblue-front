import { AlertTriangle, Info, XCircle } from 'lucide-react'

export default function Alert({ type, message, value, action }) {
  const getAlertStyles = () => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-400',
          text: 'text-yellow-800',
          icon: AlertTriangle,
          iconColor: 'text-yellow-600'
        }
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-400',
          text: 'text-red-800',
          icon: XCircle,
          iconColor: 'text-red-600'
        }
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-400',
          text: 'text-blue-800',
          icon: Info,
          iconColor: 'text-blue-600'
        }
    }
  }

  const styles = getAlertStyles()
  const Icon = styles.icon

  return (
    <div className={`${styles.bg} border-l-4 ${styles.border} p-4 rounded-r-lg`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${styles.iconColor} mt-0.5`} />
        <div className="flex-1">
          <p className={`text-sm font-medium ${styles.text}`}>{message}</p>
          <p className={`text-xs ${styles.text} mt-1 opacity-80`}>
            Valor: {value} - {action}
          </p>
        </div>
      </div>
    </div>
  )
}
