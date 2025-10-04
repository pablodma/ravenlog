'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Plus, Edit2, FolderOpen, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CreateFormPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'form' | 'submissions' | 'notifications'>('form')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    instructions: '',
    is_public: false
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const handleSlugChange = (slug: string) => {
    // Only allow alphanumeric characters and hyphens
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setFormData(prev => ({
      ...prev,
      slug: cleanSlug
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error('El nombre y slug son requeridos')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Debes estar autenticado para crear formularios')
        return
      }

      const { data, error } = await supabase
        .from('forms')
        .insert({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          description: formData.description.trim() || null,
          instructions: formData.instructions.trim() || null,
          is_public: formData.is_public,
          created_by: user.id
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Formulario creado correctamente')
      router.push(`/admin/forms/edit/${data.id}`)
    } catch (error: any) {
      console.error('Error creating form:', error)
      if (error.code === '23505') {
        toast.error('El slug ya existe. Por favor, elige otro.')
      } else {
        toast.error('Error al crear el formulario')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/admin/forms"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                Volver a Formularios
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Crear Formulario</h1>
            <p className="text-sm text-gray-500">
              Define la información básica de tu formulario
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('form')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'form'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Edit2 className="h-4 w-4" />
                Formulario
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'submissions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FolderOpen className="h-4 w-4" />
                Envíos
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Bell className="h-4 w-4" />
                Notificaciones
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'form' && (
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="Nombre del formulario"
                    required
                  />
                  <p className="mt-1 text-sm text-muted-foreground">
                    El nombre del formulario
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="slug-del-formulario"
                    required
                  />
                  <p className="mt-1 text-sm text-muted-foreground">
                    Se usará en la URL: /forms/{formData.slug || 'slug-del-formulario'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  rows={3}
                  placeholder="Descripción breve del formulario"
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  Una descripción breve del formulario
                </p>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Instrucciones
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  rows={4}
                  placeholder="Instrucciones para los usuarios que llenarán el formulario"
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  Instrucciones que seguirán los usuarios al llenar el formulario
                </p>
              </div>

              {/* Public Setting */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                  className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                />
                <label htmlFor="is_public" className="ml-2 text-sm text-foreground">
                  Permitir envíos de invitados (público)
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                Si está habilitado, los usuarios no autenticados podrán enviar el formulario
              </p>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-border">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? 'Creando...' : 'Crear Formulario'}
                  </button>
                  <Link
                    href="/admin/forms"
                    className="px-4 py-2 text-muted-foreground bg-muted rounded-lg hover:bg-muted/80"
                  >
                    Cancelar
                  </Link>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Configuración de Envíos</h2>
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  La configuración de envíos estará disponible después de crear el formulario
                </p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Configuración de Notificaciones</h2>
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  La configuración de notificaciones estará disponible después de crear el formulario
                </p>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
