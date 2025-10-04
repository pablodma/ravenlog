'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface ConnectionTestResult {
  step: string
  status: 'loading' | 'success' | 'error'
  message: string
  details?: any
}

export default function SupabaseConnectionTest() {
  const [results, setResults] = useState<ConnectionTestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (step: string, status: 'loading' | 'success' | 'error', message: string, details?: any) => {
    setResults(prev => [...prev, { step, status, message, details }])
  }

  const testConnection = async () => {
    setIsRunning(true)
    setResults([])

    // Test 1: Verificar variables de entorno
    addResult('Variables de entorno', 'loading', 'Verificando configuración...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      addResult('Variables de entorno', 'error', 'Variables de entorno no encontradas', {
        url: supabaseUrl ? 'Configurado' : 'No configurado',
        key: supabaseKey ? 'Configurado' : 'No configurado'
      })
      setIsRunning(false)
      return
    }

    addResult('Variables de entorno', 'success', 'Variables de entorno configuradas', {
      url: supabaseUrl,
      key: supabaseKey.substring(0, 20) + '...'
    })

    // Test 2: Probar conectividad HTTP básica
    addResult('Conectividad HTTP', 'loading', 'Probando conectividad HTTP...')
    
    try {
      const response = await fetch(supabaseUrl + '/rest/v1/', {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        addResult('Conectividad HTTP', 'success', 'Servidor Supabase accesible', {
          status: response.status,
          statusText: response.statusText
        })
      } else {
        addResult('Conectividad HTTP', 'error', `Error HTTP: ${response.status}`, {
          status: response.status,
          statusText: response.statusText,
          url: supabaseUrl + '/rest/v1/'
        })
      }
    } catch (err: any) {
      addResult('Conectividad HTTP', 'error', 'Error de conectividad', { 
        message: err.message,
        type: err.name
      })
    }

    // Test 3: Probar conexión básica con Supabase client
    addResult('Conexión Supabase Client', 'loading', 'Probando cliente de Supabase...')
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)

      if (error) {
        addResult('Conexión Supabase Client', 'error', 'Error de conexión', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
      } else {
        addResult('Conexión Supabase Client', 'success', 'Cliente Supabase funcionando', { data })
      }
    } catch (err: any) {
      addResult('Conexión Supabase Client', 'error', 'Error inesperado', { message: err.message })
    }

    // Test 3: Probar consulta de perfiles
    addResult('Consulta de perfiles', 'loading', 'Consultando tabla profiles...')
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .limit(5)

      if (error) {
        addResult('Consulta de perfiles', 'error', 'Error consultando perfiles', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
      } else {
        addResult('Consulta de perfiles', 'success', `Perfiles encontrados: ${data?.length || 0}`, { data })
      }
    } catch (err: any) {
      addResult('Consulta de perfiles', 'error', 'Error inesperado', { message: err.message })
    }

    // Test 4: Probar consulta de rangos
    addResult('Consulta de rangos', 'loading', 'Consultando tabla ranks...')
    
    try {
      const { data, error } = await supabase
        .from('ranks')
        .select('id, name, abbreviation')
        .limit(5)

      if (error) {
        addResult('Consulta de rangos', 'error', 'Error consultando rangos', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
      } else {
        addResult('Consulta de rangos', 'success', `Rangos encontrados: ${data?.length || 0}`, { data })
      }
    } catch (err: any) {
      addResult('Consulta de rangos', 'error', 'Error inesperado', { message: err.message })
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading': return '🔄'
      case 'success': return '✅'
      case 'error': return '❌'
      default: return '❓'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'loading': return 'text-blue-600'
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Prueba de Conexión Supabase</h2>
        <p className="text-gray-600">Verifica la configuración y conexión con Supabase</p>
      </div>

      <div className="mb-6">
        <button
          onClick={testConnection}
          disabled={isRunning}
          className={`px-6 py-3 rounded-lg font-medium ${
            isRunning
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isRunning ? '🔄 Probando...' : '🚀 Iniciar Prueba'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Resultados de la Prueba</h3>
          {results.map((result, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{result.step}</h4>
                <span className={`text-sm font-medium ${getStatusColor(result.status)}`}>
                  {getStatusIcon(result.status)} {result.status.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{result.message}</p>
              {result.details && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    Ver detalles
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
