import { Navigate } from 'react-router-dom'
import { useRolePermissions } from '../hooks/useRolePermissions'

/**
 * Componente para proteger rutas basado en roles
 * 
 * Uso:
 * <RoleRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
 *   <MyComponent />
 * </RoleRoute>
 * 
 * @param {Object} props
 * @param {Array<string>} props.allowedRoles - Array de roles permitidos
 * @param {React.ReactNode} props.children - Componente a renderizar
 * @param {string} props.redirectTo - Ruta a redirigir si no tiene permiso (default: '/')
 */
export default function RoleRoute({ allowedRoles = [], children, redirectTo = '/' }) {
  const { userRole, hasUser } = useRolePermissions()

  // Si no hay usuario, redirigir a login (esto debería ser manejado por ProtectedRoute)
  if (!hasUser) {
    return <Navigate to="/login" replace />
  }

  // Si el usuario no tiene un rol permitido, mostrar mensaje y redirigir
  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-8">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg 
                className="w-10 h-10 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔒 Acceso Denegado
            </h1>
            <p className="text-gray-600 mb-2">
              No tienes permisos para acceder a esta sección.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Tu rol actual: <span className="font-semibold">{userRole}</span>
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Roles requeridos: {allowedRoles.join(', ')}
            </p>
          </div>
          
          <button
            onClick={() => window.location.href = redirectTo}
            className="btn btn-primary"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    )
  }

  // Usuario tiene permiso, renderizar el componente
  return children
}
