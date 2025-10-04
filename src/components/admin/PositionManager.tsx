'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Save, X, Shield, User } from 'lucide-react'
import {
  useUnits,
  useAllPositions,
  useCreatePosition,
  useUpdatePosition,
  useDeletePosition,
} from '@/hooks/useRecruitmentData'
import PageFrame from '@/components/ui/PageFrame'
import EmptyState from '@/components/ui/EmptyState'
import LoadingState from '@/components/ui/LoadingState'
import ActionButton from '@/components/ui/ActionButton'
import DataTable from '@/components/ui/DataTable'

interface PositionForm {
  id?: string
  name: string
  description: string
  display_order: number
  is_leadership: boolean
  color: string
}

type TabType = 'list' | 'create' | 'edit'

export default function PositionManager() {
  const [activeTab, setActiveTab] = useState<TabType>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<PositionForm>({
    name: '',
    description: '',
    display_order: 0,
    is_leadership: false,
    color: '#6B7280',
  })

  const { data: units, isLoading: unitsLoading } = useUnits()
  const { data: positions, isLoading: positionsLoading } = useAllPositions()
  const createMutation = useCreatePosition()
  const updateMutation = useUpdatePosition()
  const deleteMutation = useDeletePosition()

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      display_order: 0,
      is_leadership: false,
      color: '#6B7280',
    })
    setEditingId(null)
    setActiveTab('list')
  }

  const handleCreate = () => {
    if (!formData.name) return

    createMutation.mutate(
      {
        name: formData.name,
        description: formData.description || undefined,
        display_order: formData.display_order,
        is_leadership: formData.is_leadership,
        color: formData.color,
      },
      {
        onSuccess: () => resetForm(),
      }
    )
  }

  const handleUpdate = () => {
    if (!editingId || !formData.name) return

    updateMutation.mutate(
      {
        id: editingId,
        name: formData.name,
        description: formData.description || undefined,
        display_order: formData.display_order,
        is_leadership: formData.is_leadership,
        color: formData.color,
      },
      {
        onSuccess: () => resetForm(),
      }
    )
  }

  const handleEdit = (position: any) => {
    setFormData({
      id: position.id,
      name: position.name,
      description: position.description || '',
      display_order: position.display_order,
      is_leadership: position.is_leadership,
      color: position.color || '#6B7280',
    })
    setEditingId(position.id)
    setActiveTab('edit')
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta posición?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      handleUpdate()
    } else {
      handleCreate()
    }
  }

  const loading = unitsLoading || positionsLoading

  // Ordenar posiciones por display_order
  const sortedPositions = positions?.sort((a: any, b: any) => a.display_order - b.display_order) || []

  const columns = [
    {
      key: 'name',
      label: 'Posición',
      render: (value: string, item: any) => (
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: item.color }}
          />
          <div>
            <div className="font-medium text-foreground">{value}</div>
            {item.is_leadership && (
              <div className="text-xs text-yellow-600 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Liderazgo
              </div>
            )}
          </div>
        </div>
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
      key: 'display_order',
      label: 'Orden',
      render: (value: number) => (
        <span className="text-sm text-muted-foreground">#{value}</span>
      )
    },
    {
      key: 'is_leadership',
      label: 'Tipo',
      render: (value: boolean) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Liderazgo' : 'Regular'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (value: any, item: any) => (
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
            disabled={deleteMutation.isPending}
          >
            Eliminar
          </ActionButton>
        </div>
      )
    }
  ]

  const emptyState = (
    <EmptyState
      icon={User}
      title="No hay posiciones"
      description="Aún no has creado ninguna posición. Crea la primera para comenzar."
      action={{
        label: "Crear Primera Posición",
        onClick: () => setActiveTab('create'),
        icon: Plus
      }}
    />
  )

  if (loading) {
    return (
      <PageFrame title="Posiciones" description="Gestiona las posiciones de combate del sistema">
        <LoadingState text="Cargando posiciones..." />
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
                  {editingId ? 'Editar Posición' : 'Crear Nueva Posición'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {editingId ? 'Modifica los datos de la posición' : 'Completa los datos para crear una nueva posición'}
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
                    placeholder="Ej: Líder de Escuadrón"
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Orden de visualización
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
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
                  placeholder="Descripción de la posición..."
                  rows={2}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Color (hex)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="h-10 w-16 rounded border border-input cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_leadership}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_leadership: e.target.checked }))}
                      className="rounded text-primary focus:ring-primary border-input"
                    />
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      Marcar como posición de liderazgo
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <ActionButton
                  type="submit"
                  variant="primary"
                  icon={Save}
                  disabled={!formData.name || createMutation.isPending || updateMutation.isPending}
                >
                  {editingId ? 'Actualizar' : 'Crear'} Posición
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
            data={sortedPositions}
            columns={columns}
            emptyState={emptyState}
          />
        )
    }
  }

  return (
    <PageFrame 
      title="Posiciones de Combate" 
      description="Gestiona las posiciones globales disponibles para todas las unidades"
      headerActions={
        activeTab === 'list' ? (
          <ActionButton
            variant="primary"
            icon={Plus}
            onClick={() => setActiveTab('create')}
          >
            Nueva Posición
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
            Lista de Posiciones
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Crear Posición
          </button>
        </nav>
      </div>

      {renderTabContent()}
    </PageFrame>
  )
}