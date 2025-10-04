'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  const getErrorMessage = (message: string | null) => {
    switch (message) {
      case 'invalid_link':
        return {
          title: 'Enlace Inválido o Expirado',
          description: 'El enlace de recuperación de contraseña no es válido o ha expirado.',
          solution: 'Solicita un nuevo enlace de recuperación de contraseña.'
        }
      case 'email_not_confirmed':
        return {
          title: 'Email No Confirmado',
          description: 'Debes confirmar tu email antes de continuar.',
          solution: 'Revisa tu bandeja de entrada y haz clic en el enlace de confirmación.'
        }
      default:
        return {
          title: 'Error de Autenticación',
          description: 'Ha ocurrido un error durante el proceso de autenticación.',
          solution: 'Intenta nuevamente o contacta al administrador.'
        }
    }
  }

  const errorInfo = getErrorMessage(message)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {errorInfo.title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {errorInfo.description}
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Solución
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>{errorInfo.solution}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/login"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Volver al Login
          </Link>
          
          {message === 'invalid_link' && (
            <Link
              href="/login"
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Solicitar Nuevo Enlace
            </Link>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Si el problema persiste, contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  )
}