import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageFrameProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  headerActions?: ReactNode
}

export default function PageFrame({
  title,
  description,
  children,
  className = '',
  headerActions
}: PageFrameProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {(title || description || headerActions) && (
        <div className="flex items-start justify-between">
          <div>
            {title && (
              <h1 className="text-3xl font-bold text-foreground">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-2 text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">
              {headerActions}
            </div>
          )}
        </div>
      )}
      <div className="card p-6">
        {children}
      </div>
    </div>
  )
}

