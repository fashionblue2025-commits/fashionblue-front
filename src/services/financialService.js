import api from './api'

export const financialService = {
  // Crear transacción
  createTransaction: (data) => api.post('/financial-transactions', data),

  // Obtener transacción por ID
  getTransaction: (id) => api.get(`/financial-transactions/${id}`),

  // Listar transacciones con filtros
  getTransactions: (filters = {}) => {
    const params = new URLSearchParams()
    
    if (filters.type) params.append('type', filters.type)
    if (filters.category) params.append('category', filters.category)
    if (filters.start_date) params.append('start_date', filters.start_date)
    if (filters.end_date) params.append('end_date', filters.end_date)
    
    const queryString = params.toString()
    return api.get(`/financial-transactions${queryString ? `?${queryString}` : ''}`)
  },

  // Obtener balance financiero
  getBalance: () => api.get('/financial-transactions/balance')
}
