'use client'

import { useState, useEffect } from 'react'
import { Save, Send, FileText, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useActiveForms, useRecruitmentForms, useMyApplication, useSubmitApplication } from '@/hooks/useRecruitmentData'

interface FormField {
  id: string
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'email'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

export default function ApplicationFormOptimized() {
  const { profile } = useAuth()
  const [formData, setFormData] = useState<Record<string, any>>({})
  
  // React Query hooks - Con caché automático
  const { data: forms, isLoading: formsLoading } = useRecruitmentForms()
  const { data: existingApplication, isLoading: appLoading } = useMyApplication()
  const submitMutation = useSubmitApplication()

  const selectedForm = forms?.[0] // Auto-seleccionar primer formulario de reclutamiento

  // Cargar datos existentes si hay aplicación pendiente
  useEffect(() => {
    if (existingApplication?.status === 'pending' && existingApplication.form_data) {
      setFormData(existingApplication.form_data)
    }
  }, [existingApplication])

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
  }

  const validateForm = () => {
    if (!selectedForm || !Array.isArray(selectedForm.fields)) return false
    for (const field of selectedForm.fields) {
      if (field.required && (!formData[field.id] || formData[field.id] === '')) {
        return false
      }
    }
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !selectedForm) return

    submitMutation.mutate({
      formId: selectedForm.id,
      formData,
      existingApplicationId: existingApplication?.id,
    })
  }

  const renderField = (field: FormField) => {
    const value = formData[field.id] || ''

    const baseInputClass = "input w-full"

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={baseInputClass}
          />
        )

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className={baseInputClass}
          />
        )

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            className={baseInputClass}
          >
            <option value="">Seleccionar...</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        )

      case 'radio':
        return (
          <div className="space-y-3">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  required={field.required}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-foreground">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'checkbox':
        return (
          <div className="space-y-3">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) ? value.includes(option) : false}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : []
                    if (e.target.checked) {
                      handleFieldChange(field.id, [...currentValues, option])
                    } else {
                      handleFieldChange(field.id, currentValues.filter(v => v !== option))
                    }
                  }}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-foreground">{option}</span>
              </label>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'badge-warning',
      in_review: 'badge-primary',
      approved: 'badge-success',
      rejected: 'badge-danger',
      processed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    }
    return colors[status as keyof typeof colors] || 'badge'
  }

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Pendiente de Revisión',
      in_review: 'En Revisión',
      approved: 'Aprobado - En Proceso',
      rejected: 'Rechazado',
      processed: 'Procesado - ¡Bienvenido al Personal!',
    }
    return texts[status as keyof typeof texts] || status
  }

  const loading = formsLoading || appLoading

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!forms || forms.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No hay formularios disponibles</h3>
        <p className="text-muted-foreground">
          Actualmente no hay formularios de reclutamiento activos.
        </p>
      </div>
    )
  }

  // Si ya hay una solicitud en proceso (no pending ni rejected)
  if (existingApplication && !['pending', 'rejected'].includes(existingApplication.status)) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8">
          <div className="flex items-center gap-4 mb-6">
            <AlertCircle className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-xl">Tu solicitud está siendo procesada</h3>
              <div className="flex items-center gap-2 mt-3">
                <span className={`badge ${getStatusColor(existingApplication.status)}`}>
                  {getStatusText(existingApplication.status)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-6 mt-6">
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Fecha de envío:</strong> {new Date(existingApplication.created_at).toLocaleString('es-ES')}
            </p>
            {existingApplication.reviewed_at && (
              <p className="text-sm text-muted-foreground mb-3">
                <strong>Fecha de revisión:</strong> {new Date(existingApplication.reviewed_at).toLocaleString('es-ES')}
              </p>
            )}
            {existingApplication.review_notes && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border">
                <p className="text-sm font-medium text-foreground mb-2">Notas del revisor:</p>
                <p className="text-sm text-muted-foreground">{existingApplication.review_notes}</p>
              </div>
            )}
          </div>

          {existingApplication.status === 'approved' && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-400">
                ¡Felicitaciones! Tu solicitud ha sido aprobada.
              </p>
            </div>
          )}

          {existingApplication.status === 'processed' && (
            <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-sm text-purple-400">
                ¡Bienvenido al equipo! Ya eres parte del personal activo.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Solicitud de Reclutamiento</h2>
        <p className="text-muted-foreground">Completa el formulario para aplicar a la unidad</p>
      </div>

      {existingApplication?.status === 'rejected' && (
        <div className="card p-6 border-destructive/20 bg-destructive/5">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <h3 className="font-medium text-destructive">Solicitud Anterior Rechazada</h3>
              <p className="text-sm text-muted-foreground mt-1">Puedes enviar una nueva aplicación.</p>
              {existingApplication.review_notes && (
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Motivo:</strong> {existingApplication.review_notes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {existingApplication?.status === 'pending' && (
        <div className="card p-6 border-yellow-500/20 bg-yellow-500/5">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-500">Tienes una solicitud pendiente</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Puedes actualizar tu solicitud antes de que sea revisada.
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedForm && (
        <div className="card p-8">
          <div className="mb-8 text-center">
            <h3 className="text-2xl font-semibold text-foreground mb-3">{selectedForm.title}</h3>
            {selectedForm.description && (
              <p className="text-muted-foreground">{selectedForm.description}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {Array.isArray(selectedForm.fields) && selectedForm.fields.map((field: FormField) => (
              <div key={field.id} className="space-y-3">
                <label className="block text-sm font-medium text-foreground">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}

            <div className="flex justify-center gap-4 pt-8 border-t border-border">
              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="btn-primary px-8 py-3 text-lg flex items-center gap-3 disabled:opacity-50"
              >
                {existingApplication?.status === 'pending' ? (
                  <>
                    <Save className="h-5 w-5" />
                    {submitMutation.isPending ? 'Guardando...' : 'Actualizar Solicitud'}
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    {submitMutation.isPending ? 'Enviando...' : 'Enviar Solicitud'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

