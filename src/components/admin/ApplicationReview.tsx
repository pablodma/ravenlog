import { useState, useEffect } from 'react'
import { Eye, CheckCircle, XCircle, Clock, User, FileText, MessageSquare } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Application {
  id: string
  applicant_id: string
  form_id: string
  form_data: Record<string, any>
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'processed'
  reviewed_by: string | null
  reviewed_at: string | null
  review_notes: string | null
  created_at: string
  applicant: {
    full_name: string
    email: string
    avatar_url: string | null
  }
  recruitment_form: {
    title: string
    fields: any[]
  }
}

export default function ApplicationReview() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('applications')
        .select(`
          *,
          applicant:profiles!applicant_id(full_name, email, avatar_url),
          recruitment_form:recruitment_forms!form_id(title, fields)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Error al cargar aplicaciones')
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, newStatus: string, notes?: string) => {
    setProcessing(true)
    try {
      const { error } = await (supabase as any)
        .rpc('update_application_status', {
          application_id: applicationId,
          new_status: newStatus,
          notes: notes || null
        })

      if (error) throw error

      toast.success(`Aplicación ${getStatusText(newStatus).toLowerCase()}`)
      fetchApplications()
      setSelectedApplication(null)
      setReviewNotes('')
    } catch (error: any) {
      console.error('Error updating application:', error)
      toast.error(error.message || 'Error al actualizar aplicación')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in_review': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'processed': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'in_review': return 'En Revisión'
      case 'approved': return 'Aprobado'
      case 'rejected': return 'Rechazado'
      case 'processed': return 'Procesado'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'in_review': return <Eye className="h-4 w-4" />
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      case 'processed': return <User className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
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

  if (loading) {
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
            Aplicaciones ({applications.length})
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {applications.map((application) => (
              <div
                key={application.id}
                onClick={() => setSelectedApplication(application)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedApplication?.id === application.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
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

          {applications.length === 0 && (
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
                        onClick={() => updateApplicationStatus(selectedApplication.id, 'in_review', reviewNotes)}
                        disabled={processing}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Marcar en Revisión
                      </button>
                    )}

                    {['pending', 'in_review'].includes(selectedApplication.status) && (
                      <>
                        <button
                          onClick={() => updateApplicationStatus(selectedApplication.id, 'approved', reviewNotes)}
                          disabled={processing}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Aprobar
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected', reviewNotes)}
                          disabled={processing}
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
