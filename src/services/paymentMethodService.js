import api from './api'

export const paymentMethodService = {
  // Obtener todos los métodos de pago
  getPaymentMethods: async () => {
    const response = await api.get('/payment-methods')
    // Si la respuesta tiene una propiedad 'data', usarla; si no, usar la respuesta completa
    const data = response.data?.data || response.data
    // Asegurar que siempre retornamos un array
    return Array.isArray(data) ? data : []
  }
}
