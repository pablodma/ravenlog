import { ReactNode } from 'react'

interface LoadingStateProps {
  text?: string
  size?: 'small' | 'medium' | 'large'
  className?: string
  children?: ReactNode
}

export default function LoadingState({ 
  text = 'Cargando...', 
  size = 'medium',
  className = '',
  children
}: LoadingStateProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  const containerClasses = {
    small: 'py-4',
    medium: 'py-8',
    large: 'py-12'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${containerClasses[size]} ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-primary/20 border-t-primary ${sizeClasses[size]}`} />
      {text && (
        <p className="mt-4 text-sm text-muted-foreground">{text}</p>
      )}
      {children}
    </div>
  )
}

