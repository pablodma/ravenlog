'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit2, Trash2, Save, X, Award, Target, Users, BookOpen, Star } from 'lucide-react'
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
}

interface UnitQualification {
  id: string
  unit_id: string
  name: string
  description: string | null
  category: string
  order_index: number
  is_required: boolean
  prerequisites: string[]
  created_at: string
  unit?: Unit
}

interface UnitQualificationForm {
  name: string
  description: string
  category: string
  order_index: number
  is_required: boolean
  prerequisites: string[]
}

const CATEGORY_OPTIONS = [
  { value: 'initial', label: 'Entrenamiento Inicial (IQT)' },
  { value: 'mission', label: 'Entrenamiento de Misión (MQT)' },
  { value: 'specialty', label: 'Especialidad' },
  { value: 'leadership', label: 'Liderazgo' },
  { value: 'instructor', label: 'Instructor' },
]

type TabType = 'list' | 'create' | 'edit'

interface UnitQualificationsManagerProps {
  unitId: string
  unitName: string
}

export default function UnitQualificationsManager({ unitId, unitName }: UnitQualificationsManagerProps) {
  const [qualifications, setQualifications] = useState<UnitQualification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('list')
  const [editingQualification, setEditingQualification] = useState<UnitQualification | null>(null)
  const [formData, setFormData] = useState<UnitQualificationForm>({
    name: '',
    description: '',
    category: 'initial',
    order_index: 0,
    is_required: false,
    prerequisites: []
  })

  useEffect(() => {
    fetchQualifications()
  }, [unitId])

  const fetchQualifications = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('unit_qualifications')
        .select(`
          *,
          unit:units(id, name, unit_type)
        `)
        .eq('unit_id', unitId)
        .order('order_index', { ascending: true })

      if (error) throw error
      setQualifications(data || [])
    } catch (error: any) {
      console.error('Error fetching qualifications:', error)
      toast.error('Error al cargar calificaciones: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    try {
      if (editingQualification) {
        const { error } = await supabase
          .from('unit_qualifications')
          .update({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            category: formData.category,
            order_index: formData.order_index,
            is_required: formData.is_required,
            prerequisites: formData.prerequisites
          })
          .eq('id', editingQualification.id)

        if (error) throw error
        toast.success('Calificación actualizada exitosamente')
      } else {
        const { error } = await supabase
          .from('unit_qualifications')
          .insert([{
            unit_id: unitId,
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            category: formData.category,
            order_index: formData.order_index,
            is_required: formData.is_required,
            prerequisites: formData.prerequisites
          }])

        if (error) throw error
        toast.success('Calificación creada exitosamente')
      }

      resetForm()
      fetchQualifications()
    } catch (error: any) {
      console.error('Error saving qualification:', error)
      toast.error('Error al guardar calificación: ' + error.message)
    }
  }

  const handleEdit = (qualification: UnitQualification) => {
    setEditingQualification(qualification)
    setFormData({
      name: qualification.name,
      description: qualification.description || '',
      category: qualification.category,
      order_index: qualification.order_index,
      is_required: qualification.is_required,
      prerequisites: qualification.prerequisites
    })
    setActiveTab('edit')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta calificación?')) return

    try {
      const { error } = await supabase
        .from('unit_qualifications')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Calificación eliminada exitosamente')
      fetchQualifications()
    } catch (error: any) {
      console.error('Error deleting qualification:', error)
      toast.error('Error al eliminar calificación: ' + error.message)
    }
  }

  const resetForm = () => {
    setEditingQualification(null)
    setFormData({
      name: '',
      description: '',
      category: 'initial',
      order_index: qualifications.length,
      is_required: false,
      prerequisites: []
    })
    setActiveTab('list')
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'initial': return 'bg-blue-100 text-blue-800'
      case 'mission': return 'bg-green-100 text-green-800'
      case 'specialty': return 'bg-purple-100 text-purple-800'
      case 'leadership': return 'bg-yellow-100 text-yellow-800'
      case 'instructor': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const columns = [
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
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(value)}`}>
          {CATEGORY_OPTIONS.find(cat => cat.value === value)?.label || value}
        </span>
      )
    },
    {
      key: 'order_index',
      label: 'Orden',
      render: (value: number) => (
        <span className="text-sm text-muted-foreground">#{value}</span>
      )
    },
    {
      key: 'prerequisites',
      label: 'Prerrequisitos',
      render: (value: string[]) => (
        <span className="text-sm text-muted-foreground">
          {value.length > 0 ? `${value.length} requeridas` : 'Ninguno'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (value: any, item: UnitQualification) => (
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
      icon={Award}
      title="No hay calificaciones"
      description={`Aún no has configurado calificaciones para ${unitName}. Crea la primera para comenzar.`}
      action={{
        label: "Crear Primera Calificación",
        onClick: () => setActiveTab('create'),
        icon: Plus
      }}
    />
  )

  if (loading) {
    return (
      <PageFrame title={`Calificaciones - ${unitName}`} description="Gestiona las calificaciones específicas de esta unidad">
        <LoadingState text="Cargando calificaciones..." />
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
                  {editingQualification ? 'Editar Calificación' : 'Crear Nueva Calificación'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {editingQualification ? 'Modifica los datos de la calificación' : 'Completa los datos para crear una nueva calificación'}
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
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="Nombre de la calificación"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  >
                    {CATEGORY_OPTIONS.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  rows={3}
                  placeholder="Descripción de la calificación"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Orden
                  </label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    min="0"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_required}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_required: e.target.checked }))}
                      className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                    />
                    <span className="text-sm font-medium text-foreground">Calificación requerida</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <ActionButton
                  type="submit"
                  variant="primary"
                  icon={Save}
                >
                  {editingQualification ? 'Actualizar' : 'Crear'} Calificación
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
            data={qualifications}
            columns={columns}
            emptyState={emptyState}
          />
        )
    }
  }

  return (
    <PageFrame 
      title={`Calificaciones - ${unitName}`} 
      description="Gestiona las calificaciones específicas de esta unidad"
      headerActions={
        activeTab === 'list' ? (
          <ActionButton
            variant="primary"
            icon={Plus}
            onClick={() => setActiveTab('create')}
          >
            Nueva Calificación
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
            Lista de Calificaciones
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Crear Calificación
          </button>
        </nav>
      </div>

      {renderTabContent()}
    </PageFrame>
  )
}




