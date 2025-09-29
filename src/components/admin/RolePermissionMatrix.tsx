import { useState, useEffect } from 'react'
import { X, Save, RotateCcw } from 'lucide-react'
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
        (supabase as any).from('roles').select('*').order('name'),
        (supabase as any).from('permissions').select('*').order('category', { ascending: true }).order('name'),
        (supabase as any).from('role_permissions').select('role_id, permission_id')
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

  const hasPermission = (roleId: string, permissionId: string) => {
    return rolePermissions.some(rp => rp.role_id === roleId && rp.permission_id === permissionId)
  }

  const togglePermission = (roleId: string, permissionId: string) => {
    const key = `${roleId}-${permissionId}`
    const newChanges = new Set(changes)
    
    if (hasPermission(roleId, permissionId)) {
      // Remover permiso
      setRolePermissions(prev => prev.filter(rp => !(rp.role_id === roleId && rp.permission_id === permissionId)))
    } else {
      // Agregar permiso
      setRolePermissions(prev => [...prev, { role_id: roleId, permission_id: permissionId }])
    }
    
    newChanges.add(key)
    setChanges(newChanges)
  }

  const saveChanges = async () => {
    setSaving(true)
    try {
      // Eliminar todas las asignaciones existentes
      await (supabase as any).from('role_permissions').delete().neq('role_id', 'dummy')
      
      // Insertar las nuevas asignaciones
      if (rolePermissions.length > 0) {
        const { error } = await (supabase as any)
          .from('role_permissions')
          .insert(rolePermissions)
        
        if (error) throw error
      }
      
      toast.success('Permisos actualizados exitosamente')
      setChanges(new Set())
    } catch (error: any) {
      console.error('Error saving permissions:', error)
      toast.error(error.message || 'Error al guardar permisos')
    } finally {
      setSaving(false)
    }
  }

  const resetChanges = () => {
    fetchData()
    setChanges(new Set())
  }

  // Función para obtener nombre amigable del permiso
  const getFriendlyPermissionName = (name: string) => {
    const permissionNames: Record<string, string> = {
      // Reclutamiento
      'recruitment.process_applications': 'Procesar Solicitudes',
      'recruitment.review_applications': 'Revisar Aplicaciones',
      'recruitment.create_forms': 'Crear Formularios',
      'recruitment.manage_forms': 'Gestionar Formularios',
      
      // Personal
      'personnel.move_units': 'Mover Entre Unidades',
      'personnel.promote_demote': 'Promover/Degradar',
      'personnel.manage_profiles': 'Gestionar Perfiles',
      'personnel.discharge': 'Dar de Baja',
      'personnel.assign_callsigns': 'Asignar Callsigns',
      'personnel.manage_status': 'Cambiar Estado',
      
      // Rangos y Unidades
      'ranks.create': 'Crear Rangos',
      'ranks.modify': 'Modificar Rangos',
      'ranks.delete': 'Eliminar Rangos',
      'units.create': 'Crear Unidades',
      'units.modify': 'Modificar Unidades',
      'units.delete': 'Eliminar Unidades',
      
      // Medallas
      'medals.create': 'Crear Medallas',
      'medals.modify': 'Modificar Medallas',
      'medals.delete': 'Eliminar Medallas',
      'medals.assign': 'Asignar Medallas',
      'medals.revoke': 'Revocar Medallas',
      
      // Eventos
      'events.create': 'Crear Eventos',
      'events.modify': 'Modificar Eventos',
      'events.delete': 'Eliminar Eventos',
      'events.respond': 'Responder Eventos',
      'events.manage_responses': 'Gestionar Respuestas',
      'events.schedule_mandatory': 'Eventos Obligatorios',
      
      // Entrenamiento
      'certifications.create': 'Crear Certificaciones',
      'certifications.modify': 'Modificar Certificaciones',
      'certifications.assign': 'Asignar Certificaciones',
      'certifications.revoke': 'Revocar Certificaciones',
      'training.schedule': 'Programar Entrenamientos',
      'training.evaluate': 'Evaluar Entrenamientos',
      
      // Logs y Reportes
      'logs.view_all': 'Ver Todos los Logs',
      'logs.manage_dcs': 'Gestionar DCS',
      'reports.generate': 'Generar Reportes',
      'reports.view_analytics': 'Ver Analíticas',
      'audit.view_logs': 'Logs de Auditoría',
      
      // Administración
      'admin.manage_roles': 'Gestionar Roles',
      'admin.assign_roles': 'Asignar Roles',
      'admin.manage_permissions': 'Gestionar Permisos',
      'admin.system_settings': 'Configuraciones',
      'admin.backup_restore': 'Backup/Restaurar',
      
      // Discord y Comunicaciones
      'discord.manage_integration': 'Gestionar Discord',
      'discord.sync_roles': 'Sincronizar Roles',
      'communications.send_announcements': 'Enviar Anuncios',
      'communications.moderate': 'Moderar Chat',
      
      // Operaciones
      'operations.plan_missions': 'Planificar Misiones',
      'operations.assign_roles': 'Asignar Roles Misión',
      'operations.debrief': 'Realizar Debriefings',
      'operations.manage_loadouts': 'Gestionar Loadouts'
    }
    
    return permissionNames[name] || name
  }

  // Agrupar permisos por categoría
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category].push(permission)
    return acc
  }, {} as Record<string, typeof permissions>)

  const categoryNames: Record<string, string> = {
    recruitment: 'Reclutamiento',
    personnel: 'Personal',
    ranks: 'Rangos',
    units: 'Unidades', 
    medals: 'Medallas',
    events: 'Eventos',
    training: 'Entrenamiento',
    logs: 'Logs',
    reports: 'Reportes',
    audit: 'Auditoría',
    admin: 'Administración',
    discord: 'Discord',
    communications: 'Comunicaciones',
    operations: 'Operaciones'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Matriz de Roles y Permisos</h2>
          <p className="text-gray-600">Asignar permisos específicos a cada rol</p>
        </div>
        
        {changes.size > 0 && (
          <div className="flex gap-2">
            <button
              onClick={resetChanges}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Descartar
            </button>
            <button
              onClick={saveChanges}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Guardando...' : `Guardar (${changes.size})`}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
          <div key={category} className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {categoryNames[category] || category} ({categoryPermissions.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-48">
                      Rol
                    </th>
                    {categoryPermissions.map((permission) => (
                      <th
                        key={permission.id}
                        className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32"
                      >
                        <div className="text-center" title={permission.description}>
                          {getFriendlyPermissionName(permission.name)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roles.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-3 w-3 rounded-full mr-3" style={{ backgroundColor: role.color }}></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{role.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-32">{role.description}</div>
                          </div>
                        </div>
                      </td>
                      {categoryPermissions.map((permission) => (
                        <td key={permission.id} className="px-3 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={hasPermission(role.id, permission.id)}
                            onChange={() => togglePermission(role.id, permission.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(groupedPermissions).length === 0 && (
        <div className="text-center py-12">
          <X className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No hay permisos configurados aún</p>
          <p className="text-sm text-gray-400">
            Ejecuta el script de permisos en Supabase para crear el sistema de permisos
          </p>
        </div>
      )}
    </div>
  )
}