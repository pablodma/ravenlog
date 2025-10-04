'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, Clock, XCircle, Award, User, Target, BookOpen, Star, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import PageFrame from '@/components/ui/PageFrame'
import LoadingState from '@/components/ui/LoadingState'
import ActionButton from '@/components/ui/ActionButton'
import DataTable from '@/components/ui/DataTable'

interface Profile {
  id: string
  full_name: string
  callsign: string | null
  rank: string | null
}

interface UnitQualification {
  id: string
  name: string
  description: string | null
  category: string
  order_index: number
  is_required: boolean
}

interface PersonnelQualification {
  id: string
  profile_id: string
  unit_qualification_id: string
  status: 'not_started' | 'in_progress' | 'completed' | 'failed'
  progress_percentage: number
  completed_at: string | null
  instructor_id: string | null
  notes: string | null
  profile: Profile
  unit_qualification: UnitQualification
  instructor?: Profile
}

interface PersonnelQualificationForm {
  status: 'not_started' | 'in_progress' | 'completed' | 'failed'
  progress_percentage: number
  notes: string
  instructor_id: string | null
}

type TabType = 'overview' | 'personnel' | 'qualifications'

interface PersonnelQualificationsTrackerProps {
  unitId: string
  unitName: string
}

export default function PersonnelQualificationsTracker({ unitId, unitName }: PersonnelQualificationsTrackerProps) {
  const [personnelQualifications, setPersonnelQualifications] = useState<PersonnelQualification[]>([])
  const [unitQualifications, setUnitQualifications] = useState<UnitQualification[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [editingQualification, setEditingQualification] = useState<PersonnelQualification | null>(null)
  const [formData, setFormData] = useState<PersonnelQualificationForm>({
    status: 'not_started',
    progress_percentage: 0,
    notes: '',
    instructor_id: null
  })

  useEffect(() => {
    fetchData()
  }, [unitId])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Obtener calificaciones de la unidad
      const { data: qualifications, error: qualError } = await supabase
        .from('unit_qualifications')
        .select('*')
        .eq('unit_id', unitId)
        .order('order_index')

      if (qualError) throw qualError
      setUnitQualifications(qualifications || [])

      // Obtener personal de la unidad
      const { data: unitProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, callsign, rank')
        .eq('unit_id', unitId)

      if (profilesError) throw profilesError
      setProfiles(unitProfiles || [])

      // Obtener progreso de calificaciones
      const { data: progress, error: progressError } = await supabase
        .from('personnel_qualifications')
        .select(`
          *,
          profile:profiles(id, full_name, callsign, rank),
          unit_qualification:unit_qualifications(id, name, description, category, order_index, is_required),
          instructor:profiles!instructor_id(id, full_name, callsign)
        `)
        .in('unit_qualification_id', qualifications?.map(q => q.id) || [])

      if (progressError) throw progressError
      setPersonnelQualifications(progress || [])
    } catch (error: any) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar datos: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingQualification) return

    try {
      const { error } = await supabase
        .from('personnel_qualifications')
        .update({
          status: formData.status,
          progress_percentage: formData.progress_percentage,
          notes: formData.notes || null,
          instructor_id: formData.instructor_id || null,
          completed_at: formData.status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', editingQualification.id)

      if (error) throw error
      toast.success('Progreso actualizado exitosamente')
      resetForm()
      fetchData()
    } catch (error: any) {
      console.error('Error updating progress:', error)
      toast.error('Error al actualizar progreso: ' + error.message)
    }
  }

  const handleEditProgress = (qualification: PersonnelQualification) => {
    setEditingQualification(qualification)
    setFormData({
      status: qualification.status,
      progress_percentage: qualification.progress_percentage,
      notes: qualification.notes || '',
      instructor_id: qualification.instructor_id || null
    })
    setActiveTab('personnel')
  }

  const resetForm = () => {
    setEditingQualification(null)
    setFormData({
      status: 'not_started',
      progress_percentage: 0,
      notes: '',
      instructor_id: null
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'in_progress': return Clock
      case 'failed': return XCircle
      default: return Award
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'initial': return BookOpen
      case 'mission': return Target
      case 'specialty': return Award
      case 'leadership': return Star
      case 'instructor': return Users
      default: return Award
    }
  }

  // Calcular estadísticas generales
  const getOverviewStats = () => {
    const totalQualifications = unitQualifications.length
    const totalPersonnel = profiles.length
    const totalProgress = personnelQualifications.length
    const completedProgress = personnelQualifications.filter(pq => pq.status === 'completed').length
    const inProgress = personnelQualifications.filter(pq => pq.status === 'in_progress').length

    return {
      totalQualifications,
      totalPersonnel,
      totalProgress,
      completedProgress,
      inProgress,
      completionRate: totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0
    }
  }

  const stats = getOverviewStats()

  const columns = [
    {
      key: 'profile',
      label: 'Personal',
      render: (value: any, item: PersonnelQualification) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium text-foreground">{item.profile.full_name}</div>
            {item.profile.callsign && (
              <div className="text-sm text-muted-foreground">{item.profile.callsign}</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'unit_qualification',
      label: 'Calificación',
      render: (value: any, item: PersonnelQualification) => {
        const Icon = getCategoryIcon(item.unit_qualification.category)
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="font-medium text-foreground">{item.unit_qualification.name}</div>
              {item.unit_qualification.is_required && (
                <div className="text-xs text-red-600">Requerida</div>
              )}
            </div>
          </div>
        )
      }
    },
    {
      key: 'status',
      label: 'Estado',
      render: (value: string, item: PersonnelQualification) => {
        const Icon = getStatusIcon(value)
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(value)}`}>
              {value === 'not_started' ? 'No iniciado' : 
               value === 'in_progress' ? 'En progreso' :
               value === 'completed' ? 'Completado' : 'Fallido'}
            </span>
          </div>
        )
      }
    },
    {
      key: 'progress_percentage',
      label: 'Progreso',
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground">{value}%</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (value: any, item: PersonnelQualification) => (
        <ActionButton
          variant="secondary"
          size="sm"
          icon={Edit2}
          onClick={() => handleEditProgress(item)}
        >
          Actualizar
        </ActionButton>
      )
    }
  ]

  if (loading) {
    return (
      <PageFrame title={`Seguimiento de Calificaciones - ${unitName}`} description="Gestiona el progreso de calificaciones del personal">
        <LoadingState text="Cargando datos..." />
      </PageFrame>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.totalQualifications}</div>
                  <div className="text-sm text-muted-foreground">Calificaciones</div>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.totalPersonnel}</div>
                  <div className="text-sm text-muted-foreground">Personal</div>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.completedProgress}</div>
                  <div className="text-sm text-muted-foreground">Completadas</div>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.inProgress}</div>
                  <div className="text-sm text-muted-foreground">En progreso</div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'personnel':
        return (
          <div className="space-y-6">
            {editingQualification && (
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Actualizar Progreso - {editingQualification.unit_qualification.name}
                </h3>
                
                <form onSubmit={handleUpdateProgress} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Estado
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      >
                        <option value="not_started">No iniciado</option>
                        <option value="in_progress">En progreso</option>
                        <option value="completed">Completado</option>
                        <option value="failed">Fallido</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Progreso (%)
                      </label>
                      <input
                        type="number"
                        value={formData.progress_percentage}
                        onChange={(e) => setFormData(prev => ({ ...prev, progress_percentage: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Notas
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      rows={3}
                      placeholder="Notas sobre el progreso..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <ActionButton
                      type="submit"
                      variant="primary"
                      icon={Save}
                    >
                      Actualizar Progreso
                    </ActionButton>
                    <ActionButton
                      type="button"
                      variant="secondary"
                      icon={X}
                      onClick={resetForm}
                    >
                      Cancelar
                    </ActionButton>
                  </div>
                </form>
              </div>
            )}

            <DataTable
              data={personnelQualifications}
              columns={columns}
            />
          </div>
        )

      case 'qualifications':
        return (
          <DataTable
            data={unitQualifications}
            columns={[
              {
                key: 'name',
                label: 'Calificación',
                render: (value: string, item: UnitQualification) => {
                  const Icon = getCategoryIcon(item.category)
                  return (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{value}</div>
                        {item.is_required && (
                          <div className="text-xs text-red-600">Requerida</div>
                        )}
                      </div>
                    </div>
                  )
                }
              },
              {
                key: 'category',
                label: 'Categoría',
                render: (value: string) => (
                  <span className="text-sm text-muted-foreground capitalize">{value}</span>
                )
              },
              {
                key: 'order_index',
                label: 'Orden',
                render: (value: number) => (
                  <span className="text-sm text-muted-foreground">#{value}</span>
                )
              }
            ]}
          />
        )

      default:
        return null
    }
  }

  return (
    <PageFrame 
      title={`Seguimiento de Calificaciones - ${unitName}`} 
      description="Gestiona el progreso de calificaciones del personal"
    >
      {/* Tabs Navigation */}
      <div className="border-b border-border mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => setActiveTab('personnel')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'personnel'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Progreso del Personal
          </button>
          <button
            onClick={() => setActiveTab('qualifications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'qualifications'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Calificaciones
          </button>
        </nav>
      </div>

      {renderTabContent()}
    </PageFrame>
  )
}
