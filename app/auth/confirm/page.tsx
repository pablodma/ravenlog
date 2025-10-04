'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function AuthConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔵 Auth confirm page: Iniciando verificación')
    console.log('🔵 Auth confirm page: URL completa:', window.location.href)
    console.log('🔵 Auth confirm page: Hash:', window.location.hash)
    console.log('🔵 Auth confirm page: Search params:', Object.fromEntries(searchParams.entries()))

    // Verificar si hay access_token en el hash (flujo de recuperación de contraseña)
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      console.log('🔵 Auth confirm page: Detectado enlace de recuperación con access_token')
      
      // Extraer parámetros del hash
      const hashParams = new URLSearchParams(hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const type = hashParams.get('type')

      console.log('🔵 Auth confirm page: Parámetros del hash:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        type
      })

      if (accessToken && type === 'recovery') {
        console.log('🔵 Auth confirm page: Configurando sesión de recuperación')
        
        // Configurar la sesión con los tokens
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        })

        // Esperar un momento para que se procese la sesión
        setTimeout(() => {
          console.log('✅ Auth confirm page: Sesión de recuperación configurada')
          toast.success('¡Enlace de recuperación válido! Puedes cambiar tu contraseña.')
          
          // Usar window.location.href para forzar la navegación en la misma pestaña
          window.location.href = '/auth/update-password'
        }, 1000) // 1 segundo de espera
        
        return
      }
    }

    // Verificar si hay parámetros en la query string (flujo normal)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const next = searchParams.get('next') ?? '/dashboard'

    if (token_hash && type) {
      console.log('🔵 Auth confirm page: Verificando OTP con token_hash')
      supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      }).then(({ data, error }) => {
        if (error) {
          console.error('🔴 Auth confirm page: Error en verificación OTP:', error)
          setError(error.message)
          setLoading(false)
          return
        }

        console.log('✅ Auth confirm page: Verificación OTP exitosa')
        toast.success('¡Verificación exitosa!')
        router.push(next)
      }).catch((err: any) => {
        console.error('🔴 Auth confirm page: Error en catch de verifyOtp:', err)
        setError(err.message || 'Error inesperado')
        setLoading(false)
      })
      return
    }

    // Si no se detectó ningún flujo válido
    console.log('🔴 Auth confirm page: No se detectó flujo válido')
    setError('Enlace inválido o expirado')
    setLoading(false)
  }, [router, searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando enlace...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Enlace Inválido
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {error}
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/login')}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Volver al Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
