'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, Award, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import PageFrame from '@/components/ui/PageFrame'
import EmptyState from '@/components/ui/EmptyState'
import LoadingState from '@/components/ui/LoadingState'
import ActionButton from '@/components/ui/ActionButton'
import DataTable from '@/components/ui/DataTable'

interface Specialty {
  id: string
  name: string
  abbreviation?: string
  description?: string
  category?: string
  icon?: string
  color?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

type TabType = 'list' | 'create' | 'edit'

export default function SpecialtiesManager() {
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('list')
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    description: ''
  })

  useEffect(() => {
    fetchSpecialties()
  }, [])

  const fetchSpecialties = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('specialties')
        .select('*')
        .order('name')

      if (error) throw error
      setSpecialties(data || [])
    } catch (error: any) {
      console.error('Error fetching specialties:', error)
      toast.error('Error al cargar especialidades')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta especialidad?')) return

    try {
      const { error } = await supabase
        .from('specialties')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Especialidad eliminada exitosamente')
      fetchSpecialties()
    } catch (error: any) {
      console.error('Error deleting specialty:', error)
      toast.error('Error al eliminar especialidad: ' + error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    try {
      if (editingSpecialty) {
        const { error } = await supabase
          .from('specialties')
          .update({
            name: formData.name.trim(),
            abbreviation: formData.abbreviation.trim() || null,
            description: formData.description.trim() || null,
          })
          .eq('id', editingSpecialty.id)

        if (error) throw error
        toast.success('Especialidad actualizada exitosamente')
      } else {
        const { error } = await supabase
          .from('specialties')
          .insert([{
            name: formData.name.trim(),
            abbreviation: formData.abbreviation.trim() || null,
            description: formData.description.trim() || null,
            is_active: true
          }])

        if (error) throw error
        toast.success('Especialidad creada exitosamente')
      }

      resetForm()
      fetchSpecialties()
    } catch (error: any) {
      console.error('Error saving specialty:', error)
      toast.error('Error al guardar especialidad: ' + error.message)
    }
  }

  const handleEdit = (specialty: Specialty) => {
    setEditingSpecialty(specialty)
    setFormData({
      name: specialty.name,
      abbreviation: specialty.abbreviation || '',
      description: specialty.description || ''
    })
    setActiveTab('edit')
  }

  const resetForm = () => {
    setEditingSpecialty(null)
    setFormData({ name: '', abbreviation: '', description: '' })
    setActiveTab('list')
  }

  const columns = [
    {
      key: 'name',
      label: 'Nombre',
      render: (value: string, item: Specialty) => (
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: item.color || '#6B7280' }}
          />
          <div>
            <div className="font-medium text-foreground">{value}</div>
            {item.abbreviation && (
              <div className="text-sm text-muted-foreground">{item.abbreviation}</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Categoría',
      render: (value: string) => (
        <span className="badge-primary text-xs">
          {value || 'Sin categoría'}
        </span>
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
      key: 'actions',
      label: 'Acciones',
      render: (value: any, item: Specialty) => (
        <div className="flex items-center gap-2">
          <ActionButton
            variant="secondary"
            size="sm"
            icon={Plus}
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
      title="No hay especialidades"
      description="Aún no has creado ninguna especialidad. Crea la primera para comenzar."
      action={{
        label: "Crear Primera Especialidad",
        onClick: () => setActiveTab('create'),
        icon: Plus
      }}
    />
  )

  if (loading) {
    return (
      <PageFrame title="Especialidades" description="Gestiona las especialidades disponibles en el sistema">
        <LoadingState text="Cargando especialidades..." />
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
                  {editingSpecialty ? 'Editar Especialidad' : 'Crear Nueva Especialidad'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {editingSpecialty ? 'Modifica los datos de la especialidad' : 'Completa los datos para crear una nueva especialidad'}
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
                    placeholder="Nombre de la especialidad"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Abreviación
                  </label>
                  <input
                    type="text"
                    value={formData.abbreviation}
                    onChange={(e) => setFormData(prev => ({ ...prev, abbreviation: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="Abreviatura (opcional)"
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
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  rows={4}
                  placeholder="Descripción de la especialidad (opcional)"
                />
              </div>

              <div className="flex gap-3">
                <ActionButton
                  type="submit"
                  variant="primary"
                  icon={Save}
                >
                  {editingSpecialty ? 'Actualizar' : 'Crear'} Especialidad
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
            data={specialties}
            columns={columns}
            emptyState={emptyState}
          />
        )
    }
  }

  return (
    <PageFrame 
      title="Especialidades" 
      description="Gestiona las especialidades disponibles en el sistema"
      headerActions={
        activeTab === 'list' ? (
          <ActionButton
            variant="primary"
            icon={Plus}
            onClick={() => setActiveTab('create')}
          >
            Nueva Especialidad
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
            Lista de Especialidades
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Crear Especialidad
          </button>
        </nav>
      </div>

      {renderTabContent()}
    </PageFrame>
  )
}