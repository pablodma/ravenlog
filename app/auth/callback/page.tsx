'use client'

import { useContext, useEffect } from 'react'
import { AuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function AuthCallbackPage() {
  const { user, loading } = useContext(AuthContext)
  const router = useRouter()

  useEffect(() => {
    console.log('🔄 AuthCallback: Verificando sesión...')
    console.log('🔄 AuthCallback: loading =', loading, 'user =', !!user)
    
    // Debug de URL y parámetros
    console.log('🔍 AuthCallback: URL actual:', window.location.href)
    console.log('🔍 AuthCallback: Hash:', window.location.hash)
    console.log('🔍 AuthCallback: Search:', window.location.search)
    
    // Esperar más tiempo para que Supabase procese la sesión
    const checkSession = async () => {
      console.log('⏳ AuthCallback: Esperando sesión de Supabase...')
      
      // Procesar el código OAuth manualmente
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        
        if (code) {
          console.log('🔑 AuthCallback: Procesando código OAuth:', code)
          
          // Intercambiar código por sesión
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          console.log('🔄 AuthCallback: exchangeCodeForSession result:', { data, error })
          
          if (data.session) {
            console.log('✅ AuthCallback: Sesión establecida con código')
            router.push('/dashboard')
            return
          } else if (error) {
            console.error('❌ AuthCallback: Error intercambiando código:', error)
          }
        } else {
          console.log('⚠️ AuthCallback: No hay código en la URL')
        }
      } catch (error) {
        console.error('❌ AuthCallback: Error procesando código:', error)
      }
      
      // Intentar obtener sesión existente
      try {
        const { data, error } = await supabase.auth.getSession()
        console.log('🔍 AuthCallback: getSession result:', { data, error })
        
        if (data.session) {
          console.log('✅ AuthCallback: Sesión encontrada inmediatamente')
          router.push('/dashboard')
          return
        }
      } catch (error) {
        console.error('❌ AuthCallback: Error en getSession:', error)
      }
      
      // Esperar hasta 10 segundos para que la sesión se establezca
      for (let i = 0; i < 20; i++) {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const { data: { session } } = await supabase.auth.getSession()
        console.log(`🔄 AuthCallback: Intento ${i + 1}/20 - session:`, !!session)
        
        if (session?.user) {
          console.log('✅ AuthCallback: Sesión encontrada, redirigiendo a dashboard')
          router.push('/dashboard')
          return
        }
      }
      
      console.log('❌ AuthCallback: Timeout - no se encontró sesión, redirigiendo a login')
      router.push('/login')
    }
    
    if (!loading) {
      checkSession()
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
