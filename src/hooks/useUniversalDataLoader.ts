import { useState, useEffect, useRef, useCallback } from 'react'
import { logger } from '@/utils/logger'

interface UseUniversalDataLoaderOptions {
  component: string
  loaders: Array<(signal?: AbortSignal) => Promise<void>>
  dependencies?: any[]
  preventDuplicates?: boolean
}

export function useUniversalDataLoader(options: UseUniversalDataLoaderOptions) {
  const { component, loaders, dependencies = [], preventDuplicates = true } = options
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const isMountedRef = useRef(true)
  const abortControllerRef = useRef<AbortController | null>(null)
  const loadingRef = useRef(false)

  const loadData = useCallback(async () => {
    // Prevenir requests duplicadas si está habilitado
    if (preventDuplicates && loadingRef.current) {
      logger.warn(component, 'Ya hay una carga en progreso, saltando...')
      return
    }

    logger.info(component, 'Iniciando carga de datos...')
    setIsLoading(true)
    setError(null)
    loadingRef.current = true

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      logger.info(component, 'Cancelando request anterior...')
      abortControllerRef.current.abort()
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    try {
      // Ejecutar todos los loaders en paralelo
      await Promise.all(loaders.map(loader => loader(signal)))
      
      if (isMountedRef.current) {
        logger.info(component, 'Carga completada exitosamente')
        setLoading(false)
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        logger.info(component, 'Carga cancelada')
        return
      }
      
      if (isMountedRef.current) {
        logger.error(component, 'Error en carga de datos', error)
        setError(error.message)
        setLoading(false)
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
      loadingRef.current = false
    }
  }, [component, loaders, preventDuplicates])

  useEffect(() => {
    isMountedRef.current = true
    loadData()

    return () => {
      isMountedRef.current = false
      if (abortControllerRef.current) {
        logger.info(component, 'Cleanup: Cancelando requests pendientes...')
        abortControllerRef.current.abort()
      }
    }
  }, dependencies)

  const reload = useCallback(() => {
    if (isMountedRef.current) {
      loadData()
    }
  }, [loadData])

  return {
    loading,
    error,
    isLoading,
    reload
  }
}




