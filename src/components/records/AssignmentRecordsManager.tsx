'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit2, Trash2, Search, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import PageFrame from '@/components/ui/PageFrame'
import ActionButton from '@/components/ui/ActionButton'

interface AssignmentRecord {
  id: string
  user_id: string
  assignment_type: string
  from_unit_id?: string
  to_unit_id?: string
  from_position_id?: string
  to_position_id?: string
  from_role?: string
  to_role?: string
  effective_date: string
  reason?: string
  created_at: string
  user: {
    full_name: string
    email: string
  }
  from_unit?: {
    name: string
  }
  to_unit?: {
    name: string
  }
  from_position?: {
    name: string
  }
  to_position?: {
    name: string
  }
}

type TabType = 'list' | 'create'

export default function AssignmentRecordsManager() {
  const [records, setRecords] = useState<AssignmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('list')
  const [formData, setFormData] = useState({
    user_id: '',
    assignment_type: '',
    from_unit_id: '',
    to_unit_id: '',
    from_position_id: '',
    to_position_id: '',
    from_role: '',
    to_role: '',
    effective_date: '',
    reason: ''
  })

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('assignment_records')
        .select(`
          *,
          user:profiles!user_id(full_name, email),
          from_unit:units!from_unit_id(name),
          to_unit:units!to_unit_id(name),
          from_position:positions!from_position_id(name),
          to_position:positions!to_position_id(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (error: any) {
      console.error('Error fetching records:', error)
      toast.error('Error al cargar registros')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return

    try {
      const { error } = await supabase
        .from('assignment_records')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Registro eliminado exitosamente')
      fetchRecords()
    } catch (error: any) {
      console.error('Error deleting record:', error)
      toast.error('Error al eliminar registro')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.user_id || !formData.assignment_type || !formData.effective_date) {
      toast.error('Los campos obligatorios son requeridos')
      return
    }

    try {
      const { error } = await supabase
        .from('assignment_records')
        .insert([{
          user_id: formData.user_id,
          assignment_type: formData.assignment_type,
          from_unit_id: formData.from_unit_id || null,
          to_unit_id: formData.to_unit_id || null,
          from_position_id: formData.from_position_id || null,
          to_position_id: formData.to_position_id || null,
          from_role: formData.from_role || null,
          to_role: formData.to_role || null,
          effective_date: formData.effective_date,
          reason: formData.reason || null
        }])

      if (error) throw error
      toast.success('Registro de asignación creado exitosamente')
      resetForm()
      fetchRecords()
    } catch (error: any) {
      console.error('Error creating assignment record:', error)
      toast.error('Error al crear registro de asignación: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      user_id: '',
      assignment_type: '',
      from_unit_id: '',
      to_unit_id: '',
      from_position_id: '',
      to_position_id: '',
      from_role: '',
      to_role: '',
      effective_date: '',
      reason: ''
    })
    setActiveTab('list')
  }

  const getAssignmentTypeLabel = (type: string) => {
    switch (type) {
      case 'unit':
        return 'Unidad'
      case 'position':
        return 'Posición'
      case 'role':
        return 'Rol'
      default:
        return type
    }
  }

  const getAssignmentTypeColor = (type: string) => {
    switch (type) {
      case 'unit':
        return 'badge-primary'
      case 'position':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      case 'role':
        return 'badge-success'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const filteredRecords = records.filter(record =>
    record.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'create':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Crear Nuevo Registro de Asignación
                </h3>
                <p className="text-sm text-muted-foreground">
                  Completa los datos para crear un nuevo registro de asignación
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
                    Usuario <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.user_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, user_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="ID del usuario"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tipo de Asignación <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.assignment_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignment_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="unit">Unidad</option>
                    <option value="position">Posición</option>
                    <option value="role">Rol</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Desde Unidad
                  </label>
                  <input
                    type="text"
                    value={formData.from_unit_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, from_unit_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="ID de unidad origen"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Hacia Unidad
                  </label>
                  <input
                    type="text"
                    value={formData.to_unit_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, to_unit_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="ID de unidad destino"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fecha Efectiva <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, effective_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Razón
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  rows={3}
                  placeholder="Razón de la asignación (opcional)"
                />
              </div>

              <div className="flex gap-3">
                <ActionButton
                  type="submit"
                  variant="primary"
                  icon={Save}
                >
                  Crear Registro
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
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              />
            </div>

            {/* Records Table */}
            <div className="bg-card rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Desde
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Hacia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Fecha Efectiva
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Razón
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground">
                              {record.user.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-foreground">{record.user.full_name}</div>
                              <div className="text-sm text-muted-foreground">{record.user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getAssignmentTypeColor(record.assignment_type)}`}>
                            {getAssignmentTypeLabel(record.assignment_type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {record.from_unit?.name || record.from_position?.name || record.from_role || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {record.to_unit?.name || record.to_position?.name || record.to_role || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(record.effective_date).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                          {record.reason || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <ActionButton
                              variant="secondary"
                              size="sm"
                              icon={Edit2}
                              onClick={() => toast('Funcionalidad de edición próximamente', { icon: '✏️' })}
                            >
                              Editar
                            </ActionButton>
                            <ActionButton
                              variant="destructive"
                              size="sm"
                              icon={Trash2}
                              onClick={() => handleDelete(record.id)}
                            >
                              Eliminar
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredRecords.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No se encontraron registros de asignación</p>
                </div>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              Mostrando {filteredRecords.length} de {records.length} registros
            </div>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <PageFrame title="Registros de Asignación" description="Rastrea asignaciones de unidad, posición y rol">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageFrame>
    )
  }

  return (
    <PageFrame 
      title="Registros de Asignación" 
      description="Rastrea asignaciones de unidad, posición y rol"
      headerActions={
        activeTab === 'list' ? (
          <ActionButton
            variant="primary"
            icon={Plus}
            onClick={() => setActiveTab('create')}
          >
            Nuevo Registro
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
            Lista de Registros
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Crear Registro
          </button>
        </nav>
      </div>

      {renderTabContent()}
    </PageFrame>
  )
}