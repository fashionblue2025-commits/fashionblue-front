import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, AlertCircle, Info } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { orderService } from '../../services/orderService'
import { productService } from '../../services/productService'
import { customerService } from '../../services/customerService'
import { useAuthStore } from '../../store/authStore'

// Componente para selector de tallas con carga dinámica
function SizeSelector({ item, index, categories, sizesByCategory, loadSizesByType, updateItem }) {
  const [sizes, setSizes] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadSizes = async () => {
      console.log('🔍 SizeSelector - categoryId:', item.categoryId)
      
      if (!item.categoryId) {
        setSizes([])
        return
      }

      const selectedCategory = categories.find(c => c.id === parseInt(item.categoryId))
      console.log('📂 Selected category:', selectedCategory)
      const categorySlug = selectedCategory?.slug

      if (!categorySlug) {
        console.warn('⚠️ No slug found for category')
        setSizes([])
        return
      }

      console.log('🏷️ Category slug:', categorySlug)

      // Si ya están en cache, usarlas
      if (sizesByCategory[categorySlug]) {
        console.log('✅ Using cached sizes:', sizesByCategory[categorySlug])
        setSizes(sizesByCategory[categorySlug])
        return
      }

      // Si no, cargarlas
      console.log('📡 Loading sizes for:', categorySlug)
      setLoading(true)
      const loadedSizes = await loadSizesByType(categorySlug)
      console.log('📦 Loaded sizes:', loadedSizes)
      setSizes(loadedSizes)
      setLoading(false)
    }

    loadSizes()
  }, [item.categoryId, categories])

  // Para productos existentes, mostrar input readonly
  if (item.productType === 'existing' && item.sizeId) {
    const sizeValue = sizes.find(s => s.id === parseInt(item.sizeId))?.value || item.sizeId
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Talla
        </label>
        <input
          type="text"
          value={sizeValue}
          className="input bg-gray-50"
          readOnly
        />
      </div>
    )
  }

  // Para productos nuevos, mostrar selector
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Talla
      </label>
      <select
        value={item.sizeId}
        onChange={(e) => updateItem(index, 'sizeId', e.target.value)}
        className="input"
        disabled={!item.categoryId || loading}
      >
        <option value="">
          {loading ? 'Cargando tallas...' : item.categoryId ? 'Seleccionar...' : 'Primero selecciona una categoría'}
        </option>
        {sizes.map(size => (
          <option key={size.id} value={size.id}>
            {size.value}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function CreateOrder() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      type: 'CUSTOM',
      customerName: '',
      discount: 0,
      notes: '',
      estimatedDeliveryDate: '',
    }
  })

  const [items, setItems] = useState([{ 
    productType: 'new', // 'new' o 'existing'
    productVariantId: 0, // ID de la variante (0 para nuevas)
    productName: '',
    categoryId: null, // ID de la categoría (snapshot)
    color: '', 
    sizeId: '', 
    quantity: 1, 
    unitPrice: 0 
  }])
  const [products, setProducts] = useState([])
  const [sizes, setSizes] = useState([])
  const [sizesByCategory, setSizesByCategory] = useState({}) // Cache de tallas por categoría
  const [categories, setCategories] = useState([])
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [isInternalCustomer, setIsInternalCustomer] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  const orderType = watch('type')

  useEffect(() => {
    loadCategories()
    loadCustomers()
  }, [])

  // Cargar productos solo cuando se necesiten
  useEffect(() => {
    const needsProducts = orderType === 'SALE' || items.some(item => item.productType === 'existing')
    if (needsProducts && products.length === 0) {
      loadProducts()
    }
  }, [orderType, items])

  const loadCategories = async () => {
    try {
      setLoadingData(true)
      const categoriesRes = await productService.getCategories()
      setCategories(categoriesRes.data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
      alert('Error al cargar las categorías')
    } finally {
      setLoadingData(false)
    }
  }

  const loadCustomers = async () => {
    try {
      const customersRes = await customerService.getCustomers()
      setCustomers(customersRes.data || [])
    } catch (error) {
      console.error('Error loading customers:', error)
      // No mostrar alert, es opcional
    }
  }

  const loadSizesByType = async (categorySlug) => {
    console.log('🔧 loadSizesByType called with slug:', categorySlug)
    
    // Si ya tenemos las tallas en cache, no las volvemos a cargar
    if (sizesByCategory[categorySlug]) {
      console.log('💾 Returning cached sizes for:', categorySlug)
      return sizesByCategory[categorySlug]
    }

    try {
      console.log('🌐 Fetching sizes from API for:', categorySlug)
      const sizesRes = await productService.getSizesByType(categorySlug)
      console.log('📥 API Response:', sizesRes)
      const sizes = sizesRes.data || []
      console.log('📊 Parsed sizes:', sizes)
      
      // Guardar en cache
      setSizesByCategory(prev => ({
        ...prev,
        [categorySlug]: sizes
      }))
      
      return sizes
    } catch (error) {
      console.error(`❌ Error loading sizes for ${categorySlug}:`, error)
      return []
    }
  }

  const loadProducts = async () => {
    try {
      const productsRes = await productService.getProducts()
      setProducts(productsRes.data || [])
    } catch (error) {
      console.error('Error loading products:', error)
      alert('Error al cargar los productos')
    }
  }

  const addItem = () => {
    setItems([...items, { 
      productType: 'new',
      productVariantId: 0, 
      productName: '',
      categoryId: null,
      color: '', 
      sizeId: '', 
      quantity: 1, 
      unitPrice: 0 
    }])
  }

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value

    // Si cambia el tipo de producto, resetear campos
    if (field === 'productType') {
      if (value === 'new') {
        newItems[index].productVariantId = 0
        newItems[index].productName = ''
        newItems[index].categoryId = null
        newItems[index].color = ''
        newItems[index].sizeId = ''
        newItems[index].unitPrice = 0
      } else {
        newItems[index].productVariantId = ''
        newItems[index].productName = ''
        newItems[index].categoryId = null
        newItems[index].color = ''
        newItems[index].sizeId = ''
      }
    }

    // Si cambia la categoría, resetear la talla (porque las tallas disponibles cambian)
    if (field === 'categoryId') {
      newItems[index].sizeId = ''
    }

    // Si selecciona una variante existente, autocompletar todos los campos
    if (field === 'productVariantId' && value) {
      // Buscar la variante en todos los productos
      let foundVariant = null
      let foundProduct = null
      
      for (const product of products) {
        if (product.variants && product.variants.length > 0) {
          const variant = product.variants.find(v => v.id === parseInt(value))
          if (variant) {
            foundVariant = variant
            foundProduct = product
            break
          }
        }
      }
      
      if (foundVariant && foundProduct) {
        newItems[index].productName = foundProduct.name || foundProduct.Name || ''
        newItems[index].categoryId = foundProduct.categoryId || foundProduct.CategoryId || null
        newItems[index].color = foundVariant.color || foundVariant.Color || ''
        newItems[index].sizeId = foundVariant.sizeId || foundVariant.SizeId || ''
        newItems[index].unitPrice = foundVariant.unitPrice || foundVariant.UnitPrice || 0
        console.log('✅ Variante autocompletada:', {
          variantId: value,
          productName: newItems[index].productName,
          categoryId: newItems[index].categoryId,
          color: newItems[index].color,
          sizeId: newItems[index].sizeId,
          unitPrice: newItems[index].unitPrice,
          availableStock: foundVariant.availableStock || (foundVariant.stock - (foundVariant.reservedStock || 0))
        })
      } else {
        console.warn('⚠️ Variante no encontrada en el catálogo:', value)
      }
    }

    setItems(newItems)
  }

  const validateStock = async () => {
    if (orderType !== 'SALE') return true

    for (const item of items) {
      if (!item.productVariantId || item.productVariantId === 0) {
        alert('Debes seleccionar una variante existente para ventas')
        return false
      }

      // Buscar la variante en todos los productos
      let foundVariant = null
      let foundProduct = null
      
      for (const product of products) {
        if (product.variants && product.variants.length > 0) {
          const variant = product.variants.find(v => v.id === parseInt(item.productVariantId))
          if (variant) {
            foundVariant = variant
            foundProduct = product
            break
          }
        }
      }

      if (!foundVariant) {
        alert(`Variante ${item.productVariantId} no encontrada`)
        return false
      }

      const availableStock = foundVariant.availableStock || (foundVariant.stock - (foundVariant.reservedStock || 0))
      if (availableStock < item.quantity) {
        alert(
          `Stock insuficiente para ${foundProduct.name} (${foundVariant.color}).\n` +
          `Disponible: ${availableStock}, Solicitado: ${item.quantity}`
        )
        return false
      }
    }

    return true
  }

  const onSubmit = async (data) => {
    // Validar stock para SALE
    if (!(await validateStock())) return

    // Validar items
    if (items.length === 0) {
      alert('Debes agregar al menos un producto')
      return
    }

    for (const item of items) {
      // Validar productName (siempre requerido)
      if (!item.productName || item.productName.trim() === '') {
        alert('El nombre del producto es requerido para todos los items')
        return
      }
      
      if (item.quantity <= 0) {
        alert('La cantidad debe ser mayor a 0')
        return
      }
      if (item.unitPrice <= 0) {
        alert('El precio unitario debe ser mayor a 0')
        return
      }
    }

    try {
      setLoading(true)
      console.log('items', items)
      const orderData = {
        customerName: data.customerName,
        sellerId: user?.id || 1,
        type: data.type,
        discount: parseFloat(data.discount) || 0,
        notes: data.notes || '',
        estimatedDeliveryDate: data.estimatedDeliveryDate ? new Date(data.estimatedDeliveryDate).toISOString() : null,
        // Agregar customerId solo si es cliente interno
        ...(isInternalCustomer && selectedCustomer ? { customerId: parseInt(selectedCustomer) } : {}),
        items: items.map(item => {
          const categoryId = item.categoryId && item.categoryId !== '' ? parseInt(item.categoryId) : null
          const sizeId = item.sizeId && item.sizeId !== '' ? parseInt(item.sizeId) : null
          
          // Calcular cuánto reservar del stock y cuánto fabricar
          let quantityReserved = 0
          let quantityToManufacture = parseInt(item.quantity)
          
          // Para productos existentes (variantes), calcular reserva vs fabricación
          if (item.productVariantId && parseInt(item.productVariantId) > 0) {
            // Buscar la variante para obtener el stock disponible
            let foundVariant = null
            for (const product of products) {
              if (product.variants && product.variants.length > 0) {
                const variant = product.variants.find(v => v.id === parseInt(item.productVariantId))
                if (variant) {
                  foundVariant = variant
                  break
                }
              }
            }
            
            if (foundVariant) {
              const availableStock = foundVariant.availableStock || (foundVariant.stock - (foundVariant.reservedStock || 0))
              quantityReserved = Math.min(availableStock, parseInt(item.quantity))
              quantityToManufacture = Math.max(0, parseInt(item.quantity) - availableStock)
            }
          }
          // Para productos nuevos (CUSTOM, INVENTORY), todo se fabrica
          else {
            quantityReserved = 0
            quantityToManufacture = parseInt(item.quantity)
          }
          
          console.log('📊 Item calculation:', {
            productName: item.productName,
            totalQuantity: parseInt(item.quantity),
            quantityReserved,
            quantityToManufacture
          })
          
          return {
            productId: parseInt(item.productVariantId) || 0, // productVariantId se envía como productId
            productName: item.productName || '',
            categoryId: categoryId,
            color: item.color || '',
            sizeId: sizeId,
            quantity: parseInt(item.quantity),
            quantityReserved: quantityReserved,
            quantityToManufacture: quantityToManufacture,
            unitPrice: parseFloat(item.unitPrice)
          }
        })
      }

      console.log('📤 Enviando orden al backend:', JSON.stringify(orderData, null, 2))

      const response = await orderService.createOrder(orderData)
      navigate(`/orders/${response.data.id}`)
    } catch (error) {
      console.error('Error creating order:', error)
      alert(error.response?.data?.message || 'Error al crear la orden')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const discount = parseFloat(watch('discount')) || 0
    return subtotal - discount
  }

  const getOrderTypeInfo = () => {
    const info = {
      CUSTOM: {
        title: 'Orden Personalizada (Cotización)',
        description: 'Para productos personalizados que se fabricarán bajo pedido. Los productos se crearán al aprobar la cotización.',
        color: 'blue'
      },
      INVENTORY: {
        title: 'Producción para Inventario',
        description: 'Para producir productos y agregarlos al inventario. Los productos se crearán automáticamente.',
        color: 'purple'
      },
      SALE: {
        title: 'Venta',
        description: 'Para vender productos que ya existen en inventario. Debes seleccionar productos existentes.',
        color: 'green'
      }
    }
    return info[orderType] || info.CUSTOM
  }

  const typeInfo = getOrderTypeInfo()

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Orden</h1>
          <p className="text-gray-500 mt-1">Crea una nueva orden según el tipo de operación</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Tipo de Orden */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tipo de Orden</h2>
          
          <div className="space-y-4">
            <select
              {...register('type', { required: true })}
              className="input"
            >
              <option value="CUSTOM">Orden Personalizada (Cotización)</option>
              <option value="INVENTORY">Producción para Inventario</option>
              <option value="SALE">Venta</option>
            </select>

            <div className={`p-4 rounded-lg bg-${typeInfo.color}-50 border border-${typeInfo.color}-200`}>
              <div className="flex items-start gap-3">
                <Info className={`w-5 h-5 text-${typeInfo.color}-600 mt-0.5 flex-shrink-0`} />
                <div>
                  <p className={`font-medium text-${typeInfo.color}-900`}>{typeInfo.title}</p>
                  <p className={`text-sm text-${typeInfo.color}-700 mt-1`}>{typeInfo.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información General */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Información General</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Checkbox para Cliente Interno */}
            {orderType !== 'INVENTORY' && (
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalCustomer}
                    onChange={(e) => {
                      setIsInternalCustomer(e.target.checked)
                      if (!e.target.checked) {
                        setSelectedCustomer(null)
                      }
                    }}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Cliente Interno (Registro contable automático)
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Al completar la venta, se creará automáticamente una transacción de deuda en el sistema contable del cliente.
                </p>
              </div>
            )}

            {/* Selector de Cliente Interno */}
            {isInternalCustomer && orderType !== 'INVENTORY' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Cliente Interno *
                </label>
                <select
                  value={selectedCustomer || ''}
                  onChange={(e) => {
                    const customerId = e.target.value
                    setSelectedCustomer(customerId)
                    // Autocompletar nombre del cliente
                    const customer = customers.find(c => c.id === parseInt(customerId))
                    if (customer) {
                      setValue('customerName', customer.name)
                    }
                  }}
                  className="input"
                  required={isInternalCustomer}
                >
                  <option value="">Seleccionar cliente...</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.phone ? `- ${customer.phone}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <input
                type="text"
                {...register('customerName', { required: 'El nombre del cliente es requerido' })}
                className={`input ${errors.customerName ? 'input-error' : ''}`}
                placeholder="Nombre del cliente"
                readOnly={isInternalCustomer}
              />
              {errors.customerName && (
                <p className="text-sm text-red-600 mt-1">{errors.customerName.message}</p>
              )}
              {isInternalCustomer && (
                <p className="text-xs text-gray-500 mt-1">
                  Nombre autocompletado del cliente seleccionado
                </p>
              )}
            </div>

            {orderType !== 'INVENTORY' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Estimada de Entrega
                </label>
                <input
                  type="date"
                  {...register('estimatedDeliveryDate')}
                  className="input"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="input"
                placeholder="Notas adicionales sobre la orden..."
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Productos</h2>
            <button
              type="button"
              onClick={addItem}
              className="btn btn-sm bg-primary-50 text-primary-600 hover:bg-primary-100 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Agregar Producto
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Producto #{index + 1}</span>
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Tipo de Producto (solo para no-SALE) */}
                  {orderType !== 'SALE' && (
                    <div className="lg:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Producto
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`productType-${index}`}
                            value="new"
                            checked={item.productType === 'new'}
                            onChange={(e) => updateItem(index, 'productType', e.target.value)}
                            className="w-4 h-4 text-primary-600"
                          />
                          <span className="text-sm text-gray-700">Producto Nuevo</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`productType-${index}`}
                            value="existing"
                            checked={item.productType === 'existing'}
                            onChange={(e) => updateItem(index, 'productType', e.target.value)}
                            className="w-4 h-4 text-primary-600"
                          />
                          <span className="text-sm text-gray-700">Producto Existente</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Selector de Variante Existente */}
                  {(orderType === 'SALE' || item.productType === 'existing') && (
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Seleccionar Variante *
                      </label>
                      <select
                        value={item.productVariantId}
                        onChange={(e) => updateItem(index, 'productVariantId', e.target.value)}
                        className="input"
                        required
                      >
                        <option value="">Seleccionar variante...</option>
                        {products.filter(p => p.isActive || p.IsActive).map(product => {
                          // Si el producto tiene variantes, mostrarlas
                          if (product.variants && product.variants.length > 0) {
                            return product.variants
                              .filter(v => v.isActive !== false)
                              .map(variant => {
                                const available = variant.availableStock || (variant.stock - (variant.reservedStock || 0))
                                const sizeName = variant.size?.value || variant.size?.Value || ''
                                return (
                                  <option key={variant.id} value={variant.id}>
                                    {product.name || product.Name} - {variant.color || variant.Color}
                                    {sizeName && ` (${sizeName})`} - Stock: {available}
                                  </option>
                                )
                              })
                          }
                          return null
                        })}
                      </select>
                    </div>
                  )}

                  {/* Nombre del Producto (solo para productos nuevos) */}
                  {orderType !== 'SALE' && item.productType === 'new' && (
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Producto *
                      </label>
                      <input
                        type="text"
                        value={item.productName || ''}
                        onChange={(e) => updateItem(index, 'productName', e.target.value)}
                        className="input"
                        placeholder="Ej: Camisa Polo Azul"
                        required
                      />
                    </div>
                  )}

                  {/* Categoría (solo para productos nuevos) */}
                  {orderType !== 'SALE' && item.productType === 'new' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoría
                      </label>
                      <select
                        value={item.categoryId || ''}
                        onChange={(e) => updateItem(index, 'categoryId', e.target.value)}
                        className="input"
                      >
                        <option value="">Sin categoría</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Color */}
                  {(orderType !== 'SALE' && item.productType === 'new') || (item.productType === 'existing' && item.color) ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color
                      </label>
                      <input
                        type="text"
                        value={item.color || ''}
                        onChange={(e) => updateItem(index, 'color', e.target.value)}
                        className="input"
                        placeholder="Ej: Azul"
                        readOnly={item.productType === 'existing'}
                      />
                    </div>
                  ) : null}

                  {/* Talla */}
                  {(orderType !== 'SALE' && item.productType === 'new') || (item.productType === 'existing' && item.sizeId) ? (
                    <SizeSelector 
                      item={item}
                      index={index}
                      categories={categories}
                      sizesByCategory={sizesByCategory}
                      loadSizesByType={loadSizesByType}
                      updateItem={updateItem}
                    />
                  ) : null}

                  {/* Cantidad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      className="input"
                      required
                    />
                    {/* Indicador de Stock y Fabricación con Tooltip */}
                    {parseInt(item.productVariantId) > 0 && (orderType === 'SALE' || item.productType === 'existing') && item.quantity > 0 && (() => {
                      // Buscar la variante en todos los productos
                      let foundVariant = null
                      for (const product of products) {
                        if (product.variants && product.variants.length > 0) {
                          const variant = product.variants.find(v => v.id === parseInt(item.productVariantId))
                          if (variant) {
                            foundVariant = variant
                            break
                          }
                        }
                      }
                      
                      if (!foundVariant) return null
                      
                      const totalStock = foundVariant.stock || 0
                      const reserved = foundVariant.reservedStock || 0
                      const available = foundVariant.availableStock || (totalStock - reserved)
                      const toReserve = Math.min(available, item.quantity)
                      const toManufacture = Math.max(0, item.quantity - available)
                      const percentFromStock = available > 0 ? Math.round((toReserve / item.quantity) * 100) : 0
                      
                      return (
                        <div className="mt-2 relative group">
                          {/* Badge compacto con hover */}
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-help transition-colors">
                            <Info className="w-4 h-4 text-gray-600" />
                            <div className="flex items-center gap-2 text-xs font-medium">
                              {toReserve > 0 && (
                                <span className="text-green-600">📦 {toReserve}</span>
                              )}
                              {toManufacture > 0 && (
                                <span className="text-blue-600">🏭 {toManufacture}</span>
                              )}
                            </div>
                          </div>

                          {/* Tooltip detallado */}
                          <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            {/* Barra de progreso */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                                <span className="text-gray-700">Distribución de {item.quantity} unidades</span>
                                <span className="text-gray-500">Disponible: {available}</span>
                              </div>
                              <div className="h-6 bg-gray-200 rounded-md overflow-hidden flex">
                                {toReserve > 0 && (
                                  <div 
                                    className="bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white text-xs font-semibold"
                                    style={{ width: `${percentFromStock}%` }}
                                  >
                                    {percentFromStock > 15 && <span>📦 {toReserve}</span>}
                                  </div>
                                )}
                                {toManufacture > 0 && (
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold"
                                    style={{ width: `${100 - percentFromStock}%` }}
                                  >
                                    {(100 - percentFromStock) > 15 && <span>🏭 {toManufacture}</span>}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Detalles en grid */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div className="bg-green-50 border border-green-200 rounded-md p-2">
                                <div className="text-xs text-green-700 font-medium">Del Stock</div>
                                <div className="text-xl font-bold text-green-600">{toReserve}</div>
                                <div className="text-xs text-green-600">{percentFromStock}%</div>
                              </div>
                              <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                                <div className="text-xs text-blue-700 font-medium">A Fabricar</div>
                                <div className="text-xl font-bold text-blue-600">{toManufacture}</div>
                                <div className="text-xs text-blue-600">{100 - percentFromStock}%</div>
                              </div>
                            </div>

                            {/* Info adicional */}
                            <div className="space-y-1 text-xs border-t border-gray-200 pt-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Stock total:</span>
                                <span className="font-medium">{totalStock}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Reservado:</span>
                                <span className="font-medium">{reserved}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Disponible:</span>
                                <span className="font-medium text-green-600">{available}</span>
                              </div>
                            </div>

                            {/* Mensaje de estado */}
                            <div className="mt-3 pt-2 border-t border-gray-200">
                              {toManufacture === 0 ? (
                                <div className="flex items-center gap-2 text-green-700">
                                  <span className="text-base">✓</span>
                                  <span className="text-xs font-medium">Stock suficiente</span>
                                </div>
                              ) : available === 0 ? (
                                <div className="flex items-center gap-2 text-blue-700">
                                  <span className="text-base">⚠</span>
                                  <span className="text-xs font-medium">Requiere fabricación completa</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-yellow-700">
                                  <span className="text-base">ℹ</span>
                                  <span className="text-xs font-medium">Stock parcial disponible</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  {/* Precio Unitario */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Unitario *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                      className="input"
                      required
                      readOnly={orderType === 'SALE' && item.productId}
                    />
                  </div>

                  {/* Subtotal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtotal
                    </label>
                    <div className="input bg-gray-50">
                      ${(item.quantity * item.unitPrice).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Advertencia de stock bajo */}
                {orderType === 'SALE' && item.productId && (() => {
                  const product = products.find(p => p.id === parseInt(item.productId))
                  const available = product ? product.stock - (product.reservedStock || 0) : 0
                  if (available < item.quantity) {
                    return (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-700">
                          Stock insuficiente. Disponible: {available}, Solicitado: {item.quantity}
                        </p>
                      </div>
                    )
                  }
                  return null
                })()}
              </div>
            ))}
          </div>
        </div>

        {/* Resumen */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium">
                ${items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString()}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descuento
              </label>
              <input
                type="number"
                min="0"
                step="100"
                {...register('discount')}
                className="input max-w-xs"
              />
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary-600">
                  ${calculateTotal().toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="btn btn-secondary flex-1"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear Orden'}
          </button>
        </div>
      </form>
    </div>
  )
}
