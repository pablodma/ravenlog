import { useState, useEffect } from 'react'
import { User, Award, Star, Plane, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Application {
  id: string
  applicant_id: string
  status: string
  applicant: {
    full_name: string
    email: string
    avatar_url: string | null
  }
  recruitment_form: {
    title: string
  }
}

interface Rank {
  id: string
  name: string
  title: string
  image_url: string | null
  order_index: number
}

interface Unit {
  id: string
  name: string
  description: string
  unit_type: string
  callsign: string | null
  image_url: string | null
}

export default function CandidateProcessor() {
  const [approvedApplications, setApprovedApplications] = useState<Application[]>([])
  const [ranks, setRanks] = useState<Rank[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [selectedRank, setSelectedRank] = useState<string>('')
  const [selectedUnit, setSelectedUnit] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [applicationsResponse, ranksResponse, unitsResponse] = await Promise.all([
        (supabase as any)
          .from('applications')
          .select(`
            *,
            applicant:profiles!applicant_id(full_name, email, avatar_url),
            recruitment_form:recruitment_forms!form_id(title)
          `)
          .eq('status', 'approved')
          .order('created_at', { ascending: false }),
        
        (supabase as any)
          .from('ranks')
          .select('*')
          .order('order_index'),
        
        (supabase as any)
          .from('units')
          .select('*')
          .order('name')
      ])

      if (applicationsResponse.error) throw applicationsResponse.error
      if (ranksResponse.error) throw ranksResponse.error
      if (unitsResponse.error) throw unitsResponse.error

      setApprovedApplications(applicationsResponse.data || [])
      setRanks(ranksResponse.data || [])
      setUnits(unitsResponse.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const processCandidate = async () => {
    if (!selectedApplication || !selectedRank || !selectedUnit) {
      toast.error('Debe seleccionar rango y unidad')
      return
    }

    setProcessing(true)
    try {
      const { error } = await (supabase as any)
        .rpc('process_candidate', {
          application_id: selectedApplication.id,
          rank_id: selectedRank,
          unit_id: selectedUnit
        })

      if (error) throw error

      toast.success(`${selectedApplication.applicant.full_name} ha sido procesado exitosamente`)
      
      // Limpiar selección y recargar datos
      setSelectedApplication(null)
      setSelectedRank('')
      setSelectedUnit('')
      fetchData()
    } catch (error: any) {
      console.error('Error processing candidate:', error)
      toast.error(error.message || 'Error al procesar candidato')
    } finally {
      setProcessing(false)
    }
  }

  const selectedRankData = ranks.find(r => r.id === selectedRank)
  const selectedUnitData = units.find(u => u.id === selectedUnit)

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
        <h2 className="text-2xl font-bold text-gray-900">Procesamiento de Candidatos</h2>
        <p className="text-gray-600">Asignar rango y unidad a candidatos aprobados</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de candidatos aprobados */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Candidatos Aprobados ({approvedApplications.length})
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {approvedApplications.map((application) => (
              <div
                key={application.id}
                onClick={() => setSelectedApplication(application)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedApplication?.id === application.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {application.applicant.avatar_url ? (
                    <img
                      src={application.applicant.avatar_url}
                      alt={application.applicant.full_name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {application.applicant.full_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {application.applicant.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      {application.recruitment_form.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      <CheckCircle className="h-3 w-3" />
                      Aprobado
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {approvedApplications.length === 0 && (
            <div className="text-center py-8">
              <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No hay candidatos aprobados para procesar</p>
            </div>
          )}
        </div>

        {/* Panel de procesamiento */}
        <div className="space-y-6">
          {selectedApplication ? (
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
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
                  <p className="text-gray-600">{selectedApplication.applicant.email}</p>
                </div>
              </div>

              {/* Selección de rango */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asignar Rango
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                    {ranks.map((rank) => (
                      <label
                        key={rank.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedRank === rank.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="rank"
                          value={rank.id}
                          checked={selectedRank === rank.id}
                          onChange={(e) => setSelectedRank(e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        {rank.image_url ? (
                          <img src={rank.image_url} alt={rank.name} className="w-8 h-8 object-cover rounded" />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                            <Star className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{rank.title}</p>
                          <p className="text-sm text-gray-600">{rank.name}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Selección de unidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asignar Unidad
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                    {units.map((unit) => (
                      <label
                        key={unit.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedUnit === unit.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="unit"
                          value={unit.id}
                          checked={selectedUnit === unit.id}
                          onChange={(e) => setSelectedUnit(e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
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
                            <p className="font-medium text-gray-900">{unit.name}</p>
                            {unit.callsign && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-mono">
                                {unit.callsign}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 capitalize">{unit.unit_type}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Resumen y procesamiento */}
                {selectedRank && selectedUnit && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Resumen del Procesamiento</h4>
                    <div className="space-y-1 text-sm text-green-800">
                      <p><strong>Candidato:</strong> {selectedApplication.applicant.full_name}</p>
                      <p><strong>Rango:</strong> {selectedRankData?.title}</p>
                      <p><strong>Unidad:</strong> {selectedUnitData?.name}</p>
                      <p><strong>Rol:</strong> Personal Activo</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={processCandidate}
                  disabled={!selectedRank || !selectedUnit || processing}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Award className="h-5 w-5" />
                  {processing ? 'Procesando...' : 'Procesar Candidato'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border rounded-lg p-12 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecciona un candidato
              </h3>
              <p className="text-gray-600">
                Elige un candidato aprobado para asignar rango y unidad
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
