import { useState, useEffect } from 'react'
import { X, DollarSign, Plus, Trash2, Calendar } from 'lucide-react'
import { paymentMethodService } from '../../services/paymentMethodService'

export default function TransactionModal({ type, onClose, onSubmit, loading }) {
  const [items, setItems] = useState([
    { amount: '', description: '' }
  ])
  
  // Fecha actual en formato YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }
  
  const [transactionDate, setTransactionDate] = useState(getCurrentDate())
  const [paymentMethodId, setPaymentMethodId] = useState('')
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loadingMethods, setLoadingMethods] = useState(true)

  // Cargar métodos de pago desde el backend
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoadingMethods(true)
        const data = await paymentMethodService.getPaymentMethods()
        setPaymentMethods(data)
        // Establecer el primer método como default si existe
        if (data && data.length > 0) {
          setPaymentMethodId(data[0].id.toString())
        }
      } catch (error) {
        console.error('Error loading payment methods:', error)
        setPaymentMethods([])
      } finally {
        setLoadingMethods(false)
      }
    }

    fetchPaymentMethods()
  }, [])

  const addItem = () => {
    setItems([...items, { amount: '', description: '' }])
  }

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Convertir items a formato de transacciones
    const transactions = items.map(item => {
      const amount = parseFloat(item.amount)
      // Generar descripción automática para ABONO
      let description = item.description
      if (type === 'ABONO') {
        const formattedDate = new Date(transactionDate + 'T00:00:00').toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        const paymentMethodName = paymentMethods.find(m => m.id == paymentMethodId)?.name || 'Pago'
        description = `${paymentMethodName} - ${formattedDate} - $${amount.toLocaleString()}`
      }
      
      // Convertir fecha YYYY-MM-DD a ISO 8601 completo
      const dateISO = new Date(transactionDate + 'T00:00:00').toISOString()
      
      const transaction = {
        type,
        amount,
        description,
        date: dateISO
      }
      // Solo agregar payment_method_id para ABONO
      if (type === 'ABONO') {
        transaction.payment_method_id = parseInt(paymentMethodId)
      }
      return transaction
    })
    onSubmit(transactions)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0
      return sum + amount
    }, 0)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              type === 'DEUDA' ? 'bg-red-50' : 'bg-green-50'
            }`}>
              <DollarSign className={`w-6 h-6 ${
                type === 'DEUDA' ? 'text-red-600' : 'text-green-600'
              }`} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {type === 'DEUDA' ? 'Crear Venta' : 'Registrar Abono'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Items List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Item {index + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Monto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={item.amount}
                    onChange={(e) => updateItem(index, 'amount', e.target.value)}
                    className="input"
                    placeholder="0.00"
                  />
                </div>

                {/* Descripción - Solo para DEUDA */}
                {type === 'DEUDA' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="input"
                      placeholder="Ej: Camisa polo blanca"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Fecha de Transacción */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Fecha de {type === 'DEUDA' ? 'Venta' : 'Abono'} *
            </label>
            <input
              type="date"
              required
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="input"
              max={getCurrentDate()}
            />
            <p className="text-xs text-gray-500 mt-1">
              Puedes modificar la fecha si es necesario
            </p>
          </div>

          {/* Método de Pago (solo para ABONO) */}
          {type === 'ABONO' && (
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago *
              </label>
              <select
                required
                value={paymentMethodId}
                onChange={(e) => setPaymentMethodId(e.target.value)}
                className="input"
                disabled={loadingMethods}
              >
                {loadingMethods ? (
                  <option value="">Cargando...</option>
                ) : (
                  paymentMethods.map(method => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {/* Add Item Button */}
          <button
            type="button"
            onClick={addItem}
            className="btn btn-outline w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar otro item
          </button>

          {/* Total */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total:</span>
              <span className={`text-xl font-bold ${
                type === 'DEUDA' ? 'text-red-600' : 'text-green-600'
              }`}>
                ${calculateTotal().toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`btn flex-1 ${
                type === 'DEUDA' 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Todo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
