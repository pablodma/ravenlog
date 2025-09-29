import { useState, useEffect } from 'react'
import { Check, X, Save, RotateCcw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Role {
  id: string
  name: string
  description: string
  color: string
  is_system_role: boolean
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface RolePermission {
  role_id: string
  permission_id: string
}

export default function RolePermissionMatrix() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changes, setChanges] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [rolesResponse, permissionsResponse, rolePermissionsResponse] = await Promise.all([
        supabase.from('roles').select('*').order('name'),
        supabase.from('permissions').select('*').order('category', { ascending: true }).order('name'),
        supabase.from('role_permissions').select('role_id, permission_id')
      ])

      if (rolesResponse.error) throw rolesResponse.error
      if (permissionsResponse.error) throw permissionsResponse.error
      if (rolePermissionsResponse.error) throw rolePermissionsResponse.error

      setRoles(rolesResponse.data || [])
      setPermissions(permissionsResponse.data || [])
      setRolePermissions(rolePermissionsResponse.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const hasPermission = (roleId: string, permissionId: string): boolean => {
    return rolePermissions.some(rp => rp.role_id === roleId && rp.permission_id === permissionId)
  }

  const togglePermission = async (roleId: string, permissionId: string) => {
    const key = `${roleId}-${permissionId}`
    const currentlyHas = hasPermission(roleId, permissionId)

    try {
      if (currentlyHas) {
        // Quitar permiso
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', roleId)
          .eq('permission_id', permissionId)

        if (error) throw error

        setRolePermissions(prev => 
          prev.filter(rp => !(rp.role_id === roleId && rp.permission_id === permissionId))
        )
      } else {
        // Agregar permiso
        const { error } = await supabase
          .from('role_permissions')
          .insert([{ role_id: roleId, permission_id: permissionId }])

        if (error) throw error

        setRolePermissions(prev => [
          ...prev,
          { role_id: roleId, permission_id: permissionId }
        ])
      }

      // Marcar como cambio realizado
      setChanges(prev => new Set([...prev, key]))
      
      // Remover el indicador de cambio después de un momento
      setTimeout(() => {
        setChanges(prev => {
          const newChanges = new Set(prev)
          newChanges.delete(key)
          return newChanges
        })
      }, 1000)

    } catch (error: any) {
      console.error('Error toggling permission:', error)
      toast.error(error.message || 'Error al actualizar permiso')
    }
  }

  const saveAll = async () => {
    setSaving(true)
    try {
      // Los cambios se guardan inmediatamente, esto es solo para mostrar feedback
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success('Todos los cambios guardados')
      setChanges(new Set())
    } catch (error: any) {
      toast.error('Error al guardar cambios')
    } finally {
      setSaving(false)
    }
  }

  const resetChanges = () => {
    fetchData()
    setChanges(new Set())
    toast.success('Cambios revertidos')
  }

  // Agrupar permisos por categoría
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (roles.length === 0 || permissions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-gray-500 mb-4">
          {roles.length === 0 
            ? 'Primero debes crear al menos un rol'
            : 'Primero debes crear al menos un permiso'
          }
        </p>
        <p className="text-sm text-gray-400">
          Ve a las pestañas correspondientes para crear roles y permisos
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Matriz de Roles y Permisos</h2>
          <p className="text-gray-600">Asigna permisos específicos a cada rol</p>
        </div>
        <div className="flex items-center gap-2">
          {changes.size > 0 && (
            <button
              onClick={resetChanges}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Revertir
            </button>
          )}
          <button
            onClick={saveAll}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar Todo'}
          </button>
        </div>
      </div>

      {/* Matriz */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 sticky left-0 bg-gray-50 border-r">
                  Rol
                </th>
                {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                  <th
                    key={category}
                    colSpan={categoryPermissions.length}
                    className="px-4 py-4 text-center text-sm font-medium text-gray-900 border-l capitalize"
                  >
                    {category} ({categoryPermissions.length})
                  </th>
                ))}
              </tr>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 sticky left-0 bg-gray-100 border-r">
                  Permisos
                </th>
                {Object.values(groupedPermissions).flat().map((permission) => (
                  <th
                    key={permission.id}
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 min-w-[120px] border-l"
                  >
                    <div className="transform -rotate-45 origin-center whitespace-nowrap">
                      {permission.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white border-r">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: role.color }}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {role.name}
                        </div>
                        <div className="text-xs text-gray-500 max-w-[150px] truncate">
                          {role.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  {Object.values(groupedPermissions).flat().map((permission) => {
                    const hasAccess = hasPermission(role.id, permission.id)
                    const key = `${role.id}-${permission.id}`
                    const hasChanged = changes.has(key)
                    
                    return (
                      <td key={permission.id} className="px-2 py-4 text-center border-l">
                        <button
                          onClick={() => togglePermission(role.id, permission.id)}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                            hasAccess
                              ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
                              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          } ${hasChanged ? 'ring-2 ring-blue-300 ring-opacity-50' : ''}`}
                          title={`${hasAccess ? 'Quitar' : 'Otorgar'} permiso: ${permission.name}`}
                        >
                          {hasAccess ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3 text-gray-400" />
                          )}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leyenda */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Leyenda:</h4>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded border flex items-center justify-center">
              <Check className="h-2 w-2 text-white" />
            </div>
            Permiso otorgado
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-300 rounded flex items-center justify-center">
              <X className="h-2 w-2 text-gray-400" />
            </div>
            Permiso no otorgado
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
            Cambio reciente
          </div>
        </div>
      </div>
    </div>
  )
}
