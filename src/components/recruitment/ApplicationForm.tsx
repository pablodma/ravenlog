'use client'

import { useState, useEffect } from 'react'
import { Save, Send, FileText, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface FormField {
  id: string
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'email'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

interface RecruitmentForm {
  id: string
  title: string
  description: string | null
  fields: FormField[]
  is_active: boolean
}

interface Application {
  id: string
  status: string
  form_data: Record<string, any>
  created_at: string
  reviewed_at?: string
  review_notes?: string
}

export default function ApplicationForm() {
  const { profile } = useAuth()
  const [forms, setForms] = useState<RecruitmentForm[]>([])
  const [selectedForm, setSelectedForm] = useState<RecruitmentForm | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [existingApplication, setExistingApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchActiveForms()
    if (profile) {
      checkExistingApplication()
    }
  }, [profile])

  const fetchActiveForms = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('recruitment_forms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setForms(data || [])
      
      // Auto-seleccionar el primer formulario activo
      if (data && data.length > 0) {
        setSelectedForm(data[0])
      }
    } catch (error) {
      console.error('Error fetching forms:', error)
      toast.error('Error al cargar formularios')
    } finally {
      setLoading(false)
    }
  }

  const checkExistingApplication = async () => {
    try {
      const { data } = await (supabase as any)
        .from('applications')
        .select('*')
        .eq('applicant_id', profile?.id)
        .in('status', ['pending', 'in_review', 'approved'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setExistingApplication(data)
        // Si hay una aplicación pendiente, cargar sus datos
        if (data.status === 'pending' && data.form_data) {
          setFormData(data.form_data)
        }
      }
    } catch (error: any) {
      // Error PGRST116 significa que no hay aplicaciones, lo cual está bien
      if (error.code !== 'PGRST116') {
        console.error('Error checking application:', error)
      }
    }
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const validateForm = () => {
    if (!selectedForm) return false

    for (const field of selectedForm.fields) {
      if (field.required && (!formData[field.id] || formData[field.id] === '')) {
        toast.error(`El campo "${field.label}" es requerido`)
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    if (!selectedForm || !profile) return

    setSubmitting(true)
    try {
      const applicationData = {
        applicant_id: profile.id,
        form_id: selectedForm.id,
        form_data: formData,
        status: 'pending'
      }

      if (existingApplication && existingApplication.status === 'pending') {
        // Actualizar aplicación existente
        const { error } = await (supabase as any)
          .from('applications')
          .update({ form_data: formData })
          .eq('id', existingApplication.id)

        if (error) throw error
        toast.success('Aplicación actualizada exitosamente')
      } else {
        // Crear nueva aplicación
        const { error } = await (supabase as any)
          .from('applications')
          .insert([applicationData])

        if (error) throw error
        toast.success('¡Aplicación enviada exitosamente! Será revisada pronto.')
      }

      checkExistingApplication()
    } catch (error: any) {
      console.error('Error submitting application:', error)
      toast.error(error.message || 'Error al enviar aplicación')
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const value = formData[field.id] || ''

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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar...</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  required={field.required}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                {option}
              </label>
            ))}
          </div>
        )

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center">
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
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                {option}
              </label>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_review': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'processed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente de Revisión'
      case 'in_review': return 'En Revisión'
      case 'approved': return 'Aprobado - En Proceso'
      case 'rejected': return 'Rechazado'
      case 'processed': return 'Procesado - ¡Bienvenido al Personal!'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (forms.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay formularios disponibles</h3>
        <p className="text-gray-600">
          Actualmente no hay formularios de reclutamiento activos. 
          Contacta con un administrador para más información.
        </p>
      </div>
    )
  }

  // Si ya hay una solicitud en proceso que NO es pending
  if (existingApplication && !['pending', 'rejected'].includes(existingApplication.status)) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-8 w-8 text-blue-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Tu solicitud está siendo procesada</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(existingApplication.status)}`}>
                  {getStatusText(existingApplication.status)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Fecha de envío:</strong> {new Date(existingApplication.created_at).toLocaleString('es-ES')}
            </p>
            {existingApplication.reviewed_at && (
              <p className="text-sm text-gray-600 mb-2">
                <strong>Fecha de revisión:</strong> {new Date(existingApplication.reviewed_at).toLocaleString('es-ES')}
              </p>
            )}
            {existingApplication.review_notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-1">Notas del revisor:</p>
                <p className="text-sm text-gray-700">{existingApplication.review_notes}</p>
              </div>
            )}
          </div>

          {existingApplication.status === 'approved' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ¡Felicitaciones! Tu solicitud ha sido aprobada. Un administrador te asignará un rango y unidad pronto.
              </p>
            </div>
          )}

          {existingApplication.status === 'processed' && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">
                ¡Bienvenido al equipo! Tu solicitud ha sido procesada completamente. Ya eres parte del personal activo.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Solicitud de Reclutamiento</h2>
        <p className="text-gray-600">Completa el formulario para aplicar a la unidad</p>
      </div>

      {/* Estado de aplicación existente */}
      {existingApplication && existingApplication.status === 'rejected' && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div className="flex-1">
              <h3 className="font-medium text-red-900">Solicitud Anterior Rechazada</h3>
              <p className="text-sm text-red-700 mt-1">
                Tu solicitud anterior fue rechazada. Puedes enviar una nueva aplicación.
              </p>
              {existingApplication.review_notes && (
                <p className="text-sm text-red-700 mt-2">
                  <strong>Motivo:</strong> {existingApplication.review_notes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {existingApplication && existingApplication.status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-900">Tienes una solicitud pendiente</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Puedes actualizar tu solicitud antes de que sea revisada.
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedForm && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedForm.title}</h3>
            {selectedForm.description && (
              <p className="text-gray-600">{selectedForm.description}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {selectedForm.fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}

            <div className="flex justify-end gap-3 pt-6 border-t">
              {existingApplication?.status === 'pending' ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {submitting ? 'Guardando...' : 'Actualizar Solicitud'}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
