import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Award } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Medal {
  id: string
  name: string
  title: string
  description: string
  image_url: string | null
  rarity: string
  created_at: string
}

interface MedalForm {
  name: string
  title: string
  description: string
  image_url: string
  rarity: string
}

export default function MedalManager() {
  const [medals, setMedals] = useState<Medal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMedal, setEditingMedal] = useState<Medal | null>(null)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState<MedalForm>({
    name: '',
    title: '',
    description: '',
    image_url: '',
    rarity: 'common'
  })

  useEffect(() => {
    fetchMedals()
  }, [])

  const fetchMedals = async () => {
    try {
      const { data, error } = await supabase
        .from('medals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMedals(data || [])
    } catch (error) {
      console.error('Error fetching medals:', error)
      toast.error('Error al cargar medallas')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.includes('png')) {
      toast.error('Solo se permiten archivos PNG')
      return
    }

    setUploading(true)
    try {
      const fileExt = 'png'
      const fileName = `medal-${Date.now()}.${fileExt}`
      const filePath = `medals/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      setForm({ ...form, image_url: publicUrl })
      toast.success('Imagen subida exitosamente')
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error('Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingMedal) {
        const { error } = await supabase
          .from('medals')
          .update(form)
          .eq('id', editingMedal.id)

        if (error) throw error
        toast.success('Medalla actualizada exitosamente')
      } else {
        const { error } = await supabase
          .from('medals')
          .insert([form])

        if (error) throw error
        toast.success('Medalla creada exitosamente')
      }

      resetForm()
      fetchMedals()
    } catch (error: any) {
      console.error('Error saving medal:', error)
      toast.error(error.message || 'Error al guardar medalla')
    }
  }

  const handleEdit = (medal: Medal) => {
    setEditingMedal(medal)
    setForm({
      name: medal.name,
      title: medal.title,
      description: medal.description,
      image_url: medal.image_url || '',
      rarity: medal.rarity
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta medalla?')) return

    try {
      const { error } = await supabase
        .from('medals')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Medalla eliminada exitosamente')
      fetchMedals()
    } catch (error: any) {
      console.error('Error deleting medal:', error)
      toast.error(error.message || 'Error al eliminar medalla')
    }
  }

  const resetForm = () => {
    setForm({ name: '', title: '', description: '', image_url: '', rarity: 'common' })
    setEditingMedal(null)
    setShowForm(false)
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Medallas</h2>
          <p className="text-gray-600">Crear y gestionar medallas y reconocimientos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Medalla
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingMedal ? 'Editar Medalla' : 'Nueva Medalla'}
            </h3>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagen (PNG)
              </label>
              <div className="flex items-center gap-4">
                {form.image_url && (
                  <img src={form.image_url} alt="Preview" className="w-16 h-16 object-cover rounded-lg border" />
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept=".png"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {uploading && <p className="text-sm text-blue-600 mt-1">Subiendo imagen...</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingMedal ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {medals.map((medal) => (
          <div key={medal.id} className="bg-white p-4 rounded-lg border shadow-sm flex items-center gap-4">
            <div className="flex-shrink-0">
              {medal.image_url ? (
                <img src={medal.image_url} alt={medal.name} className="w-16 h-16 object-cover rounded-lg border" />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center">
                  <Award className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{medal.title}</h3>
              <p className="text-sm text-gray-600">{medal.name}</p>
              <p className="text-sm text-gray-500 mt-1">{medal.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(medal)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(medal.id)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {medals.length === 0 && (
        <div className="text-center py-12">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No hay medallas creadas aún</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Crear Primera Medalla
          </button>
        </div>
      )}
    </div>
  )
}
