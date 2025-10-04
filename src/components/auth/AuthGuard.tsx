'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import LoadingSpinner from '@/components/LoadingSpinner'

interface AuthGuardProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  requiredRole?: 'admin' | 'user'
  fallbackPath?: string
}

export default function AuthGuard({
  children,
  requiredPermissions = [],
  requiredRole,
  fallbackPath = '/login'
}: AuthGuardProps) {
  const { user, loading: authLoading } = useAuth()
  const { permissions, loading: permissionsLoading, hasPermission, hasAllPermissions } = usePermissions()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    if (authLoading || permissionsLoading) return

    // Si no hay usuario, redirigir al login
    if (!user) {
      router.push(fallbackPath)
      return
    }

    // Verificar rol requerido
    if (requiredRole && user.user_metadata?.role !== requiredRole) {
      router.push('/unauthorized')
      return
    }

    // Verificar permisos requeridos
    if (requiredPermissions.length > 0) {
      const hasRequiredPermissions = hasAllPermissions(requiredPermissions)
      if (!hasRequiredPermissions) {
        router.push('/unauthorized')
        return
      }
    }

    setIsAuthorized(true)
  }, [user, authLoading, permissionsLoading, requiredPermissions, requiredRole, router, fallbackPath, hasAllPermissions])

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading || permissionsLoading || isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Si no está autorizado, no mostrar nada (ya se redirigió)
  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}

// Componente específico para admin
export function AdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="admin" fallbackPath="/unauthorized">
      {children}
    </AuthGuard>
  )
}

// Componente específico para usuarios autenticados
export function UserGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  )
}

// Componente para verificar permisos específicos
export function PermissionGuard({ 
  children, 
  permissions 
}: { 
  children: React.ReactNode
  permissions: string[]
}) {
  return (
    <AuthGuard requiredPermissions={permissions}>
      {children}
    </AuthGuard>
  )
}
