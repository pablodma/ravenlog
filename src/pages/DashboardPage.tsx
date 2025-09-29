
import { useAuth } from '@/contexts/AuthContext'
import { UserPlus, Activity, Calendar, Award } from 'lucide-react'

export default function DashboardPage() {
  const { profile } = useAuth()


  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-primary/10 to-military-sage/10 rounded-lg p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              ¡Bienvenido de vuelta!
            </h1>
            <p className="text-muted-foreground mt-1">
              {profile?.full_name || profile?.email}
            </p>
            <div className="flex items-center mt-2 space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                profile?.role === 'admin' ? 'bg-primary text-primary-foreground' :
                profile?.role === 'personnel' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
              }`}>
                {profile?.role}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>


      {/* Contenido principal en dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actividad reciente */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg border">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-foreground flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary" />
                Actividad Reciente
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Juan "Viper" Rodríguez</span> completó la certificación de A/A BVR
                    </p>
                    <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">María "Phoenix" López</span> fue promovida a Capitán
                    </p>
                    <p className="text-xs text-muted-foreground">Hace 1 día</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      Nueva solicitud de enlistamiento de <span className="font-medium">"Eagle-01"</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Hace 2 días</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Carlos "Thunder" Martín</span> obtuvo la medalla "As del Aire"
                    </p>
                    <p className="text-xs text-muted-foreground">Hace 3 días</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Próximas misiones */}
          <div className="bg-card rounded-lg border">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-sm font-semibold text-foreground flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-primary" />
                Próximas Misiones
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Operación Tormenta</p>
                  <p className="text-xs text-muted-foreground">Hoy 20:00 UTC</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs rounded-full">
                  Confirmado
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Training BFM</p>
                  <p className="text-xs text-muted-foreground">Mañana 19:00 UTC</p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 text-xs rounded-full">
                  Pendiente
                </span>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="bg-card rounded-lg border">
            <div className="p-4 border-b">
              <h3 className="text-sm font-semibold text-foreground">Acciones Rápidas</h3>
            </div>
            <div className="p-4 space-y-3">
              <button className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center">
                  <UserPlus className="w-4 h-4 mr-3 text-primary" />
                  <span className="text-sm text-foreground">Ver Solicitudes</span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center">
                  <Award className="w-4 h-4 mr-3 text-primary" />
                  <span className="text-sm text-foreground">Otorgar Certificación</span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center">
                  <Medal className="w-4 h-4 mr-3 text-primary" />
                  <span className="text-sm text-foreground">Conceder Medalla</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
