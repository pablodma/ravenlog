'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit2, Trash2, Eye, Copy, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Form {
  id: string
  name: string
  slug: string
  description: string | null
  instructions: string | null
  is_public: boolean
  is_active: boolean
  created_at: string
  _count?: {
    submissions?: number
  }
}

export default function FormsManager() {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select(`
          *,
          submissions:form_submissions(count)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const processedForms = data?.map(form => ({
        ...form,
        _count: {
          submissions: form.submissions?.[0]?.count || 0
        }
      })) || []

      setForms(processedForms)
    } catch (error: any) {
      console.error('Error fetching forms:', error)
      toast.error('Error al cargar formularios')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (form: Form) => {
    if (!confirm(`¿Estás seguro de eliminar el formulario "${form.name}"?`)) return

    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', form.id)

      if (error) throw error

      setForms(forms.filter(f => f.id !== form.id))
      toast.success('Formulario eliminado correctamente')
    } catch (error: any) {
      console.error('Error deleting form:', error)
      toast.error('Error al eliminar el formulario')
    }
  }

  const toggleActive = async (form: Form) => {
    try {
      const { error } = await supabase
        .from('forms')
        .update({ is_active: !form.is_active })
        .eq('id', form.id)

      if (error) throw error

      setForms(forms.map(f => 
        f.id === form.id ? { ...f, is_active: !f.is_active } : f
      ))
      
      toast.success(`Formulario ${!form.is_active ? 'activado' : 'desactivado'} correctamente`)
    } catch (error: any) {
      console.error('Error toggling form status:', error)
      toast.error('Error al cambiar el estado del formulario')
    }
  }

  const copyFormUrl = (slug: string) => {
    const url = `${window.location.origin}/forms/${slug}`
    navigator.clipboard.writeText(url)
    toast.success('URL copiada al portapapeles')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando formularios...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header with Create Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Lista de Formularios</h2>
          <p className="text-sm text-gray-500">
            Gestiona todos los formularios del sistema
          </p>
        </div>
        <Link
          href="/admin/forms/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Crear Formulario
        </Link>
      </div>

      {/* Forms List */}
      {forms.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <div key={form.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {form.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    /{form.slug}
                  </p>
                  {form.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {form.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    form.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {form.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                  {form.is_public && (
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      Público
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>
                  {form._count?.submissions || 0} envíos
                </span>
                <span>
                  {new Date(form.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => copyFormUrl(form.slug)}
                  className="flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
                  title="Copiar URL"
                >
                  <Copy className="h-4 w-4" />
                  Copiar URL
                </button>
                <Link
                  href={`/forms/${form.slug}`}
                  className="flex-1 px-3 py-2 text-sm text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 flex items-center justify-center gap-2"
                  title="Ver formulario"
                >
                  <Eye className="h-4 w-4" />
                  Ver
                </Link>
                <Link
                  href={`/admin/forms/edit/${form.id}`}
                  className="flex-1 px-3 py-2 text-sm text-green-700 bg-green-100 rounded-lg hover:bg-green-200 flex items-center justify-center gap-2"
                  title="Editar"
                >
                  <Edit2 className="h-4 w-4" />
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(form)}
                  className="px-3 py-2 text-sm text-red-700 bg-red-100 rounded-lg hover:bg-red-200 flex items-center justify-center"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => toggleActive(form)}
                className="w-full mt-3 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {form.is_active ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Settings className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay formularios creados
          </h3>
          <p className="text-gray-500 mb-6">
            Crea tu primer formulario para comenzar a recopilar información
          </p>
          <Link
            href="/admin/forms/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Crear Primer Formulario
          </Link>
        </div>
      )}
    </div>
  )
}




