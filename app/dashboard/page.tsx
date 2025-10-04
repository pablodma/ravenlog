'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AdminService } from '@/services/adminService'
import { UserPlus, Activity, Calendar, Award, Medal, User, BarChart3, Upload, History, Plane, Edit, Mail, MapPin } from 'lucide-react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import FlightStatistics from '@/components/dcs/FlightStatistics'
import LogUploader from '@/components/dcs/LogUploader'
import LogHistory from '@/components/dcs/LogHistory'
import { ParsedLogSummary } from '@/utils/dcsLogParser'

export default function DashboardPage() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'statistics' | 'upload' | 'history' | 'medals' | 'certifications'>('overview')
  const [userStats, setUserStats] = useState({ medals: 0, certifications: 0, dcsFlights: 0 })
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (profile?.id) {
      loadUserStats()
    }
  }, [profile?.id])

  const loadUserStats = async () => {
    if (!profile?.id) return
    
    try {
      setLoading(true)
      const stats = await AdminService.getUserStats(profile.id)
      setUserStats(stats)
    } catch (error) {
      console.error('Error loading user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadComplete = (summary: ParsedLogSummary) => {
    setRefreshKey(prev => prev + 1)
    setActiveTab('statistics')
  }

  const handleUploadClick = () => {
    setActiveTab('upload')
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview' as const, name: 'Resumen', icon: Activity },
    { id: 'profile' as const, name: 'Mi Perfil', icon: User },
    { id: 'statistics' as const, name: 'Estadísticas DCS', icon: BarChart3 },
    { id: 'upload' as const, name: 'Subir Log', icon: Upload },
    { id: 'history' as const, name: 'Historial', icon: History },
    { id: 'medals' as const, name: 'Medallas', icon: Medal },
    { id: 'certifications' as const, name: 'Certificaciones', icon: Award },
  ]

  // Datos de ejemplo
  const userMedals: any[] = []
  const userCertifications: any[] = []

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
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

      case 'profile':
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
                    <p className="text-foreground mt-1 capitalize">{profile.role}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Miembro desde</label>
                    <p className="text-foreground mt-1">
                      {new Date(profile.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Última actividad</label>
                    <p className="text-foreground mt-1">
                      {new Date(profile.updated_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'statistics':
        return (
          <div className="space-y-6">
            <FlightStatistics key={refreshKey} />
          </div>
        )

      case 'upload':
        return (
          <div className="space-y-6">
            <LogUploader onUploadComplete={handleUploadComplete} />
          </div>
        )

      case 'history':
        return (
          <div className="space-y-6">
            <LogHistory />
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
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header con información del usuario */}
          <div className="bg-gradient-to-r from-primary/10 to-military-sage/10 rounded-lg p-6 border">
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
      </DashboardLayout>
    </ProtectedRoute>
  )
}
