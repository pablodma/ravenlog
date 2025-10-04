'use client'

import { useState, useEffect } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Role {
  id: string
  name: string
  description: string
  is_system: boolean
  is_active: boolean
  created_at: string
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
  action: string
  resource: string
}

interface UserRole {
  id: string
  user_id: string
  role_id: string
  assigned_at: string
  expires_at?: string
  is_active: boolean
  user: {
    id: string
    email: string
    full_name?: string
  }
  role: Role
}

export default function RoleManager() {
  const { isAdmin, canManageRoles } = usePermissions()
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'assignments'>('roles')

  // Verificar permisos
  if (!isAdmin() && !canManageRoles()) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">No tienes permisos para gestionar roles.</p>
      </div>
    )
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('name')

      if (rolesError) throw rolesError

      // Fetch permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('permissions')
        .select('*')
        .order('category', { ascending: true })

      if (permissionsError) throw permissionsError

      // Fetch user roles
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select(`
          *,
          user:profiles!user_roles_user_id_fkey(id, email, full_name),
          role:roles!user_roles_role_id_fkey(*)
        `)
        .order('assigned_at', { ascending: false })

      if (userRolesError) throw userRolesError

      setRoles(rolesData || [])
      setPermissions(permissionsData || [])
      setUserRoles(userRolesData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const createRole = async (name: string, description: string) => {
    try {
      const { error } = await supabase
        .from('roles')
        .insert({
          name,
          description,
          is_system: false,
          is_active: true
        })

      if (error) throw error

      toast.success('Rol creado exitosamente')
      fetchData()
    } catch (error) {
      console.error('Error creating role:', error)
      toast.error('Error al crear el rol')
    }
  }

  const assignRoleToUser = async (userId: string, roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleId,
          assigned_at: new Date().toISOString(),
          is_active: true
        })

      if (error) throw error

      toast.success('Rol asignado exitosamente')
      fetchData()
    } catch (error) {
      console.error('Error assigning role:', error)
      toast.error('Error al asignar el rol')
    }
  }

  const removeRoleFromUser = async (userRoleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('id', userRoleId)

      if (error) throw error

      toast.success('Rol removido exitosamente')
      fetchData()
    } catch (error) {
      console.error('Error removing role:', error)
      toast.error('Error al remover el rol')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Gestión de Roles y Permisos
          </h3>
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('roles')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'roles'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Roles
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'permissions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Permisos
              </button>
              <button
                onClick={() => setActiveTab('assignments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'assignments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Asignaciones
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="mt-6">
            {activeTab === 'roles' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-medium text-gray-900">Roles del Sistema</h4>
                  <button
                    onClick={() => {
                      const name = prompt('Nombre del rol:')
                      const description = prompt('Descripción del rol:')
                      if (name && description) {
                        createRole(name, description)
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Crear Rol
                  </button>
                </div>
                
                <div className="grid gap-4">
                  {roles.map((role) => (
                    <div key={role.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900">{role.name}</h5>
                          <p className="text-sm text-gray-600">{role.description}</p>
                          <div className="mt-2 flex space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              role.is_system ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {role.is_system ? 'Sistema' : 'Personalizado'}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              role.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {role.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Permisos del Sistema</h4>
                
                <div className="grid gap-4">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900">{permission.name}</h5>
                          <p className="text-sm text-gray-600">{permission.description}</p>
                          <div className="mt-2 flex space-x-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {permission.category}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {permission.action}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {permission.resource}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Asignaciones de Roles</h4>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rol
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Asignado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userRoles.map((userRole) => (
                        <tr key={userRole.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {userRole.user?.full_name || 'Sin nombre'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {userRole.user?.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {userRole.role?.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(userRole.assigned_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              userRole.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {userRole.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {userRole.is_active && (
                              <button
                                onClick={() => removeRoleFromUser(userRole.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Remover
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}