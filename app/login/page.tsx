'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

type AuthMode = 'signin' | 'signup' | 'magic-link' | 'reset-password'

export default function LoginPage() {
  const { signIn, signUp, signInWithMagicLink, resetPassword, loading } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      switch (mode) {
        case 'signin':
          await signIn(formData.email, formData.password)
          toast.success('¡Bienvenido de vuelta!')
          router.push('/dashboard')
          break

        case 'signup':
          if (formData.password !== formData.confirmPassword) {
            toast.error('Las contraseñas no coinciden')
            return
          }
          if (formData.password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres')
            return
          }
          await signUp(formData.email, formData.password, formData.fullName)
          toast.success('¡Cuenta creada exitosamente!')
          router.push('/dashboard')
          break

        case 'magic-link':
          await signInWithMagicLink(formData.email)
          toast.success('¡Enlace mágico enviado! Revisa tu email.')
          break

        case 'reset-password':
          try {
            await resetPassword(formData.email)
            toast.success('¡Email de recuperación enviado! Revisa tu bandeja de entrada. El enlace es válido por 1 hora.')
            setMode('signin')
          } catch (error: any) {
            console.error('Error en reset password:', error)
            // Fallback: intentar con magic link
            toast.error('Error enviando email de recuperación. Intentando con enlace mágico...')
            try {
              await signInWithMagicLink(formData.email)
              toast.success('¡Enlace mágico enviado! Revisa tu email.')
              setMode('signin')
            } catch (magicError: any) {
              toast.error('Error: ' + (magicError.message || 'No se pudo enviar el email'))
            }
          }
          break
      }
    } catch (error: any) {
      if (error.message === 'Please check your email to confirm your account') {
        toast.success('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.')
      } else {
        toast.error(error.message || 'Error en la autenticación')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: ''
    })
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    resetForm()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Iniciar Sesión'
      case 'signup': return 'Crear Cuenta'
      case 'magic-link': return 'Enlace Mágico'
      case 'reset-password': return 'Recuperar Contraseña'
    }
  }

  const getDescription = () => {
    switch (mode) {
      case 'signin': return 'Accede a tu cuenta de RavenLog'
      case 'signup': return 'Únete a RavenLog'
      case 'magic-link': return 'Te enviaremos un enlace para acceder sin contraseña'
      case 'reset-password': return 'Te enviaremos un enlace para restablecer tu contraseña'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {getTitle()}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {getDescription()}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Full Name - Solo para signup */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Nombre completo
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Tu nombre completo"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {/* Email - Siempre presente */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            {/* Password - No para magic-link ni reset-password */}
            {mode !== 'magic-link' && mode !== 'reset-password' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Tu contraseña"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {/* Confirm Password - Solo para signup */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Confirma tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </div>
              ) : (
                <>
                  {mode === 'signin' && 'Iniciar Sesión'}
                  {mode === 'signup' && 'Crear Cuenta'}
                  {mode === 'magic-link' && 'Enviar Enlace Mágico'}
                  {mode === 'reset-password' && 'Enviar Email de Recuperación'}
                </>
              )}
            </button>
          </div>

          {/* Mode Switchers */}
          <div className="space-y-4">
            {mode === 'signin' && (
              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => switchMode('reset-password')}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  ¿Olvidaste tu contraseña?
                </button>
                <div className="text-sm text-gray-600">
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Crear cuenta
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  <button
                    type="button"
                    onClick={() => switchMode('magic-link')}
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Acceder con enlace mágico
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="text-center">
                <div className="text-sm text-gray-600">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Iniciar sesión
                  </button>
                </div>
              </div>
            )}

            {(mode === 'magic-link' || mode === 'reset-password') && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  ← Volver al login
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}


