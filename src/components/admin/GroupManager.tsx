'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit2, Trash2, Save, X, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import PageFrame from '@/components/ui/PageFrame'
import EmptyState from '@/components/ui/EmptyState'
import LoadingState from '@/components/ui/LoadingState'
import ActionButton from '@/components/ui/ActionButton'
import DataTable from '@/components/ui/DataTable'

interface Group {
  id: string
  name: string
  description: string | null
  color: string
  display_order: number
  is_active: boolean
  created_at: string
}

type TabType = 'list' | 'create' | 'edit'

export default function GroupManager() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('list')
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6B7280',
    display_order: 0,
    is_active: true,
  })

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setGroups(data || [])
    } catch (error: any) {
      console.error('Error fetching groups:', error)
      toast.error('Error al cargar grupos: ' + error.message)
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
      if (editingGroup) {
        const { error } = await supabase
          .from('groups')
          .update({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            color: formData.color,
            display_order: formData.display_order,
            is_active: formData.is_active,
          })
          .eq('id', editingGroup.id)

        if (error) throw error
        toast.success('Grupo actualizado exitosamente')
      } else {
        const { error } = await supabase
          .from('groups')
          .insert([{
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            color: formData.color,
            display_order: formData.display_order,
            is_active: formData.is_active,
          }])

        if (error) throw error
        toast.success('Grupo creado exitosamente')
      }

      resetForm()
      fetchGroups()
    } catch (error: any) {
      console.error('Error saving group:', error)
      toast.error('Error al guardar grupo: ' + error.message)
    }
  }

  const handleEdit = (group: Group) => {
    setEditingGroup(group)
    setFormData({
      name: group.name,
      description: group.description || '',
      color: group.color,
      display_order: group.display_order,
      is_active: group.is_active,
    })
    setActiveTab('edit')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este grupo? Las unidades en este grupo quedarán sin asignar.')) return

    try {
      // Primero verificar si hay unidades asignadas a este grupo
      const { data: unitsInGroup, error: unitsError } = await supabase
        .from('units')
        .select('id, name')
        .eq('group_id', id)

      if (unitsError) throw unitsError

      if (unitsInGroup && unitsInGroup.length > 0) {
        // Desasignar unidades del grupo antes de eliminar
        const { error: unassignError } = await supabase
          .from('units')
          .update({ group_id: null })
          .eq('group_id', id)

        if (unassignError) throw unassignError

        toast('Unidades desasignadas del grupo', { icon: 'ℹ️' })
      }

      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Grupo eliminado exitosamente')
      fetchGroups()
    } catch (error: any) {
      console.error('Error deleting group:', error)
      toast.error('Error al eliminar grupo: ' + error.message)
    }
  }

  const resetForm = () => {
    setEditingGroup(null)
    setFormData({
      name: '',
      description: '',
      color: '#6B7280',
      display_order: 0,
      is_active: true,
    })
    setActiveTab('list')
  }

  const columns = [
    {
      key: 'display_order',
      label: 'Orden',
      render: (value: number) => (
        <span className="text-sm text-muted-foreground">#{value}</span>
      )
    },
    {
      key: 'name',
      label: 'Grupo',
      render: (value: string, item: Group) => (
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: item.color }}
          />
          <div>
            <div className="font-medium text-foreground">{value}</div>
            {item.description && (
              <div className="text-sm text-muted-foreground max-w-xs truncate">
                {item.description}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'color',
      label: 'Color',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded border border-border"
            style={{ backgroundColor: value }}
          />
          <span className="text-xs text-muted-foreground">{value}</span>
        </div>
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
      render: (value: any, item: Group) => (
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
      icon={Users}
      title="No hay grupos"
      description="Aún no has creado ningún grupo. Crea el primero para comenzar."
      action={{
        label: "Crear Primer Grupo",
        onClick: () => setActiveTab('create'),
        icon: Plus
      }}
    />
  )

  if (loading) {
    return (
      <PageFrame title="Grupos" description="Gestiona grupos organizacionales. Cada grupo puede contener múltiples unidades">
        <LoadingState text="Cargando grupos..." />
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
                  {editingGroup ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {editingGroup ? 'Modifica los datos del grupo' : 'Completa los datos para crear un nuevo grupo'}
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
                    placeholder="Nombre del grupo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Orden de Visualización
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    min="0"
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
                  rows={3}
                  placeholder="Descripción del grupo"
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

                <div className="flex items-end">
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
                  {editingGroup ? 'Actualizar' : 'Crear'} Grupo
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
            data={groups}
            columns={columns}
            emptyState={emptyState}
          />
        )
    }
  }

  return (
    <PageFrame 
      title="Grupos" 
      description="Gestiona grupos organizacionales. Cada grupo puede contener múltiples unidades"
      headerActions={
        activeTab === 'list' ? (
          <ActionButton
            variant="primary"
            icon={Plus}
            onClick={() => setActiveTab('create')}
          >
            Nuevo Grupo
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
            Lista de Grupos
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Crear Grupo
          </button>
        </nav>
      </div>

      {renderTabContent()}
    </PageFrame>
  )
}