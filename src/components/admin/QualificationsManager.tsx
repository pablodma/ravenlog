'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit2, Trash2, Save, X, Award, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import PageFrame from '@/components/ui/PageFrame'
import EmptyState from '@/components/ui/EmptyState'
import LoadingState from '@/components/ui/LoadingState'
import ActionButton from '@/components/ui/ActionButton'
import DataTable from '@/components/ui/DataTable'
import { logger } from '@/utils/logger'
import { useIsMounted } from '@/hooks/useIsMounted'
import { useStableEffect } from '@/hooks/useStableEffect'

interface Qualification {
  id: string
  name: string
  description: string | null
  category_id: string | null
  category_name?: string
  requirements: string | null
  icon: string | null
  color: string
  is_active: boolean
  unit_id: string | null
  unit_name?: string
  created_at: string
}

interface Category {
  id: string
  name: string
  description: string | null
  color: string
  icon: string | null
  is_active: boolean
  created_at: string
}

type TabType = 'list' | 'create' | 'edit' | 'categories' | 'create_category' | 'edit_category'

export default function QualificationsManager() {
  const [qualifications, setQualifications] = useState<Qualification[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('list')
  const [editingQualification, setEditingQualification] = useState<Qualification | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [units, setUnits] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false) // Prevenir requests duplicadas
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: null,
    requirements: '',
    icon: '',
    color: '#6B7280',
    is_active: true,
    unit_id: null,
  })
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    color: '#6B7280',
    icon: '',
    is_active: true,
  })

  const isMounted = useIsMounted()

  useStableEffect(() => {
    let mounted = true
    let abortController: AbortController | null = null
    
    logger.info('QualificationsManager', 'Iniciando carga de datos...')
    setIsLoading(true)
    
    const loadData = async () => {
      // Crear nuevo AbortController para esta carga
      abortController = new AbortController()
      
      try {
        await Promise.all([
          fetchQualifications(abortController.signal),
          fetchUnits(abortController.signal),
          fetchCategories(abortController.signal)
        ])
        
        if (mounted) {
          console.log('✅ QualificationsManager: Carga inicial completada')
        }
      } catch (error: any) {
        if (error.name !== 'AbortError' && mounted) {
          console.error('❌ QualificationsManager: Error en carga inicial:', error)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }
    
    loadData()
    
    // Cleanup function para cancelar requests pendientes
    return () => {
      mounted = false
      if (abortController) {
        logger.info('QualificationsManager', 'Cancelando requests pendientes...')
        abortController.abort()
      }
      setIsLoading(false)
    }
  }, [])

  const fetchUnits = async (signal?: AbortSignal) => {
    try {
      console.log('🔄 QualificationsManager: Cargando unidades...')
      
      // Verificar si la request fue cancelada
      if (signal?.aborted) {
        console.log('❌ QualificationsManager: Request de unidades cancelada')
        return
      }
      
      const { data, error } = await supabase
        .from('units')
        .select('id, name, unit_type, description')
        .order('name')
        .abortSignal(signal)

      if (error) throw error
      console.log('✅ QualificationsManager: Unidades cargadas:', data?.length || 0)
      
      // Solo actualizar estado si el componente sigue montado
      if (!signal?.aborted && isMounted) {
        setUnits(data || [])
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('❌ QualificationsManager: Request de unidades abortada')
        return
      }
      console.error('❌ QualificationsManager: Error cargando unidades:', error)
      toast.error('Error al cargar unidades: ' + error.message)
    }
  }

  const fetchCategories = async (signal?: AbortSignal) => {
    try {
      console.log('🔄 QualificationsManager: Cargando categorías...')
      
      // Verificar si la request fue cancelada
      if (signal?.aborted) {
        console.log('❌ QualificationsManager: Request de categorías cancelada')
        return
      }
      
      const { data, error } = await supabase
        .from('qualification_categories')
        .select('*')
        .order('name')
        .abortSignal(signal)

      if (error) throw error
      console.log('✅ QualificationsManager: Categorías cargadas:', data?.length || 0)
      
      // Solo actualizar estado si el componente sigue montado
      if (!signal?.aborted && isMounted) {
        setCategories(data || [])
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('❌ QualificationsManager: Request de categorías abortada')
        return
      }
      console.error('❌ QualificationsManager: Error cargando categorías:', error)
      toast.error('Error al cargar categorías')
    }
  }

  const fetchQualifications = async (signal?: AbortSignal) => {
    try {
      console.log('🔄 QualificationsManager: Cargando calificaciones...')
      
      // Verificar si la request fue cancelada
      if (signal?.aborted) {
        console.log('❌ QualificationsManager: Request de calificaciones cancelada')
        return
      }
      
      setLoading(true)
      const { data, error } = await supabase
        .from('qualifications')
        .select('*')
        .order('name', { ascending: true })
        .abortSignal(signal)

      if (error) throw error
      
      console.log('📊 QualificationsManager: Datos brutos de calificaciones:', data)
      
      // Transform data to include unit_name and category_name
      const transformedData = (data || []).map(qual => ({
        ...qual,
        unit_name: null, // Will be populated when unit_id is set
        category_name: null // Will be populated when category_id is set
      }))
      
      console.log('✅ QualificationsManager: Calificaciones transformadas:', transformedData.length)
      
      // Solo actualizar estado si el componente sigue montado
      if (!signal?.aborted && isMounted) {
        setQualifications(transformedData)
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('❌ QualificationsManager: Request de calificaciones abortada')
        return
      }
      console.error('❌ QualificationsManager: Error cargando calificaciones:', error)
      toast.error('Error al cargar calificaciones')
    } finally {
      console.log('🏁 QualificationsManager: Finalizando carga de calificaciones')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔄 QualificationsManager: Iniciando submit de calificación...')
    console.log('📊 QualificationsManager: Datos del formulario:', formData)
    
    if (!formData.name.trim()) {
      console.log('❌ QualificationsManager: Nombre requerido')
      toast.error('El nombre es requerido')
      return
    }

    if (!formData.category_id) {
      console.log('❌ QualificationsManager: Categoría requerida')
      toast.error('La categoría es requerida')
      return
    }

    if (!formData.unit_id) {
      console.log('❌ QualificationsManager: Unidad requerida')
      toast.error('La unidad es requerida')
      return
    }

    try {
      if (editingQualification) {
        console.log('🔄 QualificationsManager: Actualizando calificación existente:', editingQualification.id)
        const { error } = await supabase
          .from('qualifications')
          .update({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            category_id: formData.category_id,
            requirements: formData.requirements.trim() || null,
            icon: formData.icon.trim() || null,
            color: formData.color,
            is_active: formData.is_active,
            unit_id: formData.unit_id,
          })
          .eq('id', editingQualification.id)

        if (error) throw error
        console.log('✅ QualificationsManager: Calificación actualizada exitosamente')
        toast.success('Calificación actualizada exitosamente')
      } else {
        console.log('🔄 QualificationsManager: Creando nueva calificación')
        const { error } = await supabase
          .from('qualifications')
          .insert([{
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            category_id: formData.category_id,
            requirements: formData.requirements.trim() || null,
            icon: formData.icon.trim() || null,
            color: formData.color,
            is_active: formData.is_active,
            unit_id: formData.unit_id,
          }])

        if (error) throw error
        console.log('✅ QualificationsManager: Calificación creada exitosamente')
        toast.success('Calificación creada exitosamente')
      }

      console.log('🔄 QualificationsManager: Reseteando formulario y recargando datos...')
      resetForm()
      await fetchQualifications()
      console.log('✅ QualificationsManager: Submit completado')
    } catch (error: any) {
      console.error('❌ QualificationsManager: Error guardando calificación:', error)
      toast.error('Error al guardar calificación: ' + error.message)
    }
  }

  const handleEdit = (qualification: Qualification) => {
    setEditingQualification(qualification)
    setFormData({
      name: qualification.name,
      description: qualification.description || '',
      category_id: qualification.category_id,
      requirements: qualification.requirements || '',
      icon: qualification.icon || '',
      color: qualification.color,
      is_active: qualification.is_active,
      unit_id: qualification.unit_id,
    })
    setActiveTab('edit')
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔄 QualificationsManager: Iniciando submit de categoría...')
    console.log('📊 QualificationsManager: Datos del formulario de categoría:', categoryFormData)
    
    if (!categoryFormData.name.trim()) {
      console.log('❌ QualificationsManager: Nombre de categoría requerido')
      toast.error('El nombre es requerido')
      return
    }

    try {
      if (editingCategory) {
        console.log('🔄 QualificationsManager: Actualizando categoría existente:', editingCategory.id)
        const { error } = await supabase
          .from('qualification_categories')
          .update({
            name: categoryFormData.name.trim(),
            description: categoryFormData.description.trim() || null,
            color: categoryFormData.color,
            icon: categoryFormData.icon.trim() || null,
            is_active: categoryFormData.is_active,
          })
          .eq('id', editingCategory.id)

        if (error) throw error
        console.log('✅ QualificationsManager: Categoría actualizada exitosamente')
        toast.success('Categoría actualizada exitosamente')
      } else {
        console.log('🔄 QualificationsManager: Creando nueva categoría')
        const { error } = await supabase
          .from('qualification_categories')
          .insert([{
            name: categoryFormData.name.trim(),
            description: categoryFormData.description.trim() || null,
            color: categoryFormData.color,
            icon: categoryFormData.icon.trim() || null,
            is_active: categoryFormData.is_active,
          }])

        if (error) throw error
        console.log('✅ QualificationsManager: Categoría creada exitosamente')
        toast.success('Categoría creada exitosamente')
      }

      console.log('🔄 QualificationsManager: Recargando categorías...')
      await fetchCategories()
      resetCategoryForm()
      console.log('✅ QualificationsManager: Submit de categoría completado')
    } catch (error: any) {
      console.error('❌ QualificationsManager: Error guardando categoría:', error)
      toast.error('Error al guardar categoría: ' + error.message)
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      color: category.color,
      icon: category.icon || '',
      is_active: category.is_active,
    })
    setActiveTab('edit_category')
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return

    try {
      const { error } = await supabase
        .from('qualification_categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Categoría eliminada exitosamente')
      await fetchCategories()
    } catch (error: any) {
      console.error('Error deleting category:', error)
      toast.error('Error al eliminar categoría: ' + error.message)
    }
  }

  const resetCategoryForm = () => {
    setEditingCategory(null)
    setCategoryFormData({
      name: '',
      description: '',
      color: '#6B7280',
      icon: '',
      is_active: true,
    })
    setActiveTab('categories')
  }

  const handleDelete = async (id: string) => {
    console.log('🔄 QualificationsManager: Iniciando eliminación de calificación:', id)
    if (!confirm('¿Estás seguro de eliminar esta calificación?')) {
      console.log('❌ QualificationsManager: Eliminación cancelada por el usuario')
      return
    }

    try {
      console.log('🔄 QualificationsManager: Eliminando calificación de la base de datos...')
      const { error } = await supabase
        .from('qualifications')
        .delete()
        .eq('id', id)

      if (error) throw error
      console.log('✅ QualificationsManager: Calificación eliminada exitosamente')
      toast.success('Calificación eliminada exitosamente')
      
      console.log('🔄 QualificationsManager: Recargando calificaciones...')
      await fetchQualifications()
      console.log('✅ QualificationsManager: Eliminación completada')
    } catch (error: any) {
      console.error('❌ QualificationsManager: Error eliminando calificación:', error)
      toast.error('Error al eliminar calificación: ' + error.message)
    }
  }

  const resetForm = () => {
    console.log('🔄 QualificationsManager: Reseteando formulario de calificación')
    setEditingQualification(null)
    setFormData({
      name: '',
      description: '',
      category_id: null,
      requirements: '',
      icon: '',
      color: '#6B7280',
      is_active: true,
      unit_id: null,
    })
    setActiveTab('list')
    console.log('✅ QualificationsManager: Formulario de calificación reseteado')
  }

  const columns = [
    {
      key: 'name',
      label: 'Nombre',
      render: (value: string, item: Qualification) => (
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: item.color }}
          />
          <div>
            <div className="font-medium text-foreground">{value}</div>
            {item.icon && (
              <div className="text-sm text-muted-foreground">{item.icon}</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Categoría',
      render: (value: string) => (
        <span className="badge-primary text-xs">
          {value || 'Sin categoría'}
        </span>
      )
    },
    {
      key: 'unit_id',
      label: 'Unidad',
      render: (value: string) => (
        <span className="text-sm text-muted-foreground">
          {value ? 'Asignada' : 'Sin unidad'}
        </span>
      )
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (value: string) => (
        <div className="max-w-xs truncate text-muted-foreground">
          {value || 'Sin descripción'}
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: (value: boolean) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (value: any, item: Qualification) => (
        <div className="flex items-center gap-2">
          <ActionButton
            variant="secondary"
            size="sm"
            icon={Edit2}
            onClick={() => handleEdit(item)}
          >
            Editar
          </ActionButton>
          <ActionButton
            variant="destructive"
            size="sm"
            icon={Trash2}
            onClick={() => handleDelete(item.id)}
          >
            Eliminar
          </ActionButton>
        </div>
      )
    }
  ]

  const emptyState = (
    <EmptyState
      icon={Award}
      title="No hay calificaciones"
      description="Aún no has creado ninguna calificación. Crea la primera para comenzar."
      action={{
        label: "Crear Primera Calificación",
        onClick: () => setActiveTab('create'),
        icon: Plus
      }}
    />
  )

  if (loading) {
    return (
      <PageFrame title="Calificaciones" description="Gestiona las calificaciones disponibles en el sistema">
        <LoadingState text="Cargando calificaciones..." />
      </PageFrame>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'categories':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Categorías de Calificaciones</h3>
                <p className="text-sm text-muted-foreground">
                  Gestiona las categorías disponibles para las calificaciones
                </p>
              </div>
              <ActionButton
                variant="primary"
                icon={Plus}
                onClick={() => setActiveTab('create_category')}
              >
                Nueva Categoría
              </ActionButton>
            </div>

            <DataTable
              data={categories}
              columns={[
                {
                  key: 'name',
                  label: 'Nombre',
                  render: (value: string, item: Category) => (
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <div className="font-medium text-foreground">{value}</div>
                        {item.icon && (
                          <div className="text-sm text-muted-foreground">{item.icon}</div>
                        )}
                      </div>
                    </div>
                  )
                },
                {
                  key: 'description',
                  label: 'Descripción',
                  render: (value: string) => (
                    <div className="max-w-xs truncate text-muted-foreground">
                      {value || 'Sin descripción'}
                    </div>
                  )
                },
                {
                  key: 'is_active',
                  label: 'Estado',
                  render: (value: boolean) => (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {value ? 'Activo' : 'Inactivo'}
                    </span>
                  )
                },
                {
                  key: 'actions',
                  label: 'Acciones',
                  render: (value: any, item: Category) => (
                    <div className="flex items-center gap-2">
                      <ActionButton
                        variant="secondary"
                        size="sm"
                        icon={Edit2}
                        onClick={() => handleEditCategory(item)}
                      >
                        Editar
                      </ActionButton>
                      <ActionButton
                        variant="destructive"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDeleteCategory(item.id)}
                      >
                        Eliminar
                      </ActionButton>
                    </div>
                  )
                }
              ]}
              emptyState={
                <EmptyState
                  icon={Tag}
                  title="Sin categorías"
                  description="No hay categorías creadas. Crea la primera categoría para comenzar."
                />
              }
            />
          </div>
        )

      case 'create_category':
      case 'edit_category':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {editingCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {editingCategory ? 'Modifica los datos de la categoría' : 'Completa los datos para crear una nueva categoría'}
                </p>
              </div>
              <ActionButton
                variant="secondary"
                icon={X}
                onClick={resetCategoryForm}
              >
                Cancelar
              </ActionButton>
            </div>

            <form onSubmit={handleCategorySubmit} className="bg-card rounded-lg border p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="Nombre de la categoría"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={categoryFormData.color}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-10 border border-input rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={categoryFormData.color}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      placeholder="#6B7280"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Descripción
                </label>
                <textarea
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  rows={2}
                  placeholder="Descripción de la categoría"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Icono
                </label>
                <input
                  type="text"
                  value={categoryFormData.icon}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  placeholder="Nombre del icono (ej: graduation-cap, target, star)"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={categoryFormData.is_active}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-input"
                  />
                  <span className="text-sm text-foreground">Categoría activa</span>
                </label>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <ActionButton
                  type="submit"
                  variant="primary"
                  icon={Save}
                >
                  {editingCategory ? 'Actualizar Categoría' : 'Crear Categoría'}
                </ActionButton>
                <ActionButton
                  type="button"
                  variant="secondary"
                  icon={X}
                  onClick={resetCategoryForm}
                >
                  Cancelar
                </ActionButton>
              </div>
            </form>
          </div>
        )

      case 'create':
      case 'edit':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {editingQualification ? 'Editar Calificación' : 'Crear Nueva Calificación'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {editingQualification ? 'Modifica los datos de la calificación' : 'Completa los datos para crear una nueva calificación'}
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
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="Nombre de la calificación"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category_id || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value || null }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Unidad <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.unit_id || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit_id: e.target.value || null }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    required
                  >
                    <option value="">Seleccionar unidad</option>
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>{unit.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  rows={2}
                  placeholder="Descripción de la calificación"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Requisitos
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  rows={2}
                  placeholder="Prerrequisitos o requisitos para obtener esta calificación..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="h-10 w-20 rounded border border-input cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      placeholder="#6B7280"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-foreground">Activo</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <ActionButton
                  type="submit"
                  variant="primary"
                  icon={Save}
                >
                  {editingQualification ? 'Actualizar' : 'Crear'} Calificación
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
          <DataTable
            data={qualifications}
            columns={columns}
            emptyState={emptyState}
          />
        )
    }
  }

  return (
    <PageFrame 
      title="Calificaciones" 
      description="Gestiona las calificaciones disponibles en el sistema"
      headerActions={
        activeTab === 'list' ? (
          <ActionButton
            variant="primary"
            icon={Plus}
            onClick={() => setActiveTab('create')}
          >
            Nueva Calificación
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
            Lista de Calificaciones
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Crear Calificación
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Categorías
          </button>
        </nav>
      </div>

      {renderTabContent()}
    </PageFrame>
  )
}