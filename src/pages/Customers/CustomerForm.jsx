import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save } from 'lucide-react'
import { customerService } from '../../services/customerService'
import { productService } from '../../services/productService'

export default function CustomerForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(!!id)
  const [shirtSizes, setShirtSizes] = useState([])
  const [pantsSizes, setPantsSizes] = useState([])
  const [shoesSizes, setShoesSizes] = useState([])
  const isEdit = !!id

  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  useEffect(() => {
    const init = async () => {
      await loadSizes()
      if (id) {
        await loadCustomer()
      }
    }
    init()
  }, [id])

  const loadSizes = async () => {
    try {
      const [shirts, pants, shoes] = await Promise.all([
        productService.getSizesByType('SHIRT'),
        productService.getSizesByType('PANTS'),
        productService.getSizesByType('SHOES')
      ])
      setShirtSizes(shirts.data || [])
      setPantsSizes(pants.data || [])
      setShoesSizes(shoes.data || [])
    } catch (error) {
      console.error('Error loading sizes:', error)
    }
  }

  const loadCustomer = async () => {
    try {
      setLoadingData(true)
      const response = await customerService.getCustomer(id)
      const customer = response.data
      
      // Mapear los datos del cliente al formulario
      // Convertir IDs a strings para los selects
      // Formatear fecha para input type="date" (YYYY-MM-DD)
      let formattedBirthDate = ''
      if (customer.birthDate) {
        try {
          // Si ya viene en formato YYYY-MM-DD, usarlo directamente
          if (customer.birthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            formattedBirthDate = customer.birthDate
          } else {
            // Si viene en formato ISO, convertir
            const date = new Date(customer.birthDate)
            if (!isNaN(date.getTime())) {
              formattedBirthDate = date.toISOString().split('T')[0]
            }
          }
        } catch (e) {
          console.error('Error parsing birthDate:', e)
        }
      }
      
      reset({
        name: customer.name || '',
        phone: customer.phone || '',
        address: customer.address || '',
        risk_level: customer.riskLevel || '',
        shirt_size_id: customer.shirtSizeId ? String(customer.shirtSizeId) : '',
        pants_size_id: customer.pantsSizeId ? String(customer.pantsSizeId) : '',
        shoes_size_id: customer.shoesSizeId ? String(customer.shoesSizeId) : '',
        birthDate: formattedBirthDate,
        payment_frequency: customer.paymentFrequency || '',
        payment_days: customer.paymentDays || '',
        notes: customer.notes || ''
      })
      
      console.log('Customer data loaded:', {
        raw: {
          birthDate: customer.birthDate,
          shirtSizeId: customer.shirtSizeId,
          pantsSizeId: customer.pantsSizeId,
          shoesSizeId: customer.shoesSizeId
        },
        mapped: {
          birthDate: formattedBirthDate,
          shirt_size_id: customer.shirtSizeId ? String(customer.shirtSizeId) : '',
          pants_size_id: customer.pantsSizeId ? String(customer.pantsSizeId) : '',
          shoes_size_id: customer.shoesSizeId ? String(customer.shoesSizeId) : ''
        }
      })
    } catch (error) {
      console.error('Error loading customer:', error)
      alert('Error al cargar el cliente')
      navigate('/customers')
    } finally {
      setLoadingData(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      
      // Convertir IDs a números
      const customerData = {
        ...data,
        shirt_size_id: data.shirt_size_id ? parseInt(data.shirt_size_id) : null,
        pants_size_id: data.pants_size_id ? parseInt(data.pants_size_id) : null,
        shoes_size_id: data.shoes_size_id ? parseInt(data.shoes_size_id) : null,
      }
      
      if (isEdit) {
        await customerService.updateCustomer(id, customerData)
      } else {
        await customerService.createCustomer(customerData)
      }
      
      navigate('/customers')
    } catch (error) {
      console.error('Error saving customer:', error)
      alert(error.response?.data?.message || 'Error al guardar el cliente')
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/customers')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEdit ? 'Actualiza la información del cliente' : 'Completa los datos del nuevo cliente'}
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
                Nombre Completo *
              </label>
              <input
                type="text"
                {...register('name', { required: 'El nombre es requerido' })}
                className={`input ${errors.name ? 'input-error' : ''}`}
                placeholder="Juan Pérez"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="input"
                placeholder="+57 300 123 4567"
              />
            </div>

            {/* Nivel de Riesgo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de Riesgo *
              </label>
              <select
                {...register('risk_level', { required: 'El nivel de riesgo es requerido' })}
                className={`input ${errors.risk_level ? 'input-error' : ''}`}
              >
                <option value="">Seleccionar...</option>
                <option value="LOW">Bajo</option>
                <option value="MEDIUM">Medio</option>
                <option value="HIGH">Alto</option>
              </select>
              {errors.risk_level && (
                <p className="mt-1 text-sm text-red-600">{errors.risk_level.message}</p>
              )}
            </div>

            {/* Cumpleaños */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                {...register('birthDate')}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Dirección */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Dirección
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección Completa
            </label>
            <input
              type="text"
              {...register('address')}
              className="input"
              placeholder="Calle 123 #45-67, Bogotá"
            />
          </div>
        </div>

        {/* Tallas */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tallas
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Talla de Camisa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Talla de Camisa
              </label>
              <select
                {...register('shirt_size_id')}
                className="input"
              >
                <option value="">Seleccionar...</option>
                {shirtSizes.map(size => (
                  <option key={size.id} value={size.id}>{size.value}</option>
                ))}
              </select>
            </div>

            {/* Talla de Pantalón */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Talla de Pantalón
              </label>
              <select
                {...register('pants_size_id')}
                className="input"
              >
                <option value="">Seleccionar...</option>
                {pantsSizes.map(size => (
                  <option key={size.id} value={size.id}>{size.value}</option>
                ))}
              </select>
            </div>

            {/* Talla de Zapatos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Talla de Zapatos
              </label>
              <select
                {...register('shoes_size_id')}
                className="input"
              >
                <option value="">Seleccionar...</option>
                {shoesSizes.map(size => (
                  <option key={size.id} value={size.id}>{size.value}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Información de Pago */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información de Pago
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Frecuencia de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frecuencia de Pago
              </label>
              <select
                {...register('payment_frequency')}
                className="input"
              >
                <option value="">Seleccionar...</option>
                <option value="WEEKLY">Semanal</option>
                <option value="BIWEEKLY">Quincenal</option>
                <option value="MONTHLY">Mensual</option>
              </select>
            </div>

            {/* Días de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Días de Pago
              </label>
              <input
                type="text"
                {...register('payment_days')}
                className="input"
                placeholder="Ej: 1,15 o Lunes,Viernes"
              />
              <p className="mt-1 text-xs text-gray-500">
                Separados por comas
              </p>
            </div>
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas Adicionales
          </label>
          <textarea
            {...register('notes')}
            rows={4}
            className="input"
            placeholder="Información adicional sobre el cliente..."
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-gradient flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Cliente')}
          </button>
        </div>
      </form>
    </div>
  )
}
