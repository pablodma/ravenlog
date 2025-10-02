'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit2, Trash2, Eye, FileText, Calendar as CalendarIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Form {
  id: string
  title: string
  description: string
  form_type: 'recruitment' | 'leave_request'
  fields: any
  is_active: boolean
  created_at: string
  _count?: {
    applications?: number
    leave_submissions?: number
  }
}

export default function FormsManager() {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'recruitment' | 'leave_request'>('all')

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const { data, error } = await supabase
        .from('recruitment_forms')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setForms(data || [])
    } catch (error: any) {
      console.error('Error fetching forms:', error)
      toast.error('Error al cargar formularios')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (form: Form) => {
    if (!confirm(`¿Estás seguro de eliminar el formulario "${form.title}"?`)) return

    try {
      const { error } = await supabase
        .from('recruitment_forms')
        .delete()
        .eq('id', form.id)

      if (error) throw error
      toast.success('Formulario eliminado exitosamente')
      fetchForms()
    } catch (error: any) {
      console.error('Error deleting form:', error)
      toast.error('Error al eliminar formulario: ' + error.message)
    }
  }

  const toggleActive = async (form: Form) => {
    try {
      const { error } = await supabase
        .from('recruitment_forms')
        .update({ is_active: !form.is_active })
        .eq('id', form.id)

      if (error) throw error
      toast.success(form.is_active ? 'Formulario desactivado' : 'Formulario activado')
      fetchForms()
    } catch (error: any) {
      console.error('Error updating form:', error)
      toast.error('Error al actualizar formulario')
    }
  }

  const filteredForms = forms.filter(form => 
    filter === 'all' ? true : form.form_type === filter
  )

  const getFormTypeLabel = (type: string) => {
    switch (type) {
      case 'recruitment':
        return 'Reclutamiento'
      case 'leave_request':
        return 'Solicitud de Ausencia'
      default:
        return type
    }
  }

  const getFormTypeColor = (type: string) => {
    switch (type) {
      case 'recruitment':
        return 'bg-blue-100 text-blue-800'
      case 'leave_request':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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
          <h2 className="text-2xl font-bold text-foreground">Formularios</h2>
          <p className="text-muted-foreground mt-1">Gestiona los formularios de tu organización</p>
        </div>
        <Link
          href="/forms/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Formulario
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos ({forms.length})
        </button>
        <button
          onClick={() => setFilter('recruitment')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'recruitment'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Reclutamiento ({forms.filter(f => f.form_type === 'recruitment').length})
        </button>
        <button
          onClick={() => setFilter('leave_request')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'leave_request'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Ausencias ({forms.filter(f => f.form_type === 'leave_request').length})
        </button>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredForms.map((form) => (
          <div
            key={form.id}
            className="bg-card rounded-lg border p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-foreground">{form.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {form.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFormTypeColor(form.form_type)}`}>
                {getFormTypeLabel(form.form_type)}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                form.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {form.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div className="text-xs text-muted-foreground mb-4">
              {Array.isArray(form.fields) ? form.fields.length : 0} campos
            </div>

            <div className="flex items-center gap-2 pt-4 border-t">
              <button
                onClick={() => toast.info('Vista previa próximamente')}
                className="flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
                title="Vista previa"
              >
                <Eye className="h-4 w-4" />
                Ver
              </button>
              <button
                onClick={() => toast.info('Edición próximamente')}
                className="flex-1 px-3 py-2 text-sm text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 flex items-center justify-center gap-2"
                title="Editar"
              >
                <Edit2 className="h-4 w-4" />
                Editar
              </button>
              <button
                onClick={() => handleDelete(form)}
                className="px-3 py-2 text-sm text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => toggleActive(form)}
              className="w-full mt-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {form.is_active ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        ))}
      </div>

      {filteredForms.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No hay formularios
          </h3>
          <p className="text-muted-foreground mb-4">
            {filter === 'all'
              ? 'Aún no has creado ningún formulario'
              : `No hay formularios de tipo "${getFormTypeLabel(filter)}"`}
          </p>
          <Link
            href="/forms/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Crear Primer Formulario
          </Link>
        </div>
      )}
    </div>
  )
}

