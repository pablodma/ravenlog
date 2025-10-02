import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

// Hook para gestionar permisos RBAC
export function usePermissions() {
  const { profile } = useAuth()
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.role_id) {
      fetchUserPermissions()
    } else if (profile?.role) {
      // Fallback para usuarios que aún no tienen role_id (durante migración)
      fetchUserPermissionsByRole()
    } else {
      setPermissions([])
      setLoading(false)
    }
  }, [profile?.role_id, profile?.role])

  const fetchUserPermissions = async () => {
    try {
      setLoading(true)
      
      // Obtener permisos del usuario basado en su role_id (RBAC completo)
      const { data, error } = await (supabase as any)
        .from('role_permissions')
        .select(`
          permission_id,
          permissions!inner(name)
        `)
        .eq('role_id', profile?.role_id!)

      if (error) throw error

      const userPermissions = data?.map((item: any) => item.permissions.name) || []
      setPermissions(userPermissions)
    } catch (error) {
      console.error('Error fetching user permissions:', error)
      // Fallback al sistema de roles simple
      fetchUserPermissionsByRole()
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPermissionsByRole = async () => {
    try {
      setLoading(true)
      
      // Sistema de permisos basado en rol simple (fallback)
      let userPermissions: string[] = []
      
      switch (profile?.role) {
        case 'admin':
          // Admin tiene todos los permisos
          userPermissions = ['*'] // Wildcard para todos los permisos
          break
        case 'personnel':
          userPermissions = [
            'events.respond',
            'logs.view_all'
          ]
          break
        case 'candidate':
          userPermissions = []
          break
        default:
          userPermissions = []
      }
      
      setPermissions(userPermissions)
    } catch (error) {
      console.error('Error fetching user permissions by role:', error)
      setPermissions([])
    } finally {
      setLoading(false)
    }
  }

  const hasPermission = (permission: string): boolean => {
    // Admin siempre tiene todos los permisos
    if (profile?.role === 'admin' || permissions.includes('*')) return true
    
    return permissions.includes(permission)
  }

  const hasAnyPermission = (permissionList: string[]): boolean => {
    // Admin siempre tiene todos los permisos
    if (profile?.role === 'admin' || permissions.includes('*')) return true
    
    return permissionList.some(permission => permissions.includes(permission))
  }

  const hasAllPermissions = (permissionList: string[]): boolean => {
    // Admin siempre tiene todos los permisos
    if (profile?.role === 'admin' || permissions.includes('*')) return true
    
    return permissionList.every(permission => permissions.includes(permission))
  }

  const getUserRole = () => {
    return profile?.role || 'candidate'
  }

  const isAdmin = () => {
    return profile?.role === 'admin'
  }

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserRole,
    isAdmin,
    refetch: fetchUserPermissions
  }
}


