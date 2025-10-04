'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit2, Trash2, Key } from 'lucide-react'
import toast from 'react-hot-toast'

interface Permission {
  id: string
  name: string
  description: string | null
  resource: string
  action: string
  is_active: boolean
  created_at: string
}

export default function PermissionsManager() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    resource: '',
    action: ''
  })

  const RESOURCES = [
    'users', 'roles', 'permissions', 'forms', 'fields', 'submissions',
    'organization', 'units', 'groups', 'positions', 'ranks', 'specialties',
    'qualifications', 'awards', 'statuses', 'records', 'calendar'
  ]

  const ACTIONS = [
    'create', 'read', 'update', 'delete', 'manage', 'view', 'edit', 'approve'
  ]

  useEffect(() => {
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPermissions(data || [])
    } catch (error: any) {
      console.error('Error fetching permissions:', error)
      toast.error('Error al cargar permisos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.resource || !formData.action) {
      toast.error('Todos los campos requeridos deben ser completados')
      return
    }

    try {
      if (editingPermission) {
        // Update existing permission
        const { error } = await supabase
          .from('permissions')
          .update({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            resource: formData.resource,
            action: formData.action
          })
          .eq('id', editingPermission.id)

        if (error) throw error

        setPermissions(permissions.map(p => 
          p.id === editingPermission.id 
            ? { ...p, name: formData.name.trim(), description: formData.description.trim() || null, resource: formData.resource, action: formData.action }
            : p
        ))
        toast.success('Permiso actualizado correctamente')
      } else {
        // Create new permission
        const { error } = await supabase
          .from('permissions')
          .insert({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            resource: formData.resource,
            action: formData.action
          })

        if (error) throw error

        toast.success('Permiso creado correctamente')
        fetchPermissions()
      }

      setShowCreateForm(false)
      setEditingPermission(null)
      setFormData({ name: '', description: '', resource: '', action: '' })
    } catch (error: any) {
      console.error('Error saving permission:', error)
      toast.error('Error al guardar el permiso')
    }
  }

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission)
    setFormData({
      name: permission.name,
      description: permission.description || '',
      resource: permission.resource,
      action: permission.action
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (permission: Permission) => {
    if (!confirm(`¿Estás seguro de eliminar el permiso "${permission.name}"?`)) return

    try {
      const { error } = await supabase
        .from('permissions')
        .delete()
        .eq('id', permission.id)

      if (error) throw error

      setPermissions(permissions.filter(p => p.id !== permission.id))
      toast.success('Permiso eliminado correctamente')
    } catch (error: any) {
      console.error('Error deleting permission:', error)
      toast.error('Error al eliminar el permiso')
    }
  }

  const toggleActive = async (permission: Permission) => {
    try {
      const { error } = await supabase
        .from('permissions')
        .update({ is_active: !permission.is_active })
        .eq('id', permission.id)

      if (error) throw error

      setPermissions(permissions.map(p => 
        p.id === permission.id ? { ...p, is_active: !p.is_active } : p
      ))
      
      toast.success(`Permiso ${!permission.is_active ? 'activado' : 'desactivado'} correctamente`)
    } catch (error: any) {
      console.error('Error toggling permission status:', error)
      toast.error('Error al cambiar el estado del permiso')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando permisos...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Gestión de Permisos</h2>
          <p className="text-sm text-muted-foreground">
            Crea y gestiona permisos específicos del sistema
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Crear Permiso
        </button>
      </div>

      {/* Permissions List */}
      {permissions.length > 0 ? (
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Recurso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {permissions.map((permission) => (
                  <tr key={permission.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Key className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{permission.name}</div>
                          {permission.description && (
                            <div className="text-sm text-muted-foreground max-w-xs truncate">
                              {permission.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {permission.resource}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {permission.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        permission.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {permission.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(permission)}
                          className="text-primary hover:text-primary/80"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleActive(permission)}
                          className="text-muted-foreground hover:text-foreground"
                          title={permission.is_active ? 'Desactivar' : 'Activar'}
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(permission)}
                          className="text-destructive hover:text-destructive/80"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Key className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No hay permisos creados
          </h3>
          <p className="text-muted-foreground mb-6">
            Crea tu primer permiso para comenzar a gestionar accesos
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus className="h-5 w-5" />
            Crear Primer Permiso
          </button>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {editingPermission ? 'Editar Permiso' : 'Crear Permiso'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingPermission(null)
                    setFormData({ name: '', description: '', resource: '', action: '' })
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="Nombre del permiso"
                    required
                  />
                  <p className="mt-1 text-sm text-muted-foreground">
                    El nombre del permiso que se mostrará en el sistema
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Recurso *
                    </label>
                    <select
                      value={formData.resource}
                      onChange={(e) => setFormData(prev => ({ ...prev, resource: e.target.value }))}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      required
                    >
                      <option value="">Seleccionar recurso</option>
                      {RESOURCES.map((resource) => (
                        <option key={resource} value={resource}>
                          {resource}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-sm text-muted-foreground">
                      El recurso al que aplica el permiso
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Acción *
                    </label>
                    <select
                      value={formData.action}
                      onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      required
                    >
                      <option value="">Seleccionar acción</option>
                      {ACTIONS.map((action) => (
                        <option key={action} value={action}>
                          {action}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-sm text-muted-foreground">
                      La acción que permite realizar
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    rows={3}
                    placeholder="Descripción del permiso"
                  />
                  <p className="mt-1 text-sm text-muted-foreground">
                    Una descripción del permiso y su propósito
                  </p>
                </div>

                <div className="flex gap-3 pt-6 border-t border-border">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {editingPermission ? 'Actualizar Permiso' : 'Crear Permiso'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setEditingPermission(null)
                      setFormData({ name: '', description: '', resource: '', action: '' })
                    }}
                    className="px-4 py-2 text-muted-foreground bg-muted rounded-lg hover:bg-muted/80"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}




