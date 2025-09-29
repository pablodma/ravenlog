'use client'

import { useContext, useEffect } from 'react'
import { AuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function AuthCallbackPage() {
  const { user, loading } = useContext(AuthContext)
  const router = useRouter()

  useEffect(() => {
    console.log('🔄 AuthCallback: Verificando sesión...')
    console.log('🔄 AuthCallback: loading =', loading, 'user =', !!user)
    
    if (!loading) {
      if (user) {
        console.log('✅ AuthCallback: Usuario autenticado, redirigiendo a dashboard')
        router.push('/dashboard')
      } else {
        console.log('❌ AuthCallback: No hay usuario, redirigiendo a login')
        router.push('/login')
      }
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Procesando autenticación...</p>
      </div>
    </div>
  )
}
