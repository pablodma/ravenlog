import { useState, useEffect, useCallback } from 'react'
import { logger } from '@/utils/logger'

interface ApiCall {
  id: string
  endpoint: string
  method: string
  startTime: number
  status?: 'pending' | 'success' | 'error'
  duration?: number
  error?: string
}

export function useApiMonitor(component: string) {
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([])
  const [activeCalls, setActiveCalls] = useState<Set<string>>(new Set())

  const startApiCall = useCallback((endpoint: string, method: string = 'GET') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const startTime = Date.now()
    
    const apiCall: ApiCall = {
      id,
      endpoint,
      method,
      startTime,
      status: 'pending'
    }

    logger.api(component, `Iniciando ${method} ${endpoint}`, { id })
    
    setApiCalls(prev => [...prev.slice(-20), apiCall])
    setActiveCalls(prev => new Set([...prev, id]))
    
    return id
  }, [component])

  const endApiCall = useCallback((id: string, success: boolean, error?: string) => {
    const endTime = Date.now()
    
    setApiCalls(prev => prev.map(call => {
      if (call.id === id) {
        const duration = endTime - call.startTime
        logger.api(component, `Completado ${call.method} ${call.endpoint}`, { 
          id, 
          duration, 
          success, 
          error 
        })
        
        return {
          ...call,
          status: success ? 'success' : 'error',
          duration,
          error
        }
      }
      return call
    }))
    
    setActiveCalls(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }, [component])

  const getApiStats = useCallback(() => {
    const total = apiCalls.length
    const pending = apiCalls.filter(call => call.status === 'pending').length
    const successful = apiCalls.filter(call => call.status === 'success').length
    const failed = apiCalls.filter(call => call.status === 'error').length
    const avgDuration = apiCalls
      .filter(call => call.duration)
      .reduce((acc, call) => acc + (call.duration || 0), 0) / 
      apiCalls.filter(call => call.duration).length || 0

    return {
      total,
      pending,
      successful,
      failed,
      avgDuration: Math.round(avgDuration),
      isActive: activeCalls.size > 0
    }
  }, [apiCalls, activeCalls])

  return {
    apiCalls,
    activeCalls,
    startApiCall,
    endApiCall,
    getApiStats
  }
}




