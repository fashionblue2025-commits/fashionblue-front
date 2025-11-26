import api from './api'

export const customerService = {
  getCustomers: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    const url = params ? `/customers?${params}` : '/customers'
    const response = await api.get(url)
    return response.data
  },

  getCustomer: async (id) => {
    const response = await api.get(`/customers/${id}`)
    return response.data
  },

  createCustomer: async (customerData) => {
    const response = await api.post('/customers', customerData)
    return response.data
  },

  updateCustomer: async (id, customerData) => {
    const response = await api.put(`/customers/${id}`, customerData)
    return response.data
  },

  deleteCustomer: async (id) => {
    const response = await api.delete(`/customers/${id}`)
    return response.data
  },

  searchCustomers: async (query) => {
    const response = await api.get(`/customers/search?q=${query}`)
    return response.data
  },

  // Historial de transacciones
  getCustomerHistory: async (id) => {
    const response = await api.get(`/customers/${id}/history`)
    return response.data
  },

  // Balance del cliente
  getCustomerBalance: async (id) => {
    const response = await api.get(`/customers/${id}/balance`)
    return response.data
  },

  // Crear transacciones (DEUDA o ABONO)
  createTransactions: async (customerId, transactions) => {
    const response = await api.post(`/customers/transactions`, {
      customer_id: parseInt(customerId),
      transactions: transactions
    })
    return response.data
  },

  // Descargar estado de cuenta en PDF
  downloadStatement: async (id, days = null) => {
    const url = days 
      ? `/customers/${id}/statement?days=${days}` 
      : `/customers/${id}/statement`
    
    const response = await api.get(url, {
      responseType: 'blob', // Importante para archivos binarios
    })
    
    return response.data
  },
}
