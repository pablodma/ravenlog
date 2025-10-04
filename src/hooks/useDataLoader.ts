import { useState, useEffect, useCallback } from 'react'
import { logger } from '@/utils/logger'
import { useAbortController } from './useAbortController'

interface UseDataLoaderOptions {
  component: string
  loaders: Array<() => Promise<void>>
  dependencies?: any[]
}

export function useDataLoader(options: UseDataLoaderOptions) {
  const { component, loaders, dependencies = [] } = options
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const { createAbortController, getSignal, isAborted } = useAbortController({
    component,
    onAbort: () => {
      setLoading(false)
      setIsLoading(false)
    }
  })

  const loadData = useCallback(async () => {
    // Prevenir requests duplicadas
    if (isLoading) {
      logger.warn(component, 'Ya hay una carga en progreso, saltando...')
      return
    }

    logger.info(component, 'Iniciando carga de datos...')
    setIsLoading(true)
    setError(null)
    
    const abortController = createAbortController()
    
    try {
      // Ejecutar todos los loaders en paralelo
      await Promise.all(loaders.map(loader => loader()))
      
      if (!isAborted()) {
        logger.info(component, 'Carga completada exitosamente')
        setLoading(false)
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        logger.info(component, 'Carga cancelada')
        return
      }
      
      logger.error(component, 'Error en carga de datos', error)
      setError(error.message)
      setLoading(false)
    } finally {
      setIsLoading(false)
    }
  }, [component, loaders, isLoading, createAbortController, isAborted])

  useEffect(() => {
    loadData()
  }, dependencies)

  return {
    loading,
    error,
    isLoading,
    reload: loadData
  }
}




