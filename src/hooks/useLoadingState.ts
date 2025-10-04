import { useState, useEffect, useCallback } from 'react'
import { logger } from '@/utils/logger'

interface UseLoadingStateOptions {
  component: string
  timeout?: number
  onTimeout?: () => void
}

export function useLoadingState(
  initialLoading = true,
  options: UseLoadingStateOptions
) {
  const { component, timeout = 10000, onTimeout } = options
  const [loading, setLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)

  const startLoading = useCallback(() => {
    logger.info(component, 'Iniciando carga...')
    setLoading(true)
    setError(null)
    setStartTime(Date.now())
  }, [component])

  const stopLoading = useCallback(() => {
    const duration = startTime ? Date.now() - startTime : 0
    logger.info(component, `Carga completada en ${duration}ms`)
    setLoading(false)
    setStartTime(null)
  }, [component, startTime])

  const setErrorState = useCallback((errorMessage: string) => {
    logger.error(component, 'Error en carga', errorMessage)
    setError(errorMessage)
    setLoading(false)
    setStartTime(null)
  }, [component])

  // Timeout handler
  useEffect(() => {
    if (!loading || !startTime) return

    const timer = setTimeout(() => {
      logger.warn(component, `Carga timeout después de ${timeout}ms`)
      if (onTimeout) {
        onTimeout()
      }
      setErrorState(`Timeout después de ${timeout}ms`)
    }, timeout)

    return () => clearTimeout(timer)
  }, [loading, startTime, timeout, onTimeout, component, setErrorState])

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setErrorState,
    isLoading: loading,
    hasError: !!error
  }
}




