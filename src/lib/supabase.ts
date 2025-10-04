import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@ravenlog/shared'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔧 Supabase Config:', {
  url: supabaseUrl ? '✅ Configurado' : '❌ No configurado',
  key: supabaseAnonKey ? '✅ Configurado' : '❌ No configurado',
  urlValue: supabaseUrl,
  keyValue: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined'
})

let supabase: any

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas')
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Presente' : 'Ausente')
  
  // Crear un cliente mock para desarrollo
  console.warn('⚠️ Creando cliente mock de Supabase para desarrollo')
  const mockClient = {
    from: () => ({
      select: () => ({
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null }),
          abortSignal: () => Promise.resolve({ data: [], error: null })
        }),
        limit: () => Promise.resolve({ data: [], error: null }),
        abortSignal: () => Promise.resolve({ data: [], error: null })
      }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado' } }),
      update: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado' } }),
      delete: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado' } })
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  }
  
  // @ts-ignore
  supabase = mockClient
} else {
  console.log('✅ Creando cliente de Supabase con configuración válida')
  supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
}

export { supabase }

// Export createClient function for use in other components
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
}
