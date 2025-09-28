
import { useAuth } from '@/contexts/AuthContext'
import { Chrome } from 'lucide-react'

export default function LoginPage() {
  const { signInWithGoogle } = useAuth()

  const handleGoogleSignIn = async () => {
    await signInWithGoogle()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-military-olive/10 via-background to-military-sage/10">
      <div className="max-w-md w-full space-y-8 p-8">
        {/* Logo y título */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <span className="text-primary-foreground font-bold text-2xl">RL</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground">RavenLog</h2>
          <p className="mt-2 text-muted-foreground">
            Sistema de Gestión Militar
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Unidad Aérea de Simulación DCS
          </p>
        </div>

        {/* Formulario de login */}
        <div className="bg-card border rounded-lg shadow-lg p-8 space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-foreground mb-2">
              Iniciar Sesión
            </h3>
            <p className="text-sm text-muted-foreground">
              Accede con tu cuenta de Google para continuar
            </p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center px-4 py-3 border border-input rounded-lg text-sm font-medium text-foreground bg-background hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm"
          >
            <Chrome className="w-5 h-5 mr-3 text-blue-500" />
            Continuar con Google
          </button>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Al iniciar sesión, aceptas nuestros términos de servicio
              y política de privacidad.
            </p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-card/50 border rounded-lg p-4">
          <h4 className="text-sm font-medium text-foreground mb-2">
            ¿Nuevo en la unidad?
          </h4>
          <p className="text-xs text-muted-foreground">
            Una vez que inicies sesión, podrás completar tu proceso de 
            enlistamiento y unirte a nuestras operaciones.
          </p>
        </div>
      </div>
    </div>
  )
}
