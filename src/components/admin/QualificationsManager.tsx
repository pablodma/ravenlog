'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Qualification {
  id: string
  name: string
  description: string | null
  category: string | null
  requirements: string | null
  icon: string | null
  color: string
  is_active: boolean
}

const CATEGORY_OPTIONS = [
  { value: 'aircraft', label: 'Aircraft' },
  { value: 'weapon_system', label: 'Weapon System' },
  { value: 'tactical', label: 'Tactical' },
  { value: 'instructor', label: 'Instructor' },
]

export default function QualificationsManager() {
  const [qualifications, setQualifications] = useState<Qualification[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'aircraft',
    requirements: '',
    icon: '',
    color: '#6B7280',
    is_active: true,
  })

  useEffect(() => {
    fetchQualifications()
  }, [])

  const fetchQualifications = async () => {
    try {
      const { data, error } = await supabase
        .from('qualifications')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setQualifications(data || [])
    } catch (error: any) {
      toast.error('Error loading qualifications: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingId) {
        const { error } = await supabase
          .from('qualifications')
          .update(formData)
          .eq('id', editingId)

        if (error) throw error
        toast.success('Qualification updated successfully')
      } else {
        const { error } = await supabase
          .from('qualifications')
          .insert([formData])

        if (error) throw error
        toast.success('Qualification created successfully')
      }

      resetForm()
      fetchQualifications()
    } catch (error: any) {
      toast.error('Error saving qualification: ' + error.message)
    }
  }

  const handleEdit = (qualification: Qualification) => {
    setEditingId(qualification.id)
    setFormData({
      name: qualification.name,
      description: qualification.description || '',
      category: qualification.category || 'aircraft',
      requirements: qualification.requirements || '',
      icon: qualification.icon || '',
      color: qualification.color,
      is_active: qualification.is_active,
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this qualification?')) return

    try {
      const { error } = await supabase
        .from('qualifications')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Qualification deleted successfully')
      fetchQualifications()
    } catch (error: any) {
      toast.error('Error deleting qualification: ' + error.message)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      name: '',
      description: '',
      category: 'aircraft',
      requirements: '',
      icon: '',
      color: '#6B7280',
      is_active: true,
    })
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
      <div>
        <h2 className="text-2xl font-bold text-foreground">Qualifications Management</h2>
        <p className="text-muted-foreground mt-1">Manage certifications and qualifications for personnel.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-card rounded-lg border p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          {editingId ? 'Edit Qualification' : 'Create New Qualification'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
            >
              {CATEGORY_OPTIONS.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Requirements
          </label>
          <textarea
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
            rows={2}
            placeholder="Prerequisites or requirements to obtain this qualification..."
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
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-10 w-20 rounded border border-input cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-foreground">Active</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {editingId ? 'Update' : 'Create'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Qualifications List */}
      <div className="bg-card rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {qualifications.map((qualification) => (
                <tr key={qualification.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">{qualification.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-muted-foreground capitalize">{qualification.category?.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                    {qualification.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border border-border"
                        style={{ backgroundColor: qualification.color }}
                      />
                      <span className="text-xs text-muted-foreground">{qualification.color}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        qualification.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {qualification.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(qualification)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(qualification.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

