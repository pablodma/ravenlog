'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, Clock, Users, CheckCircle, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

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

export default function FormsPage() {
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
        .eq('is_active', true)
        .eq('is_public', true)
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando formularios...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Formularios</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Completa los formularios disponibles para enviar solicitudes y reportes
          </p>
        </div>

        {/* Forms Grid */}
        {forms.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <div key={form.id} className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {form.name}
                    </h3>
                    {form.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {form.description}
                      </p>
                    )}
                  </div>
                  <div className="ml-4">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Activo
                    </span>
                  </div>
                </div>

                {form.instructions && (
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Instrucciones:</strong> {form.instructions}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {form._count?.submissions || 0} envíos
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(form.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/forms/${form.slug}`}
                  className="inline-flex items-center gap-2 w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors justify-center"
                >
                  Completar Formulario
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No hay formularios disponibles
            </h3>
            <p className="text-muted-foreground">
              No hay formularios públicos disponibles en este momento.
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            ¿Cómo funcionan los formularios?
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary font-semibold text-xs">1</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Completa el formulario</p>
                <p>Llena todos los campos requeridos con información precisa</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary font-semibold text-xs">2</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Envía tu solicitud</p>
                <p>Revisa la información y envía el formulario</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary font-semibold text-xs">3</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Espera respuesta</p>
                <p>Tu solicitud será revisada y procesada por el equipo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}