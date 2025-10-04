'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
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

export default function FormPage() {
  const params = useParams()
  const [form, setForm] = useState<Form | null>(null)
  const [fields, setFields] = useState<FormField[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (params.slug) {
      fetchForm()
    }
  }, [params.slug])

  const fetchForm = async () => {
    try {
      setLoading(true)
      
      // Fetch form details
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('slug', params.slug as string)
        .eq('is_active', true)
        .eq('is_public', true)
        .single()

      if (formError) throw formError
      if (!formData) {
        toast.error('Formulario no encontrado')
        return
      }

      setForm(formData)

      // Fetch form fields
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', formData.id)
        .eq('is_active', true)
        .order('display_order')

      if (fieldsError) throw fieldsError
      setFields(fieldsData || [])

    } catch (error: any) {
      console.error('Error fetching form:', error)
      toast.error('Error al cargar el formulario')
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
  }

  const validateForm = () => {
    for (const field of fields) {
      if (field.is_required && (!formData[field.id] || formData[field.id] === '')) {
        toast.error(`El campo "${field.label}" es requerido`)
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Debes estar autenticado para enviar formularios')
        return
      }

      const { error } = await supabase
        .from('form_submissions')
        .insert({
          form_id: form!.id,
          submitted_by: user.id,
          form_data: formData,
          status: 'pending',
          is_read: false
        })

      if (error) throw error

      toast.success('¡Formulario enviado exitosamente! Será revisado pronto.')
      
      // Reset form
      setFormData({})
      
    } catch (error: any) {
      console.error('Error submitting form:', error)
      toast.error('Error al enviar el formulario')
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const value = formData[field.id] || ''

    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={field.field_type}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || ''}
            required={field.is_required}
            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
          />
        )

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || ''}
            required={field.is_required}
            rows={4}
            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
          />
        )

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.is_required}
            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
          >
            <option value="">Seleccionar...</option>
            {field.options?.map((option: string, index: number) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) ? value.includes(option) : false}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : []
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option)
                    handleFieldChange(field.id, newValues)
                  }}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">{option}</span>
              </label>
            ))}
          </div>
        )

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || ''}
            required={field.is_required}
            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
          />
        )
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando formulario...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!form) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Formulario no encontrado</h1>
            <p className="text-muted-foreground mb-6">
              El formulario que buscas no existe o no está disponible
            </p>
            <Link
              href="/forms"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
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
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/forms"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver a Formularios
          </Link>
        </div>

        {/* Form Header */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">{form.name}</h1>
          {form.description && (
            <p className="text-muted-foreground mb-4">{form.description}</p>
          )}
          {form.instructions && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium text-primary mb-1">Instrucciones importantes:</h3>
                  <p className="text-sm text-primary/80">{form.instructions}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map((field) => (
            <div key={field.id} className="bg-card rounded-lg border border-border p-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">
                  {field.label}
                  {field.is_required && <span className="text-destructive ml-1">*</span>}
                </label>
                
                {field.description && (
                  <p className="text-sm text-muted-foreground">{field.description}</p>
                )}
                
                {renderField(field)}
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4" />
                <span>Revisa la información antes de enviar</span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Enviar Formulario
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
