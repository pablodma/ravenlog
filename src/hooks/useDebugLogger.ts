import { useEffect, useRef } from 'react'
import { logger } from '@/utils/logger'

interface UseDebugLoggerOptions {
  component: string
  enabled?: boolean
}

export function useDebugLogger<T>(
  value: T,
  label: string,
  options: UseDebugLoggerOptions
) {
  const { component, enabled = true } = options
  const prevValue = useRef<T>()

  useEffect(() => {
    if (!enabled) return

    if (prevValue.current !== value) {
      logger.state(component, `${label} cambió`, {
        previous: prevValue.current,
        current: value,
        changed: prevValue.current !== value
      })
      prevValue.current = value
    }
  }, [value, label, component, enabled])
}

export function useDebugEffect(
  effect: () => void,
  deps: any[],
  label: string,
  component: string
) {
  useEffect(() => {
    logger.debug(component, `Ejecutando efecto: ${label}`, { deps })
    effect()
  }, deps)
}




