'use client'

import { useState, useMemo } from 'react'
import { Eye, CheckCircle, XCircle, Clock, User, FileText, MessageSquare } from 'lucide-react'
import { useAllApplications, useUpdateApplicationStatus } from '@/hooks/useRecruitmentData'

export default function ApplicationReviewOptimized() {
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')

  // React Query con caché
  const { data: applications, isLoading } = useAllApplications()
  const updateStatusMutation = useUpdateApplicationStatus()

  // Memoizar aplicación seleccionada para evitar re-renders
  const selectedApplication = useMemo(
    () => applications?.find(app => app.id === selectedApplicationId),
    [applications, selectedApplicationId]
  )

  const handleUpdateStatus = (newStatus: string) => {
    if (!selectedApplicationId) return

    updateStatusMutation.mutate(
      { applicationId: selectedApplicationId, newStatus, notes: reviewNotes },
      {
        onSuccess: () => {
          setSelectedApplicationId(null)
          setReviewNotes('')
        },
      }
    )
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      in_review: 'bg-blue-100 text-blue-800 border-blue-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      processed: 'bg-purple-100 text-purple-800 border-purple-200',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Pendiente',
      in_review: 'En Revisión',
      approved: 'Aprobado',
      rejected: 'Rechazado',
      processed: 'Procesado',
    }
    return texts[status as keyof typeof texts] || status
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <Clock className="h-4 w-4" />,
      in_review: <Eye className="h-4 w-4" />,
      approved: <CheckCircle className="h-4 w-4" />,
      rejected: <XCircle className="h-4 w-4" />,
      processed: <User className="h-4 w-4" />,
    }
    return icons[status as keyof typeof icons] || <FileText className="h-4 w-4" />
  }

  const renderFieldValue = (field: any, value: any) => {
    if (!value) return <span className="text-gray-400">Sin respuesta</span>

    switch (field.type) {
      case 'checkbox':
        return Array.isArray(value) ? value.join(', ') : value
      case 'textarea':
        return (
          <div className="max-w-md">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{value}</p>
          </div>
        )
      default:
        return <span className="text-gray-900">{value}</span>
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Revisión de Aplicaciones</h2>
        <p className="text-gray-600">Revisar y procesar solicitudes de reclutamiento</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de aplicaciones */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Aplicaciones ({applications?.length || 0})
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {applications?.map((application) => (
              <div
                key={application.id}
                onClick={() => setSelectedApplicationId(application.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedApplicationId === application.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {application.applicant.avatar_url ? (
                    <img
                      src={application.applicant.avatar_url}
                      alt={application.applicant.full_name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {application.applicant.full_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {application.applicant.email}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(application.status)}`}>
                    {getStatusIcon(application.status)}
                    {getStatusText(application.status)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(application.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {(!applications || applications.length === 0) && (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No hay aplicaciones para revisar</p>
            </div>
          )}
        </div>

        {/* Detalle de aplicación */}
        <div className="lg:col-span-2">
          {selectedApplication ? (
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedApplication.applicant.full_name}
                  </h3>
                  <p className="text-gray-600">{selectedApplication.recruitment_form.title}</p>
                </div>
                <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(selectedApplication.status)}`}>
                  {getStatusIcon(selectedApplication.status)}
                  {getStatusText(selectedApplication.status)}
                </span>
              </div>

              {/* Respuestas del formulario */}
              <div className="space-y-4 mb-6">
                <h4 className="font-medium text-gray-900">Respuestas del Formulario</h4>
                <div className="space-y-3">
                  {(selectedApplication.recruitment_form.fields || []).map((field: any) => (
                    <div key={field.id} className="border-b border-gray-100 pb-3">
                      <dt className="text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </dt>
                      <dd className="text-sm">
                        {renderFieldValue(field, selectedApplication.form_data[field.id])}
                      </dd>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notas de revisión existentes */}
              {selectedApplication.review_notes && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Notas de Revisión</span>
                  </div>
                  <p className="text-sm text-gray-700">{selectedApplication.review_notes}</p>
                  {selectedApplication.reviewed_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Revisado el {new Date(selectedApplication.reviewed_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Acciones de revisión */}
              {selectedApplication.status !== 'processed' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas de Revisión
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Agregar comentarios sobre esta aplicación..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3">
                    {selectedApplication.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus('in_review')}
                        disabled={updateStatusMutation.isPending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Marcar en Revisión
                      </button>
                    )}

                    {['pending', 'in_review'].includes(selectedApplication.status) && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus('approved')}
                          disabled={updateStatusMutation.isPending}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleUpdateStatus('rejected')}
                          disabled={updateStatusMutation.isPending}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Rechazar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border rounded-lg p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecciona una aplicación
              </h3>
              <p className="text-gray-600">
                Elige una aplicación de la lista para revisar los detalles
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

