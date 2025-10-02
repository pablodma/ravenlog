'use client'

import { ReactNode } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { Lock } from 'lucide-react'

interface PermissionGuardProps {
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  fallback?: ReactNode
  children: ReactNode
}

export default function PermissionGuard({
  permission,
  permissions = [],
  requireAll = false,
  fallback,
  children
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
  } else {
    // Si no se especifican permisos, permitir acceso
    hasAccess = true
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <Lock className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso Restringido</h3>
        <p className="text-gray-600 max-w-md">
          No tienes permisos suficientes para acceder a esta funcionalidad. 
          Contacta con un administrador si necesitas acceso.
        </p>
      </div>
    )
  }

  return <>{children}</>
}

// Componente para mostrar solo si tiene permisos (sin fallback)
export function PermissionCheck({
  permission,
  permissions = [],
  requireAll = false,
  children
}: Omit<PermissionGuardProps, 'fallback'>) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()

  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
  } else {
    hasAccess = true
  }

  if (!hasAccess) {
    return null
  }

  return <>{children}</>
}


