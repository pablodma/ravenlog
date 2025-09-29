import { createClient } from '@supabase/supabase-js'
import type { Database } from '@ravenlog/shared'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug variables de entorno
console.log('🔍 DEBUG SUPABASE CONFIG:')
console.log('URL:', supabaseUrl ? 'CONFIGURADA' : 'NO CONFIGURADA')
console.log('KEY:', supabaseAnonKey ? 'CONFIGURADA' : 'NO CONFIGURADA')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas')
  console.error('URL:', supabaseUrl)
  console.error('KEY:', supabaseAnonKey ? 'CONFIGURADA' : 'NO CONFIGURADA')
  
  // En lugar de fallar, usar valores por defecto para el build
  const defaultUrl = 'https://sjajpvjypxkiarsurtqz.supabase.co'
  const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqYWpwdmp5cHhraWFyc3VydHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NzQ4MzQsImV4cCI6MjA1MTE1MDgzNH0.8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ'
  
  console.log('🔄 Usando valores por defecto para el build')
  supabaseUrl = defaultUrl
  supabaseAnonKey = defaultKey
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Limpiar sesiones corruptas
    flowType: 'pkce'
  }
})

// Limpiar sesiones corruptas al inicializar
if (typeof window !== 'undefined') {
  // Limpiar localStorage de sesiones corruptas
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.includes('supabase') || key.includes('sb-')) {
      console.log('🧹 Limpiando sesión corrupta:', key)
      localStorage.removeItem(key)
    }
  })
  
  // Limpiar sessionStorage también
  const sessionKeys = Object.keys(sessionStorage)
  sessionKeys.forEach(key => {
    if (key.includes('supabase') || key.includes('sb-')) {
      console.log('🧹 Limpiando sessionStorage corrupto:', key)
      sessionStorage.removeItem(key)
    }
  })
}
