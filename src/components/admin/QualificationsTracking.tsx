'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Building2, Users, Target, Award, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import PageFrame from '@/components/ui/PageFrame'
import EmptyState from '@/components/ui/EmptyState'
import LoadingState from '@/components/ui/LoadingState'
import ActionButton from '@/components/ui/ActionButton'
import DataTable from '@/components/ui/DataTable'

interface Unit {
  id: string
  name: string
  unit_type: string
  description: string
}

interface Personnel {
  id: string
  profile: {
    full_name: string
    callsign: string
  }
  unit_id: string
}

interface Qualification {
  id: string
  name: string
  category: string
  unit_id: string
}

interface PersonnelQualification {
  id: string
  personnel_id: string
  qualification_id: string
  status: 'not_started' | 'in_progress' | 'completed' | 'failed'
  progress_percentage: number
  notes: string | null
  instructor_id: string | null
  started_at: string | null
  completed_at: string | null
  qualification: Qualification
  personnel: Personnel
}

type TabType = 'units' | 'personnel' | 'progress'

export default function QualificationsTracking() {
  const [units, setUnits] = useState<Unit[]>([])
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [qualifications, setQualifications] = useState<Qualification[]>([])
  const [personnelQualifications, setPersonnelQualifications] = useState<PersonnelQualification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('units')

  useEffect(() => {
    console.log('🔄 QualificationsTracking: Iniciando carga de datos...')
    
    // Crear AbortController para cancelar requests pendientes
    const abortController = new AbortController()
    
    const loadData = async () => {
      try {
        await fetchUnits(abortController.signal)
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('❌ QualificationsTracking: Error en carga inicial:', error)
        }
      }
    }
    
    loadData()
    
    // Cleanup function para cancelar requests pendientes
    return () => {
      console.log('🔄 QualificationsTracking: Cancelando requests pendientes...')
      abortController.abort()
    }
  }, [])

  useEffect(() => {
    if (selectedUnit) {
      console.log('🔄 QualificationsTracking: Unidad seleccionada, cargando datos relacionados:', selectedUnit.name)
      fetchPersonnel()
      fetchQualifications()
      fetchPersonnelQualifications()
    }
  }, [selectedUnit])

  const fetchUnits = async (signal?: AbortSignal) => {
    try {
      console.log('🔄 QualificationsTracking: Cargando unidades...')
      
      // Verificar si la request fue cancelada
      if (signal?.aborted) {
        console.log('❌ QualificationsTracking: Request de unidades cancelada')
        return
      }
      
      setLoading(true)
      const { data, error } = await supabase
        .from('units')
        .select('id, name, unit_type, description')
        .order('name')
        .abortSignal(signal)

      if (error) throw error
      console.log('✅ QualificationsTracking: Unidades cargadas:', data?.length || 0)
      setUnits(data || [])
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('❌ QualificationsTracking: Request de unidades abortada')
        return
      }
      console.error('❌ QualificationsTracking: Error cargando unidades:', error)
      toast.error('Error al cargar unidades')
    } finally {
      console.log('🏁 QualificationsTracking: Finalizando carga de unidades')
      setLoading(false)
    }
  }

  const fetchPersonnel = async () => {
    if (!selectedUnit) return

    try {
      console.log('🔄 QualificationsTracking: Cargando personal de la unidad:', selectedUnit.name)
      const { data, error } = await supabase
        .from('personnel')
        .select(`
          id,
          profile:user_id (
            full_name,
            callsign
          )
        `)
        .eq('unit_id', selectedUnit.id)

      if (error) throw error
      console.log('✅ QualificationsTracking: Personal cargado:', data?.length || 0)
      setPersonnel(data || [])
    } catch (error: any) {
      console.error('❌ QualificationsTracking: Error cargando personal:', error)
      toast.error('Error al cargar personal')
    }
  }

  const fetchQualifications = async () => {
    if (!selectedUnit) return

    try {
      const { data, error } = await supabase
        .from('qualifications')
        .select('id, name, category')
        .eq('unit_id', selectedUnit.id)
        .order('name')

      if (error) throw error
      setQualifications(data || [])
    } catch (error: any) {
      console.error('Error fetching qualifications:', error)
      toast.error('Error al cargar calificaciones')
    }
  }

  const fetchPersonnelQualifications = async () => {
    if (!selectedUnit) return

    try {
      const { data, error } = await supabase
        .from('personnel_qualifications')
        .select(`
          *,
          qualification:qualification_id (
            id,
            name,
            category
          ),
          personnel:personnel_id (
            id,
            profile:user_id (
              full_name,
              callsign
            )
          )
        `)
        .eq('personnel.unit_id', selectedUnit.id)

      if (error) throw error
      setPersonnelQualifications(data || [])
    } catch (error: any) {
      console.error('Error fetching personnel qualifications:', error)
      toast.error('Error al cargar progreso de calificaciones')
    }
  }

  const handleSelectUnit = (unit: Unit) => {
    setSelectedUnit(unit)
    setActiveTab('personnel')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado'
      case 'in_progress':
        return 'En Progreso'
      case 'failed':
        return 'Fallido'
      default:
        return 'No Iniciado'
    }
  }

  if (loading) {
    return (
      <PageFrame
        title="Seguimiento de Calificaciones"
        description="Monitorea el progreso de calificaciones del personal"
        icon={Target}
      >
        <LoadingState text="Cargando seguimiento..." />
      </PageFrame>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'units':
        return (
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Seleccionar Unidad</h3>
              <p className="text-muted-foreground mb-6">
                Selecciona una unidad para ver el seguimiento de calificaciones de su personal.
              </p>
              
              <div className="grid gap-4">
                {units.map((unit) => (
                  <div key={unit.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{unit.name}</div>
                        <div className="text-sm text-muted-foreground">{unit.unit_type} • {unit.description}</div>
                      </div>
                    </div>
                    <ActionButton
                      variant="secondary"
                      size="sm"
                      icon={Target}
                      onClick={() => handleSelectUnit(unit)}
                    >
                      Ver Seguimiento
                    </ActionButton>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'personnel':
        return selectedUnit ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Seguimiento - {selectedUnit.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Progreso de calificaciones del personal
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ActionButton
                  variant="secondary"
                  size="sm"
                  icon={Building2}
                  onClick={() => setActiveTab('units')}
                >
                  Cambiar Unidad
                </ActionButton>
                <ActionButton
                  variant="secondary"
                  size="sm"
                  icon={TrendingUp}
                  onClick={() => setActiveTab('progress')}
                >
                  Ver Estadísticas
                </ActionButton>
              </div>
            </div>

            <DataTable
              data={personnelQualifications}
              columns={[
                {
                  key: 'personnel',
                  label: 'Personal',
                  render: (value: any, item: PersonnelQualification) => (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{item.personnel.profile.full_name}</div>
                        {item.personnel.profile.callsign && (
                          <div className="text-sm text-muted-foreground">{item.personnel.profile.callsign}</div>
                        )}
                      </div>
                    </div>
                  )
                },
                {
                  key: 'qualification',
                  label: 'Calificación',
                  render: (value: any, item: PersonnelQualification) => (
                    <div>
                      <div className="font-medium text-foreground">{item.qualification.name}</div>
                      <div className="text-sm text-muted-foreground">{item.qualification.category}</div>
                    </div>
                  )
                },
                {
                  key: 'status',
                  label: 'Estado',
                  render: (value: string, item: PersonnelQualification) => (
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                  )
                },
                {
                  key: 'progress_percentage',
                  label: 'Progreso',
                  render: (value: number) => (
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{value}%</span>
                    </div>
                  )
                },
                {
                  key: 'started_at',
                  label: 'Iniciado',
                  render: (value: string) => (
                    <span className="text-sm text-muted-foreground">
                      {value ? new Date(value).toLocaleDateString() : 'No iniciado'}
                    </span>
                  )
                },
                {
                  key: 'completed_at',
                  label: 'Completado',
                  render: (value: string) => (
                    <span className="text-sm text-muted-foreground">
                      {value ? new Date(value).toLocaleDateString() : 'Pendiente'}
                    </span>
                  )
                }
              ]}
              emptyState={
                <EmptyState
                  icon={Award}
                  title="Sin calificaciones asignadas"
                  description="No hay calificaciones asignadas al personal de esta unidad."
                />
              }
            />
          </div>
        ) : null

      case 'progress':
        return selectedUnit ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Estadísticas - {selectedUnit.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Resumen del progreso de calificaciones
                </p>
              </div>
              <ActionButton
                variant="secondary"
                size="sm"
                icon={Building2}
                onClick={() => setActiveTab('units')}
              >
                Cambiar Unidad
              </ActionButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card rounded-lg border p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {personnelQualifications.filter(pq => pq.status === 'completed').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Completadas</div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {personnelQualifications.filter(pq => pq.status === 'in_progress').length}
                    </div>
                    <div className="text-sm text-muted-foreground">En Progreso</div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {personnelQualifications.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Asignadas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null

      default:
        return null
    }
  }

  return (
    <PageFrame
      title="Seguimiento de Calificaciones"
      description="Monitorea el progreso de calificaciones del personal"
      icon={Target}
    >
      {/* Tabs Navigation */}
      <div className="border-b border-border mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('units')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'units'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Seleccionar Unidad
          </button>
          {selectedUnit && (
            <>
              <button
                onClick={() => setActiveTab('personnel')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'personnel'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                Personal - {selectedUnit.name}
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'progress'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                Estadísticas - {selectedUnit.name}
              </button>
            </>
          )}
        </nav>
      </div>

      {renderTabContent()}
    </PageFrame>
  )
}
