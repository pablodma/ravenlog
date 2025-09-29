import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Permission {
  id: string
  name: string
  description: string
  category: string
  created_at: string
}

interface PermissionForm {
  name: string
  description: string
  category: string
}

const CATEGORIES = [
  'personnel',
  'operations', 
  'administration',
  'training',
  'reports',
  'system'
]

export default function PermissionManager() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [form, setForm] = useState<PermissionForm>({
    name: '',
    description: '',
    category: 'personnel'
  })

  useEffect(() => {
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      setPermissions(data || [])
    } catch (error) {
      console.error('Error fetching permissions:', error)
      toast.error('Error al cargar permisos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingPermission) {
        // Actualizar permiso existente
        const { error } = await supabase
          .from('permissions')
          .update(form)
          .eq('id', editingPermission.id)

        if (error) throw error
        toast.success('Permiso actualizado exitosamente')
      } else {
        // Crear nuevo permiso
        const { error } = await supabase
          .from('permissions')
          .insert([form])

        if (error) throw error
        toast.success('Permiso creado exitosamente')
      }

      // Resetear formulario y recargar
      resetForm()
      fetchPermissions()
    } catch (error: any) {
      console.error('Error saving permission:', error)
      toast.error(error.message || 'Error al guardar permiso')
    }
  }

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission)
    setForm({
      name: permission.name,
      description: permission.description,
      category: permission.category
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este permiso?')) return

    try {
      const { error } = await supabase
        .from('permissions')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Permiso eliminado exitosamente')
      fetchPermissions()
    } catch (error: any) {
      console.error('Error deleting permission:', error)
      toast.error(error.message || 'Error al eliminar permiso')
    }
  }

  const resetForm = () => {
    setForm({ name: '', description: '', category: 'personnel' })
    setEditingPermission(null)
    setShowForm(false)
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Permisos</h2>
          <p className="text-gray-600">Crear y gestionar permisos del sistema</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Permiso
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingPermission ? 'Editar Permiso' : 'Nuevo Permiso'}
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
                  Nombre del Permiso
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="ej: manage_personnel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe qué permite hacer este permiso..."
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
                {editingPermission ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de permisos por categoría */}
      <div className="space-y-6">
        {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
          <div key={category} className="bg-white rounded-lg border shadow-sm">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold capitalize text-gray-900">
                {category} ({categoryPermissions.length})
              </h3>
            </div>
            <div className="p-6">
              <div className="grid gap-4">
                {categoryPermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex justify-between items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-blue-600">
                          {permission.name}
                        </code>
                      </div>
                      <p className="text-gray-600 text-sm">{permission.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(permission)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(permission.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {permissions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No hay permisos creados aún</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Crear Primer Permiso
          </button>
        </div>
      )}
    </div>
  )
}
