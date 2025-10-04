import { useEffect, useRef } from 'react'
import { logger } from '@/utils/logger'

interface UseAbortControllerOptions {
  component: string
  onAbort?: () => void
}

export function useAbortController(options: UseAbortControllerOptions) {
  const { component, onAbort } = options
  const abortControllerRef = useRef<AbortController | null>(null)

  const createAbortController = () => {
    // Cancelar el controller anterior si existe
    if (abortControllerRef.current) {
      logger.info(component, 'Cancelando requests anteriores...')
      abortControllerRef.current.abort()
    }

    // Crear nuevo controller
    abortControllerRef.current = new AbortController()
    return abortControllerRef.current
  }

  const abort = () => {
    if (abortControllerRef.current) {
      logger.info(component, 'Abortando requests...')
      abortControllerRef.current.abort()
      if (onAbort) {
        onAbort()
      }
    }
  }

  const getSignal = () => {
    return abortControllerRef.current?.signal
  }

  const isAborted = () => {
    return abortControllerRef.current?.signal.aborted || false
  }

  // Cleanup automático cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        logger.info(component, 'Cleanup: Cancelando requests pendientes...')
        abortControllerRef.current.abort()
      }
    }
  }, [component])

  return {
    createAbortController,
    abort,
    getSignal,
    isAborted
  }
}




