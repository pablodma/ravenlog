'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Plus, Trash2, Edit2, Eye, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Form {
  id: string
  name: string
  slug: string
  description: string | null
  instructions: string | null
  is_public: boolean
  is_active: boolean
}

interface FormField {
  id: string
  form_id: string
  field_type: string
  label: string
  placeholder: string | null
  description: string | null
  is_required: boolean
  options: any
  validation_rules: any
  display_order: number
  is_active: boolean
}

export default function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [form, setForm] = useState<Form | null>(null)
  const [fields, setFields] = useState<FormField[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'form' | 'fields' | 'preview'>('form')

  useEffect(() => {
    fetchForm()
    fetchFields()
  }, [resolvedParams.id])

  const fetchForm = async () => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', resolvedParams.id)
        .single()

      if (error) throw error
      setForm(data)
    } catch (error: any) {
      console.error('Error fetching form:', error)
      toast.error('Error al cargar el formulario')
    }
  }

  const fetchFields = async () => {
    try {
      const { data, error } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', resolvedParams.id)
        .order('display_order')

      if (error) throw error
      setFields(data || [])
    } catch (error: any) {
      console.error('Error fetching fields:', error)
      toast.error('Error al cargar los campos')
    } finally {
      setLoading(false)
    }
  }

  const handleFormUpdate = async (updatedForm: Partial<Form>) => {
    try {
      const { error } = await supabase
        .from('forms')
        .update(updatedForm)
        .eq('id', resolvedParams.id)

      if (error) throw error

      setForm(prev => prev ? { ...prev, ...updatedForm } : null)
      toast.success('Formulario actualizado correctamente')
    } catch (error: any) {
      console.error('Error updating form:', error)
      toast.error('Error al actualizar el formulario')
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando formulario...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!form) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Formulario no encontrado</h1>
              <Link
                href="/admin/forms"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a Formularios
              </Link>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/admin/forms"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Volver a Formularios
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{form.name}</h1>
                <p className="text-sm text-muted-foreground">
                  /{form.slug}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/forms/${form.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  Vista Previa
                </Link>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('form')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'form'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <Edit2 className="h-4 w-4 inline mr-2" />
                Información del Formulario
              </button>
              <button
                onClick={() => setActiveTab('fields')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'fields'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Campos del Formulario
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'preview'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <Eye className="h-4 w-4 inline mr-2" />
                Vista Previa
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'form' && (
            <FormInfoTab form={form} onUpdate={handleFormUpdate} />
          )}
          
          {activeTab === 'fields' && (
            <FormFieldsTab formId={resolvedParams.id} fields={fields} onFieldsChange={setFields} />
          )}
          
          {activeTab === 'preview' && (
            <FormPreviewTab form={form} fields={fields} />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

// Form Info Tab Component
function FormInfoTab({ form, onUpdate }: { form: Form; onUpdate: (data: Partial<Form>) => void }) {
  const [formData, setFormData] = useState({
    name: form.name,
    slug: form.slug,
    description: form.description || '',
    instructions: form.instructions || '',
    is_public: form.is_public,
    is_active: form.is_active
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(formData)
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Instrucciones
          </label>
          <textarea
            value={formData.instructions}
            onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
            rows={4}
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_public}
              onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
              className="h-4 w-4 text-primary focus:ring-ring border-input rounded"
            />
            <span className="ml-2 text-sm text-foreground">Público</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="h-4 w-4 text-primary focus:ring-ring border-input rounded"
            />
            <span className="ml-2 text-sm text-foreground">Activo</span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2 transition-colors"
          >
            <Save className="h-4 w-4" />
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  )
}

// Form Fields Tab Component
function FormFieldsTab({ formId, fields, onFieldsChange }: { 
  formId: string; 
  fields: FormField[]; 
  onFieldsChange: (fields: FormField[]) => void 
}) {
  const [availableFields, setAvailableFields] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddField, setShowAddField] = useState(false)

  useEffect(() => {
    fetchAvailableFields()
  }, [])

  const fetchAvailableFields = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setAvailableFields(data || [])
    } catch (error: any) {
      console.error('Error fetching available fields:', error)
      toast.error('Error al cargar campos disponibles')
    } finally {
      setLoading(false)
    }
  }

  const handleAddField = async (fieldId: string) => {
    try {
      const field = availableFields.find(f => f.id === fieldId)
      if (!field) return

      const { data, error } = await supabase
        .from('form_fields')
        .insert({
          form_id: formId,
          field_id: fieldId,
          field_name: field.slug,
          field_type: field.type,
          label: field.name,
          description: field.description,
          order_index: fields.length + 1
        })
        .select()
        .single()

      if (error) throw error

      onFieldsChange([...fields, data])
      setShowAddField(false)
      toast.success('Campo agregado al formulario')
    } catch (error: any) {
      console.error('Error adding field to form:', error)
      toast.error('Error al agregar campo al formulario')
    }
  }

  const handleRemoveField = async (fieldId: string) => {
    if (!confirm('¿Estás seguro de eliminar este campo del formulario?')) return

    try {
      const { error } = await supabase
        .from('form_fields')
        .delete()
        .eq('id', fieldId)

      if (error) throw error

      onFieldsChange(fields.filter(f => f.id !== fieldId))
      toast.success('Campo eliminado del formulario')
    } catch (error: any) {
      console.error('Error removing field from form:', error)
      toast.error('Error al eliminar campo del formulario')
    }
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Campos del Formulario</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddField(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Agregar Campo
          </button>
          <Link
            href="/admin/settings/fields"
            className="inline-flex items-center gap-2 px-4 py-2 text-muted-foreground bg-muted rounded-lg hover:bg-muted/80"
          >
            <Settings className="h-4 w-4" />
            Gestionar Campos
          </Link>
        </div>
      </div>
      
      {fields.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Plus className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No hay campos agregados
          </h3>
          <p className="text-muted-foreground mb-6">
            Agrega campos para construir tu formulario
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setShowAddField(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Agregar Campo
            </button>
            <Link
              href="/admin/settings/fields"
              className="inline-flex items-center gap-2 px-4 py-2 text-muted-foreground bg-muted rounded-lg hover:bg-muted/80"
            >
              <Settings className="h-4 w-4" />
              Crear Nuevo Campo
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.id} className="border border-border rounded-lg p-4 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-foreground">{field.label}</h3>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                      {field.field_type}
                    </span>
                  </div>
                  {field.description && (
                    <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Clave: {field.label}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRemoveField(field.id)}
                    className="p-2 text-destructive hover:text-destructive/80"
                    title="Eliminar del formulario"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Field Modal */}
      {showAddField && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Agregar Campo al Formulario</h3>
                <button
                  onClick={() => setShowAddField(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : availableFields.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-foreground mb-2">
                    No hay campos disponibles
                  </h4>
                  <p className="text-muted-foreground mb-4">
                    Primero necesitas crear campos en la configuración
                  </p>
                  <Link
                    href="/admin/settings/fields"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                    Crear Primer Campo
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Selecciona un campo para agregar al formulario:
                  </p>
                  <div className="grid gap-3">
                    {availableFields.map((field) => (
                      <button
                        key={field.id}
                        onClick={() => handleAddField(field.id)}
                        className="p-4 border border-border rounded-lg hover:bg-muted/50 text-left transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-foreground">{field.name}</h4>
                            <p className="text-sm text-muted-foreground">{field.slug}</p>
                            {field.description && (
                              <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
                            )}
                          </div>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                            {field.type}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Form Preview Tab Component (placeholder for now)
function FormPreviewTab({ form, fields }: { form: Form; fields: FormField[] }) {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">{form.name}</h1>
          {form.description && (
            <p className="text-muted-foreground mb-4">{form.description}</p>
          )}
          {form.instructions && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-primary mb-2">Instrucciones:</h3>
              <p className="text-primary">{form.instructions}</p>
            </div>
          )}
        </div>

        {fields.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No hay campos agregados aún</p>
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  {field.label}
                  {field.is_required && <span className="text-destructive ml-1">*</span>}
                </label>
                {field.description && (
                  <p className="text-sm text-muted-foreground">{field.description}</p>
                )}
                <input
                  type="text"
                  placeholder={field.placeholder || ''}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-border">
          <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Enviar Formulario
          </button>
        </div>
      </div>
    </div>
  )
}
