
import { useAuth } from '@/contexts/AuthContext'

export default function EnrollmentPage() {
  const { profile } = useAuth()

  if (profile?.role === 'candidate') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-lg border p-6">
          <h1 className="text-2xl font-bold text-foreground mb-6">Proceso de Enlistamiento</h1>
          <p className="text-muted-foreground mb-4">
            Complete el siguiente formulario para solicitar su ingreso a la unidad.
          </p>
          {/* TODO: Implementar formulario de enlistamiento */}
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <p className="text-muted-foreground">
              Formulario de enlistamiento en desarrollo...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Solicitudes de Enlistamiento</h1>
      </div>
      
      {/* TODO: Implementar lista de solicitudes */}
      <div className="bg-card rounded-lg border p-6">
        <div className="bg-muted/30 rounded-lg p-8 text-center">
          <p className="text-muted-foreground">
            Lista de solicitudes en desarrollo...
          </p>
        </div>
      </div>
    </div>
  )
}
