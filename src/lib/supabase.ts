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
  throw new Error('Variables de entorno de Supabase no configuradas')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
