import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Package, DollarSign, TrendingUp, AlertCircle, Upload, Image as ImageIcon, X } from 'lucide-react'
import { productService } from '../../services/productService'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewPhoto, setPreviewPhoto] = useState(null)

  useEffect(() => {
    loadProduct()
  }, [id])

  useEffect(() => {
    if (previewPhoto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [previewPhoto])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const [productRes, photosRes] = await Promise.all([
        productService.getProduct(id),
        productService.getProductPhotos(id)
      ])
      setProduct(productRes.data)
      console.log('Photos response:', photosRes)
      setPhotos(photosRes.data || [])
    } catch (error) {
      console.error('Error loading product:', error)
      alert('Error al cargar el producto')
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(files)
  }

  const handleUploadPhotos = async () => {
    if (selectedFiles.length === 0) return

    try {
      setUploading(true)
      await productService.uploadProductPhotos(id, selectedFiles)
      setSelectedFiles([])
      await loadProduct()
    } catch (error) {
      console.error('Error uploading photos:', error)
      alert(error.response?.data?.message || 'Error al subir las fotos')
    } finally {
      setUploading(false)
    }
  }

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta foto?')) return

    try {
      await productService.deleteProductPhoto(id, photoId)
      await loadProduct()
    } catch (error) {
      console.error('Error deleting photo:', error)
      alert(error.response?.data?.message || 'Error al eliminar la foto')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto "${product.Name}"?`)) {
      return
    }

    try {
      await productService.deleteProduct(id)
      navigate('/products')
    } catch (error) {
      console.error('Error deleting product:', error)
      alert(error.response?.data?.message || 'Error al eliminar el producto')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Producto no encontrado</p>
      </div>
    )
  }

  const profitMargin = product.UnitPrice - product.ProductionCost
  const profitPercentage = product.ProductionCost > 0 
    ? ((profitMargin / product.ProductionCost) * 100).toFixed(1)
    : 0

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/products')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.Name}</h1>
            <p className="text-gray-500 mt-1">SKU: {product.SKU}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/products/${id}/edit`}
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
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Descripción */}
          {product.Description && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Descripción
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{product.Description}</p>
            </div>
          )}

          {/* Costos y Precios */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Costos y Precios
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Costo de Material</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${product.materialCost.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Costo de Mano de Obra</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${product.laborCost.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Costo de Producción</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${product.productionCost.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Precio Unitario</p>
                  <p className="text-lg font-semibold text-primary-600">
                    ${product.unitPrice.toLocaleString()}
                  </p>
                </div>
              </div>

        

              {/* Precio al Por Mayor */}
              {product.WholesalePrice > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Precio al Por Mayor</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${product.wholesalePrice.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cantidad Mínima</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {product.minWholesaleQty} unidades
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inventario */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Inventario
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Stock Total</p>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-bold ${
                    (product.totalStock || product.Stock || 0) <= (product.minStock || product.MinStock) ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {product.totalStock || product.Stock || 0}
                  </p>
                  {(product.totalStock || product.Stock || 0) <= (product.minStock || product.MinStock) && (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Stock Reservado</p>
                <p className="text-2xl font-bold text-gray-900">
                  {product.ReservedStock || product.reservedStock || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Stock Mínimo</p>
                <p className="text-2xl font-bold text-gray-900">
                  {product.MinStock || product.minStock || 0}
                </p>
              </div>
            </div>
            {(product.totalStock || product.Stock || 0) <= (product.minStock || product.MinStock) && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  ⚠️ El stock está por debajo del mínimo recomendado. Considera reabastecer.
                </p>
              </div>
            )}
          </div>

          {/* Variantes del Producto */}
          {product.variants && product.variants.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Variantes del Producto
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Color
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Talla
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Stock
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Reservado
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Disponible
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Precio
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {product.variants.map((variant, index) => {
                      const available = variant.availableStock || (variant.stock - (variant.reservedStock || 0))
                      return (
                        <tr key={variant.id || index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-6 h-6 rounded-full border-2 border-gray-300"
                                style={{ backgroundColor: variant.color.toLowerCase() }}
                                title={variant.color}
                              />
                              <span className="text-sm font-medium text-gray-900">
                                {variant.color || variant.Color}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-900">
                              {variant.size?.value || variant.size?.Value || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-medium text-gray-900">
                              {variant.stock || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm text-gray-600">
                              {variant.reservedStock || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-sm font-semibold ${
                              available > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {available}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-medium text-gray-900">
                              ${(variant.unitPrice || variant.UnitPrice || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              (variant.isActive !== undefined ? variant.isActive : variant.IsActive)
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {(variant.isActive !== undefined ? variant.isActive : variant.IsActive) ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                    <tr>
                      <td colSpan="2" className="px-4 py-3 text-sm font-semibold text-gray-900">
                        Total
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                        {product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-gray-600">
                        {product.variants.reduce((sum, v) => sum + (v.reservedStock || 0), 0)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-green-600">
                        {product.variants.reduce((sum, v) => sum + (v.availableStock || (v.stock - (v.reservedStock || 0))), 0)}
                      </td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Fotos */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Fotos del Producto ({photos.length})
              </h2>
              <label className="btn btn-sm bg-primary-50 text-primary-600 hover:bg-primary-100 flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                Subir Fotos
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900 mb-2">
                  {selectedFiles.length} archivo{selectedFiles.length !== 1 ? 's' : ''} seleccionado{selectedFiles.length !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={handleUploadPhotos}
                  disabled={uploading}
                  className="btn btn-sm btn-primary"
                >
                  {uploading ? 'Subiendo...' : 'Confirmar Subida'}
                </button>
              </div>
            )}

            {photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {photos.map((photo) => {
                  const imageUrl = photo.photoUrl 
                  return (
                    <div key={photo.id} className="relative group">
                      <img
                        src={imageUrl}
                        alt={photo.description || 'Foto del producto'}
                        className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setPreviewPhoto(photo)}
                        onError={(e) => {
                          console.error('Error loading image:', imageUrl)
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagen no disponible%3C/text%3E%3C/svg%3E'
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePhoto(photo.id)
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {photo.description && (
                        <p className="mt-2 text-sm text-gray-600">{photo.description}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No hay fotos del producto</p>
                <p className="text-sm text-gray-400 mt-1">Sube fotos para mostrar el producto</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Estado */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado</h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              product.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {product.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          {/* Stats Cards */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stock Total</p>
                  <p className="text-lg font-bold text-gray-900">
                    {product.totalStock || product.Stock || 0}
                  </p>
                  {product.variants && product.variants.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {product.variants.length} variantes
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valor en Inventario</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${((product.totalStock || product.Stock || 0) * (product.unitPrice || product.UnitPrice || 0)).toLocaleString()}
                  </p>
                </div>
              </div>

          
            </div>
          </div>

          {/* Información Adicional */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información Adicional
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Creado</p>
                <p className="text-gray-900">
                  {new Date(product.CreatedAt).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Última Actualización</p>
                <p className="text-gray-900">
                  {new Date(product.UpdatedAt).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Preview de Foto */}
      {previewPhoto && (
        <div 
          className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999] p-4"
          onClick={() => setPreviewPhoto(null)}
          style={{ margin: 0 }}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={previewPhoto.photoUrl}
              alt={previewPhoto.description || 'Foto del producto'}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {previewPhoto.description && (
              <div className="mt-4 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg">
                <p className="text-center">{previewPhoto.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
