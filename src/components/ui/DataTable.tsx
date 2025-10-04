import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (value: any, item: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  emptyState?: ReactNode
  className?: string
  rowClassName?: (item: T, index: number) => string
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyState,
  className = '',
  rowClassName
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="card">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return emptyState || (
      <div className="card p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">No hay datos disponibles</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('card overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="table-header">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="px-6 py-3 text-left">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item, index) => (
              <tr 
                key={index} 
                className={cn(
                  'table-row',
                  rowClassName?.(item, index)
                )}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    {column.render 
                      ? column.render(item[column.key as keyof T], item)
                      : item[column.key as keyof T]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

