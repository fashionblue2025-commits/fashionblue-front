import { useState, useEffect } from 'react'
import { permissionService } from '../services/permissionService'
import { useAuthStore } from '../store/authStore'

/**
 * Hook para manejar permisos de categorías del usuario actual
 */
export function useUserPermissions() {
  const [allowedCategories, setAllowedCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const user = useAuthStore(state => state.user)

  useEffect(() => {
    if (user) {
      loadAllowedCategories()
    }
  }, [user])

  const loadAllowedCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Si no hay usuario, no cargar permisos
      if (!user) {
        console.log('⚠️ No hay usuario')
        setAllowedCategories([])
        setLoading(false)
        return
      }
      
      console.log('🔄 Cargando categorías permitidas del usuario actual...')
      const response = await permissionService.getMyAllowedCategories('view')
      const categories = response.data || []
      console.log('✅ Categorías permitidas cargadas:', categories)
      setAllowedCategories(categories)
    } catch (err) {
      console.error('❌ Error loading allowed categories:', err)
      console.error('Error details:', err.response?.data || err.message)
      setError(err)
      // Si hay error, dejar array vacío para que no bloquee
      setAllowedCategories([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * Verifica si el usuario puede realizar una acción en una categoría
   */
  const canAccessCategory = (categoryId, action = 'view') => {
    // Super Admin tiene acceso a todo
    if (user?.Role === 'SUPER_ADMIN') {
      return true
    }

    // Si no hay categorías permitidas cargadas aún, denegar
    if (loading) {
      return false
    }

    // Buscar si la categoría está en las permitidas
    return allowedCategories.some(cat => cat.id === categoryId)
  }

  /**
   * Obtiene las IDs de categorías permitidas
   */
  const getAllowedCategoryIds = () => {
    return allowedCategories.map(cat => cat.id)
  }

  /**
   * Verifica si el usuario tiene acceso a alguna categoría
   */
  const hasAnyAccess = () => {
    if (user?.Role === 'SUPER_ADMIN') {
      return true
    }
    return allowedCategories.length > 0
  }

  return {
    allowedCategories,
    loading,
    error,
    canAccessCategory,
    getAllowedCategoryIds,
    hasAnyAccess,
    reload: loadAllowedCategories
  }
}
