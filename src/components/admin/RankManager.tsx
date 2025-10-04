'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit2, Trash2, Save, X, Star, Target, Clock, Trophy, Crosshair, Award } from 'lucide-react'
import toast from 'react-hot-toast'
import PageFrame from '@/components/ui/PageFrame'
import EmptyState from '@/components/ui/EmptyState'
import LoadingState from '@/components/ui/LoadingState'
import ActionButton from '@/components/ui/ActionButton'
import DataTable from '@/components/ui/DataTable'

interface Rank {
  id: string
  name: string
  abbreviation: string
  order: number
  image_url: string | null
  description: string | null
  required_missions: number
  required_flight_hours: number
  required_takeoffs: number
  required_landings: number
  required_kills: number
  minimum_accuracy: number
  minimum_kd_ratio: number
  time_in_previous_rank_days: number
  requirements_enforced: boolean
  created_at: string
}

interface RankForm {
  name: string
  abbreviation: string
  order: number
  image_url: string
  description: string
  required_missions: number
  required_flight_hours: number
  required_takeoffs: number
  required_landings: number
  required_kills: number
  minimum_accuracy: number
  minimum_kd_ratio: number
  time_in_previous_rank_days: number
  requirements_enforced: boolean
}

type TabType = 'list' | 'create' | 'edit'

