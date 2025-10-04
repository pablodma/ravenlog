'use client'

import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Plus, Trash2, Edit2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

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
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando formulario...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!form) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Formulario no encontrado</h1>
            <Link
              href="/forms"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a Formularios
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/forms"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver a Formularios
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{form.name}</h1>
              <p className="mt-2 text-gray-600">
                /{form.slug}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/forms/${form.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200"
              >
                <Eye className="h-4 w-4" />
                Vista Previa
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('form')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'form'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Edit2 className="h-4 w-4 inline mr-2" />
              Información del Formulario
            </button>
            <button
              onClick={() => setActiveTab('fields')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'fields'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Campos del Formulario
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'preview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Información del Formulario</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instrucciones
          </label>
          <textarea
            value={formData.instructions}
            onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_public}
              onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Público</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Activo</span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  )
}

// Form Fields Tab Component (placeholder for now)
function FormFieldsTab({ formId, fields, onFieldsChange }: { 
  formId: string; 
  fields: FormField[]; 
  onFieldsChange: (fields: FormField[]) => void 
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Campos del Formulario</h2>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Agregar Campo
        </button>
      </div>
      
      {fields.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No hay campos agregados aún</p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Agregar Primer Campo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{field.label}</h3>
                  <p className="text-sm text-gray-500">{field.field_type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Form Preview Tab Component (placeholder for now)
function FormPreviewTab({ form, fields }: { form: Form; fields: FormField[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Vista Previa del Formulario</h2>
      
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{form.name}</h1>
          {form.description && (
            <p className="text-gray-600 mb-4">{form.description}</p>
          )}
          {form.instructions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">Instrucciones:</h3>
              <p className="text-blue-800">{form.instructions}</p>
            </div>
          )}
        </div>

        {fields.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No hay campos agregados aún</p>
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.is_required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.description && (
                  <p className="text-sm text-gray-500">{field.description}</p>
                )}
                <input
                  type="text"
                  placeholder={field.placeholder || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Enviar Formulario
          </button>
        </div>
      </div>
    </div>
  )
}
