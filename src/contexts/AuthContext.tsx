'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@ravenlog/shared'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Tables<'profiles'> | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('AuthProvider useEffect iniciado')
    
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Sesión inicial obtenida:', !!session)
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        console.log('Usuario encontrado, obteniendo perfil...')
        fetchProfile(session.user.id)
      } else {
        console.log('No hay usuario, terminando loading')
        setLoading(false)
      }
    })

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, !!session)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Siempre obtener perfil si hay usuario, sin importar el evento
          console.log('Usuario encontrado en auth change, obteniendo perfil...')
          await fetchProfile(session.user.id)
        } else {
          console.log('Sin usuario en auth change')
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 fetchProfile: Iniciando para usuario:', userId)
      console.log('🔍 fetchProfile: Estado actual - loading:', loading, 'profile:', !!profile)
      
      // Timeout de seguridad más corto para evitar loading infinito
      const timeoutId = setTimeout(() => {
        console.error('⏰ fetchProfile: TIMEOUT después de 5 segundos - forzando loading=false')
        console.error('⏰ fetchProfile: Esto indica un problema con Supabase RLS o conectividad')
        setLoading(false)
        toast.error('Error de conexión. Intenta recargar la página.')
      }, 5000) // 5 segundos más agresivo
      
      console.log('🔄 fetchProfile: Ejecutando consulta a Supabase...')
      const startTime = Date.now()
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      const endTime = Date.now()
      console.log(`⏱️ fetchProfile: Consulta completada en ${endTime - startTime}ms`)
      clearTimeout(timeoutId) // Cancelar timeout si la consulta termina

      if (error) {
        console.error('❌ fetchProfile: Error en consulta:', error)
        console.error('❌ fetchProfile: Error code:', error.code)
        console.error('❌ fetchProfile: Error message:', error.message)
        
        // Si no existe perfil, crear uno
        if (error.code === 'PGRST116') {
          console.log('🆕 fetchProfile: Perfil no existe, creando nuevo...')
          await createProfile(userId)
          return // createProfile maneja setLoading(false)
        } else {
          console.error('💥 fetchProfile: Error crítico, intentando crear perfil como fallback')
          // Intentar crear perfil como último recurso
          await createProfile(userId)
          return
        }
      }
      
      if (data) {
        console.log('✅ fetchProfile: Perfil obtenido exitosamente:', (data as any).email || 'sin email')
        setProfile(data)
        console.log('🏁 fetchProfile: Estableciendo loading=false')
        setLoading(false)
      } else {
        console.warn('⚠️ fetchProfile: No se encontraron datos del perfil, creando nuevo')
        await createProfile(userId)
        return
      }
    } catch (error) {
      console.error('💥 fetchProfile: Error crítico en catch:', error)
      setLoading(false)
    }
  }

  const createProfile = async (userId: string) => {
    try {
      console.log('🆕 createProfile: Iniciando creación para usuario:', userId)
      
      // Timeout para createProfile también
      const timeoutId = setTimeout(() => {
        console.error('⏰ createProfile: TIMEOUT después de 5 segundos')
        setLoading(false)
        toast.error('Error de conexión al crear perfil. Intenta recargar.')
      }, 5000)
      
      const user = await supabase.auth.getUser()
      if (!user.data.user) {
        console.error('❌ createProfile: No hay usuario para crear perfil')
        clearTimeout(timeoutId)
        setLoading(false)
        return
      }

      const profileData = {
        id: userId,
        email: user.data.user.email!,
        full_name: user.data.user.user_metadata?.full_name || null,
        avatar_url: user.data.user.user_metadata?.avatar_url || null,
        role: 'candidate' as const
      }

      console.log('📝 createProfile: Datos del perfil a crear:', profileData)
      const startTime = Date.now()

      const { data, error } = await (supabase as any)
        .from('profiles')
        .insert([profileData])
        .select()
        .single()

      const endTime = Date.now()
      console.log(`⏱️ createProfile: Inserción completada en ${endTime - startTime}ms`)
      clearTimeout(timeoutId)

      if (error) {
        console.error('❌ createProfile: Error en inserción:', error)
        toast.error('Error al crear el perfil: ' + error.message)
        // Aun con error, terminar loading
      } else {
        console.log('✅ createProfile: Perfil creado exitosamente:', data.email)
        setProfile(data)
        toast.success('¡Bienvenido a RavenLog! Perfil creado exitosamente')
      }
    } catch (error) {
      console.error('Error en createProfile:', error)
      toast.error('Error inesperado al crear perfil')
    } finally {
      console.log('CreateProfile terminado, setLoading(false)')
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      console.log('🚀 signInWithGoogle: Iniciando login con Google')
      
      // Detectar si estamos en desarrollo o producción
      const isProduction = window.location.hostname !== 'localhost'
      const redirectTo = isProduction 
        ? 'https://ravenlog-dcs.vercel.app/auth/callback' 
        : 'http://localhost:3000/auth/callback'

      console.log('🔗 signInWithGoogle: redirectTo =', redirectTo)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
        }
      })
      
      console.log('📊 signInWithGoogle: Respuesta de Supabase:', { data, error })
      
      if (error) {
        console.error('❌ signInWithGoogle: Error:', error)
        toast.error('Error al iniciar sesión con Google: ' + error.message)
      } else {
        console.log('✅ signInWithGoogle: Login iniciado correctamente')
        toast.success('Redirigiendo a Google...')
      }
    } catch (error) {
      console.error('💥 signInWithGoogle: Error crítico:', error)
      toast.error('Error al iniciar sesión')
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast.error('Error al cerrar sesión')
        console.error('Error:', error)
      } else {
        toast.success('Sesión cerrada exitosamente')
      }
    } catch (error) {
      toast.error('Error al cerrar sesión')
      console.error('Error:', error)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signInWithGoogle,
    signOut,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}
