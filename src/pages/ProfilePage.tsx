import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { User, Award, Medal, BarChart3, Calendar, MapPin, Mail, Edit } from 'lucide-react'
import FlightStatistics from '@/components/dcs/FlightStatistics'

export default function ProfilePage() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState<'info' | 'statistics' | 'medals' | 'certifications'>('info')

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const tabs = [
    { id: 'info' as const, name: 'Información Personal', icon: User },
    { id: 'statistics' as const, name: 'Estadísticas DCS', icon: BarChart3 },
    { id: 'medals' as const, name: 'Medallas', icon: Medal },
    { id: 'certifications' as const, name: 'Certificaciones', icon: Award },
  ]

  // Datos de ejemplo - estos vendrían de la base de datos
  const userMedals = [
    {
      id: 1,
      name: 'As del Aire',
      description: 'Otorgada por excelencia en combate aéreo',
      imageUrl: '/medals/ace.png',
      dateAwarded: '2024-01-15',
      awardedBy: 'Comando Central'
    },
    {
      id: 2,
      name: 'Veterano de Campaña',
      description: 'Participación en 50+ misiones',
      imageUrl: '/medals/veteran.png',
      dateAwarded: '2024-02-20',
      awardedBy: 'Estado Mayor'
    },
    {
      id: 3,
      name: 'Instructor Certificado',
      description: 'Capacitación de nuevos pilotos',
      imageUrl: '/medals/instructor.png',
      dateAwarded: '2024-03-10',
      awardedBy: 'Academia de Vuelo'
    }
  ]

  const userCertifications = [
    {
      id: 1,
      name: 'BVR (Beyond Visual Range)',
      category: 'Combate Aéreo',
      level: 'Avanzado',
      dateObtained: '2024-01-10',
      expiryDate: '2025-01-10',
      status: 'Vigente'
    },
    {
      id: 2,
      name: 'CAS (Close Air Support)',
      category: 'Apoyo Terrestre',
      level: 'Intermedio',
      dateObtained: '2023-11-15',
      expiryDate: '2024-11-15',
      status: 'Por Renovar'
    },
    {
      id: 3,
      name: 'SEAD (Suppression of Enemy Air Defenses)',
      category: 'Guerra Electrónica',
      level: 'Básico',
      dateObtained: '2024-02-05',
      expiryDate: '2025-02-05',
      status: 'Vigente'
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="space-y-6">
            {/* Información Personal */}
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Información Personal</h2>
                <button className="flex items-center text-sm text-primary hover:text-primary/80">
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nombre Completo</label>
                    <p className="text-foreground mt-1">{profile.full_name || 'No especificado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-foreground mt-1 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                      {profile.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Rol</label>
                    <p className="text-foreground mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        profile.role === 'admin' ? 'bg-primary text-primary-foreground' :
                        profile.role === 'personnel' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {profile.role}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fecha de Ingreso</label>
                    <p className="text-foreground mt-1 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      {new Date(profile.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Unidad</label>
                    <p className="text-foreground mt-1 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                      Escuadrón Raven (Por asignar)
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Rango</label>
                    <p className="text-foreground mt-1">Teniente (Por asignar)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Avatar y Estadísticas Rápidas */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Resumen de Actividad</h2>
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0">
                  <img
                    className="w-20 h-20 rounded-full bg-muted"
                    src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || profile.email)}&background=6B7D47&color=fff`}
                    alt={profile.full_name || 'Usuario'}
                  />
                </div>
                <div className="grid grid-cols-3 gap-6 flex-1">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">3</div>
                    <div className="text-sm text-muted-foreground">Medallas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">3</div>
                    <div className="text-sm text-muted-foreground">Certificaciones</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">5</div>
                    <div className="text-sm text-muted-foreground">Misiones DCS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'statistics':
        return (
          <div className="space-y-6">
            <FlightStatistics />
          </div>
        )

      case 'medals':
        return (
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Mis Medallas</h2>
              
              {userMedals.length === 0 ? (
                <div className="text-center py-8">
                  <Medal className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Sin medallas</h3>
                  <p className="text-muted-foreground">
                    Las medallas que recibas aparecerán aquí
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userMedals.map((medal) => (
                    <div key={medal.id} className="bg-muted/50 rounded-lg p-4 border">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                          <Medal className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{medal.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{medal.description}</p>
                          <div className="text-xs text-muted-foreground">
                            <p>Otorgada: {new Date(medal.dateAwarded).toLocaleDateString('es-ES')}</p>
                            <p>Por: {medal.awardedBy}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 'certifications':
        return (
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Mis Certificaciones</h2>
              
              {userCertifications.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Sin certificaciones</h3>
                  <p className="text-muted-foreground">
                    Las certificaciones que obtengas aparecerán aquí
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userCertifications.map((cert) => (
                    <div key={cert.id} className="bg-muted/50 rounded-lg p-4 border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Award className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{cert.name}</h3>
                            <p className="text-sm text-muted-foreground">{cert.category} • Nivel {cert.level}</p>
                            <p className="text-xs text-muted-foreground">
                              Obtenida: {new Date(cert.dateObtained).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            cert.status === 'Vigente' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}>
                            {cert.status}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            Vence: {new Date(cert.expiryDate).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-lg p-6 border">
        <div className="flex items-center space-x-4">
          <img
            className="w-16 h-16 rounded-full bg-muted"
            src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || profile.email)}&background=6B7D47&color=fff`}
            alt={profile.full_name || 'Usuario'}
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {profile.full_name || profile.email}
            </h1>
            <p className="text-muted-foreground">
              Miembro desde {new Date(profile.created_at).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                <Icon className={`mr-2 h-5 w-5 ${
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                }`} />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  )
}
