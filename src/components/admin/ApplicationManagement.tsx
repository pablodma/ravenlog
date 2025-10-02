'use client'

import { useState, useMemo } from 'react'
import { 
  Eye, CheckCircle, XCircle, Clock, User, FileText, MessageSquare, 
  Award, Star, Plane, ChevronRight, Shield 
} from 'lucide-react'
import {
  useAllApplications,
  useRanks,
  useUnits,
  useUnitPositions,
  useUpdateApplicationStatus,
  useProcessCandidate,
} from '@/hooks/useRecruitmentData'

export default function ApplicationManagement() {
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [selectedRank, setSelectedRank] = useState<string>('')
  const [selectedUnit, setSelectedUnit] = useState<string>('')
  const [selectedPosition, setSelectedPosition] = useState<string>('')
  const [showProcessingPanel, setShowProcessingPanel] = useState(false)

  // React Query
  const { data: applications, isLoading: appsLoading } = useAllApplications()
  const { data: ranks, isLoading: ranksLoading } = useRanks()
  const { data: units, isLoading: unitsLoading } = useUnits()
  const { data: positions, isLoading: positionsLoading } = useUnitPositions(selectedUnit)
  const updateStatusMutation = useUpdateApplicationStatus()
  const processMutation = useProcessCandidate()

  const selectedApplication = useMemo(
    () => applications?.find(app => app.id === selectedApplicationId),
    [applications, selectedApplicationId]
  )

  const selectedRankData = useMemo(
    () => ranks?.find(r => r.id === selectedRank),
    [ranks, selectedRank]
  )

  const selectedUnitData = useMemo(
    () => units?.find(u => u.id === selectedUnit),
    [units, selectedUnit]
  )

  const selectedPositionData = useMemo(
    () => positions?.find(p => p.id === selectedPosition),
    [positions, selectedPosition]
  )

  const handleUpdateStatus = (newStatus: string) => {
    if (!selectedApplicationId) return

    updateStatusMutation.mutate(
      { applicationId: selectedApplicationId, newStatus, notes: reviewNotes },
      {
        onSuccess: () => {
          setReviewNotes('')
          // Si aprueba, mostrar panel de procesamiento
          if (newStatus === 'approved') {
            setShowProcessingPanel(true)
          } else {
            // Si rechaza, limpiar selección
            setSelectedApplicationId(null)
            setShowProcessingPanel(false)
          }
        },
      }
    )
  }

  const handleProcessCandidate = () => {
    if (!selectedApplicationId || !selectedRank || !selectedUnit) return

    processMutation.mutate(
      {
        applicationId: selectedApplicationId,
        rankId: selectedRank,
        unitId: selectedUnit,
        positionId: selectedPosition || undefined,
      },
      {
        onSuccess: () => {
          // Limpiar todo después de procesar
          setSelectedApplicationId(null)
          setSelectedRank('')
          setSelectedUnit('')
          setSelectedPosition('')
          setShowProcessingPanel(false)
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

  const loading = appsLoading || ranksLoading || unitsLoading
  
  // Resetear posición cuando cambia la unidad
  const handleUnitChange = (unitId: string) => {
    setSelectedUnit(unitId)
    setSelectedPosition('') // Limpiar posición al cambiar unidad
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
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Solicitudes</h2>
        <p className="text-gray-600">Revisar, aprobar y procesar solicitudes de reclutamiento</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de aplicaciones */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Solicitudes ({applications?.length || 0})
          </h3>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {applications?.map((application) => (
              <div
                key={application.id}
                onClick={() => {
                  setSelectedApplicationId(application.id)
                  setShowProcessingPanel(application.status === 'approved')
                  setReviewNotes('')
                }}
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
              <p className="text-gray-500">No hay solicitudes</p>
            </div>
          )}
        </div>

        {/* Panel de detalle y acciones */}
        <div className="lg:col-span-2">
          {selectedApplication ? (
            <div className="space-y-6">
              {/* Información del candidato */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    {selectedApplication.applicant.avatar_url ? (
                      <img
                        src={selectedApplication.applicant.avatar_url}
                        alt={selectedApplication.applicant.full_name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {selectedApplication.applicant.full_name}
                      </h3>
                      <p className="text-gray-600">{selectedApplication.recruitment_form.title}</p>
                    </div>
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
                {!showProcessingPanel && selectedApplication.status !== 'processed' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notas de Revisión
                      </label>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Agregar comentarios sobre esta solicitud..."
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
                            Aprobar y Procesar
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

              {/* Panel de procesamiento (aparece después de aprobar) */}
              {showProcessingPanel && selectedApplication.status === 'approved' && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-900">
                      Procesar Candidato Aprobado
                    </h3>
                  </div>
                  <p className="text-sm text-green-700 mb-6">
                    Asigna el rango, la unidad y la posición para completar el proceso de enlistamiento.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Selección de rango */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        Asignar Rango
                      </label>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {ranks?.map((rank) => (
                          <label
                            key={rank.id}
                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedRank === rank.id 
                                ? 'border-green-500 bg-white shadow-sm' 
                                : 'border-gray-200 bg-white hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="rank"
                              value={rank.id}
                              checked={selectedRank === rank.id}
                              onChange={(e) => setSelectedRank(e.target.value)}
                              className="text-green-600 focus:ring-green-500"
                            />
                            {rank.image_url ? (
                              <img src={rank.image_url} alt={rank.name} className="w-8 h-8 object-cover rounded" />
                            ) : (
                              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                <Star className="h-4 w-4 text-gray-500" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{rank.name}</p>
                              <p className="text-xs text-gray-600">{rank.abbreviation}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Selección de unidad */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        Asignar Unidad
                      </label>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {units?.map((unit) => (
                          <label
                            key={unit.id}
                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedUnit === unit.id 
                                ? 'border-green-500 bg-white shadow-sm' 
                                : 'border-gray-200 bg-white hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="unit"
                              value={unit.id}
                              checked={selectedUnit === unit.id}
                              onChange={(e) => handleUnitChange(e.target.value)}
                              className="text-green-600 focus:ring-green-500"
                            />
                            {unit.image_url ? (
                              <img src={unit.image_url} alt={unit.name} className="w-8 h-8 object-cover rounded" />
                            ) : (
                              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                <Plane className="h-4 w-4 text-gray-500" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900 text-sm">{unit.name}</p>
                                {unit.callsign && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-mono">
                                    {unit.callsign}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 capitalize">{unit.unit_type}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Selección de posición (si hay posiciones para la unidad) */}
                    {selectedUnit && (
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                          Asignar Posición {positions && positions.length > 0 ? '' : '(opcional)'}
                        </label>
                        {positionsLoading ? (
                          <div className="text-sm text-gray-500">Cargando posiciones...</div>
                        ) : positions && positions.length > 0 ? (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {positions.map((position: any) => (
                              <label
                                key={position.id}
                                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                  selectedPosition === position.id 
                                    ? 'border-green-500 bg-white shadow-sm' 
                                    : 'border-gray-200 bg-white hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="position"
                                  value={position.id}
                                  checked={selectedPosition === position.id}
                                  onChange={(e) => setSelectedPosition(e.target.value)}
                                  className="text-green-600 focus:ring-green-500"
                                />
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: position.color }}
                                />
                                {position.is_leadership && (
                                  <Shield className="h-4 w-4 text-yellow-600" />
                                )}
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">{position.name}</p>
                                  {position.description && (
                                    <p className="text-xs text-gray-600">{position.description}</p>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                            No hay posiciones definidas para esta unidad. El candidato será procesado sin posición asignada.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Resumen y botón de procesamiento */}
                  {selectedRank && selectedUnit && (
                    <div className="mt-6 p-4 bg-white border border-green-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <ChevronRight className="h-4 w-4" />
                        Resumen del Procesamiento
                      </h4>
                      <div className="space-y-1 text-sm text-gray-700 mb-4">
                        <p><strong>Candidato:</strong> {selectedApplication.applicant.full_name}</p>
                        <p><strong>Rango:</strong> {selectedRankData?.name} ({selectedRankData?.abbreviation})</p>
                        <p><strong>Unidad:</strong> {selectedUnitData?.name}</p>
                        {selectedPositionData && (
                          <p className="flex items-center gap-2">
                            <strong>Posición:</strong> 
                            <span className="flex items-center gap-1">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: selectedPositionData.color }}
                              />
                              {selectedPositionData.name}
                              {selectedPositionData.is_leadership && (
                                <Shield className="h-3 w-3 text-yellow-600" />
                              )}
                            </span>
                          </p>
                        )}
                        {!selectedPositionData && (
                          <p><strong>Posición:</strong> <span className="text-gray-500">Sin asignar</span></p>
                        )}
                      </div>
                      <button
                        onClick={handleProcessCandidate}
                        disabled={processMutation.isPending}
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                      >
                        <Award className="h-5 w-5" />
                        {processMutation.isPending ? 'Procesando...' : 'Completar Enlistamiento'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border rounded-lg p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecciona una solicitud
              </h3>
              <p className="text-gray-600">
                Elige una solicitud de la lista para revisar y procesar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

