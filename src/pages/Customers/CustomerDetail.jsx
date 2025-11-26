import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Phone, 
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  X
} from 'lucide-react'
import { customerService } from '../../services/customerService'
import TransactionModal from '../../components/Customers/TransactionModal'
import StatementDownload from '../../components/StatementDownload'

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [balance, setBalance] = useState(0)
  const [showDebtModal, setShowDebtModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [loadingTransaction, setLoadingTransaction] = useState(false)

  useEffect(() => {
    loadCustomer()
    loadTransactionsAndBalance()
  }, [id])

  const loadCustomer = async () => {
    try {
      setLoading(true)
      const response = await customerService.getCustomer(id)
      setCustomer(response.data)
      // El balance ahora viene incluido en el cliente
      if (response.data?.balance !== undefined) {
        setBalance(response.data.balance)
      }
    } catch (error) {
      console.error('Error loading customer:', error)
      alert('Error al cargar el cliente')
      navigate('/customers')
    } finally {
      setLoading(false)
    }
  }

  const loadTransactionsAndBalance = async () => {
    try {
      const response = await customerService.getCustomerHistory(id)
      // La API ahora retorna { balance, transactions }
      if (response.data?.transactions) {
        setTransactions(response.data.transactions)
        setBalance(response.data.balance || 0)
      } else {
        // Fallback para versión anterior de la API
        setTransactions(response.data || [])
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    }
  }

  const handleCreateTransaction = async (transactions) => {
    try {
      setLoadingTransaction(true)
      // transactions ya viene como array desde el modal
      await customerService.createTransactions(id, transactions)
      await loadTransactionsAndBalance()
      await loadCustomer()
      setShowDebtModal(false)
      setShowPaymentModal(false)
    } catch (error) {
      console.error('Error creating transaction:', error)
      alert(error.response?.data?.message || 'Error al crear la transacción')
    } finally {
      setLoadingTransaction(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return
    
    try {
      await customerService.deleteCustomer(id)
      navigate('/customers')
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('Error al eliminar el cliente')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cliente no encontrado</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/customers')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-gray-500 mt-1">ID: {customer.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/customers/${id}/edit`}
            className="btn btn-outline flex items-center gap-2"
          >
            <Edit className="w-5 h-5" />
            Editar
          </Link>
          <button
            onClick={handleDelete}
            className="btn bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Eliminar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Historial de Transacciones - Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notas */}
          {customer.notes && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Notas
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}

          {/* Estado de Cuenta */}
          <StatementDownload 
            customerId={customer.id} 
            customerName={customer.name}
          />

          {/* Historial de Transacciones */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Historial de Transacciones
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {transactions.length} transacción{transactions.length !== 1 ? 'es' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDebtModal(true)}
                  className="btn btn-sm bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Venta
                </button>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="btn btn-sm bg-green-50 text-green-600 hover:bg-green-100 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Abono
                </button>
              </div>
            </div>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p>No hay transacciones registradas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'DEUDA' ? 'bg-red-50' : 'bg-green-50'
                      }`}>
                        {transaction.type === 'DEUDA' ? (
                          <TrendingUp className="w-5 h-5 text-red-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`badge ${
                            transaction.type === 'DEUDA' ? 'badge-danger' : 'badge-success'
                          }`}>
                            {transaction.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(transaction.date).toLocaleDateString('es-CO', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 mt-1">{transaction.description}</p>
                        {transaction.paymentMethodId && (
                          <p className="text-xs text-gray-500 mt-1">
                            Método de pago ID: {transaction.paymentMethodId}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.type === 'DEUDA' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        ${transaction.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Balance Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Balance</h3>
            <div>
              <p className={`text-3xl font-bold ${
                balance > 0 ? 'text-red-600' : 
                balance < 0 ? 'text-green-600' : 
                'text-gray-900'
              }`}>
                ${Math.abs(balance).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {balance > 0 ? 'Debe' : 
                 balance < 0 ? 'A favor' : 'Sin deuda'}
              </p>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información de Contacto
            </h3>
            <div className="space-y-3">
              {customer.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Teléfono</p>
                    <p className="text-sm text-gray-900">{customer.phone}</p>
                  </div>
                </div>
              )}
              {customer.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Dirección</p>
                    <p className="text-sm text-gray-900">{customer.address}</p>
                  </div>
                </div>
              )}
              {customer.birthday && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Cumpleaños</p>
                    <p className="text-sm text-gray-900">
                      {new Date(customer.birthday).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
              {customer.createdAt && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Cliente desde</p>
                    <p className="text-sm text-gray-900">
                      {new Date(customer.createdAt).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tallas y Preferencias */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tallas y Preferencias
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {customer.shirtSize && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Camisa</p>
                  <p className="text-xl font-bold text-gray-900">{customer.shirtSize.value}</p>
                </div>
              )}
              {customer.pantsSize && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Pantalón</p>
                  <p className="text-xl font-bold text-gray-900">{customer.pantsSize.value}</p>
                </div>
              )}
              {customer.shoesSize && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Zapatos</p>
                  <p className="text-xl font-bold text-gray-900">{customer.shoesSize.value}</p>
                </div>
              )}
            </div>
          </div>

          {/* Información de Pago */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información de Pago
            </h3>
            <div className="space-y-3">
              {(customer.paymentFrequency || customer.paymentDays) && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Frecuencia de Pago</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {customer.paymentFrequency && (
                      <span className="text-sm text-gray-900 font-medium">
                        {customer.paymentFrequency === 'WEEKLY' ? 'Semanal' :
                         customer.paymentFrequency === 'BIWEEKLY' ? 'Quincenal' :
                         customer.paymentFrequency === 'MONTHLY' ? 'Mensual' : customer.paymentFrequency}
                      </span>
                    )}
                    {customer.paymentDays && (
                      <>
                        <span className="text-sm text-gray-500">los días</span>
                        {customer.paymentDays.split(',').map((day, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            {day.trim()}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
              {customer.riskLevel && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Nivel de Riesgo</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    customer.riskLevel === 'LOW' ? 'bg-green-100 text-green-800' :
                    customer.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {customer.riskLevel === 'LOW' ? 'Bajo' : 
                     customer.riskLevel === 'MEDIUM' ? 'Medio' : 'Alto'}
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Modal Crear Venta (DEUDA) */}
      {showDebtModal && (
        <TransactionModal
          type="DEUDA"
          onClose={() => setShowDebtModal(false)}
          onSubmit={handleCreateTransaction}
          loading={loadingTransaction}
        />
      )}

      {/* Modal Registrar Abono */}
      {showPaymentModal && (
        <TransactionModal
          type="ABONO"
          onClose={() => setShowPaymentModal(false)}
          onSubmit={handleCreateTransaction}
          loading={loadingTransaction}
        />
      )}
    </div>
  )
}
