import api from './api'

export const permissionService = {
  // Obtener permisos de un usuario
  getUserPermissions: async (userId) => {
    const response = await api.get(`/permissions/users/${userId}`)
    return response.data
  },

  // Establecer permisos de un usuario (reemplaza todos)
  setUserPermissions: async (userId, permissions) => {
    const response = await api.post(`/permissions/users/${userId}`, { permissions })
    return response.data
  },

  // Agregar/actualizar permiso específico de una categoría
  addCategoryPermission: async (userId, categoryId, permissions) => {
    const response = await api.post(`/permissions/users/${userId}/categories/${categoryId}`, permissions)
    return response.data
  },

  // Eliminar permiso de una categoría
  removeCategoryPermission: async (userId, categoryId) => {
    const response = await api.delete(`/permissions/users/${userId}/categories/${categoryId}`)
    return response.data
  },

  // Obtener categorías permitidas para un usuario
  getAllowedCategories: async (userId, action = 'view') => {
    const response = await api.get(`/permissions/users/${userId}/allowed-categories`, {
      params: { action }
    })
    return response.data
  },

  // Obtener usuarios con permisos en una categoría
  getCategoryPermissions: async (categoryId) => {
    const response = await api.get(`/permissions/categories/${categoryId}/users`)
    return response.data
  },

  // Obtener categorías permitidas del usuario actual
  getMyAllowedCategories: async (action = 'view') => {
    const response = await api.get('/permissions/users/me/allowed-categories', {
      params: { action }
    })
    return response.data
  }
}
