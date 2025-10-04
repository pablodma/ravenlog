'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Eye, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Filter,
  Search,
  MoreHorizontal,
  ArrowUpDown,
  RefreshCw,
  Inbox,
  FileText
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import ProcessSubmissionModal from '@/components/admin/ProcessSubmissionModal'

interface FormSubmission {
  id: string
  form_id: string
  submitted_by: string | null
  submitted_by_email: string | null
  submitted_by_name: string | null
  form_data: any
  status: string
  is_read: boolean
  created_at: string
  updated_at: string
  form: {
    id: string
    name: string
    slug: string
  }
}

type FilterType = 'all' | 'read' | 'unread'
type SortType = 'newest' | 'oldest' | 'status' | 'form'

export default function ReceptionsPage() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortType>('newest')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([])
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null)

  useEffect(() => {
    fetchSubmissions()
  }, [filter, sortBy, searchTerm])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('form_submissions')
        .select(`
          *,
          form:forms(id, name, slug)
        `)

      // Aplicar filtros
      if (filter === 'read') {
        query = query.eq('is_read', true)
      } else if (filter === 'unread') {
        query = query.eq('is_read', false)
      }

      // Aplicar búsqueda
      if (searchTerm) {
        query = query.or(`form.name.ilike.%${searchTerm}%,submitted_by_email.ilike.%${searchTerm}%,submitted_by_name.ilike.%${searchTerm}%`)
      }

      // Aplicar ordenamiento
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'status':
          query = query.order('status', { ascending: true })
          break
        case 'form':
          query = query.order('form.name', { ascending: true })
          break
      }

      const { data, error } = await query

      if (error) throw error
      setSubmissions(data || [])
    } catch (error: any) {
      console.error('Error fetching submissions:', error)
      toast.error('Error al cargar recepciones')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (submissionIds: string[]) => {
    try {
      const { error } = await (supabase as any)
        .from('form_submissions')
        .update({ is_read: true })
        .in('id', submissionIds)

      if (error) throw error
      
      setSubmissions(prev => 
        prev.map(sub => 
          submissionIds.includes(sub.id) 
            ? { ...sub, is_read: true }
            : sub
        )
      )
      
      toast.success('Marcado como leído')
    } catch (error: any) {
      console.error('Error marking as read:', error)
      toast.error('Error al marcar como leído')
    }
  }

  const handleDelete = async (submissionId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta recepción?')) return

    try {
      const { error } = await supabase
        .from('form_submissions')
        .delete()
        .eq('id', submissionId)

      if (error) throw error
      
      setSubmissions(prev => prev.filter(sub => sub.id !== submissionId))
      toast.success('Recepción eliminada')
    } catch (error: any) {
      console.error('Error deleting submission:', error)
      toast.error('Error al eliminar recepción')
    }
  }

  const handleProcess = (submission: FormSubmission) => {
    setSelectedSubmission(submission)
    setShowProcessModal(true)
  }

  const handleProcessed = () => {
    fetchSubmissions()
    setShowProcessModal(false)
    setSelectedSubmission(null)
  }

  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'read' && !submission.is_read) return false
    if (filter === 'unread' && submission.is_read) return false
    return true
  })

  const getStatusBadge = (status: string) => {
    if (!status) return null
    
    // Define status colors and styles using design system
    const statusStyles: { [key: string]: { bg: string; text: string; label: string } } = {
      'pending': { bg: 'bg-yellow-500/10', text: 'text-yellow-600', label: 'Pendiente' },
      'approved': { bg: 'bg-green-500/10', text: 'text-green-600', label: 'Aprobado' },
      'rejected': { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Rechazado' },
      'reviewed': { bg: 'bg-primary/10', text: 'text-primary', label: 'Revisado' },
      'draft': { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Borrador' }
    }
    
    const style = statusStyles[status.toLowerCase()] || { bg: 'bg-muted', text: 'text-muted-foreground', label: status }
    
    return (
      <span 
        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}
      >
        {style.label}
      </span>
    )
  }

  const getSubmitterName = (submission: FormSubmission) => {
    if (submission.submitted_by_name) {
      return submission.submitted_by_name
    }
    if (submission.submitted_by_email) {
      return submission.submitted_by_email
    }
    return 'Usuario desconocido'
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando recepciones...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Bandeja</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Gestiona los formularios enviados por los usuarios
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchSubmissions}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Actualizar
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-border">
            <nav className="flex space-x-8">
              <Link
                href="/admin/forms"
                className="inline-flex items-center gap-2 py-2 px-1 border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-border font-medium text-sm transition-colors"
              >
                <FileText className="h-4 w-4" />
                Gestión de Formularios
              </Link>
              <Link
                href="/admin/forms/receptions"
                className="inline-flex items-center gap-2 py-2 px-1 border-b-2 border-primary text-primary font-medium text-sm"
              >
                <Inbox className="h-4 w-4" />
                Bandeja
              </Link>
            </nav>
          </div>

          {/* Filters and Search */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar por formulario o usuario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterType)}
                  className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                >
                  <option value="all">Todos</option>
                  <option value="unread">No leídos</option>
                  <option value="read">Leídos</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortType)}
                  className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                >
                  <option value="newest">Más recientes</option>
                  <option value="oldest">Más antiguos</option>
                  <option value="status">Por estado</option>
                  <option value="form">Por formulario</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submissions List */}
          <div className="bg-card rounded-lg border border-border">
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No hay recepciones
                </h3>
                <p className="text-muted-foreground">
                  {filter === 'all' 
                    ? 'Aún no hay formularios enviados'
                    : filter === 'read'
                    ? 'No hay recepciones leídas'
                    : 'No hay recepciones sin leer'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredSubmissions.map((submission) => (
                  <div 
                    key={submission.id} 
                    className={`p-6 hover:bg-muted/50 transition-colors ${
                      !submission.is_read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {submission.form.name}
                          </h3>
                          {!submission.is_read && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                              Nuevo
                            </span>
                          )}
                          {getStatusBadge(submission.status)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span>Enviado por: {getSubmitterName(submission)}</span>
                          <span>•</span>
                          <span>{new Date(submission.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{new Date(submission.created_at).toLocaleTimeString()}</span>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <p className="line-clamp-2">
                            Formulario enviado con {Object.keys(submission.form_data || {}).length} campos completados
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {/* Procesar - Botón principal */}
                        <button
                          onClick={() => handleProcess(submission)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium shadow-sm transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Procesar
                        </button>

                        {/* Acciones secundarias */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMarkAsRead([submission.id])}
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                            title="Marcar como leído"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(submission.id)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedSubmissions.length > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary">
                  {selectedSubmissions.length} recepciones seleccionadas
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMarkAsRead(selectedSubmissions)}
                    className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                  >
                    Marcar como leído
                  </button>
                  <button
                    onClick={() => setSelectedSubmissions([])}
                    className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Process Modal */}
        <ProcessSubmissionModal
          isOpen={showProcessModal}
          onClose={() => {
            setShowProcessModal(false)
            setSelectedSubmission(null)
          }}
          submission={selectedSubmission}
          onProcessed={handleProcessed}
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
