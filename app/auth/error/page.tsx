'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const message = searchParams?.get('message')

  const getErrorMessage = () => {
    switch (message) {
      case 'invalid_link':
        return {
          title: 'Enlace inválido o expirado',
          description: 'El enlace que usaste es inválido o ha expirado. Por favor, solicita uno nuevo.',
          action: 'Solicitar nuevo enlace'
        }
      default:
        return {
          title: 'Error de autenticación',
          description: 'Ocurrió un error durante el proceso de autenticación. Por favor, intenta nuevamente.',
          action: 'Volver al login'
        }
    }
  }

  const errorInfo = getErrorMessage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {errorInfo.title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {errorInfo.description}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={() => router.push('/login')}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {errorInfo.action}
          </button>

          <div className="text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              ← Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}


