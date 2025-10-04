'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit2, Trash2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

interface Role {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
}

export default function RolesManager() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRoles(data || [])
    } catch (error: any) {
      console.error('Error fetching roles:', error)
      toast.error('Error al cargar roles')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('El nombre del rol es requerido')
      return
    }

    try {
      if (editingRole) {
        // Update existing role
        const { error } = await supabase
          .from('roles')
          .update({
            name: formData.name.trim(),
            description: formData.description.trim() || null
          })
          .eq('id', editingRole.id)

        if (error) throw error

        setRoles(roles.map(r => 
          r.id === editingRole.id 
            ? { ...r, name: formData.name.trim(), description: formData.description.trim() || null }
            : r
        ))
        toast.success('Rol actualizado correctamente')
      } else {
        // Create new role
        const { error } = await supabase
          .from('roles')
          .insert({
            name: formData.name.trim(),
            description: formData.description.trim() || null
          })

        if (error) throw error

        toast.success('Rol creado correctamente')
        fetchRoles()
      }

      setShowCreateForm(false)
      setEditingRole(null)
      setFormData({ name: '', description: '' })
    } catch (error: any) {
      console.error('Error saving role:', error)
      toast.error('Error al guardar el rol')
    }
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      description: role.description || ''
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (role: Role) => {
    if (!confirm(`¿Estás seguro de eliminar el rol "${role.name}"?`)) return

    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', role.id)

      if (error) throw error

      setRoles(roles.filter(r => r.id !== role.id))
      toast.success('Rol eliminado correctamente')
    } catch (error: any) {
      console.error('Error deleting role:', error)
      toast.error('Error al eliminar el rol')
    }
  }

  const toggleActive = async (role: Role) => {
    try {
      const { error } = await supabase
        .from('roles')
        .update({ is_active: !role.is_active })
        .eq('id', role.id)

      if (error) throw error

      setRoles(roles.map(r => 
        r.id === role.id ? { ...r, is_active: !r.is_active } : r
      ))
      
      toast.success(`Rol ${!role.is_active ? 'activado' : 'desactivado'} correctamente`)
    } catch (error: any) {
      console.error('Error toggling role status:', error)
      toast.error('Error al cambiar el estado del rol')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando roles...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Gestión de Roles</h2>
          <p className="text-sm text-muted-foreground">
            Crea y gestiona roles del sistema
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Crear Rol
        </button>
      </div>

      {/* Roles List */}
      {roles.length > 0 ? (
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Descripción
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
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-sm font-medium text-foreground">{role.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground max-w-xs truncate">
                        {role.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        role.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {role.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(role)}
                          className="text-primary hover:text-primary/80"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleActive(role)}
                          className="text-muted-foreground hover:text-foreground"
                          title={role.is_active ? 'Desactivar' : 'Activar'}
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(role)}
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
            <Shield className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No hay roles creados
          </h3>
          <p className="text-muted-foreground mb-6">
            Crea tu primer rol para comenzar a gestionar permisos
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus className="h-5 w-5" />
            Crear Primer Rol
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
                  {editingRole ? 'Editar Rol' : 'Crear Rol'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingRole(null)
                    setFormData({ name: '', description: '' })
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
                    placeholder="Nombre del rol"
                    required
                  />
                  <p className="mt-1 text-sm text-muted-foreground">
                    El nombre del rol que se mostrará en el sistema
                  </p>
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
                    placeholder="Descripción del rol"
                  />
                  <p className="mt-1 text-sm text-muted-foreground">
                    Una descripción del rol y sus responsabilidades
                  </p>
                </div>

                <div className="flex gap-3 pt-6 border-t border-border">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {editingRole ? 'Actualizar Rol' : 'Crear Rol'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setEditingRole(null)
                      setFormData({ name: '', description: '' })
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