'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

interface CreateAssignmentRecordModalProps {
  onClose: () => void
  onSuccess: () => void
}

type TabType = 'details' | 'assignment' | 'notifications'

export default function CreateAssignmentRecordModal({ onClose, onSuccess }: CreateAssignmentRecordModalProps) {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('assignment')
  const [loading, setLoading] = useState(false)

  // Data for dropdowns
  const [users, setUsers] = useState<Array<{ id: string; full_name: string; email: string }>>([])
  const [units, setUnits] = useState<Array<{ id: string; name: string }>>([])
  const [positions, setPositions] = useState<Array<{ id: string; name: string }>>([])
  const [statuses, setStatuses] = useState<Array<{ id: string; name: string }>>([])

  // Form data
  const [formData, setFormData] = useState({
    user_id: '',
    assignment_type: 'unit' as 'unit' | 'position' | 'role',
    from_unit_id: '',
    to_unit_id: '',
    from_position_id: '',
    to_position_id: '',
    from_role: '',
    to_role: '',
    effective_date: new Date().toISOString().split('T')[0],
    reason: '',
    notes: '',
  })

  useEffect(() => {
    fetchDropdownData()
  }, [])

  const fetchDropdownData = async () => {
    try {
      const [usersRes, unitsRes, positionsRes, statusesRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email').order('full_name'),
        supabase.from('units').select('id, name').order('name'),
        supabase.from('unit_positions').select('id, name').order('name'),
        supabase.from('statuses').select('id, name').eq('is_active', true).order('name'),
      ])

      if (usersRes.data) setUsers(usersRes.data)
      if (unitsRes.data) setUnits(unitsRes.data)
      if (positionsRes.data) setPositions(positionsRes.data)
      if (statusesRes.data) setStatuses(statusesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent, createAnother = false) => {
    e.preventDefault()

    if (!formData.user_id) {
      toast.error('Please select a user')
      return
    }

    setLoading(true)
    try {
      const dataToInsert = {
        user_id: formData.user_id,
        assignment_type: formData.assignment_type,
        from_unit_id: formData.assignment_type === 'unit' ? (formData.from_unit_id || null) : null,
        to_unit_id: formData.assignment_type === 'unit' ? (formData.to_unit_id || null) : null,
        from_position_id: formData.assignment_type === 'position' ? (formData.from_position_id || null) : null,
        to_position_id: formData.assignment_type === 'position' ? (formData.to_position_id || null) : null,
        from_role: formData.assignment_type === 'role' ? (formData.from_role || null) : null,
        to_role: formData.assignment_type === 'role' ? (formData.to_role || null) : null,
        effective_date: formData.effective_date,
        reason: formData.reason || null,
        notes: formData.notes || null,
        created_by: profile?.id,
      }

      const { error } = await supabase
        .from('assignment_records')
        .insert([dataToInsert])

      if (error) throw error

      toast.success('Assignment record created successfully')
      
      if (createAnother) {
        // Reset form but keep assignment type
        setFormData({
          ...formData,
          user_id: '',
          from_unit_id: '',
          to_unit_id: '',
          from_position_id: '',
          to_position_id: '',
          from_role: '',
          to_role: '',
          reason: '',
          notes: '',
        })
      } else {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error creating record:', error)
      toast.error('Error creating assignment record: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const renderAssignmentFields = () => {
    switch (formData.assignment_type) {
      case 'unit':
        return (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Desde Unidad
                </label>
                <select
                  value={formData.from_unit_id}
                  onChange={(e) => setFormData({ ...formData, from_unit_id: e.target.value })}
                  className="input"
                >
                  <option value="">Ninguna / Nueva Asignación</option>
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Hacia Unidad *
                </label>
                <select
                  value={formData.to_unit_id}
                  onChange={(e) => setFormData({ ...formData, to_unit_id: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Seleccionar unidad</option>
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Si se selecciona, el usuario será asignado a la unidad al crear el registro.
            </p>
          </>
        )

      case 'position':
        return (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Desde Posición
                </label>
                <select
                  value={formData.from_position_id}
                  onChange={(e) => setFormData({ ...formData, from_position_id: e.target.value })}
                  className="input"
                >
                  <option value="">Ninguna / Nueva Asignación</option>
                  {positions.map(pos => (
                    <option key={pos.id} value={pos.id}>{pos.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Hacia Posición *
                </label>
                <select
                  value={formData.to_position_id}
                  onChange={(e) => setFormData({ ...formData, to_position_id: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Seleccionar posición</option>
                  {positions.map(pos => (
                    <option key={pos.id} value={pos.id}>{pos.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Si se selecciona, el usuario será asignado a la posición al crear el registro.
            </p>
          </>
        )

      case 'role':
        return (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Desde Rol
                </label>
                <select
                  value={formData.from_role}
                  onChange={(e) => setFormData({ ...formData, from_role: e.target.value })}
                  className="input"
                >
                  <option value="">Ninguno / Nueva Asignación</option>
                  <option value="admin">Administrador</option>
                  <option value="personnel">Personal</option>
                  <option value="candidate">Candidato</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Hacia Rol *
                </label>
                <select
                  value={formData.to_role}
                  onChange={(e) => setFormData({ ...formData, to_role: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Seleccionar rol</option>
                  <option value="admin">Administrador</option>
                  <option value="personnel">Personal</option>
                  <option value="candidate">Candidato</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Si se selecciona, el usuario será asignado al rol al crear el registro.
            </p>
          </>
        )
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <h2 className="text-lg font-semibold text-foreground">Crear Registro de Asignación</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border/50 bg-muted/20">
          <nav className="flex px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('details')}
              className={`tab-button ${activeTab === 'details' ? 'tab-button-active' : 'tab-button-inactive'}`}
            >
              Detalles
            </button>
            <button
              onClick={() => setActiveTab('assignment')}
              className={`tab-button ${activeTab === 'assignment' ? 'tab-button-active' : 'tab-button-inactive'}`}
            >
              Registro de Asignación
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`tab-button ${activeTab === 'notifications' ? 'tab-button-active' : 'tab-button-inactive'}`}
            >
              Notificaciones
            </button>
          </nav>
        </div>

        {/* Content */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Creado
                  </label>
                  <input
                    type="text"
                    value={new Date().toLocaleDateString('es-ES') + ' a las ' + new Date().toLocaleTimeString('es-ES')}
                    disabled
                    className="input opacity-60 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Autor
                  </label>
                  <input
                    type="text"
                    value={profile?.full_name || profile?.email || 'Admin'}
                    disabled
                    className="input opacity-60 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">El autor del registro</p>
                </div>
              </div>
            )}

            {/* Assignment Record Tab */}
            {activeTab === 'assignment' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Usuario(s) *
                  </label>
                  <select
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Seleccionar una opción</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name} ({user.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    El usuario al que se asigna este registro.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Tipo *
                  </label>
                  <select
                    value={formData.assignment_type}
                    onChange={(e) => setFormData({ ...formData, assignment_type: e.target.value as any })}
                    className="input"
                  >
                    <option value="unit">Asignación de Unidad</option>
                    <option value="position">Asignación de Posición</option>
                    <option value="role">Asignación de Rol</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    El tipo de registro de asignación. Un registro primario actualizará la unidad, posición y especialidad del usuario.
                  </p>
                </div>

                {renderAssignmentFields()}

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Fecha Efectiva *
                  </label>
                  <input
                    type="date"
                    value={formData.effective_date}
                    onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Razón
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="input"
                    rows={2}
                    placeholder="Razón de esta asignación..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Notas
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Información opcional sobre el registro"
                  />
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-muted/30 rounded-lg p-8 text-center">
                <p className="text-muted-foreground">
                  La configuración de notificaciones estará disponible en una futura actualización.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border/50 px-6 py-4 bg-muted/20">
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="btn-secondary disabled:opacity-50"
              >
                Crear y crear otro
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

