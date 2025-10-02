'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Eye, ExternalLink, Search, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Submission {
  id: string
  submission_type: 'recruitment' | 'leave_request'
  form_id: string
  form_title: string
  user_id: string
  user_name: string
  user_email: string
  form_data: any
  status: string
  created_at: string
  processed_at?: string
  start_date?: string
  end_date?: string
}

export default function SubmissionsManager() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'recruitment' | 'leave_request'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      // Obtener solicitudes de reclutamiento
      const { data: applications, error: appError } = await supabase
        .from('applications')
        .select(`
          id,
          form_id,
          applicant_id,
          form_data,
          status,
          created_at,
          processed_at,
          form:recruitment_forms!form_id(id, title, form_type),
          applicant:profiles!applicant_id(id, full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (appError) throw appError

      // Obtener solicitudes de ausencia
      const { data: leaves, error: leaveError } = await supabase
        .from('leave_submissions')
        .select(`
          id,
          form_id,
          user_id,
          form_data,
          status,
          start_date,
          end_date,
          created_at,
          processed_at,
          form:recruitment_forms(id, title, form_type),
          user:profiles!user_id(id, full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (leaveError) throw leaveError

      // Combinar y formatear
      const formattedApplications: Submission[] = (applications || []).map(app => ({
        id: app.id,
        submission_type: 'recruitment' as const,
        form_id: app.form_id,
        form_title: (app.form as any)?.title || 'Formulario eliminado',
        user_id: app.applicant_id,
        user_name: (app.applicant as any)?.full_name || 'Usuario desconocido',
        user_email: (app.applicant as any)?.email || '',
        form_data: app.form_data,
        status: app.status,
        created_at: app.created_at,
        processed_at: app.processed_at,
      }))

      const formattedLeaves: Submission[] = (leaves || []).map(leave => ({
        id: leave.id,
        submission_type: 'leave_request' as const,
        form_id: leave.form_id,
        form_title: (leave.form as any)?.title || 'Formulario eliminado',
        user_id: leave.user_id,
        user_name: (leave.user as any)?.full_name || 'Usuario desconocido',
        user_email: (leave.user as any)?.email || '',
        form_data: leave.form_data,
        status: leave.status,
        created_at: leave.created_at,
        processed_at: leave.processed_at,
        start_date: leave.start_date,
        end_date: leave.end_date,
      }))

      // Combinar y ordenar por fecha
      const allSubmissions = [...formattedApplications, ...formattedLeaves]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setSubmissions(allSubmissions)
    } catch (error: any) {
      console.error('Error fetching submissions:', error)
      toast.error('Error al cargar envíos')
    } finally {
      setLoading(false)
    }
  }

  const handleProcess = (submission: Submission) => {
    if (submission.submission_type === 'recruitment') {
      // Redirigir a procesamiento de reclutamiento
      router.push(`/admin?tab=recruitment&application=${submission.id}`)
    } else {
      // Redirigir a procesamiento de ausencia
      router.push(`/forms/process-leave/${submission.id}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'in_review':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'approved':
        return 'Aprobado'
      case 'accepted':
        return 'Aceptado'
      case 'rejected':
        return 'Rechazado'
      case 'in_review':
        return 'En Revisión'
      default:
        return status
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'recruitment':
        return 'Reclutamiento'
      case 'leave_request':
        return 'Ausencia'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'recruitment':
        return 'bg-blue-100 text-blue-800'
      case 'leave_request':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch =
      sub.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.form_title.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === 'all' || sub.submission_type === typeFilter
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Envíos</h2>
        <p className="text-muted-foreground mt-1">Gestiona todas las solicitudes recibidas</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o formulario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos los tipos</option>
          <option value="recruitment">Reclutamiento</option>
          <option value="leave_request">Ausencia</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobado</option>
          <option value="rejected">Rechazado</option>
        </select>
      </div>

      {/* Submissions Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Formulario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {submission.user_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {submission.user_email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-foreground">
                      {submission.form_title}
                    </div>
                    {submission.start_date && submission.end_date && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(submission.start_date).toLocaleDateString()} - {new Date(submission.end_date).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(submission.submission_type)}`}>
                      {getTypeLabel(submission.submission_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(submission.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                      {getStatusLabel(submission.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toast.info('Vista previa próximamente')}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {submission.status === 'pending' && (
                        <button
                          onClick={() => handleProcess(submission)}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                          title="Procesar solicitud"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Procesar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay envíos que coincidan con los filtros</p>
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredSubmissions.length} de {submissions.length} envíos
      </div>
    </div>
  )
}

