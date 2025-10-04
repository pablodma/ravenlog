'use client'

import { ReactNode } from 'react'
import { useUniversalDataLoader } from '@/hooks/useUniversalDataLoader'
import LoadingState from './ui/LoadingState'
import ErrorState from './ui/ErrorState'

interface UniversalDataLoaderProps {
  component: string
  loaders: Array<(signal?: AbortSignal) => Promise<void>>
  dependencies?: any[]
  children: ReactNode
  fallback?: ReactNode
  preventDuplicates?: boolean
}

export default function UniversalDataLoader({ 
  component, 
  loaders, 
  dependencies = [], 
  children, 
  fallback,
  preventDuplicates = true
}: UniversalDataLoaderProps) {
  const { loading, error, reload } = useUniversalDataLoader({
    component,
    loaders,
    dependencies,
    preventDuplicates
  })

  if (loading) {
    return fallback || <LoadingState text="Cargando datos..." />
  }

  if (error) {
    return <ErrorState error={error} onRetry={reload} />
  }

  return <>{children}</>
}




