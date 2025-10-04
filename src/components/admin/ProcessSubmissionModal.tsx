'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Save, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'


interface FormSubmission {
  id: string
  form_id: string
  submitted_by: string | null
  submitted_by_email: string | null
  submitted_by_name: string | null
  form_data: any
  status: string
  is_read: boolean
  created_at: string
  updated_at: string
  form: {
    id: string
    name: string
    slug: string
  }
}

interface ProcessSubmissionModalProps {
  isOpen: boolean
  onClose: () => void
  submission: FormSubmission | null
  onProcessed: () => void
}

export default function ProcessSubmissionModal({ 
  isOpen, 
  onClose, 
  submission, 
  onProcessed 
}: ProcessSubmissionModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (isOpen && submission) {
      setSelectedStatus(submission.status || '')
      setNotes('')
    }
  }, [isOpen, submission])


  const handleProcess = async () => {
    if (!submission || !selectedStatus) {
      toast.error('Selecciona un estado para procesar')
      return
    }

    setLoading(true)
    try {
      const { error } = await (supabase as any)
        .from('form_submissions')
        .update({
          status: selectedStatus,
          is_read: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', submission.id)

      if (error) throw error

      // Si hay notas, las guardamos en un campo adicional o en una tabla separada
      if (notes.trim()) {
        // Aquí podrías guardar las notas en una tabla separada o en un campo JSON
        console.log('Notas del procesamiento:', notes)
      }

      toast.success('Recepción procesada exitosamente')
      onProcessed()
      onClose()
    } catch (error: any) {
      console.error('Error processing submission:', error)
      toast.error('Error al procesar recepción')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !submission) return null

  const getSubmitterName = (submission: FormSubmission) => {
    if (submission.submitted_by_name) {
      return submission.submitted_by_name
    }
    if (submission.submitted_by_email) {
      return submission.submitted_by_email
    }
    return 'Usuario desconocido'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Procesar Recepción</h3>
            <p className="text-sm text-gray-500">
              Cambia el estado y procesa esta recepción
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Submission Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Información de la Recepción</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Formulario:</span>
                <span className="ml-2 font-medium">{submission.form.name}</span>
              </div>
              <div>
                <span className="text-gray-500">Enviado por:</span>
                <span className="ml-2 font-medium">{getSubmitterName(submission)}</span>
              </div>
              <div>
                <span className="text-gray-500">Fecha:</span>
                <span className="ml-2 font-medium">
                  {new Date(submission.created_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Estado actual:</span>
                <span className="ml-2 font-medium">
                  {submission.status || 'Sin estado'}
                </span>
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nuevo Estado <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar estado...</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobado</option>
              <option value="rejected">Rechazado</option>
              <option value="reviewed">Revisado</option>
              <option value="draft">Borrador</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas del Procesamiento
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Agrega notas sobre el procesamiento de esta recepción..."
            />
          </div>

          {/* Form Data Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Datos del Formulario
            </label>
            <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
              {submission.form_data && Object.keys(submission.form_data).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(submission.form_data).map(([key, value]) => (
                    <div key={key} className="flex">
                      <span className="font-medium text-gray-700 w-1/3">{key}:</span>
                      <span className="text-gray-600 flex-1">{String(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No hay datos del formulario</p>
              )}
            </div>
          </div>

          {/* Warning */}
          {selectedStatus && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">
                    Confirmar Procesamiento
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Al procesar esta recepción, se cambiará su estado y se marcará como leída. 
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleProcess}
            disabled={!selectedStatus || loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Procesando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Procesar Recepción
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
