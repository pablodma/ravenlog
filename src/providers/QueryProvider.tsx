'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutos
            refetchOnWindowFocus: false, // No refetch al volver a la ventana
            retry: (failureCount, error: any) => {
              // No reintentar en errores de autenticación
              if (error?.status === 401 || error?.status === 403) {
                return false
              }
              return failureCount < 2 // Máximo 2 reintentos
            },
          },
          mutations: {
            retry: false, // No reintentar mutations por defecto
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