export default function RankManager() {
  const [ranks, setRanks] = useState<Rank[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('list')
  const [editingRank, setEditingRank] = useState<Rank | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showRequirements, setShowRequirements] = useState(false)
  const [formData, setFormData] = useState<RankForm>({
    name: '',
    abbreviation: '',
    order: 1,
    image_url: '',
    description: '',
    required_missions: 0,
    required_flight_hours: 0,
    required_takeoffs: 0,
    required_landings: 0,
    required_kills: 0,
    minimum_accuracy: 0,
    minimum_kd_ratio: 0,
    time_in_previous_rank_days: 0,
    requirements_enforced: false
  })

  useEffect(() => {
    fetchRanks()
  }, [])

  const fetchRanks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('ranks')
        .select('*')
        .order('order')

      if (error) throw error
      setRanks(data || [])
    } catch (error: any) {
      console.error('Error fetching ranks:', error)
      toast.error('Error al cargar rangos: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.includes('image/')) {
      toast.error('Solo se permiten archivos de imagen')
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `rank-${Date.now()}.${fileExt}`
      const filePath = `ranks/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, image_url: publicUrl }))
      toast.success('Imagen subida exitosamente')
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error('Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.abbreviation.trim()) {
      toast.error('El nombre y abreviación son requeridos')
      return
    }

    try {
      if (editingRank) {
        const { error } = await supabase
          .from('ranks')
          .update(formData)
          .eq('id', editingRank.id)

        if (error) throw error
        toast.success('Rango actualizado exitosamente')
      } else {
        const { error } = await supabase
          .from('ranks')
          .insert([formData])

        if (error) throw error
        toast.success('Rango creado exitosamente')
      }

      resetForm()
      fetchRanks()
    } catch (error: any) {
      console.error('Error saving rank:', error)
      toast.error('Error al guardar rango: ' + error.message)
    }
  }

  const handleEdit = (rank: Rank) => {
    setEditingRank(rank)
    setFormData({
      name: rank.name,
      abbreviation: rank.abbreviation,
      order: rank.order,
      image_url: rank.image_url || '',
      description: rank.description || '',
      required_missions: rank.required_missions || 0,
      required_flight_hours: rank.required_flight_hours || 0,
      required_takeoffs: rank.required_takeoffs || 0,
      required_landings: rank.required_landings || 0,
      required_kills: rank.required_kills || 0,
      minimum_accuracy: rank.minimum_accuracy || 0,
      minimum_kd_ratio: rank.minimum_kd_ratio || 0,
      time_in_previous_rank_days: rank.time_in_previous_rank_days || 0,
      requirements_enforced: rank.requirements_enforced || false
    })
    setActiveTab('edit')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este rango?')) return

    try {
      const { error } = await supabase
        .from('ranks')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Rango eliminado exitosamente')
      fetchRanks()
    } catch (error: any) {
      console.error('Error deleting rank:', error)
      toast.error('Error al eliminar rango: ' + error.message)
    }
  }

  const resetForm = () => {
    setEditingRank(null)
    setFormData({
      name: '',
      abbreviation: '',
      order: ranks.length + 1,
      image_url: '',
      description: '',
      required_missions: 0,
      required_flight_hours: 0,
      required_takeoffs: 0,
      required_landings: 0,
      required_kills: 0,
      minimum_accuracy: 0,
      minimum_kd_ratio: 0,
      time_in_previous_rank_days: 0,
      requirements_enforced: false
    })
    setActiveTab('list')
    setShowRequirements(false)
  }

  const hasRequirements = (rank: Rank) => {
    return rank.required_missions > 0 ||
           rank.required_flight_hours > 0 ||
           rank.required_takeoffs > 0 ||
           rank.required_landings > 0 ||
           rank.required_kills > 0 ||
           rank.minimum_accuracy > 0 ||
           rank.minimum_kd_ratio > 0 ||
           rank.time_in_previous_rank_days > 0
  }

  const columns = [
    {
      key: 'name',
      label: 'Rango',
      render: (value: string, item: Rank) => (
        <div className="flex items-center gap-3">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-8 h-8 object-cover rounded" />
          ) : (
            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
              <Star className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div>
            <div className="font-medium text-foreground">{value}</div>
            <div className="text-sm text-muted-foreground">{item.abbreviation}</div>
          </div>
        </div>
      )
    },
    {
      key: 'order',
      label: 'Orden',
      render: (value: number) => (
        <span className="text-sm text-muted-foreground">#{value}</span>
      )
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (value: string) => (
        <div className="max-w-xs truncate text-muted-foreground">
          {value || 'Sin descripción'}
        </div>
      )
    },
    {
      key: 'requirements_enforced',
      label: 'Requisitos',
      render: (value: boolean, item: Rank) => (
        <div className="flex items-center gap-2">
          {hasRequirements(item) && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
              {value ? 'Obligatorios' : 'Opcionales'}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (value: any, item: Rank) => (
        <div className="flex items-center gap-2">
          <ActionButton
            variant="secondary"
            size="sm"
            icon={Edit2}
            onClick={() => handleEdit(item)}
          >
            Editar
          </ActionButton>
          <ActionButton
            variant="destructive"
            size="sm"
            icon={Trash2}
            onClick={() => handleDelete(item.id)}
          >
            Eliminar
          </ActionButton>
        </div>
      )
    }
  ]

  const emptyState = (
    <EmptyState
      icon={Star}
      title="No hay rangos"
      description="Aún no has creado ningún rango. Crea el primero para comenzar."
      action={{
        label: "Crear Primer Rango",
        onClick: () => setActiveTab('create'),
        icon: Plus
      }}
    />
  )

  if (loading) {
    return (
      <PageFrame title="Rangos" description="Gestiona los rangos militares del sistema">
        <LoadingState text="Cargando rangos..." />
      </PageFrame>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'create':
      case 'edit':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {editingRank ? 'Editar Rango' : 'Crear Nuevo Rango'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {editingRank ? 'Modifica los datos del rango' : 'Completa los datos para crear un nuevo rango'}
                </p>
              </div>
              <ActionButton
                variant="secondary"
                icon={X}
                onClick={resetForm}
              >
                Cancelar
              </ActionButton>
            </div>

            <form onSubmit={handleSubmit} className="bg-card rounded-lg border p-6 space-y-6">
              {/* Información Básica */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Información Básica
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Abreviación <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.abbreviation}
                      onChange={(e) => setFormData(prev => ({ ...prev, abbreviation: e.target.value }))}
                      placeholder="ej: CDT, TTE, CAP"
                      className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Orden <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                      min="1"
                      className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    placeholder="Describe este rango..."
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Imagen del Rango
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.image_url && (
                      <img src={formData.image_url} alt="Preview" className="w-16 h-16 object-cover rounded-lg border" />
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      />
                      {uploading && <p className="text-sm text-primary mt-1">Subiendo imagen...</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Requisitos */}
              <div className="border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowRequirements(!showRequirements)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Requisitos para Promoción
                  </h4>
                  {showRequirements ? '▼' : '▶'}
                </button>

                {showRequirements && (
                  <div className="mt-4 space-y-4 bg-muted/20 p-4 rounded-lg">
                    {/* Requisitos de Vuelo */}
                    <div>
                      <h5 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Requisitos de Vuelo
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Misiones Mínimas
                          </label>
                          <input
                            type="number"
                            value={formData.required_missions}
                            onChange={(e) => setFormData(prev => ({ ...prev, required_missions: parseInt(e.target.value) || 0 }))}
                            min="0"
                            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Horas de Vuelo Mínimas
                          </label>
                          <input
                            type="number"
                            value={formData.required_flight_hours}
                            onChange={(e) => setFormData(prev => ({ ...prev, required_flight_hours: parseFloat(e.target.value) || 0 }))}
                            min="0"
                            step="0.5"
                            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Despegues Mínimos
                          </label>
                          <input
                            type="number"
                            value={formData.required_takeoffs}
                            onChange={(e) => setFormData(prev => ({ ...prev, required_takeoffs: parseInt(e.target.value) || 0 }))}
                            min="0"
                            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Aterrizajes Mínimos
                          </label>
                          <input
                            type="number"
                            value={formData.required_landings}
                            onChange={(e) => setFormData(prev => ({ ...prev, required_landings: parseInt(e.target.value) || 0 }))}
                            min="0"
                            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Requisitos de Combate */}
                    <div>
                      <h5 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Requisitos de Combate
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Bajas Mínimas
                          </label>
                          <input
                            type="number"
                            value={formData.required_kills}
                            onChange={(e) => setFormData(prev => ({ ...prev, required_kills: parseInt(e.target.value) || 0 }))}
                            min="0"
                            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Precisión Mínima (%)
                          </label>
                          <input
                            type="number"
                            value={formData.minimum_accuracy}
                            onChange={(e) => setFormData(prev => ({ ...prev, minimum_accuracy: parseFloat(e.target.value) || 0 }))}
                            min="0"
                            max="100"
                            step="0.01"
                            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            K/D Ratio Mínimo
                          </label>
                          <input
                            type="number"
                            value={formData.minimum_kd_ratio}
                            onChange={(e) => setFormData(prev => ({ ...prev, minimum_kd_ratio: parseFloat(e.target.value) || 0 }))}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Otros Requisitos */}
                    <div>
                      <h5 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Otros Requisitos
                      </h5>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                          Tiempo Mínimo en Rango Anterior (días)
                        </label>
                        <input
                          type="number"
                          value={formData.time_in_previous_rank_days}
                          onChange={(e) => setFormData(prev => ({ ...prev, time_in_previous_rank_days: parseInt(e.target.value) || 0 }))}
                          min="0"
                          className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground text-sm"
                        />
                      </div>
                    </div>

                    {/* Requisitos Obligatorios */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <input
                        type="checkbox"
                        id="requirements_enforced"
                        checked={formData.requirements_enforced}
                        onChange={(e) => setFormData(prev => ({ ...prev, requirements_enforced: e.target.checked }))}
                        className="rounded border-input text-primary focus:ring-primary"
                      />
                      <label htmlFor="requirements_enforced" className="text-sm text-foreground">
                        Los requisitos son <strong>obligatorios</strong> para la promoción
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <ActionButton
                  type="submit"
                  variant="primary"
                  icon={Save}
                >
                  {editingRank ? 'Actualizar' : 'Crear'} Rango
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
        )
      
      case 'list':
      default:
        return (
          <DataTable
            data={ranks}
            columns={columns}
            emptyState={emptyState}
          />
        )
    }
  }

  return (
    <PageFrame 
      title="Rangos" 
      description="Gestiona los rangos militares del sistema"
      headerActions={
        activeTab === 'list' ? (
          <ActionButton
            variant="primary"
            icon={Plus}
            onClick={() => setActiveTab('create')}
          >
            Nuevo Rango
          </ActionButton>
        ) : null
      }
    >
      {/* Tabs Navigation */}
      <div className="border-b border-border mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Lista de Rangos
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Crear Rango
          </button>
        </nav>
      </div>

      {renderTabContent()}
    </PageFrame>
  )
}