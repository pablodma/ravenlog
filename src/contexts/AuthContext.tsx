'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@ravenlog/shared'
import { logger } from '@/utils/logger'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Tables<'profiles'> | null
  loading: boolean
  // Password-based auth
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  // Passwordless auth (Magic Link)
  signInWithMagicLink: (email: string) => Promise<void>
  // Password reset
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  // General
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let isInitialized = false
    
    logger.info('AuthContext', 'Iniciando useEffect')
    
    // Get initial session
    const initializeAuth = async () => {
      if (isInitialized) {
        logger.warn('AuthContext', 'Ya inicializado, saltando...')
        return
      }
      
      isInitialized = true
      logger.info('AuthContext', 'Iniciando initializeAuth')
      try {
        logger.api('AuthContext', 'Llamando a getSession...')
        const { data: { session }, error } = await supabase.auth.getSession()
        logger.api('AuthContext', 'getSession completado', { session: !!session, error })
        
        if (!mounted) {
          logger.warn('AuthContext', 'Componente desmontado, abortando')
          return
        }
        
        if (error) {
          logger.error('AuthContext', 'Error getting session', error)
          setLoading(false)
          return
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        console.log('🔵 AuthContext: Usuario establecido', { hasUser: !!session?.user })
        
        if (session?.user) {
          console.log('🔵 AuthContext: Usuario encontrado, cargando perfil...')
          await fetchProfile(session.user.id)
        } else {
          console.log('🟢 AuthContext: No hay usuario, estableciendo loading=false')
          setLoading(false)
        }
      } catch (error) {
        console.error('🔴 AuthContext: Error en catch de initializeAuth:', error)
        if (mounted) {
          setLoading(false)
        }
      }
      console.log('🔵 AuthContext: initializeAuth completado')
    }

    initializeAuth()

    // Listen for auth changes
    console.log('🔵 AuthContext: Configurando listener de cambios de auth')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔵 AuthContext: Cambio de auth detectado', { event, hasSession: !!session })
        if (!mounted) return
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      console.log('🔴 AuthContext: Limpiando useEffect')
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    console.log('🔵 fetchProfile: Iniciando para userId:', userId)
    try {
      console.log('🔵 fetchProfile: Consultando base de datos...')
      
      // Intentar obtener el perfil directamente
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('🔴 fetchProfile: Error obteniendo perfil:', profileError)
        console.error('🔴 fetchProfile: Error details:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        })
        
        // Si el perfil no existe, crearlo
        console.log('🟡 fetchProfile: Perfil no encontrado, creando nuevo perfil')
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user?.email || '',
            role: 'user',
            is_active: true
          })
          .select()
          .single()

        if (createError) {
          console.error('🔴 fetchProfile: Error creando perfil:', createError)
          console.error('🔴 fetchProfile: Create error details:', {
            code: createError.code,
            message: createError.message,
            details: createError.details,
            hint: createError.hint
          })
          
          // Si no se puede crear, usar datos básicos del usuario
          console.log('🟡 fetchProfile: Usando datos básicos del usuario')
          const basicProfile = {
            id: userId,
            email: user?.email || '',
            full_name: user?.user_metadata?.full_name || null,
            avatar_url: user?.user_metadata?.avatar_url || null,
            role: 'user',
            role_id: null,
            secondary_roles: null,
            unit_id: null,
            rank_id: null,
            position_id: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          setProfile(basicProfile)
        } else {
          console.log('🟢 fetchProfile: Perfil creado exitosamente', newProfile)
          setProfile(newProfile)
        }
      } else {
        console.log('🟢 fetchProfile: Perfil cargado exitosamente', profileData)
        setProfile(profileData)
      }
    } catch (error) {
      console.error('🔴 fetchProfile: Error en catch:', error)
      
      // En caso de error total, usar datos básicos
      console.log('🟡 fetchProfile: Usando datos básicos como fallback')
      const basicProfile = {
        id: userId,
        email: user?.email || '',
        full_name: user?.user_metadata?.full_name || null,
        avatar_url: user?.user_metadata?.avatar_url || null,
        role: 'user',
        role_id: null,
        secondary_roles: null,
        unit_id: null,
        rank_id: null,
        position_id: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setProfile(basicProfile)
    } finally {
      // Asegurar que loading siempre se establece en false
      console.log('🟢 fetchProfile: Estableciendo loading=false')
      setLoading(false)
    }
  }

  // Password-based authentication with improved security
  const signUp = async (email: string, password: string, fullName?: string) => {
    // Validate password strength
    if (password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres')
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new Error('La contraseña debe contener al menos una mayúscula, una minúscula y un número')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || null
        },
        emailRedirectTo: `${window.location.origin}/auth/confirm`
      }
    })

    if (error) {
      throw error
    }

    // If user needs email confirmation
    if (data.user && !data.session) {
      throw new Error('Por favor revisa tu email para confirmar tu cuenta')
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw error
    }

    // Update login tracking
    if (data.user) {
      try {
        await supabase
          .from('profiles')
          .update({
            last_login_at: new Date().toISOString(),
            login_count: supabase.raw('login_count + 1')
          })
          .eq('id', data.user.id)
      } catch (updateError) {
        console.warn('Error updating login tracking:', updateError)
      }
    }
  }

  // Passwordless authentication (Magic Link)
  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/confirm`
      }
    })

    if (error) {
      throw error
    }
  }

  // Password reset
  const resetPassword = async (email: string) => {
    console.log('🔄 resetPassword: Iniciando para email:', email)
    console.log('🔄 resetPassword: URL de redirección:', `${window.location.origin}/auth/confirm?next=/auth/update-password`)
    
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/confirm?next=/auth/update-password`
      })

      console.log('🔄 resetPassword: Respuesta:', { data, error })

      if (error) {
        console.error('🔴 resetPassword: Error:', error)
        throw error
      }

      console.log('✅ resetPassword: Email enviado exitosamente')
    } catch (error) {
      console.error('🔴 resetPassword: Error en catch:', error)
      throw error
    }
  }

  const updatePassword = async (newPassword: string) => {
    console.log('🔄 updatePassword: Iniciando actualización de contraseña')
    
    // Validate password strength
    if (newPassword.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres')
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      throw new Error('La contraseña debe contener al menos una mayúscula, una minúscula y un número')
    }

    console.log('🔄 updatePassword: Llamando a supabase.auth.updateUser...')
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })

      console.log('🔄 updatePassword: Respuesta:', { hasData: !!data, error: error ? error.message : null })

      if (error) {
        console.error('🔴 updatePassword: Error:', error)
        throw error
      }

      console.log('✅ updatePassword: Contraseña actualizada exitosamente')
    } catch (err: any) {
      console.error('🔴 updatePassword: Error en catch:', err)
      throw err
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
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
    signUp,
    signIn,
    signInWithMagicLink,
    resetPassword,
    updatePassword,
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
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


