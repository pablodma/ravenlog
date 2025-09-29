import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Shield } from 'lucide-react'

interface RoleGuardProps {
  roles: string[]
  fallback?: ReactNode
  children: ReactNode
}

export default function RoleGuard({ roles, fallback, children }: RoleGuardProps) {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const hasRole = profile?.role && roles.includes(profile.role)

  if (!hasRole) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <Shield className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso Restringido</h3>
        <p className="text-gray-600 max-w-md">
          Esta funcionalidad está disponible solo para: {roles.join(', ')}.
          Tu rol actual: {profile?.role || 'Sin asignar'}
        </p>
      </div>
    )
  }

  return <>{children}</>
}

// Componente para mostrar solo si tiene el rol (sin fallback)
export function RoleCheck({ roles, children }: Omit<RoleGuardProps, 'fallback'>) {
  const { profile } = useAuth()
  
  const hasRole = profile?.role && roles.includes(profile.role)
  
  if (!hasRole) {
    return null
  }

  return <>{children}</>
}
