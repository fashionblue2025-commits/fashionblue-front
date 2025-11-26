import api from './api'

export const productService = {
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    const response = await api.get(`/products?${params}`)
    return response.data
  },

  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  createProduct: async (productData) => {
    const response = await api.post('/products', productData)
    return response.data
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData)
    return response.data
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`)
    return response.data
  },

  // Categorías
  getCategories: async () => {
    const response = await api.get('/categories?is_active=true')
    return response.data
  },

  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}`)
    return response.data
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData)
    return response.data
  },

  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData)
    return response.data
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`)
    return response.data
  },

  // Productos por categoría
  getProductsByCategory: async (categoryId) => {
    const response = await api.get(`/products?category_id=${categoryId}`)
    return response.data
  },

  // Tallas
  getSizes: async () => {
    const response = await api.get('/sizes')
    return response.data
  },

  // Tallas por tipo
  getSizesByType: async (type) => {
    const response = await api.get(`/sizes?type=${type}`)
    return response.data
  },

  // Fotos de productos
  uploadProductPhotos: async (productId, files, descriptions = []) => {
    const formData = new FormData()
    
    files.forEach((file) => {
      formData.append('files', file)
    })
    
    descriptions.forEach((desc) => {
      formData.append('descriptions', desc)
    })
    
    const response = await api.post(`/products/${productId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getProductPhotos: async (productId) => {
    const response = await api.get(`/products/${productId}/photos`)
    return response.data
  },

  deleteProductPhoto: async (productId, photoId) => {
    const response = await api.delete(`/products/${productId}/photos/${photoId}`)
    return response.data
  },
}
