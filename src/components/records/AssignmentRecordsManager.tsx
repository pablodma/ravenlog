'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import CreateAssignmentRecordModal from './CreateAssignmentRecordModal'

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
  notes?: string
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

export default function AssignmentRecordsManager() {
  const [records, setRecords] = useState<AssignmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('assignment_records')
        .select(`
          *,
          user:profiles!user_id(full_name, email),
          from_unit:units!from_unit_id(name),
          to_unit:units!to_unit_id(name),
          from_position:unit_positions!from_position_id(name),
          to_position:unit_positions!to_position_id(name)
        `)
        .order('effective_date', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (error: any) {
      console.error('Error fetching records:', error)
      toast.error('Error al cargar registros de asignación')
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Registros de Asignación</h2>
          <p className="text-muted-foreground mt-1">Rastrea asignaciones de unidad, posición y rol</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Registro
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input w-full pl-10"
        />
      </div>

      {/* Records Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Desde
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Hacia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Razón
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="table-row">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {record.user.full_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {record.user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${getAssignmentTypeColor(record.assignment_type)}`}>
                      {getAssignmentTypeLabel(record.assignment_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {record.assignment_type === 'unit' && record.from_unit?.name}
                    {record.assignment_type === 'position' && record.from_position?.name}
                    {record.assignment_type === 'role' && record.from_role}
                    {!record.from_unit && !record.from_position && !record.from_role && '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {record.assignment_type === 'unit' && record.to_unit?.name}
                    {record.assignment_type === 'position' && record.to_position?.name}
                    {record.assignment_type === 'role' && record.to_role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(record.effective_date).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                    {record.reason || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toast.info('Funcionalidad de edición próximamente')}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No assignment records found</p>
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredRecords.length} of {records.length} records
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateAssignmentRecordModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchRecords()
          }}
        />
      )}
    </div>
  )
}

