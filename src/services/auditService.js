import api from './api'

export const auditService = {
  // Obtener logs con filtros
  getLogs: async (filters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    const queryString = params.toString()
    const response = await api.get(`/audit/logs${queryString ? `?${queryString}` : ''}`)
    return response.data
  },

  // Obtener un log específico
  getLog: async (id) => {
    const response = await api.get(`/audit/logs/${id}`)
    return response.data
  },

  // Obtener logs de una orden específica
  getOrderLogs: async (orderId) => {
    const response = await api.get(`/audit/orders/${orderId}/logs`)
    return response.data
  },

  // Obtener logs de un usuario específico
  getUserLogs: async (userId) => {
    const response = await api.get(`/audit/users/${userId}/logs`)
    return response.data
  },

  // Obtener estadísticas de auditoría
  getStats: async () => {
    const response = await api.get(`/audit/stats`)
    return response.data
  }
}
