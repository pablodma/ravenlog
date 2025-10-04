import { useEffect, useRef } from 'react'

export function useStableEffect(effect: () => void, deps: any[] = []) {
  const effectRef = useRef(effect)
  const isExecutingRef = useRef(false)

  // Update the effect function
  effectRef.current = effect

  useEffect(() => {
    // Prevent multiple simultaneous executions
    if (isExecutingRef.current) {
      return
    }

    isExecutingRef.current = true
    
    const executeEffect = async () => {
      try {
        await effectRef.current()
      } finally {
        isExecutingRef.current = false
      }
    }

    executeEffect()
  }, deps)
}




