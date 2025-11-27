import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users,
  LogOut, 
  Menu, 
  X,
  ShoppingBag,
  BarChart3,
  Shield,
  DollarSign,
  Key
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useRolePermissions } from '../../hooks/useRolePermissions'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { getSidebarModules } = useRolePermissions()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Mapeo de iconos
  const iconMap = {
    LayoutDashboard,
    BarChart3,
    Users,
    Package,
    ShoppingCart,
    ShoppingBag,
    DollarSign,
    Shield,
    Key
  }

  // Obtener módulos accesibles según el rol del usuario
  const { main, admin } = getSidebarModules()

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-brand rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-brand bg-clip-text text-transparent">
                  Fashion Blue
                </h1>
                <p className="text-xs text-gray-500">Gestión</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 space-y-1">
            {/* Módulos principales */}
            {main.map((module) => {
              const Icon = iconMap[module.icon] || Package
              const active = isActive(module.path)
              
              return (
                <Link
                  key={module.key}
                  to={module.path}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${active
                      ? 'bg-gradient-brand text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  {module.name}
                </Link>
              )
            })}
            
            {/* Sección de Administración */}
            {admin.length > 0 && (
              <>
                <div className="pt-4 pb-2">
                  <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Administración
                  </p>
                </div>
                {admin.map((module) => {
                  const Icon = iconMap[module.icon] || Shield
                  const active = isActive(module.path)
                  
                  return (
                    <Link
                      key={module.key}
                      to={module.path}
                      className={`
                        group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                        ${active
                          ? 'bg-gradient-brand text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`} />
                      {module.name}
                    </Link>
                  )
                })}
              </>
            )}
          </nav>

          {/* User section */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-3 p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <div className={`lg:hidden ${sidebarOpen ? 'fixed inset-0 z-40' : ''}`}>
        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
            fixed inset-y-0 left-0 flex flex-col w-64 bg-white transform transition-transform duration-300 ease-in-out z-50
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-brand bg-clip-text text-transparent">
                Fashion Blue
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {/* Módulos principales */}
            {main.map((module) => {
              const Icon = iconMap[module.icon] || Package
              const active = isActive(module.path)
              
              return (
                <Link
                  key={module.key}
                  to={module.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${active
                      ? 'bg-gradient-brand text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} />
                  {module.name}
                </Link>
              )
            })}
            
            {/* Sección de Administración */}
            {admin.length > 0 && (
              <>
                <div className="pt-4 pb-2">
                  <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Administración
                  </p>
                </div>
                {admin.map((module) => {
                  const Icon = iconMap[module.icon] || Shield
                  const active = isActive(module.path)
                  
                  return (
                    <Link
                      key={module.key}
                      to={module.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                        ${active
                          ? 'bg-gradient-brand text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} />
                      {module.name}
                    </Link>
                  )
                })}
              </>
            )}
          </nav>

          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-3 p-2 text-gray-400 hover:text-red-500"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar mobile */}
        <div className="sticky top-0 z-10 lg:hidden flex items-center justify-between h-16 bg-white border-b border-gray-200 px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-brand bg-clip-text text-transparent">
              Fashion Blue
            </span>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
