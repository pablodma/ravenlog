import { ReactNode } from 'react'
import { LucideIcon, AlertCircle } from 'lucide-react'

interface ErrorStateProps {
  icon?: LucideIcon
  title?: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  className?: string
  children?: ReactNode
}

export default function ErrorState({ 
  icon: Icon = AlertCircle,
  title = 'Error',
  description, 
  action,
  className = '',
  children
}: ErrorStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <Icon className="h-12 w-12 text-destructive mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground mb-6">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary inline-flex items-center gap-2"
        >
          {action.icon && <action.icon className="h-4 w-4" />}
          {action.label}
        </button>
      )}
      {children}
    </div>
  )
}

