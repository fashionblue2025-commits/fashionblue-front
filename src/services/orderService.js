import api from './api'

export const orderService = {
  // Órdenes
  getOrders: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    const response = await api.get(`/orders?${params}`)
    return response.data
  },

  getOrder: async (id) => {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },

  createOrder: async (orderData) => {
    console.log('📤 Enviando orden al backend:', JSON.stringify(orderData, null, 2))
    const response = await api.post('/orders', orderData)
    return response.data
  },

  approveOrder: async (id) => {
    const response = await api.post(`/orders/${id}/approve`)
    return response.data
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.post(`/orders/${id}/change-status`, { status })
    return response.data
  },

  getAllowedStatuses: async (id) => {
    const response = await api.get(`/orders/${id}/allowed-statuses`)
    return response.data
  },

  deliverOrder: async (id) => {
    const response = await api.post(`/orders/${id}/deliver`)
    return response.data
  },

  cancelOrder: async (id) => {
    const response = await api.post(`/orders/${id}/cancel`)
    return response.data
  },

  // Items
  addOrderItem: async (orderId, itemData) => {
    const response = await api.post(`/orders/${orderId}/items`, itemData)
    return response.data
  },

  updateOrderItem: async (orderId, itemId, itemData) => {
    const response = await api.put(`/orders/${orderId}/items/${itemId}`, itemData)
    return response.data
  },

  removeOrderItem: async (orderId, itemId) => {
    const response = await api.delete(`/orders/${orderId}/items/${itemId}`)
    return response.data
  },

  // Fotos
  uploadPhotos: async (orderId, files, descriptions = []) => {
    const formData = new FormData()
    
    files.forEach((file) => {
      formData.append('files', file)
    })
    
    descriptions.forEach((desc) => {
      formData.append('descriptions', desc)
    })
    
    const response = await api.post(`/orders/${orderId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getOrderPhotos: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/photos`)
    return response.data
  },

  deletePhoto: async (orderId, photoId) => {
    const response = await api.delete(`/orders/${orderId}/photos/${photoId}`)
    return response.data
  },
}
