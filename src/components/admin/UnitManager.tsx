import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Users, Plane } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Unit {
  id: string
  name: string
  description: string
  unit_type: string
  callsign: string | null
  image_url: string | null
  max_personnel: number
  created_at: string
  personnel_count?: number
}

interface UnitForm {
  name: string
  description: string
  unit_type: string
  callsign: string
  image_url: string
  max_personnel: number
}

const UNIT_TYPES = [
  'squadron',
  'wing', 
  'group',
  'flight',
  'division'
]

export default function UnitManager() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState<UnitForm>({
    name: '',
    description: '',
    unit_type: 'squadron',
    callsign: '',
    image_url: '',
    max_personnel: 50
  })

  useEffect(() => {
    fetchUnits()
  }, [])

  const fetchUnits = async () => {
    try {
      // Obtener unidades con conteo de personal
      const { data: unitsData, error } = await (supabase as any)
        .from('units')
        .select(`
          *,
          personnel_count:profiles(count)
        `)
        .order('name')

      if (error) throw error

      // Formatear datos para incluir conteo
      const unitsWithCount = unitsData?.map((unit: any) => ({
        ...unit,
        personnel_count: unit.personnel_count?.[0]?.count || 0
      })) || []

      setUnits(unitsWithCount)
    } catch (error) {
      console.error('Error fetching units:', error)
      toast.error('Error al cargar unidades')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.includes('image/')) {
      toast.error('Solo se permiten archivos de imagen')
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `unit-${Date.now()}.${fileExt}`
      const filePath = `units/${fileName}`

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
      if (editingUnit) {
        const { error } = await (supabase as any)
          .from('units')
          .update(form)
          .eq('id', editingUnit.id)

        if (error) throw error
        toast.success('Unidad actualizada exitosamente')
      } else {
        const { error } = await (supabase as any)
          .from('units')
          .insert([form])

        if (error) throw error
        toast.success('Unidad creada exitosamente')
      }

      resetForm()
      fetchUnits()
    } catch (error: any) {
      console.error('Error saving unit:', error)
      if (error.code === '23505') {
        toast.error('Ya existe una unidad con ese nombre')
      } else {
        toast.error(error.message || 'Error al guardar unidad')
      }
    }
  }

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit)
    setForm({
      name: unit.name,
      description: unit.description,
      unit_type: unit.unit_type,
      callsign: unit.callsign || '',
      image_url: unit.image_url || '',
      max_personnel: unit.max_personnel
    })
    setShowForm(true)
  }

  const handleDelete = async (unit: Unit) => {
    if (unit.personnel_count && unit.personnel_count > 0) {
      toast.error(`No se puede eliminar. Hay ${unit.personnel_count} persona(s) asignada(s) a esta unidad`)
      return
    }

    if (!confirm(`¿Estás seguro de eliminar la unidad "${unit.name}"?`)) return

    try {
      const { error } = await (supabase as any)
        .from('units')
        .delete()
        .eq('id', unit.id)

      if (error) throw error
      toast.success('Unidad eliminada exitosamente')
      fetchUnits()
    } catch (error: any) {
      console.error('Error deleting unit:', error)
      toast.error(error.message || 'Error al eliminar unidad')
    }
  }

  const resetForm = () => {
    setForm({ name: '', description: '', unit_type: 'squadron', callsign: '', image_url: '', max_personnel: 50 })
    setEditingUnit(null)
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
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Unidades</h2>
          <p className="text-gray-600">Crear y gestionar unidades militares</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Unidad
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingUnit ? 'Editar Unidad' : 'Nueva Unidad'}
            </h3>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Unidad
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="ej: 101st Fighter Squadron"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Unidad
                </label>
                <select
                  value={form.unit_type}
                  onChange={(e) => setForm({ ...form, unit_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {UNIT_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Callsign
                </label>
                <input
                  type="text"
                  value={form.callsign}
                  onChange={(e) => setForm({ ...form, callsign: e.target.value })}
                  placeholder="ej: VIPER, EAGLE, FALCON"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Máximo Personal
                </label>
                <input
                  type="number"
                  value={form.max_personnel}
                  onChange={(e) => setForm({ ...form, max_personnel: parseInt(e.target.value) })}
                  min="1"
                  max="500"
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
                placeholder="Describe la misión y responsabilidades de esta unidad..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagen de la Unidad
              </label>
              <div className="flex items-center gap-4">
                {form.image_url && (
                  <img src={form.image_url} alt="Preview" className="w-16 h-16 object-cover rounded-lg border" />
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
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
                {editingUnit ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {units.map((unit) => (
          <div key={unit.id} className="bg-white p-4 rounded-lg border shadow-sm flex items-center gap-4">
            <div className="flex-shrink-0">
              {unit.image_url ? (
                <img src={unit.image_url} alt={unit.name} className="w-16 h-16 object-cover rounded-lg border" />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center">
                  <Plane className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{unit.name}</h3>
                {unit.callsign && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-mono">
                    {unit.callsign}
                  </span>
                )}
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                  {unit.unit_type}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{unit.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {unit.personnel_count || 0}/{unit.max_personnel} personal
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(unit)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(unit)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                disabled={!!(unit.personnel_count && unit.personnel_count > 0)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {units.length === 0 && (
        <div className="text-center py-12">
          <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No hay unidades creadas aún</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Crear Primera Unidad
          </button>
        </div>
      )}
    </div>
  )
}
