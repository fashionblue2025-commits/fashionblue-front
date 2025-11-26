import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Mail,
  Phone,
  MapPin,
  ArrowUpDown,
  TrendingUp
} from 'lucide-react'
import { customerService } from '../../services/customerService'
import StatementDownloadButton from '../../components/StatementDownloadButton'

export default function Customers() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [sortBy, setSortBy] = useState('name')

  useEffect(() => {
    loadCustomers(sortBy)
  }, [sortBy])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCustomers(customers)
    } else {
      const filtered = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.includes(searchQuery)
      )
      setFilteredCustomers(filtered)
    }
  }, [searchQuery, customers])

  const loadCustomers = async (sort = 'name') => {
    try {
      setLoading(true)
      const filters = sort ? { sort } : {}
      const response = await customerService.getCustomers(filters)
      const customersData = response.data || []
      
      // La API ahora incluye el balance en cada cliente
      // Ya no necesitamos hacer llamadas adicionales
      setCustomers(customersData)
      setFilteredCustomers(customersData)
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return
    
    try {
      await customerService.deleteCustomer(id)
      loadCustomers()
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">Gestiona tu base de clientes</p>
        </div>
        <Link
          to="/customers/new"
          className="btn btn-gradient flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </Link>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="card overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchQuery ? 'No se encontraron clientes' : 'No hay clientes'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery 
                ? 'Intenta con otra búsqueda' 
                : 'Comienza agregando un nuevo cliente.'}
            </p>
            {!searchQuery && (
              <div className="mt-6">
                <Link to="/customers/new" className="btn btn-primary">
                  <Plus className="w-5 h-5 mr-2" />
                  Nuevo Cliente
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {/* Fila de filtros */}
                <tr className="border-b border-gray-200">
                  <th colSpan="4" className="px-6 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <ArrowUpDown className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Ordenar por:</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSortBy('name')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            sortBy === 'name'
                              ? 'bg-primary-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                          }`}
                        >
                          📝 Nombre
                        </button>
                        <button
                          onClick={() => setSortBy('balance')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            sortBy === 'balance'
                              ? 'bg-red-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                          }`}
                        >
                          🔴 Mayor Deuda
                        </button>
                        <button
                          onClick={() => setSortBy('balance_asc')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            sortBy === 'balance_asc'
                              ? 'bg-green-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                          }`}
                        >
                          🟢 Menor Deuda
                        </button>
                      </div>
                    </div>
                  </th>
                </tr>
                {/* Fila de headers de columnas */}
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    onClick={() => navigate(`/customers/${customer.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {/* Nombre con indicador de riesgo */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {customer.riskLevel && (
                          <div 
                            className={`w-1 h-10 rounded-full ${
                              customer.riskLevel === 'LOW' ? 'bg-green-500' :
                              customer.riskLevel === 'MEDIUM' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            title={`Riesgo: ${
                              customer.riskLevel === 'LOW' ? 'Bajo' : 
                              customer.riskLevel === 'MEDIUM' ? 'Medio' : 'Alto'
                            }`}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">ID: {customer.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Teléfono */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.phone || '-'}</div>
                    </td>

                    {/* Balance */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${
                        customer.balance > 0 ? 'text-red-600' : 
                        customer.balance < 0 ? 'text-green-600' : 
                        'text-gray-900'
                      }`}>
                        ${Math.abs(customer.balance || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {customer.balance > 0 ? 'Debe' : 
                         customer.balance < 0 ? 'A favor' : 'Sin deuda'}
                      </div>
                    </td>


                    {/* Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <StatementDownloadButton 
                          customerId={customer.id}
                          customerName={customer.name}
                          variant="icon"
                        />
                        <Link
                          to={`/customers/${customer.id}/edit`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-primary-600 hover:text-primary-900"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(customer.id)
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      {filteredCustomers.length > 0 && (
        <div className="card bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total de clientes</p>
              <p className="text-2xl font-bold text-gray-900">{filteredCustomers.length}</p>
            </div>
            {searchQuery && (
              <p className="text-sm text-gray-500">
                Mostrando resultados para "{searchQuery}"
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
