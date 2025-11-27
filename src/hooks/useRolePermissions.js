import { useAuthStore } from '../store/authStore'
import { hasPermission, canAccessRoute, getModulesForSidebar, ROLES } from '../config/permissions'

/**
 * Hook para manejar permisos basados en roles
 * @returns {Object}
 */
export function useRolePermissions() {
  const user = useAuthStore(state => state.user)
  const userRole = user?.Role || null

  /**
   * Verifica si el usuario tiene permiso para un módulo
   * @param {string} moduleName - Nombre del módulo
   * @param {string} action - Acción específica (opcional)
   * @returns {boolean}
   */
  const canAccess = (moduleName, action = null) => {
    if (!userRole) return false
    return hasPermission(userRole, moduleName, action)
  }

  /**
   * Verifica si el usuario puede acceder a una ruta
   * @param {string} path - Path de la ruta
   * @returns {boolean}
   */
  const canAccessPath = (path) => {
    if (!userRole) return false
    return canAccessRoute(userRole, path)
  }

  /**
   * Obtiene los módulos accesibles para mostrar en el sidebar
   * @returns {Object} - { main: [], admin: [] }
   */
  const getSidebarModules = () => {
    if (!userRole) return { main: [], admin: [] }
    return getModulesForSidebar(userRole)
  }

  /**
   * Verifica si el usuario es Super Admin
   * @returns {boolean}
   */
  const isSuperAdmin = () => {
    return userRole === ROLES.SUPER_ADMIN
  }

  /**
   * Verifica si el usuario es Admin (Super Admin o Admin)
   * @returns {boolean}
   */
  const isAdmin = () => {
    return userRole === ROLES.SUPER_ADMIN || userRole === ROLES.ADMIN
  }

  /**
   * Verifica si el usuario es Vendedor
   * @returns {boolean}
   */
  const isSeller = () => {
    return userRole === ROLES.SELLER
  }

  /**
   * Verifica si el usuario es Viewer
   * @returns {boolean}
   */
  const isViewer = () => {
    return userRole === ROLES.VIEWER
  }

  return {
    userRole,
    canAccess,
    canAccessPath,
    getSidebarModules,
    isSuperAdmin,
    isAdmin,
    isSeller,
    isViewer,
    hasUser: !!user,
    // Exportar ROLES para uso conveniente
    ROLES
  }
}
