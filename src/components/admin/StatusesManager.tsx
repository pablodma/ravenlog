'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit2, Trash2, Save, X, Activity } from 'lucide-react'
import toast from 'react-hot-toast'
import PageFrame from '@/components/ui/PageFrame'
import EmptyState from '@/components/ui/EmptyState'
import LoadingState from '@/components/ui/LoadingState'
import ActionButton from '@/components/ui/ActionButton'
import DataTable from '@/components/ui/DataTable'

interface Status {
  id: string
  name: string
  description: string | null
  type: string
  color: string
  is_default: boolean
  allows_operations: boolean
  is_active: boolean
}

const TYPE_OPTIONS = [
  { value: 'operational', label: 'Operacional' },
  { value: 'administrative', label: 'Administrativo' },
  { value: 'training', label: 'Entrenamiento' },
  { value: 'medical', label: 'Médico' },
]

type TabType = 'list' | 'create' | 'edit'

export default function StatusesManager() {
  const [statuses, setStatuses] = useState<Status[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('list')
  const [editingStatus, setEditingStatus] = useState<Status | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'operational',
    color: '#6B7280',
    is_default: false,
    allows_operations: true,
    is_active: true,
  })

  useEffect(() => {
    fetchStatuses()
  }, [])

  const fetchStatuses = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('statuses')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setStatuses(data || [])
    } catch (error: any) {
      console.error('Error fetching statuses:', error)
      toast.error('Error al cargar estados: ' + error.message)
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
      if (editingStatus) {
        const { error } = await supabase
          .from('statuses')
          .update({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            type: formData.type,
            color: formData.color,
            is_default: formData.is_default,
            allows_operations: formData.allows_operations,
            is_active: formData.is_active,
          })
          .eq('id', editingStatus.id)

        if (error) throw error
        toast.success('Estado actualizado exitosamente')
      } else {
        const { error } = await supabase
          .from('statuses')
          .insert([{
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            type: formData.type,
            color: formData.color,
            is_default: formData.is_default,
            allows_operations: formData.allows_operations,
            is_active: formData.is_active,
          }])

        if (error) throw error
        toast.success('Estado creado exitosamente')
      }

      resetForm()
      fetchStatuses()
    } catch (error: any) {
      console.error('Error saving status:', error)
      toast.error('Error al guardar estado: ' + error.message)
    }
  }

  const handleEdit = (status: Status) => {
    setEditingStatus(status)
    setFormData({
      name: status.name,
      description: status.description || '',
      type: status.type,
      color: status.color,
      is_default: status.is_default,
      allows_operations: status.allows_operations,
      is_active: status.is_active,
    })
    setActiveTab('edit')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este estado?')) return

    try {
      const { error } = await supabase
        .from('statuses')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Estado eliminado exitosamente')
      fetchStatuses()
    } catch (error: any) {
      console.error('Error deleting status:', error)
      toast.error('Error al eliminar estado: ' + error.message)
    }
  }

  const resetForm = () => {
    setEditingStatus(null)
    setFormData({
      name: '',
      description: '',
      type: 'operational',
      color: '#6B7280',
      is_default: false,
      allows_operations: true,
      is_active: true,
    })
    setActiveTab('list')
  }

  const columns = [
    {
      key: 'name',
      label: 'Estado',
      render: (value: string, item: Status) => (
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: item.color }}
          />
          <div>
            <div className="font-medium text-foreground">{value}</div>
            {item.is_default && (
              <div className="text-xs text-blue-600">Por defecto</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (value: string) => (
        <span className="text-sm text-muted-foreground capitalize">{value}</span>
      )
    },
    {
      key: 'allows_operations',
      label: 'Operaciones',
      render: (value: boolean) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Sí' : 'No'}
        </span>
      )
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: (value: boolean) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (value: any, item: Status) => (
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
      icon={Activity}
      title="No hay estados"
      description="Aún no has creado ningún estado. Crea el primero para comenzar."
      action={{
        label: "Crear Primer Estado",
        onClick: () => setActiveTab('create'),
        icon: Plus
      }}
    />
  )

  if (loading) {
    return (
      <PageFrame title="Estados" description="Gestiona los tipos de estado del personal y disponibilidad operacional">
        <LoadingState text="Cargando estados..." />
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
                  {editingStatus ? 'Editar Estado' : 'Crear Nuevo Estado'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {editingStatus ? 'Modifica los datos del estado' : 'Completa los datos para crear un nuevo estado'}
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
                    placeholder="Nombre del estado"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tipo
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  >
                    {TYPE_OPTIONS.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
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
                  rows={2}
                  placeholder="Descripción del estado"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="h-10 w-20 rounded border border-input cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      placeholder="#6B7280"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allows_operations}
                      onChange={(e) => setFormData(prev => ({ ...prev, allows_operations: e.target.checked }))}
                      className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                    />
                    <span className="text-sm font-medium text-foreground">Permite operaciones</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_default}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                      className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                    />
                    <span className="text-sm font-medium text-foreground">Estado por defecto</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                    />
                    <span className="text-sm font-medium text-foreground">Activo</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <ActionButton
                  type="submit"
                  variant="primary"
                  icon={Save}
                >
                  {editingStatus ? 'Actualizar' : 'Crear'} Estado
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
            data={statuses}
            columns={columns}
            emptyState={emptyState}
          />
        )
    }
  }

  return (
    <PageFrame 
      title="Estados" 
      description="Gestiona los tipos de estado del personal y disponibilidad operacional"
      headerActions={
        activeTab === 'list' ? (
          <ActionButton
            variant="primary"
            icon={Plus}
            onClick={() => setActiveTab('create')}
          >
            Nuevo Estado
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
            Lista de Estados
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Crear Estado
          </button>
        </nav>
      </div>

      {renderTabContent()}
    </PageFrame>
  )
}