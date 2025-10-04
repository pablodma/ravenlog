'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit2, Trash2, Eye, Copy, Settings } from 'lucide-react'
import toast from 'react-hot-toast'

interface Field {
  id: string
  name: string
  slug: string
  type: string
  description: string | null
  is_active: boolean
  created_at: string
}

const FIELD_TYPES = [
  { value: 'text', label: 'Texto', description: 'Campo de texto simple' },
  { value: 'textarea', label: 'Área de texto', description: 'Campo de texto multilínea' },
  { value: 'email', label: 'Email', description: 'Campo de correo electrónico' },
  { value: 'number', label: 'Número', description: 'Campo numérico' },
  { value: 'select', label: 'Selección', description: 'Lista desplegable' },
  { value: 'checkbox', label: 'Casilla', description: 'Casilla de verificación' },
  { value: 'radio', label: 'Radio', description: 'Botones de radio' },
  { value: 'date', label: 'Fecha', description: 'Selector de fecha' },
  { value: 'datetime', label: 'Fecha y hora', description: 'Selector de fecha y hora' },
  { value: 'time', label: 'Hora', description: 'Selector de hora' },
  { value: 'file', label: 'Archivo', description: 'Subida de archivo' },
  { value: 'password', label: 'Contraseña', description: 'Campo de contraseña' },
  { value: 'url', label: 'URL', description: 'Campo de URL' },
  { value: 'tel', label: 'Teléfono', description: 'Campo de teléfono' },
  { value: 'color', label: 'Color', description: 'Selector de color' },
  { value: 'range', label: 'Rango', description: 'Control deslizante' },
  { value: 'boolean', label: 'Booleano', description: 'Verdadero/Falso' },
  { value: 'code', label: 'Código', description: 'Editor de código' },
  { value: 'country', label: 'País', description: 'Selector de país' },
  { value: 'timezone', label: 'Zona horaria', description: 'Selector de zona horaria' }
]

export default function FieldsManager() {
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingField, setEditingField] = useState<Field | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: '',
    description: ''
  })

  useEffect(() => {
    fetchFields()
  }, [])

  const fetchFields = async () => {
    try {
      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setFields(data || [])
    } catch (error: any) {
      console.error('Error fetching fields:', error)
      toast.error('Error al cargar campos')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const handleSlugChange = (slug: string) => {
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setFormData(prev => ({
      ...prev,
      slug: cleanSlug
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.slug.trim() || !formData.type) {
      toast.error('Todos los campos requeridos deben ser completados')
      return
    }

    try {
      if (editingField) {
        // Update existing field
        const { error } = await supabase
          .from('fields')
          .update({
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            type: formData.type,
            description: formData.description.trim() || null
          })
          .eq('id', editingField.id)

        if (error) throw error

        setFields(fields.map(f => 
          f.id === editingField.id 
            ? { ...f, name: formData.name.trim(), slug: formData.slug.trim(), type: formData.type, description: formData.description.trim() || null }
            : f
        ))
        toast.success('Campo actualizado correctamente')
      } else {
        // Create new field
        const { error } = await supabase
          .from('fields')
          .insert({
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            type: formData.type,
            description: formData.description.trim() || null
          })

        if (error) throw error

        toast.success('Campo creado correctamente')
        fetchFields()
      }

      setShowCreateForm(false)
      setEditingField(null)
      setFormData({ name: '', slug: '', type: '', description: '' })
    } catch (error: any) {
      console.error('Error saving field:', error)
      if (error.code === '23505') {
        toast.error('El slug ya existe. Por favor, elige otro.')
      } else {
        toast.error('Error al guardar el campo')
      }
    }
  }

  const handleEdit = (field: Field) => {
    setEditingField(field)
    setFormData({
      name: field.name,
      slug: field.slug,
      type: field.type,
      description: field.description || ''
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (field: Field) => {
    if (!confirm(`¿Estás seguro de eliminar el campo "${field.name}"?`)) return

    try {
      const { error } = await supabase
        .from('fields')
        .delete()
        .eq('id', field.id)

      if (error) throw error

      setFields(fields.filter(f => f.id !== field.id))
      toast.success('Campo eliminado correctamente')
    } catch (error: any) {
      console.error('Error deleting field:', error)
      toast.error('Error al eliminar el campo')
    }
  }

  const toggleActive = async (field: Field) => {
    try {
      const { error } = await supabase
        .from('fields')
        .update({ is_active: !field.is_active })
        .eq('id', field.id)

      if (error) throw error

      setFields(fields.map(f => 
        f.id === field.id ? { ...f, is_active: !f.is_active } : f
      ))
      
      toast.success(`Campo ${!field.is_active ? 'activado' : 'desactivado'} correctamente`)
    } catch (error: any) {
      console.error('Error toggling field status:', error)
      toast.error('Error al cambiar el estado del campo')
    }
  }

  const getFieldTypeLabel = (type: string) => {
    const fieldType = FIELD_TYPES.find(ft => ft.value === type)
    return fieldType ? fieldType.label : type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando campos...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Gestión de Campos</h2>
          <p className="text-sm text-muted-foreground">
            Crea y gestiona campos reutilizables para formularios
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Crear Campo
        </button>
      </div>

      {/* Fields List */}
      {fields.length > 0 ? (
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tipo
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
                {fields.map((field) => (
                  <tr key={field.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">{field.name}</div>
                      {field.description && (
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {field.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">{field.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                        {getFieldTypeLabel(field.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        field.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {field.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(field)}
                          className="text-primary hover:text-primary/80"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleActive(field)}
                          className="text-muted-foreground hover:text-foreground"
                          title={field.is_active ? 'Desactivar' : 'Activar'}
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(field)}
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
            <Settings className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No hay campos creados
          </h3>
          <p className="text-muted-foreground mb-6">
            Crea tu primer campo para comenzar a construir formularios
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus className="h-5 w-5" />
            Crear Primer Campo
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
                  {editingField ? 'Editar Campo' : 'Crear Campo'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingField(null)
                    setFormData({ name: '', slug: '', type: '', description: '' })
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      placeholder="Nombre del campo"
                      required
                    />
                    <p className="mt-1 text-sm text-muted-foreground">
                      El nombre del campo que se mostrará al usuario
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Slug *
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      placeholder="nombre_del_campo"
                      required
                    />
                    <p className="mt-1 text-sm text-muted-foreground">
                      Se usará como clave del campo. Caracteres permitidos: 0-9, a-z, A-Z, _
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tipo *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    {FIELD_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-muted-foreground">
                    El tipo de campo determina cómo se comportará
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
                    placeholder="Descripción opcional del campo"
                  />
                  <p className="mt-1 text-sm text-muted-foreground">
                    Una descripción breve del campo
                  </p>
                </div>

                <div className="flex gap-3 pt-6 border-t border-border">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {editingField ? 'Actualizar Campo' : 'Crear Campo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setEditingField(null)
                      setFormData({ name: '', slug: '', type: '', description: '' })
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




