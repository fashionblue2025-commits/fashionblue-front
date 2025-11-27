/**
 * Sistema de Control de Acceso Basado en Roles (RBAC)
 * 
 * Define qué roles pueden acceder a cada módulo/ruta de la aplicación
 */

// Roles disponibles en el sistema
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  SELLER: 'SELLER',
  VIEWER: 'VIEWER'
}

// Configuración de permisos por módulo
export const MODULE_PERMISSIONS = {
  // Dashboard
  dashboard: {
    path: '/',
    name: 'Dashboard',
    icon: 'LayoutDashboard',
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    description: 'Panel principal con métricas y resumen'
  },
  
  analytics: {
    path: '/analytics',
    name: 'Analíticas',
    icon: 'BarChart3',
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    description: 'Análisis detallado y reportes'
  },

  // Productos y Categorías
  categories: {
    path: '/categories',
    name: 'Categorías',
    icon: 'Package',
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER],
    description: 'Gestión de categorías de productos'
  },

  products: {
    path: '/products',
    name: 'Productos',
    icon: 'ShoppingBag',
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER],
    description: 'Gestión de productos',
    children: {
      view: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER, ROLES.VIEWER],
      create: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER],
      edit: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER],
      delete: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    }
  },

  // Órdenes
  orders: {
    path: '/orders',
    name: 'Órdenes',
    icon: 'ShoppingCart',
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER],
    description: 'Gestión de pedidos',
    children: {
      view: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER, ROLES.VIEWER],
      create: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER],
      edit: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER],
      delete: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
      approve: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    }
  },

  // Clientes
  customers: {
    path: '/customers',
    name: 'Clientes',
    icon: 'Users',
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER],
    description: 'Gestión de clientes',
    children: {
      view: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER, ROLES.VIEWER],
      create: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER],
      edit: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SELLER],
      delete: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    }
  },

  // Administración (Solo Super Admin)
  financial: {
    path: '/financial',
    name: 'Finanzas',
    icon: 'DollarSign',
    allowedRoles: [ROLES.SUPER_ADMIN],
    description: 'Gestión financiera y transacciones',
    isAdminOnly: true
  },

  audit: {
    path: '/audit',
    name: 'Auditoría',
    icon: 'Shield',
    allowedRoles: [ROLES.SUPER_ADMIN],
    description: 'Logs de auditoría del sistema',
    isAdminOnly: true
  },

  permissions: {
    path: '/permissions',
    name: 'Permisos',
    icon: 'Key',
    allowedRoles: [ROLES.SUPER_ADMIN],
    description: 'Gestión de permisos por categoría',
    isAdminOnly: true
  }
}

/**
 * Verifica si un rol tiene permiso para acceder a un módulo
 * @param {string} userRole - Rol del usuario
 * @param {string} moduleName - Nombre del módulo
 * @param {string} action - Acción específica (opcional: 'view', 'create', 'edit', 'delete')
 * @returns {boolean}
 */
export function hasPermission(userRole, moduleName, action = null) {
  const module = MODULE_PERMISSIONS[moduleName]
  
  if (!module) {
    console.warn(`Module "${moduleName}" not found in permissions config`)
    return false
  }

  // Verificar permiso del módulo principal
  if (!module.allowedRoles.includes(userRole)) {
    return false
  }

  // Si se especifica una acción, verificar permiso específico
  if (action && module.children && module.children[action]) {
    return module.children[action].includes(userRole)
  }

  return true
}

/**
 * Obtiene todos los módulos accesibles para un rol
 * @param {string} userRole - Rol del usuario
 * @returns {Array} - Array de módulos permitidos
 */
export function getAccessibleModules(userRole) {
  return Object.entries(MODULE_PERMISSIONS)
    .filter(([_, module]) => module.allowedRoles.includes(userRole))
    .map(([key, module]) => ({ key, ...module }))
}

/**
 * Agrupa los módulos para el sidebar
 * @param {string} userRole - Rol del usuario
 * @returns {Object} - Módulos agrupados por sección
 */
export function getModulesForSidebar(userRole) {
  const accessibleModules = getAccessibleModules(userRole)
  
  return {
    main: accessibleModules.filter(m => !m.isAdminOnly),
    admin: accessibleModules.filter(m => m.isAdminOnly)
  }
}

/**
 * Verifica si una ruta es accesible para un rol
 * @param {string} userRole - Rol del usuario
 * @param {string} path - Path de la ruta
 * @returns {boolean}
 */
export function canAccessRoute(userRole, path) {
  // Buscar el módulo que coincide con el path
  const module = Object.values(MODULE_PERMISSIONS).find(m => 
    path === m.path || path.startsWith(m.path + '/')
  )
  
  if (!module) {
    // Si no hay configuración específica, denegar por defecto
    return false
  }
  
  return module.allowedRoles.includes(userRole)
}
