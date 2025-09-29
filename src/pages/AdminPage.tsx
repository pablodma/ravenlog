import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Shield, Users, Settings, Grid, Key, Award, Star, Plane, FileText, Eye, UserCheck, Medal, UserPlus } from 'lucide-react'
import PermissionGuard, { PermissionCheck } from '@/components/auth/PermissionGuard'
import PermissionManager from '@/components/admin/PermissionManager'
import RoleManager from '@/components/admin/RoleManager'
import RolePermissionMatrix from '@/components/admin/RolePermissionMatrix'
import MedalManager from '@/components/admin/MedalManager'
import RankManager from '@/components/admin/RankManager'
import UnitManager from '@/components/admin/UnitManager'
import FormBuilder from '@/components/admin/FormBuilder'
import ApplicationReview from '@/components/admin/ApplicationReview'
import CandidateProcessor from '@/components/admin/CandidateProcessor'

type TabType = 'overview' | 'permissions' | 'roles' | 'matrix' | 'users' | 'medals' | 'ranks' | 'units' | 'forms' | 'applications' | 'processing'

export default function AdminPage() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Proteger toda la página de admin
  if (!profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview' as TabType, name: 'Resumen', icon: Grid, permission: null },
    { id: 'applications' as TabType, name: 'Aplicaciones', icon: Eye, permission: 'recruitment.review_applications' },
    { id: 'processing' as TabType, name: 'Procesamiento', icon: UserCheck, permission: 'recruitment.process_applications' },
    { id: 'forms' as TabType, name: 'Formularios', icon: FileText, permission: 'recruitment.create_forms' },
    { id: 'permissions' as TabType, name: 'Permisos', icon: Key, permission: 'admin.manage_permissions' },
    { id: 'roles' as TabType, name: 'Roles', icon: Shield, permission: 'admin.manage_roles' },
    { id: 'matrix' as TabType, name: 'Asignaciones', icon: Settings, permission: 'admin.manage_permissions' },
    { id: 'medals' as TabType, name: 'Medallas', icon: Award, permission: 'medals.create' },
    { id: 'ranks' as TabType, name: 'Rangos', icon: Star, permission: 'ranks.create' },
    { id: 'units' as TabType, name: 'Unidades', icon: Plane, permission: 'units.create' },
    { id: 'users' as TabType, name: 'Usuarios', icon: Users, permission: 'admin.assign_roles' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'applications':
        return (
          <PermissionGuard permission="recruitment.review_applications">
            <ApplicationReview />
          </PermissionGuard>
        )
      case 'processing':
        return (
          <PermissionGuard permission="recruitment.process_applications">
            <CandidateProcessor />
          </PermissionGuard>
        )
      case 'forms':
        return (
          <PermissionGuard permission="recruitment.create_forms">
            <FormBuilder />
          </PermissionGuard>
        )
      case 'permissions':
        return (
          <PermissionGuard permission="admin.manage_permissions">
            <PermissionManager />
          </PermissionGuard>
        )
      case 'roles':
        return (
          <PermissionGuard permission="admin.manage_roles">
            <RoleManager />
          </PermissionGuard>
        )
      case 'matrix':
        return (
          <PermissionGuard permission="admin.manage_permissions">
            <RolePermissionMatrix />
          </PermissionGuard>
        )
      case 'medals':
        return (
          <PermissionGuard permission="medals.create">
            <MedalManager />
          </PermissionGuard>
        )
      case 'ranks':
        return (
          <PermissionGuard permission="ranks.create">
            <RankManager />
          </PermissionGuard>
        )
      case 'units':
        return (
          <PermissionGuard permission="units.create">
            <UnitManager />
          </PermissionGuard>
        )
      case 'users':
        return (
          <PermissionGuard permission="admin.assign_roles">
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Gestión de Usuarios</h3>
              <p className="text-gray-600">Esta funcionalidad estará disponible próximamente</p>
            </div>
          </PermissionGuard>
        )
      default:
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
              <p className="text-gray-600">
                Bienvenido, {profile?.full_name}. Desde aquí puedes gestionar todo el sistema.
              </p>
            </div>

            {/* Estadísticas Administrativas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Personal Activo
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      24
                    </p>
                    <p className="text-sm mt-1 text-green-600">
                      +2 este mes
                    </p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Certificaciones
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      12
                    </p>
                    <p className="text-sm mt-1 text-muted-foreground">
                      3 categorías
                    </p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Medallas
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      8
                    </p>
                    <p className="text-sm mt-1 text-green-600">
                      2 nuevas
                    </p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Medal className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Candidatos
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      5
                    </p>
                    <p className="text-sm mt-1 text-muted-foreground">
                      En revisión
                    </p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <UserPlus className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center gap-3 mb-3">
                  <Key className="h-8 w-8 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Gestión de Permisos</h2>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Crear y gestionar permisos específicos del sistema
                </p>
                <button
                  onClick={() => setActiveTab('permissions')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Gestionar permisos →
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-8 w-8 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Gestión de Roles</h2>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Crear roles personalizados para tu organización
                </p>
                <button
                  onClick={() => setActiveTab('roles')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Gestionar roles →
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center gap-3 mb-3">
                  <Settings className="h-8 w-8 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Matriz de Permisos</h2>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Asignar permisos específicos a cada rol
                </p>
                <button
                  onClick={() => setActiveTab('matrix')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Ver matriz →
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="h-8 w-8 text-orange-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Gestión de Usuarios</h2>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Asignar roles a usuarios y gestionar accesos
                </p>
                <button
                  onClick={() => setActiveTab('users')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Gestionar usuarios →
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Reportes</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Generar reportes y estadísticas del sistema
                </p>
                <button className="text-gray-400 text-sm font-medium cursor-not-allowed">
                  Próximamente...
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Configuración</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Configuración general del sistema
                </p>
                <button className="text-gray-400 text-sm font-medium cursor-not-allowed">
                  Próximamente...
                </button>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Navegación por pestañas */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <PermissionCheck key={tab.id} permission={tab.permission || undefined}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.name}
                  </button>
                </PermissionCheck>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Contenido de la pestaña activa */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  )
}