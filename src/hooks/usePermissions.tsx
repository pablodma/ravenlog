import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

export function usePermissions() {
  const { profile } = useAuth()
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.role_id) {
      fetchUserPermissions()
    } else {
      setPermissions([])
      setLoading(false)
    }
  }, [profile?.role_id])

  const fetchUserPermissions = async () => {
    try {
      setLoading(true)
      
      // Obtener permisos del usuario basado en su rol
      const { data, error } = await (supabase as any)
        .from('role_permissions')
        .select(`
          permission_id,
          permissions!inner(name)
        `)
        .eq('role_id', profile?.role_id)

      if (error) throw error

      const userPermissions = data?.map((item: any) => item.permissions.name) || []
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
    if (profile?.role === 'admin') return true
    
    return permissions.includes(permission)
  }

  const hasAnyPermission = (permissionList: string[]): boolean => {
    // Admin siempre tiene todos los permisos
    if (profile?.role === 'admin') return true
    
    return permissionList.some(permission => permissions.includes(permission))
  }

  const hasAllPermissions = (permissionList: string[]): boolean => {
    // Admin siempre tiene todos los permisos
    if (profile?.role === 'admin') return true
    
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
