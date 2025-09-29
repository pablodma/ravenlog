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

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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
        
        // Evitar procesar el mismo evento múltiples veces
        if (event === 'INITIAL_SESSION') {
          return // Ya procesado en getSession()
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('Usuario logueado, obteniendo perfil...')
          await fetchProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          console.log('Usuario deslogueado')
          setProfile(null)
          setLoading(false)
        } else if (!session) {
          console.log('Sin sesión')
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Obteniendo perfil para usuario:', userId)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        // Si no existe perfil, crear uno
        if (error.code === 'PGRST116') {
          console.log('Perfil no existe, creando nuevo...')
          await createProfile(userId)
          return // createProfile maneja setLoading(false)
        } else {
          // Para otros errores, terminar loading
          setLoading(false)
        }
      } else {
        console.log('Perfil obtenido exitosamente')
        setProfile(data)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error en fetchProfile:', error)
      setLoading(false)
    }
  }

  const createProfile = async (userId: string) => {
    try {
      console.log('Creando perfil para usuario:', userId)
      const user = await supabase.auth.getUser()
      if (!user.data.user) {
        console.error('No hay usuario para crear perfil')
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

      console.log('Datos del perfil a crear:', profileData)

      const { data, error } = await (supabase as any)
        .from('profiles')
        .insert([profileData])
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        toast.error('Error al crear el perfil')
        // Aun con error, terminar loading
      } else {
        console.log('Perfil creado exitosamente:', data)
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
      // Detectar si estamos en desarrollo o producción
      const isProduction = window.location.hostname !== 'localhost'
      const redirectTo = isProduction 
        ? 'https://ravenlog-dcs.vercel.app/' 
        : 'http://localhost:3000/'

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
        }
      })
      
      if (error) {
        toast.error('Error al iniciar sesión con Google')
        console.error('Error:', error)
      }
    } catch (error) {
      toast.error('Error al iniciar sesión')
      console.error('Error:', error)
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
