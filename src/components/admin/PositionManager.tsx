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

interface PositionForm {
  id?: string
  name: string
  description: string
  unit_id: string
  display_order: number
  is_leadership: boolean
  color: string
}

export default function PositionManager() {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<PositionForm>({
    name: '',
    description: '',
    unit_id: '',
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
      unit_id: '',
      display_order: 0,
      is_leadership: false,
      color: '#6B7280',
    })
    setIsCreating(false)
    setEditingId(null)
  }

  const handleCreate = () => {
    if (!formData.name || !formData.unit_id) return

    createMutation.mutate(
      {
        name: formData.name,
        description: formData.description || undefined,
        unit_id: formData.unit_id,
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
      unit_id: position.unit_id,
      display_order: position.display_order,
      is_leadership: position.is_leadership,
      color: position.color || '#6B7280',
    })
    setEditingId(position.id)
    setIsCreating(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta posición?')) {
      deleteMutation.mutate(id)
    }
  }

  const loading = unitsLoading || positionsLoading

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Agrupar posiciones por unidad
  const positionsByUnit = positions?.reduce((acc: any, position: any) => {
    const unitName = position.unit?.name || 'Sin unidad'
    if (!acc[unitName]) acc[unitName] = []
    acc[unitName].push(position)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Posiciones de Combate</h2>
          <p className="text-gray-600">Gestionar posiciones dentro de cada unidad</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Posición
        </button>
      </div>

      {/* Formulario de creación/edición */}
      {(isCreating || editingId) && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Editar Posición' : 'Nueva Posición'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Líder de Escuadrón"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidad <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.unit_id}
                onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                disabled={!!editingId} // No se puede cambiar al editar
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Seleccionar unidad...</option>
                {units?.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la posición..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orden de visualización
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color (hex)
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_leadership}
                  onChange={(e) => setFormData({ ...formData, is_leadership: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <Shield className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Marcar como posición de liderazgo
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={editingId ? handleUpdate : handleCreate}
              disabled={!formData.name || !formData.unit_id || createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {editingId ? 'Actualizar' : 'Crear'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de posiciones por unidad */}
      <div className="space-y-6">
        {positionsByUnit && Object.keys(positionsByUnit).length > 0 ? (
          Object.entries(positionsByUnit).map(([unitName, unitPositions]: [string, any]) => (
            <div key={unitName} className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{unitName}</h3>
              
              <div className="space-y-2">
                {unitPositions.map((position: any) => (
                  <div
                    key={position.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: position.color }}
                      />
                      {position.is_leadership && (
                        <Shield className="h-4 w-4 text-yellow-600" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{position.name}</p>
                          {position.is_leadership && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                              Liderazgo
                            </span>
                          )}
                        </div>
                        {position.description && (
                          <p className="text-sm text-gray-600">{position.description}</p>
                        )}
                        <p className="text-xs text-gray-500">Orden: {position.display_order}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(position)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(position.id)}
                        disabled={deleteMutation.isPending}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border rounded-lg p-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay posiciones creadas
            </h3>
            <p className="text-gray-600 mb-4">
              Crea posiciones de combate para organizar tu unidad
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nueva Posición
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

