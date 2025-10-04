'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  console.log('🟡 HomePage render:', { loading, hasUser: !!user })

  useEffect(() => {
    console.log('🟡 HomePage useEffect:', { loading, hasUser: !!user })
    if (!loading) {
      if (user) {
        console.log('🟢 HomePage: Redirigiendo a /dashboard')
        router.push('/dashboard')
      } else {
        console.log('🟢 HomePage: Redirigiendo a /login')
        router.push('/login')
      }
    }
  }, [user, loading, router])

  // Loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando...</p>
        <p className="mt-2 text-xs text-gray-400">Loading: {loading.toString()} | User: {user ? 'Yes' : 'No'}</p>
      </div>
    </div>
  )
}
