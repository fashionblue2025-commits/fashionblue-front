import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Filter, X, TrendingUp, TrendingDown, Calendar, FileText, Edit } from 'lucide-react'
import { financialService } from '../../services/financialService'
import { useFinancialBalance } from '../../hooks/useFinancialBalance'
import BalanceCards from '../../components/BalanceCards'
import EditTransactionModal from '../../components/EditTransactionModal'

export default function FinancialTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    start_date: '',
    end_date: ''
  })
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [updatingTransaction, setUpdatingTransaction] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const { balance, loading: balanceLoading, refetch: refetchBalance } = useFinancialBalance()

  useEffect(() => {
    loadTransactions()
  }, [filters])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const response = await financialService.getTransactions(filters)
      setTransactions(response.data.data || [])
    } catch (error) {
      console.error('Error loading transactions:', error)
      alert('Error al cargar las transacciones')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      type: '',
      category: '',
      start_date: '',
      end_date: ''
    })
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '')

  const handleEditTransaction = async (updatedData) => {
    try {
      setUpdatingTransaction(true)
      await financialService.updateTransaction(editingTransaction.id, updatedData)
      alert('Transacción actualizada exitosamente')
      setEditingTransaction(null)
      await loadTransactions()
      refetchBalance()
    } catch (error) {
      console.error('Error updating transaction:', error)
      alert(error.response?.data?.message || 'Error al actualizar la transacción')
    } finally {
      setUpdatingTransaction(false)
    }
  }

  const handleGeneratePdf = async () => {
    try {
      setGeneratingPdf(true)
      await financialService.generatePDF(filters)
      alert('PDF generado y descargado exitosamente')
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error al generar el PDF')
    } finally {
      setGeneratingPdf(false)
    }
  }

  // Categorías
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

  const getCategoryLabel = (category) => {
    const allCategories = [...incomeCategories, ...expenseCategories]
    return allCategories.find(c => c.value === category)?.label || category
  }

  const getTypeLabel = (type) => {
    return type === 'INCOME' ? 'Ingreso' : 'Gasto'
  }

  const getTypeBadgeClass = (type) => {
    return type === 'INCOME' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transacciones Financieras</h1>
          <p className="text-gray-500 mt-1">Gestiona ingresos y gastos del negocio</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGeneratePdf}
            disabled={generatingPdf}
            className="btn bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            {generatingPdf ? 'Generando...' : 'Exportar PDF'}
          </button>
          <Link
            to="/financial/new"
            className="btn btn-gradient flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva Transacción
          </Link>
        </div>
      </div>

      {/* Balance Cards */}
      <BalanceCards balance={balance} loading={balanceLoading} />

      {/* Filtros */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Limpiar Filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="input"
            >
              <option value="">Todos</option>
              <option value="INCOME">Ingresos</option>
              <option value="EXPENSE">Gastos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input"
            >
              <option value="">Todas</option>
              {filters.type === 'INCOME' && incomeCategories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
              {filters.type === 'EXPENSE' && expenseCategories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
              {!filters.type && (
                <>
                  <optgroup label="Ingresos">
                    {incomeCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Gastos">
                    {expenseCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </optgroup>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Transacciones */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No se encontraron transacciones
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(transaction.date).toLocaleDateString('es-CO')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeClass(transaction.type)}`}>
                        {transaction.type === 'INCOME' ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {getTypeLabel(transaction.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCategoryLabel(transaction.category)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={transaction.description}>
                        {transaction.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold">
                      <span className={transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'EXPENSE' ? '-' : '+'}
                        ${transaction.amount.toLocaleString('es-CO')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <button
                        onClick={() => setEditingTransaction(transaction)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Editar transacción"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edición */}
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSubmit={handleEditTransaction}
          loading={updatingTransaction}
        />
      )}
    </div>
  )
}
