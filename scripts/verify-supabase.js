#!/usr/bin/env node

// Script para verificar la configuración de Supabase
const { createClient } = require('@supabase/supabase-js')

console.log('🔍 Verificando configuración de Supabase...\n')

// Verificar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('📋 Variables de entorno:')
console.log('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ No configurado')
console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Configurado' : '❌ No configurado')

if (supabaseUrl) {
  console.log('  URL:', supabaseUrl)
}

if (supabaseAnonKey) {
  console.log('  Key:', supabaseAnonKey.substring(0, 20) + '...')
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('\n❌ Variables de entorno no encontradas')
  console.log('💡 Asegúrate de que el archivo .env.local existe y contiene:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui')
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_aqui')
  process.exit(1)
}

console.log('\n🔗 Probando conexión con Supabase...')

try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // Probar conexión básica
  supabase
    .from('profiles')
    .select('count')
    .limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.log('❌ Error de conexión:', error.message)
        console.log('   Detalles:', error.details)
        console.log('   Hint:', error.hint)
        console.log('   Code:', error.code)
      } else {
        console.log('✅ Conexión exitosa con Supabase')
        console.log('📊 Datos recibidos:', data)
      }
    })
    .catch((err) => {
      console.log('❌ Error inesperado:', err.message)
    })

} catch (error) {
  console.log('❌ Error creando cliente de Supabase:', error.message)
}
