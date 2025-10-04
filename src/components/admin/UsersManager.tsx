'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Eye, Edit2, Trash2, Plus, Search, Filter, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import PageFrame from '@/components/ui/PageFrame'
import ActionButton from '@/components/ui/ActionButton'

interface User {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  status?: string
  role: string
  created_at: string
  rank?: {
    id: string
    name: string
    abbreviation: string
  } | null
}

type TabType = 'list' | 'edit'

export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('list')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    role: 'candidate'
  })
  const [saving, setSaving] = useState(false)
  
  // Para el formulario de edición
  const [ranks, setRanks] = useState<Array<{ id: string; name: string; abbreviation: string }>>([])

  const isMountedRef = useRef(true)

  useEffect(() => {
    console.log('🔄 UsersManager: Iniciando carga de datos...')
    isMountedRef.current = true
    
    const loadData = async () => {
      try {
        await fetchData()
        if (isMountedRef.current) {
          console.log('✅ UsersManager: Carga inicial completada')
        }
      } catch (error: any) {
        if (isMountedRef.current) {
          console.error('❌ UsersManager: Error en carga inicial:', error)
          toast.error('Error cargando usuarios')
        }
      }
    }
    
    loadData()
    
    // Cleanup function
    return () => {
      console.log('🔄 UsersManager: Limpiando componente...')
      isMountedRef.current = false
    }
  }, [])

  const fetchData = async () => {
    try {
      console.log('🔄 UsersManager: Cargando datos...')
      
      // Check if component is still mounted before setting loading
      if (!isMountedRef.current) {
        console.log('❌ UsersManager: Componente desmontado, cancelando carga')
        return
      }
      
      setLoading(true)
      console.log('🔄 UsersManager: Estado de carga establecido')
      
      // Create timeout promise to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: La consulta tardó más de 10 segundos')), 10000)
      })
      
      // Fetch users with timeout
      console.log('🔄 UsersManager: Consultando perfiles...')
      const usersPromise = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          avatar_url,
          role,
          created_at
        `)
        .order('created_at', { ascending: false })

      const { data: usersData, error: usersError } = await Promise.race([
        usersPromise,
        timeoutPromise
      ]) as any

      if (usersError) {
        console.error('❌ UsersManager: Error consultando perfiles:', usersError)
        throw usersError
      }
      
      // Check if component is still mounted before updating state
      if (!isMountedRef.current) {
        console.log('❌ UsersManager: Componente desmontado después de consulta de perfiles')
        return
      }
      
      console.log('✅ UsersManager: Usuarios cargados:', usersData?.length || 0)
      setUsers(usersData || [])

      // Fetch supporting data for edit modal with timeout
      console.log('🔄 UsersManager: Consultando rangos...')
      const ranksPromise = supabase
        .from('ranks')
        .select('id, name, abbreviation')
        .order('order')

      const ranksRes = await Promise.race([
        ranksPromise,
        timeoutPromise
      ]) as any

      if (!isMountedRef.current) {
        console.log('❌ UsersManager: Componente desmontado después de consulta de rangos')
        return
      }

      if (ranksRes.data) {
        console.log('✅ UsersManager: Rangos cargados:', ranksRes.data.length)
        setRanks(ranksRes.data)
      } else {
        console.log('⚠️ UsersManager: No se encontraron rangos')
      }

    } catch (error: any) {
      if (!isMountedRef.current) {
        console.log('❌ UsersManager: Componente desmontado durante manejo de error')
        return
      }
      
      console.error('❌ UsersManager: Error cargando datos:', error)
      console.error('❌ UsersManager: Detalles del error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      
      // Show more specific error messages
      if (error.message.includes('Timeout')) {
        toast.error('Error: La consulta tardó demasiado tiempo. Verifica tu conexión.')
      } else if (error.message.includes('permission denied') || error.message.includes('insufficient_privilege')) {
        toast.error('Error: No tienes permisos para acceder a estos datos. Contacta al administrador.')
      } else {
        toast.error('Error cargando usuarios: ' + error.message)
      }
    } finally {
      if (isMountedRef.current) {
        console.log('🏁 UsersManager: Finalizando carga de datos')
        setLoading(false)
      } else {
        console.log('❌ UsersManager: Componente desmontado, no actualizando estado de carga')
      }
    }
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user "${user.full_name}"?`)) return

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (error) throw error
      
      toast.success('User deleted successfully')
      // Remove the user from the local state instead of refetching
      setUsers(prev => prev.filter(u => u.id !== user.id))
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error('Error deleting user: ' + error.message)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      full_name: user.full_name,
      role: user.role
    })
    setActiveTab('edit')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          role: formData.role,
        })
        .eq('id', editingUser.id)

      if (error) throw error
      
      toast.success('Usuario actualizado exitosamente')
      
      // Update the user in the local state instead of refetching
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id 
          ? { ...u, full_name: formData.full_name, role: formData.role }
          : u
      ))
      
      resetForm()
    } catch (error: any) {
      console.error('Error updating user:', error)
      toast.error('Error al actualizar usuario: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setEditingUser(null)
    setFormData({ full_name: '', role: 'candidate' })
    setActiveTab('list')
  }

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isOnline = (lastSignIn?: string) => {
    if (!lastSignIn) return false
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return new Date(lastSignIn) > fiveMinutesAgo
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'edit':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Editar Usuario
                </h3>
                <p className="text-sm text-muted-foreground">
                  Modifica los datos del usuario
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
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Rol <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  >
                    <option value="candidate">Candidato</option>
                    <option value="personnel">Personal</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              {editingUser && (
                <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
                  <p><strong>Email:</strong> {editingUser.email}</p>
                  <p className="mt-1"><strong>ID:</strong> <span className="font-mono text-xs">{editingUser.id}</span></p>
                  <p className="mt-1"><strong>Creado:</strong> {new Date(editingUser.created_at).toLocaleDateString()}</p>
                </div>
              )}

              <div className="flex gap-3">
                <ActionButton
                  type="submit"
                  variant="primary"
                  icon={Save}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
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
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-card rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Fecha de Creación
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground">
                              {user.full_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-foreground">{user.full_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-muted-foreground">{user.email}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full capitalize ${
                            user.role === 'admin' ? 'text-purple-700 bg-purple-100' :
                            user.role === 'personnel' ? 'text-blue-700 bg-blue-100' :
                            'text-gray-700 bg-gray-100'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString('es-ES')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <ActionButton
                              variant="secondary"
                              size="sm"
                              icon={Edit2}
                              onClick={() => handleEdit(user)}
                            >
                              Editar
                            </ActionButton>
                            <ActionButton
                              variant="destructive"
                              size="sm"
                              icon={Trash2}
                              onClick={() => handleDelete(user)}
                            >
                              Eliminar
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No se encontraron usuarios</p>
                </div>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              Mostrando {filteredUsers.length} resultado{filteredUsers.length !== 1 ? 's' : ''}
            </div>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <PageFrame title="Usuarios" description="Gestiona los usuarios del sistema">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageFrame>
    )
  }

  return (
    <PageFrame 
      title="Usuarios" 
      description="Gestiona los usuarios del sistema"
      headerActions={
        activeTab === 'list' ? (
          <ActionButton
            variant="primary"
            icon={Plus}
            onClick={() => toast('Funcionalidad próximamente', { icon: '🚀' })}
          >
            Nuevo Usuario
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
            Lista de Usuarios
          </button>
        </nav>
      </div>

      {renderTabContent()}
    </PageFrame>
  )
}

