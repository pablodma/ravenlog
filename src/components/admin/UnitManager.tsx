'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X, Users, Plane } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import PageFrame from '@/components/ui/PageFrame'
import EmptyState from '@/components/ui/EmptyState'
import LoadingState from '@/components/ui/LoadingState'
import ActionButton from '@/components/ui/ActionButton'
import DataTable from '@/components/ui/DataTable'
import { useIsMounted } from '@/hooks/useIsMounted'
import { useStableEffect } from '@/hooks/useStableEffect'

interface Unit {
  id: string
  name: string
  description: string
  unit_type: string
  callsign: string | null
  image_url: string | null
  max_personnel: number
  group_id: string | null
  created_at: string
  personnel_count?: number
  group?: {
    id: string
    name: string
    color: string
  }
}

interface UnitForm {
  name: string
  description: string
  unit_type: string
  callsign: string
  image_url: string
  max_personnel: number
  group_id: string | null
}

interface Group {
  id: string
  name: string
  color: string
  display_order: number
}

const UNIT_TYPES = [
  'squadron',
  'wing', 
  'group',
  'flight',
  'division'
]

type TabType = 'list' | 'create' | 'edit'

export default function UnitManager() {
  const [units, setUnits] = useState<Unit[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('list')
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<UnitForm>({
    name: '',
    description: '',
    unit_type: 'squadron',
    callsign: '',
    image_url: '',
    max_personnel: 50,
    group_id: null
  })
  
  const isMounted = useIsMounted()

  useStableEffect(() => {
    let mounted = true
    let abortController: AbortController | null = null
    
    console.log('🔄 UnitManager: Iniciando carga de datos...')
    
    const loadData = async () => {
      // Crear nuevo AbortController para esta carga
      abortController = new AbortController()
      
      try {
        await Promise.all([
          fetchGroups(abortController.signal),
          fetchUnits(abortController.signal)
        ])
        
        if (mounted) {
          console.log('✅ UnitManager: Carga inicial completada')
        }
      } catch (error: any) {
        if (error.name !== 'AbortError' && mounted) {
          console.error('❌ UnitManager: Error en carga inicial:', error)
        }
      }
    }
    
    loadData()
    
    // Cleanup function para cancelar requests pendientes
    return () => {
      mounted = false
      if (abortController) {
        console.log('🔄 UnitManager: Cancelando requests pendientes...')
        abortController.abort()
      }
    }
  }, [])

  const fetchGroups = async (signal?: AbortSignal) => {
    try {
      console.log('🔄 UnitManager: Cargando grupos...')
      
      // Verificar si la request fue cancelada
      if (signal?.aborted) {
        console.log('❌ UnitManager: Request de grupos cancelada')
        return
      }
      
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, color, display_order')
        .eq('is_active', true)
        .order('display_order')
        .abortSignal(signal)

      if (error) throw error
      console.log('✅ UnitManager: Grupos cargados:', data?.length || 0)
      
      // Solo actualizar estado si el componente sigue montado
      if (!signal?.aborted && isMounted) {
        setGroups(data || [])
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('❌ UnitManager: Request de grupos abortada')
        return
      }
      console.error('❌ UnitManager: Error cargando grupos:', error)
    }
  }

  const fetchUnits = async (signal?: AbortSignal) => {
    try {
      console.log('🔄 UnitManager: Cargando unidades...')
      
      // Verificar si la request fue cancelada
      if (signal?.aborted) {
        console.log('❌ UnitManager: Request de unidades cancelada')
        return
      }
      
      setLoading(true)
      const { data: unitsData, error } = await supabase
        .from('units')
        .select(`
          *,
          personnel_count:profiles(count),
          group:groups(id, name, color)
        `)
        .order('name')
        .abortSignal(signal)

      if (error) throw error

      const unitsWithCount = unitsData?.map((unit: any) => ({
        ...unit,
        personnel_count: unit.personnel_count?.[0]?.count || 0
      })) || []

      console.log('✅ UnitManager: Unidades cargadas:', unitsWithCount.length)
      
      // Solo actualizar estado si el componente sigue montado
      if (!signal?.aborted && isMounted) {
        setUnits(unitsWithCount)
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('❌ UnitManager: Request de unidades abortada')
        return
      }
      console.error('❌ UnitManager: Error cargando unidades:', error)
      toast.error('Error al cargar unidades')
    } finally {
      console.log('🏁 UnitManager: Finalizando carga de unidades')
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
      const fileName = `unit-${Date.now()}.${fileExt}`
      const filePath = `units/${fileName}`

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
    
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('El nombre y descripción son requeridos')
      return
    }

    try {
      if (editingUnit) {
        const { error } = await supabase
          .from('units')
          .update(formData)
          .eq('id', editingUnit.id)

        if (error) throw error
        toast.success('Unidad actualizada exitosamente')
      } else {
        const { error } = await supabase
          .from('units')
          .insert([formData])

        if (error) throw error
        toast.success('Unidad creada exitosamente')
      }

      resetForm()
      fetchUnits()
    } catch (error: any) {
      console.error('Error saving unit:', error)
      if (error.code === '23505') {
        toast.error('Ya existe una unidad con ese nombre')
      } else {
        toast.error('Error al guardar unidad: ' + error.message)
      }
    }
  }

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit)
    setFormData({
      name: unit.name,
      description: unit.description,
      unit_type: unit.unit_type,
      callsign: unit.callsign || '',
      image_url: unit.image_url || '',
      max_personnel: unit.max_personnel,
      group_id: unit.group_id || null
    })
    setActiveTab('edit')
  }

  const handleDelete = async (unit: Unit) => {
    if (unit.personnel_count && unit.personnel_count > 0) {
      toast.error(`No se puede eliminar. Hay ${unit.personnel_count} persona(s) asignada(s) a esta unidad`)
      return
    }

    if (!confirm(`¿Estás seguro de eliminar la unidad "${unit.name}"?`)) return

    try {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', unit.id)

      if (error) throw error
      toast.success('Unidad eliminada exitosamente')
      fetchUnits()
    } catch (error: any) {
      console.error('Error deleting unit:', error)
      toast.error('Error al eliminar unidad: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      unit_type: 'squadron',
      callsign: '',
      image_url: '',
      max_personnel: 50,
      group_id: null
    })
    setEditingUnit(null)
    setActiveTab('list')
  }

  const columns = [
    {
      key: 'name',
      label: 'Unidad',
      render: (value: string, item: Unit) => (
        <div className="flex items-center gap-3">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-8 h-8 object-cover rounded" />
          ) : (
            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
              <Plane className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div>
            <div className="font-medium text-foreground">{value}</div>
            {item.callsign && (
              <div className="text-xs text-muted-foreground font-mono">{item.callsign}</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'unit_type',
      label: 'Tipo',
      render: (value: string) => (
        <span className="text-sm text-muted-foreground capitalize">{value}</span>
      )
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (value: string) => (
        <div className="max-w-xs truncate text-muted-foreground">
          {value}
        </div>
      )
    },
    {
      key: 'personnel_count',
      label: 'Personal',
      render: (value: number, item: Unit) => (
        <div className="flex items-center gap-1 text-sm">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span>{value || 0}/{item.max_personnel}</span>
        </div>
      )
    },
    {
      key: 'group',
      label: 'Grupo',
      render: (value: any) => (
        value ? (
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: value.color }}
            />
            <span className="text-sm text-muted-foreground">{value.name}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Sin grupo</span>
        )
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (value: any, item: Unit) => (
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
            onClick={() => handleDelete(item)}
            disabled={!!(item.personnel_count && item.personnel_count > 0)}
          >
            Eliminar
          </ActionButton>
        </div>
      )
    }
  ]

  const emptyState = (
    <EmptyState
      icon={Plane}
      title="No hay unidades"
      description="Aún no has creado ninguna unidad. Crea la primera para comenzar."
      action={{
        label: "Crear Primera Unidad",
        onClick: () => setActiveTab('create'),
        icon: Plus
      }}
    />
  )

  if (loading) {
    return (
      <PageFrame title="Unidades" description="Gestiona las unidades militares del sistema">
        <LoadingState text="Cargando unidades..." />
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
                  {editingUnit ? 'Editar Unidad' : 'Crear Nueva Unidad'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {editingUnit ? 'Modifica los datos de la unidad' : 'Completa los datos para crear una nueva unidad'}
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

            <form onSubmit={handleSubmit} className="bg-card rounded-lg border p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre de la Unidad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ej: 101st Fighter Squadron"
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tipo de Unidad
                  </label>
                  <select
                    value={formData.unit_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  >
                    {UNIT_TYPES.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Grupo
                  </label>
                  <select
                    value={formData.group_id || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, group_id: e.target.value || null }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  >
                    <option value="">Sin grupo asignado</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Máximo Personal
                  </label>
                  <input
                    type="number"
                    value={formData.max_personnel}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_personnel: parseInt(e.target.value) }))}
                    min="1"
                    max="500"
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Callsign
                </label>
                <input
                  type="text"
                  value={formData.callsign}
                  onChange={(e) => setFormData(prev => ({ ...prev, callsign: e.target.value }))}
                  placeholder="ej: VIPER, EAGLE, FALCON"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe la misión y responsabilidades de esta unidad..."
                  rows={3}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Imagen de la Unidad
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

              <div className="flex gap-3">
                <ActionButton
                  type="submit"
                  variant="primary"
                  icon={Save}
                >
                  {editingUnit ? 'Actualizar' : 'Crear'} Unidad
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
            data={units}
            columns={columns}
            emptyState={emptyState}
          />
        )
    }
  }

  return (
    <PageFrame 
      title="Unidades" 
      description="Gestiona las unidades militares del sistema"
      headerActions={
        activeTab === 'list' ? (
          <ActionButton
            variant="primary"
            icon={Plus}
            onClick={() => setActiveTab('create')}
          >
            Nueva Unidad
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
            Lista de Unidades
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Crear Unidad
          </button>
        </nav>
      </div>

      {renderTabContent()}
    </PageFrame>
  )
}