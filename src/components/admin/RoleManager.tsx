import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Users, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Role {
  id: string
  name: string
  description: string
  color: string
  is_system_role: boolean
  created_at: string
  user_count?: number
}

interface RoleForm {
  name: string
  description: string
  color: string
}

const PRESET_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange  
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#1F2937', // Dark Gray
]

export default function RoleManager() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [form, setForm] = useState<RoleForm>({
    name: '',
    description: '',
    color: PRESET_COLORS[0]
  })

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      // Obtener roles con conteo de usuarios
      const { data: rolesData, error } = await supabase
        .from('roles')
        .select(`
          *,
          user_count:profiles(count)
        `)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Formatear datos para incluir conteo
      const rolesWithCount = rolesData?.map(role => ({
        ...role,
        user_count: role.user_count?.[0]?.count || 0
      })) || []

      setRoles(rolesWithCount)
    } catch (error) {
      console.error('Error fetching roles:', error)
      toast.error('Error al cargar roles')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingRole) {
        // Actualizar rol existente
        const { error } = await supabase
          .from('roles')
          .update(form)
          .eq('id', editingRole.id)

        if (error) throw error
        toast.success('Rol actualizado exitosamente')
      } else {
        // Crear nuevo rol
        const { error } = await supabase
          .from('roles')
          .insert([{ ...form, is_system_role: false }])

        if (error) throw error
        toast.success('Rol creado exitosamente')
      }

      // Resetear formulario y recargar
      resetForm()
      fetchRoles()
    } catch (error: any) {
      console.error('Error saving role:', error)
      if (error.code === '23505') {
        toast.error('Ya existe un rol con ese nombre')
      } else {
        toast.error(error.message || 'Error al guardar rol')
      }
    }
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    setForm({
      name: role.name,
      description: role.description,
      color: role.color
    })
    setShowForm(true)
  }

  const handleDelete = async (role: Role) => {
    if (role.is_system_role) {
      toast.error('No se pueden eliminar roles del sistema')
      return
    }

    if (role.user_count && role.user_count > 0) {
      toast.error(`No se puede eliminar. Hay ${role.user_count} usuario(s) con este rol`)
      return
    }

    if (!confirm(`¿Estás seguro de eliminar el rol "${role.name}"?`)) return

    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', role.id)

      if (error) throw error
      toast.success('Rol eliminado exitosamente')
      fetchRoles()
    } catch (error: any) {
      console.error('Error deleting role:', error)
      toast.error(error.message || 'Error al eliminar rol')
    }
  }

  const resetForm = () => {
    setForm({ name: '', description: '', color: PRESET_COLORS[0] })
    setEditingRole(null)
    setShowForm(false)
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Roles</h2>
          <p className="text-gray-600">Crear y gestionar roles del sistema</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Rol
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Rol
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="ej: Flight Leader"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color del Rol
                </label>
                <div className="flex gap-2 items-center">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: form.color }}
                  />
                  <select
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {PRESET_COLORS.map(color => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe las responsabilidades de este rol..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingRole ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de roles */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Roles Existentes ({roles.length})
          </h3>
        </div>
        <div className="p-6">
          <div className="grid gap-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Color badge */}
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: role.color }}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{role.name}</h4>
                      {role.is_system_role && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                          <Shield className="h-3 w-3" />
                          Sistema
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{role.description}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Users className="h-3 w-3" />
                      {role.user_count || 0} usuario{(role.user_count || 0) !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(role)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {!role.is_system_role && (
                    <button
                      onClick={() => handleDelete(role)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={role.user_count && role.user_count > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {roles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No hay roles creados aún</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Crear Primer Rol
          </button>
        </div>
      )}
    </div>
  )
}
