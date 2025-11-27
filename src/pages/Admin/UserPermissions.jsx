import { useState, useEffect } from 'react'
import { Shield, Search, Save, Check, X } from 'lucide-react'
import { authService } from '../../services/authService'
import { permissionService } from '../../services/permissionService'
import { productService } from '../../services/productService'

export default function UserPermissions() {
  const [users, setUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedUser) {
      loadUserPermissions()
    }
  }, [selectedUser])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [usersRes, categoriesRes] = await Promise.all([
        authService.getUsers(),
        productService.getCategories()
      ])
      
      setUsers(usersRes.data || [])
      setCategories(categoriesRes.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const loadUserPermissions = async () => {
    try {
      const response = await permissionService.getUserPermissions(selectedUser.ID)
      const userPerms = response.data || []
      
      // Crear mapa de permisos por categoría
      const permsMap = {}
      userPerms.forEach(p => {
        permsMap[p.category_id] = {
          can_view: p.can_view,
          can_create: p.can_create,
          can_edit: p.can_edit,
          can_delete: p.can_delete
        }
      })
      
      // Crear array con todos las categorías y sus permisos
      const allPerms = categories.map(cat => ({
        category_id: cat.id,
        category_name: cat.name,
        can_view: permsMap[cat.id]?.can_view || false,
        can_create: permsMap[cat.id]?.can_create || false,
        can_edit: permsMap[cat.id]?.can_edit || false,
        can_delete: permsMap[cat.id]?.can_delete || false
      }))
      
      setPermissions(allPerms)
    } catch (error) {
      console.error('Error loading permissions:', error)
    }
  }

  const updatePermission = (categoryId, field, value) => {
    setPermissions(prev => prev.map(p => 
      p.category_id === categoryId
        ? { ...p, [field]: value }
        : p
    ))
  }

  const savePermissions = async () => {
    try {
      setSaving(true)
      
      // Filtrar solo los permisos que tengan al menos una acción permitida
      const activePermissions = permissions
        .filter(p => p.can_view || p.can_create || p.can_edit || p.can_delete)
        .map(p => ({
          category_id: p.category_id,
          can_view: p.can_view,
          can_create: p.can_create,
          can_edit: p.can_edit,
          can_delete: p.can_delete
        }))
      
      await permissionService.setUserPermissions(selectedUser.ID, activePermissions)
      
      setSuccessMessage('Permisos guardados correctamente')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error saving permissions:', error)
      alert('Error al guardar permisos')
    } finally {
      setSaving(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.Email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Permisos
          </h1>
          <p className="text-gray-500 mt-1">
            Administra los permisos de acceso a categorías por usuario
          </p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Usuarios */}
        <div className="lg:col-span-1 card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Seleccionar Usuario
          </h2>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          {/* User List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredUsers.map(user => (
              <button
                key={user.ID}
                onClick={() => setSelectedUser(user)}
                className={`
                  w-full text-left p-3 rounded-lg border transition-colors
                  ${selectedUser?.ID === user.ID
                    ? 'bg-primary-50 border-primary-500'
                    : 'bg-white border-gray-200 hover:border-primary-300'
                  }
                `}
              >
                <div className="font-medium text-gray-900">{user.Name}</div>
                <div className="text-sm text-gray-500">{user.Email}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {user.Role === 'SUPER_ADMIN' ? '🔑 Super Admin' : '👤 Usuario'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Permisos */}
        <div className="lg:col-span-2 card">
          {selectedUser ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Permisos de {selectedUser.Name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedUser.Email}
                  </p>
                </div>
                <button
                  onClick={savePermissions}
                  disabled={saving}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>

              {selectedUser.Role === 'SUPER_ADMIN' && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
                  <p className="text-sm">
                    ⚠️ <strong>Super Admin</strong> tiene acceso completo a todas las categorías por defecto.
                  </p>
                </div>
              )}

              {/* Tabla de Permisos */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ver
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Crear
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Editar
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Eliminar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {permissions.map((perm) => (
                      <tr key={perm.category_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {perm.category_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={perm.can_view}
                            onChange={(e) => updatePermission(perm.category_id, 'can_view', e.target.checked)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={perm.can_create}
                            onChange={(e) => updatePermission(perm.category_id, 'can_create', e.target.checked)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={perm.can_edit}
                            onChange={(e) => updatePermission(perm.category_id, 'can_edit', e.target.checked)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={perm.can_delete}
                            onChange={(e) => updatePermission(perm.category_id, 'can_delete', e.target.checked)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Los permisos se aplican de forma jerárquica. 
                  Si un usuario no tiene permiso de "Ver", no podrá realizar ninguna otra acción en esa categoría.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Selecciona un usuario para gestionar sus permisos
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
