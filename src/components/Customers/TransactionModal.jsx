import { useState } from 'react'
import { X, DollarSign, Plus, Trash2 } from 'lucide-react'

export default function TransactionModal({ type, onClose, onSubmit, loading }) {
  const [items, setItems] = useState([
    { amount: '', description: '' }
  ])

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
    const transactions = items.map(item => ({
      type,
      amount: parseFloat(item.amount),
      description: item.description
    }))
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

                {/* Descripción */}
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
                    placeholder={type === 'DEUDA' ? 'Ej: Camisa polo blanca' : 'Ej: Pago en efectivo'}
                  />
                </div>
              </div>
            ))}
          </div>

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
