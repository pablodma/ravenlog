import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, FileText, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface FormField {
  id: string
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'email'
  label: string
  placeholder?: string
  required: boolean
  options?: string[] // Para select, radio, checkbox
}

interface RecruitmentForm {
  id: string
  title: string
  description: string | null
  fields: FormField[]
  is_active: boolean
  created_by: string
  created_at: string
}

interface FormBuilderForm {
  title: string
  description: string
  fields: FormField[]
  is_active: boolean
}

const FIELD_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'textarea', label: 'Área de texto' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Número' },
  { value: 'select', label: 'Lista desplegable' },
  { value: 'radio', label: 'Opción única' },
  { value: 'checkbox', label: 'Casillas múltiples' }
]

export default function FormBuilder() {
  const [forms, setForms] = useState<RecruitmentForm[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingForm, setEditingForm] = useState<RecruitmentForm | null>(null)
  const [form, setForm] = useState<FormBuilderForm>({
    title: '',
    description: '',
    fields: [],
    is_active: true
  })

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('recruitment_forms')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setForms(data || [])
    } catch (error) {
      console.error('Error fetching forms:', error)
      toast.error('Error al cargar formularios')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('📝 FormBuilder: handleSubmit iniciado', { form, editingForm: !!editingForm })
    
    // Validaciones
    if (!form.title.trim()) {
      toast.error('El título del formulario es obligatorio')
      return
    }
    
    if (form.fields.length === 0) {
      toast.error('Debe agregar al menos un campo al formulario')
      return
    }

    // Validar que todos los campos tengan label
    const invalidFields = form.fields.filter(field => !field.label.trim())
    if (invalidFields.length > 0) {
      toast.error('Todos los campos deben tener una etiqueta')
      return
    }

    // Validar que los campos con opciones tengan al menos una opción válida
    const fieldsWithOptions = form.fields.filter(field => ['select', 'radio', 'checkbox'].includes(field.type))
    const fieldsWithoutOptions = fieldsWithOptions.filter(field => 
      !field.options || field.options.length === 0 || field.options.every(opt => !opt.trim())
    )
    if (fieldsWithoutOptions.length > 0) {
      toast.error('Los campos de selección deben tener al menos una opción válida')
      return
    }

    try {
      // Limpiar opciones vacías antes de guardar
      const cleanedFields = form.fields.map(field => {
        if (['select', 'radio', 'checkbox'].includes(field.type)) {
          return {
            ...field,
            options: field.options?.filter(opt => opt.trim() !== '') || []
          }
        }
        return field
      })

      const formData = {
        ...form,
        fields: JSON.stringify(cleanedFields)
      }

      if (editingForm) {
        const { error } = await (supabase as any)
          .from('recruitment_forms')
          .update(formData)
          .eq('id', editingForm.id)

        if (error) throw error
        console.log('✅ FormBuilder: Formulario actualizado exitosamente')
        toast.success('Formulario actualizado exitosamente')
      } else {
        const { error } = await (supabase as any)
          .from('recruitment_forms')
          .insert([formData])

        if (error) throw error
        console.log('✅ FormBuilder: Formulario creado exitosamente')
        toast.success('Formulario creado exitosamente')
      }

      console.log('🔄 FormBuilder: Reseteando formulario y recargando lista')
      resetForm()
      fetchForms()
    } catch (error: any) {
      console.error('Error saving form:', error)
      toast.error(error.message || 'Error al guardar formulario')
    }
  }

  const handleEdit = (formItem: RecruitmentForm) => {
    setEditingForm(formItem)
    // Asegurar que fields sea un array válido
    const normalizedFields = Array.isArray(formItem.fields) ? formItem.fields : []
    console.log('📝 FormBuilder: Editando formulario:', formItem.title, 'Fields:', normalizedFields)
    setForm({
      title: formItem.title,
      description: formItem.description || '',
      fields: normalizedFields,
      is_active: formItem.is_active
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este formulario?')) return

    try {
      const { error } = await (supabase as any)
        .from('recruitment_forms')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Formulario eliminado exitosamente')
      fetchForms()
    } catch (error: any) {
      console.error('Error deleting form:', error)
      toast.error(error.message || 'Error al eliminar formulario')
    }
  }

  const toggleActive = async (formItem: RecruitmentForm) => {
    try {
      const { error } = await (supabase as any)
        .from('recruitment_forms')
        .update({ is_active: !formItem.is_active })
        .eq('id', formItem.id)

      if (error) throw error
      toast.success(`Formulario ${!formItem.is_active ? 'activado' : 'desactivado'}`)
      fetchForms()
    } catch (error: any) {
      console.error('Error toggling form:', error)
      toast.error('Error al cambiar estado del formulario')
    }
  }

  const addField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      type: 'text',
      label: '',
      placeholder: '',
      required: false,
      options: []
    }
    setForm({ ...form, fields: [...form.fields, newField] })
  }

  const updateField = (index: number, field: FormField) => {
    const newFields = [...form.fields]
    
    // Si se cambia a un tipo que requiere opciones y no las tiene, agregar una opción vacía
    if (['select', 'radio', 'checkbox'].includes(field.type) && (!field.options || field.options.length === 0)) {
      field.options = ['']
    }
    
    // Si se cambia a un tipo que no requiere opciones, limpiarlas
    if (!['select', 'radio', 'checkbox'].includes(field.type)) {
      field.options = []
    }
    
    newFields[index] = field
    setForm({ ...form, fields: newFields })
  }

  const removeField = (index: number) => {
    const newFields = form.fields.filter((_, i) => i !== index)
    setForm({ ...form, fields: newFields })
  }

  const resetForm = () => {
    setForm({ title: '', description: '', fields: [], is_active: true })
    setEditingForm(null)
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Constructor de Formularios</h2>
          <p className="text-gray-600">Crear formularios de reclutamiento personalizados</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Formulario
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingForm ? 'Editar Formulario' : 'Nuevo Formulario'}
            </h3>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del Formulario
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="ej: Formulario de Reclutamiento 2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Formulario activo</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe el propósito de este formulario..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Constructor de campos */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium text-gray-900">Campos del Formulario</h4>
                <button
                  type="button"
                  onClick={addField}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Agregar Campo
                </button>
              </div>

              <div className="space-y-4">
                {(form.fields || []).map((field, index) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Tipo
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(index, { ...field, type: e.target.value as any })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        >
                          {FIELD_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Etiqueta
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(index, { ...field, label: e.target.value })}
                          placeholder="Nombre del campo"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Placeholder
                        </label>
                        <input
                          type="text"
                          value={field.placeholder || ''}
                          onChange={(e) => updateField(index, { ...field, placeholder: e.target.value })}
                          placeholder="Texto de ayuda"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(index, { ...field, required: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-1 text-xs text-gray-700">Requerido</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeField(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {['select', 'radio', 'checkbox'].includes(field.type) && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs font-medium text-gray-700">
                            Opciones
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const newOptions = [...(field.options || []), '']
                              updateField(index, { ...field, options: newOptions })
                            }}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            Agregar Opción
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {(field.options || []).map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(field.options || [])]
                                  newOptions[optionIndex] = e.target.value
                                  updateField(index, { ...field, options: newOptions })
                                }}
                                placeholder={`Opción ${optionIndex + 1}`}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newOptions = (field.options || []).filter((_, i) => i !== optionIndex)
                                  updateField(index, { ...field, options: newOptions })
                                }}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Eliminar opción"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          
                          {(!field.options || field.options.length === 0) && (
                            <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-200 rounded">
                              <p className="text-xs">No hay opciones. Haz clic en "Agregar Opción" para comenzar.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {form.fields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No hay campos agregados. Haz clic en "Agregar Campo" para comenzar.</p>
                </div>
              )}
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
                {editingForm ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de formularios */}
      <div className="grid gap-4">
        {forms.map((formItem) => (
          <div key={formItem.id} className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{formItem.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    formItem.is_active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {formItem.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                {formItem.description && (
                  <p className="text-sm text-gray-600 mb-2">{formItem.description}</p>
                )}
                <p className="text-xs text-gray-500">
                  {formItem.fields.length} campo{formItem.fields.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(formItem)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title={formItem.is_active ? 'Desactivar' : 'Activar'}
                >
                  {formItem.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => handleEdit(formItem)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(formItem.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {forms.length === 0 && !showForm && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No hay formularios creados aún</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Crear Primer Formulario
          </button>
        </div>
      )}
    </div>
  )
}
