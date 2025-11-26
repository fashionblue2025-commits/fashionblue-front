import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, TrendingUp, TrendingDown } from 'lucide-react'
import { financialService } from '../../services/financialService'

export default function CreateTransaction() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    type: 'INCOME',
    category: 'INVESTMENT',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  const incomeCategories = [
    { value: 'INVESTMENT', label: 'Inversión Personal' },
    { value: 'LOAN', label: 'Préstamo' },
    { value: 'PROFIT', label: 'Reinversión de Utilidades' },
    { value: 'SALES', label: 'Ventas' }
  ]

  const expenseCategories = [
    { value: 'OPERATIONAL', label: 'Gastos Operacionales' },
    { value: 'PERSONNEL', label: 'Nómina y Personal' },
    { value: 'INVENTORY', label: 'Compra de Inventario' },
    { value: 'MARKETING', label: 'Marketing y Publicidad' },
    { value: 'UTILITIES', label: 'Servicios Públicos' },
    { value: 'RENT', label: 'Arriendo del Local' },
    { value: 'OTHER', label: 'Otros Gastos' }
  ]

  const handleTypeChange = (newType) => {
    setForm({
      ...form,
      type: newType,
      category: newType === 'INCOME' ? 'INVESTMENT' : 'OPERATIONAL'
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validaciones
    if (!form.type) {
      alert('El tipo de transacción es requerido')
      return
    }

    if (!form.category) {
      alert('La categoría es requerida')
      return
    }

    if (!form.amount || parseFloat(form.amount) <= 0) {
      alert('El monto debe ser mayor a 0')
      return
    }

    if (!form.description || form.description.trim() === '') {
      alert('La descripción es requerida')
      return
    }

    if (!form.date) {
      alert('La fecha es requerida')
      return
    }

    try {
      setLoading(true)
      
      const transactionData = {
        type: form.type,
        category: form.category,
        amount: parseFloat(form.amount),
        description: form.description.trim(),
        date: new Date(form.date).toISOString()
      }

      await financialService.createTransaction(transactionData)
      alert('Transacción creada exitosamente')
      navigate('/financial')
    } catch (error) {
      console.error('Error creating transaction:', error)
      alert(error.response?.data?.error || 'Error al crear la transacción')
    } finally {
      setLoading(false)
    }
  }

  const categories = form.type === 'INCOME' ? incomeCategories : expenseCategories

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/financial')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Transacción</h1>
          <p className="text-gray-500 mt-1">Registra un ingreso o gasto</p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Tipo de Transacción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Transacción *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleTypeChange('INCOME')}
              className={`p-4 rounded-lg border-2 transition-all ${
                form.type === 'INCOME'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className={`w-6 h-6 ${form.type === 'INCOME' ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={`font-semibold ${form.type === 'INCOME' ? 'text-green-700' : 'text-gray-600'}`}>
                  Ingreso
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('EXPENSE')}
              className={`p-4 rounded-lg border-2 transition-all ${
                form.type === 'EXPENSE'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingDown className={`w-6 h-6 ${form.type === 'EXPENSE' ? 'text-red-600' : 'text-gray-400'}`} />
                <span className={`font-semibold ${form.type === 'EXPENSE' ? 'text-red-700' : 'text-gray-600'}`}>
                  Gasto
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría *
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="input"
            required
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Monto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monto (COP) *
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="Ej: 5000000"
            className="input"
            required
          />
          {form.amount && parseFloat(form.amount) > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              ${parseFloat(form.amount).toLocaleString('es-CO')}
            </p>
          )}
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha *
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="input"
            required
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción *
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe el motivo de esta transacción..."
            rows="4"
            className="input"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            {form.description.length} caracteres
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/financial')}
            className="btn btn-secondary flex-1"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-gradient flex-1 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Guardar Transacción
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
