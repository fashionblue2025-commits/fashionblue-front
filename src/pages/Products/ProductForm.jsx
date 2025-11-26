import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save, Plus, Trash2, CheckCircle } from 'lucide-react'
import { productService } from '../../services/productService'

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(!!id)
  const [sizes, setSizes] = useState([])
  const [categories, setCategories] = useState([])
  const [variants, setVariants] = useState([{ color: '', sizeId: '', stock: 0, unitPrice: 0 }])
  const [showSuccess, setShowSuccess] = useState(false)
  const isEdit = !!id

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      IsActive: true
    }
  })

  // Watch para calcular costo de producción automáticamente
  const materialCost = watch('MaterialCost', 0)
  const laborCost = watch('LaborCost', 0)

  useEffect(() => {
    loadInitialData()
    if (id) {
      loadProduct()
    }
  }, [id])

  const loadInitialData = async () => {
    try {
      const [sizesRes, categoriesRes] = await Promise.all([
        productService.getSizes(),
        productService.getCategories()
      ])
      setSizes(sizesRes.data || [])
      setCategories(categoriesRes.data || [])
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
  }

  const loadProduct = async () => {
    try {
      setLoadingData(true)
      const response = await productService.getProduct(id)
      const product = response.data
      
      reset({
        Name: product.Name || '',
        Description: product.Description || '',
        SKU: product.SKU || '',
        CategoryID: product.CategoryID || '',
        MaterialCost: product.MaterialCost || 0,
        LaborCost: product.LaborCost || 0,
        ProductionCost: product.ProductionCost || 0,
        UnitPrice: product.UnitPrice || 0,
        WholesalePrice: product.WholesalePrice || 0,
        MinWholesaleQty: product.MinWholesaleQty || 0,
        Stock: product.Stock || 0,
        MinStock: product.MinStock || 0,
        IsActive: product.IsActive
      })
    } catch (error) {
      console.error('Error loading product:', error)
      alert('Error al cargar el producto')
      navigate('/products')
    } finally {
      setLoadingData(false)
    }
  }

  const addVariant = () => {
    setVariants([...variants, { color: '', sizeId: '', stock: 0, unitPrice: 0 }])
  }

  const removeVariant = (index) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index))
    }
  }

  const updateVariant = (index, field, value) => {
    const newVariants = [...variants]
    newVariants[index][field] = value
    setVariants(newVariants)
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      
      // Calcular costo de producción
      const productionCost = parseFloat(data.MaterialCost || 0) + parseFloat(data.LaborCost || 0)
      
      const productData = {
        name: data.Name,
        description: data.Description || '',
        sku: data.SKU || '',
        categoryId: parseInt(data.CategoryID) || 1,
        materialCost: parseFloat(data.MaterialCost) || 0,
        laborCost: parseFloat(data.LaborCost) || 0,
        productionCost: productionCost,
        unitPrice: parseFloat(data.UnitPrice) || 0,
        wholesalePrice: parseFloat(data.WholesalePrice) || 0,
        minWholesaleQty: parseInt(data.MinWholesaleQty) || 0,
        minStock: parseInt(data.MinStock) || 0,
        isActive: data.IsActive,
        variants: variants
          .filter(v => v.color && v.color.trim() !== '')
          .map(v => ({
            color: v.color.trim(),
            sizeId: v.sizeId ? parseInt(v.sizeId) : null,
            stock: parseInt(v.stock) || 0,
            unitPrice: parseFloat(v.unitPrice) || parseFloat(data.UnitPrice) || 0,
            isActive: true
          }))
      }

      console.log('📤 Enviando producto con variantes:', JSON.stringify(productData, null, 2))
      
      if (isEdit) {
        await productService.updateProduct(id, productData)
      } else {
        await productService.createProduct(productData)
      }
      
      // Mostrar mensaje de éxito
      setShowSuccess(true)
      
      // Navegar después de un breve delay para que se vea el mensaje
      setTimeout(() => {
        navigate('/products', { replace: true })
      }, 1500)
    } catch (error) {
      console.error('Error saving product:', error)
      alert(error.response?.data?.message || 'Error al guardar el producto')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  const productionCost = parseFloat(materialCost || 0) + parseFloat(laborCost || 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <div>
              <p className="font-semibold">
                {isEdit ? '¡Producto actualizado!' : '¡Producto creado!'}
              </p>
              <p className="text-sm text-green-100">
                Redirigiendo a la lista de productos...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/products')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEdit ? 'Actualiza la información del producto' : 'Completa los datos del nuevo producto'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
        {/* Información Básica */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información Básica
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Nombre */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Producto *
              </label>
              <input
                type="text"
                {...register('Name', { required: 'El nombre es requerido' })}
                className={`input ${errors.Name ? 'input-error' : ''}`}
                placeholder="Ej: Chaqueta de Cuero Premium"
              />
              {errors.Name && (
                <p className="mt-1 text-sm text-red-600">{errors.Name.message}</p>
              )}
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU *
              </label>
              <input
                type="text"
                {...register('SKU', { required: 'El SKU es requerido' })}
                className={`input ${errors.SKU ? 'input-error' : ''}`}
                placeholder="Ej: CHQ-CUERO-001"
              />
              {errors.SKU && (
                <p className="mt-1 text-sm text-red-600">{errors.SKU.message}</p>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('IsActive')}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Producto activo</span>
              </div>
            </div>

            {/* Descripción */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                {...register('Description')}
                rows={3}
                className="input"
                placeholder="Descripción detallada del producto..."
              />
            </div>
          </div>
        </div>

        {/* Costos y Precios */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Costos y Precios
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Costo de Material */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo de Material *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('MaterialCost', { required: 'El costo de material es requerido' })}
                className={`input ${errors.MaterialCost ? 'input-error' : ''}`}
                placeholder="0.00"
              />
              {errors.MaterialCost && (
                <p className="mt-1 text-sm text-red-600">{errors.MaterialCost.message}</p>
              )}
            </div>

            {/* Costo de Mano de Obra */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo de Mano de Obra *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('LaborCost', { required: 'El costo de mano de obra es requerido' })}
                className={`input ${errors.LaborCost ? 'input-error' : ''}`}
                placeholder="0.00"
              />
              {errors.LaborCost && (
                <p className="mt-1 text-sm text-red-600">{errors.LaborCost.message}</p>
              )}
            </div>

            {/* Costo de Producción (calculado) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo de Producción (Calculado)
              </label>
              <div className="input bg-gray-50 text-gray-900 font-medium">
                ${productionCost.toLocaleString()}
              </div>
            </div>

            {/* Precio Unitario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio Unitario *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('UnitPrice', { required: 'El precio unitario es requerido' })}
                className={`input ${errors.UnitPrice ? 'input-error' : ''}`}
                placeholder="0.00"
              />
              {errors.UnitPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.UnitPrice.message}</p>
              )}
            </div>

            {/* Precio al Por Mayor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio al Por Mayor
              </label>
              <input
                type="number"
                step="0.01"
                {...register('WholesalePrice')}
                className="input"
                placeholder="0.00"
              />
            </div>

            {/* Cantidad Mínima al Por Mayor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad Mínima al Por Mayor
              </label>
              <input
                type="number"
                {...register('MinWholesaleQty')}
                className="input"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Variantes del Producto */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Variantes del Producto
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Define los colores, tallas y stock de cada variante
              </p>
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Agregar Variante
            </button>
          </div>

          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Variante #{index + 1}
                  </h3>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar variante"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color *
                    </label>
                    <input
                      type="text"
                      value={variant.color}
                      onChange={(e) => updateVariant(index, 'color', e.target.value)}
                      className="input"
                      placeholder="Ej: Negro"
                      required
                    />
                  </div>

                  {/* Talla */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Talla
                    </label>
                    <select
                      value={variant.sizeId}
                      onChange={(e) => updateVariant(index, 'sizeId', e.target.value)}
                      className="input"
                    >
                      <option value="">Sin talla</option>
                      {sizes.map(size => (
                        <option key={size.id} value={size.id}>
                          {size.value} ({size.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                      className="input"
                      placeholder="0"
                      required
                    />
                  </div>

                  {/* Precio Unitario */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio (opcional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={variant.unitPrice}
                      onChange={(e) => updateVariant(index, 'unitPrice', e.target.value)}
                      className="input"
                      placeholder="Usar precio base"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Si no especificas un precio para la variante, se usará el precio base del producto.
              El stock total se calculará automáticamente sumando el stock de todas las variantes.
            </p>
          </div>
        </div>

        {/* Stock Mínimo */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Configuración de Inventario
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Mínimo *
              </label>
              <input
                type="number"
                {...register('MinStock', { required: 'El stock mínimo es requerido' })}
                className={`input ${errors.MinStock ? 'input-error' : ''}`}
                placeholder="0"
              />
              {errors.MinStock && (
                <p className="mt-1 text-sm text-red-600">{errors.MinStock.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary flex items-center gap-2"
            disabled={loading}
          >
            <Save className="w-5 h-5" />
            {loading ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </div>
      </form>
    </div>
  )
}
