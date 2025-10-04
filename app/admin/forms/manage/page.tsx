'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit2, Trash2, Eye, Copy, Settings, FileText, Inbox, ClipboardList } from 'lucide-react'
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

export default function ManageFormsPage() {
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
      
      const processedForms = data?.map((form: any) => ({
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
      const { error } = await (supabase as any)
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
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando formularios...</p>
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
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestionar Formularios</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Crea y gestiona formularios personalizados para recopilar datos valiosos de la organización
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-border">
            <nav className="flex space-x-8">
              <Link
                href="/admin/forms"
                className="inline-flex items-center gap-2 py-2 px-1 border-b-2 border-primary text-primary font-medium text-sm"
              >
                <ClipboardList className="h-4 w-4" />
                Gestionar Formularios
              </Link>
              <Link
                href="/admin/forms/receptions"
                className="inline-flex items-center gap-2 py-2 px-1 border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-border font-medium text-sm transition-colors"
              >
                <Inbox className="h-4 w-4" />
                Bandeja
              </Link>
            </nav>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar formularios..."
                  className="pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <Link
              href="/admin/forms/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Crear formulario
            </Link>
          </div>

          {/* Forms List */}
          {forms.length > 0 ? (
            <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Público
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Envíos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {forms.map((form) => (
                      <tr key={form.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-foreground">{form.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-muted-foreground">/{form.slug}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-foreground max-w-xs truncate">
                            {form.description || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            form.is_public 
                              ? 'bg-green-500/10 text-green-600' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {form.is_public ? 'Sí' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            form.is_active 
                              ? 'bg-green-500/10 text-green-600' 
                              : 'bg-destructive/10 text-destructive'
                          }`}>
                            {form.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {form._count?.submissions || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyFormUrl(form.slug)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              title="Copiar URL"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <Link
                              href={`/forms/${form.slug}`}
                              className="text-primary hover:text-primary/80 transition-colors"
                              title="Ver formulario"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/admin/forms/edit/${form.id}`}
                              className="text-green-600 hover:text-green-700 transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(form)}
                              className="text-destructive hover:text-destructive/80 transition-colors"
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
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <Settings className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No hay formularios
              </h3>
              <p className="text-muted-foreground mb-6">
                No hay formularios para ver. Crea uno para comenzar.
              </p>
              <Link
                href="/admin/forms/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Crear formulario
              </Link>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
