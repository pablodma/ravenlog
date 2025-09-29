import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export function usePermissions() {
  const { profile } = useAuth()
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Por ahora, usar el rol directo hasta que implementemos role_id
    if (profile?.role) {
      fetchUserPermissions()
    } else {
      setPermissions([])
      setLoading(false)
    }
  }, [profile?.role])

  const fetchUserPermissions = async () => {
    try {
      setLoading(true)
      
      // Por ahora, asignar permisos basados en el rol directo
      // TODO: Implementar cuando tengamos role_id en profiles
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
      console.error('Error fetching user permissions:', error)
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

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refetch: fetchUserPermissions
  }
}
