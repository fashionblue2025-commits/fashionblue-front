import api from './api'

export const analyticsService = {
  getDashboard: async () => {
    const response = await api.get('/analytics/dashboard')
    return response.data
  },

  getMetrics: async () => {
    const response = await api.get('/analytics/metrics')
    return response.data
  }
}
