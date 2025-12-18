import { useState, useEffect } from 'react'
import { X, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

export default function EditTransactionModal({ transaction, onClose, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    type: transaction?.type || 'EXPENSE',
    category: transaction?.category || '',
    amount: transaction?.amount || '',
    description: transaction?.description || '',
    date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : ''
  })

  const incomeCategories = [
    { value: 'INVESTMENT', label: 'Inversión' },
    { value: 'LOAN', label: 'Préstamo' },
    { value: 'PROFIT', label: 'Utilidades' },
    { value: 'SALES', label: 'Ventas' }
  ]

  const expenseCategories = [
    { value: 'OPERATIONAL', label: 'Operacional' },
    { value: 'PERSONNEL', label: 'Personal' },
    { value: 'INVENTORY', label: 'Inventario' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'UTILITIES', label: 'Servicios' },
    { value: 'RENT', label: 'Arriendo' },
    { value: 'OTHER', label: 'Otros' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Formatear fecha para el backend
    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString()
    }
    
    onSubmit(submitData)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Si cambia el tipo, resetear la categoría
    if (field === 'type') {
      setFormData(prev => ({ ...prev, category: '' }))
    }
  }

  const currentCategories = formData.type === 'INCOME' ? incomeCategories : expenseCategories

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 animate-slideIn max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              formData.type === 'INCOME' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              {formData.type === 'INCOME' ? (
                <TrendingUp className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600" />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Editar Transacción
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
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="input"
            >
              <option value="INCOME">Ingreso</option>
              <option value="EXPENSE">Gasto</option>
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="input"
            >
              <option value="">Selecciona una categoría</option>
              {currentCategories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className="input pl-10"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="input"
              placeholder="Describe la transacción..."
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="input"
            />
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
              className="btn btn-gradient flex-1"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
