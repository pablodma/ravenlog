'use client'

import { ReactNode } from 'react'
import { useDataLoader } from '@/hooks/useDataLoader'
import LoadingState from './ui/LoadingState'
import ErrorState from './ui/ErrorState'

interface DataLoaderProps {
  component: string
  loaders: Array<() => Promise<void>>
  dependencies?: any[]
  children: ReactNode
  fallback?: ReactNode
}

export default function DataLoader({ 
  component, 
  loaders, 
  dependencies = [], 
  children, 
  fallback 
}: DataLoaderProps) {
  const { loading, error, reload } = useDataLoader({
    component,
    loaders,
    dependencies
  })

  if (loading) {
    return fallback || <LoadingState text="Cargando datos..." />
  }

  if (error) {
    return <ErrorState error={error} onRetry={reload} />
  }

  return <>{children}</>
}




