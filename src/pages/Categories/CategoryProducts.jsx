import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, Eye, Package, AlertCircle, ArrowLeft } from 'lucide-react'
import { productService } from '../../services/productService'
import { useUserPermissions } from '../../hooks/useUserPermissions'
import { useAuthStore } from '../../store/authStore'

export default function CategoryProducts() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState('all')
  const user = useAuthStore(state => state.user)
  const { canAccessCategory, allowedCategories, loading: loadingPermissions } = useUserPermissions()

  useEffect(() => {
    if (!loadingPermissions) {
      loadCategoryAndProducts()
    }
  }, [categoryId, loadingPermissions])

  // Verificar permisos al cargar
  useEffect(() => {
    if (!loadingPermissions && categoryId && user?.Role !== 'SUPER_ADMIN') {
      const catId = parseInt(categoryId)
      
      // Si no tiene permisos de ninguna categoría, redirigir
      if (allowedCategories.length === 0) {
        alert('No tienes permisos para ver categorías')
        navigate('/categories')
        return
      }
      
      // Verificar si tiene permiso de esta categoría específica
      if (!canAccessCategory(catId)) {
        alert('No tienes permisos para ver productos de esta categoría')
        navigate('/categories')
      }
    }
  }, [loadingPermissions, categoryId, user, allowedCategories])

  const loadCategoryAndProducts = async () => {
    try {
      setLoading(true)
      const [categoryResponse, productsResponse] = await Promise.all([
        productService.getCategory(categoryId),
        productService.getProductsByCategory(categoryId)
      ])
      setCategory(categoryResponse.data)
      setProducts(productsResponse.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error al cargar los datos')
      navigate('/categories')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto "${name}"?`)) {
      return
    }

    try {
      await productService.deleteProduct(id)
      await loadCategoryAndProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert(error.response?.data?.message || 'Error al eliminar el producto')
    }
  }

  const filteredProducts = products.filter(product => {
    const productName = product.Name || product.name || ''
    const productSKU = product.SKU || product.sku || ''
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         productSKU.toLowerCase().includes(searchTerm.toLowerCase())
    const isActive = product.IsActive !== undefined ? product.IsActive : product.isActive
    const matchesActive = filterActive === 'all' || 
                         (filterActive === 'active' && isActive) ||
                         (filterActive === 'inactive' && !isActive)
    return matchesSearch && matchesActive
  })

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
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/categories')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{category?.Name}</h1>
            <p className="text-gray-500 mt-1">
              {products.length} producto{products.length !== 1 ? 's' : ''} en esta categoría
            </p>
          </div>
        </div>
        <Link
          to={`/categories/${categoryId}/products/new`}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="input"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || filterActive !== 'all' 
                ? 'No se encontraron productos con los filtros aplicados'
                : 'No hay productos en esta categoría'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Unitario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  
                  <tr 
                    key={product.id}
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        {product.description && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">{product.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-mono">{product.sku}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        ${product.unitPrice.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          product.stock <= product.minStock ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {product.stock}
                        </span>
                        {product.stock <= product.minStock && (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/products/${product.id}`)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/products/${product.id}/edit`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
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
    </div>
  )
}
