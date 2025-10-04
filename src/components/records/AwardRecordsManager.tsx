'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Trash2, Award, Calendar, User, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import PageFrame from '@/components/ui/PageFrame'
import ActionButton from '@/components/ui/ActionButton'

interface AwardRecord {
  id: string
  user_id: string
  medal_id: string
  awarded_date: string
  reason: string
  operation_name?: string
  citation?: string
  awarded_by: string
  created_at: string
  user: {
    full_name: string
    email: string
  }
  medal: {
    name: string
    description: string
    category: string
    rarity: string
  }
}

type TabType = 'list' | 'create'

export default function AwardRecordsManager() {
  const [records, setRecords] = useState<AwardRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('list')
  const [formData, setFormData] = useState({
    user_id: '',
    medal_id: '',
    awarded_date: '',
    reason: '',
    operation_name: '',
    citation: '',
    awarded_by: ''
  })

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('award_records')
        .select(`
          *,
          user:profiles!user_id(full_name, email),
          medal:medals!medal_id(name, description, category, rarity)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (error: any) {
      console.error('Error fetching records:', error)
      toast.error('Error al cargar registros de premios')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro de premio?')) return

    try {
      const { error } = await supabase
        .from('award_records')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Registro de premio eliminado exitosamente')
      fetchRecords()
    } catch (error: any) {
      console.error('Error deleting award record:', error)
      toast.error('Error al eliminar registro de premio: ' + error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.user_id || !formData.medal_id || !formData.awarded_date || !formData.reason) {
      toast.error('Los campos obligatorios son requeridos')
      return
    }

    try {
      const { error } = await supabase
        .from('award_records')
        .insert([{
          user_id: formData.user_id,
          medal_id: formData.medal_id,
          awarded_date: formData.awarded_date,
          reason: formData.reason,
          operation_name: formData.operation_name || null,
          citation: formData.citation || null,
          awarded_by: formData.awarded_by
        }])

      if (error) throw error
      toast.success('Registro de premio creado exitosamente')
      resetForm()
      fetchRecords()
    } catch (error: any) {
      console.error('Error creating award record:', error)
      toast.error('Error al crear registro de premio: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      user_id: '',
      medal_id: '',
      awarded_date: '',
      reason: '',
      operation_name: '',
      citation: '',
      awarded_by: ''
    })
    setActiveTab('list')
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800'
      case 'uncommon':
        return 'bg-green-100 text-green-800'
      case 'rare':
        return 'bg-blue-100 text-blue-800'
      case 'epic':
        return 'bg-purple-100 text-purple-800'
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'create':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Crear Nuevo Registro de Premio
                </h3>
                <p className="text-sm text-muted-foreground">
                  Completa los datos para crear un nuevo registro de premio
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
                    Medalla <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.medal_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, medal_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="ID de la medalla"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Fecha de Otorgamiento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.awarded_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, awarded_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Otorgado por
                  </label>
                  <input
                    type="text"
                    value={formData.awarded_by}
                    onChange={(e) => setFormData(prev => ({ ...prev, awarded_by: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="Nombre de quien otorga"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Razón <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  rows={3}
                  placeholder="Razón del otorgamiento"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre de Operación
                  </label>
                  <input
                    type="text"
                    value={formData.operation_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, operation_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="Nombre de la operación (opcional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Citación
                  </label>
                  <input
                    type="text"
                    value={formData.citation}
                    onChange={(e) => setFormData(prev => ({ ...prev, citation: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="Citación (opcional)"
                  />
                </div>
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
            {records.length === 0 ? (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No hay registros de premios</h3>
                <p className="text-muted-foreground mb-4">Aún no se han creado registros de premios.</p>
                <ActionButton
                  variant="primary"
                  icon={Plus}
                  onClick={() => setActiveTab('create')}
                >
                  Crear Primer Registro
                </ActionButton>
              </div>
            ) : (
              <div className="grid gap-4">
                {records.map((record) => (
                  <div key={record.id} className="card p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Award className="h-5 w-5 text-foreground" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-foreground">{record.medal.name}</h4>
                            <p className="text-sm text-muted-foreground">{record.user.full_name}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h5 className="text-small-label mb-1">Fecha de Otorgamiento</h5>
                            <p className="text-body-small text-muted-foreground">
                              {new Date(record.awarded_date).toLocaleDateString('es-ES')}
                            </p>
                          </div>

                          <div>
                            <h5 className="text-small-label mb-1">Categoría</h5>
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getRarityColor(record.medal.rarity)}`}>
                              {record.medal.category}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h5 className="text-small-label mb-1">Razón</h5>
                          <p className="text-body-small text-muted-foreground">{record.reason}</p>
                        </div>

                        {record.operation_name && (
                          <div className="mb-4">
                            <h5 className="text-small-label mb-1">Operación</h5>
                            <p className="text-body-small text-muted-foreground">{record.operation_name}</p>
                          </div>
                        )}

                        {record.citation && (
                          <div className="mb-4">
                            <h5 className="text-small-label mb-1">Citación</h5>
                            <p className="text-body-small text-muted-foreground">{record.citation}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <ActionButton
                          variant="destructive"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDelete(record.id)}
                        >
                          Eliminar
                        </ActionButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
    }
  }

  if (loading) {
    return (
      <PageFrame title="Registros de Premios" description="Gestiona los registros de premios y medallas">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageFrame>
    )
  }

  return (
    <PageFrame 
      title="Registros de Premios" 
      description="Gestiona los registros de premios y medallas"
      headerActions={
        activeTab === 'list' && records.length > 0 ? (
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