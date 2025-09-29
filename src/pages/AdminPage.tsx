import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Shield, Users, Settings, Grid, Key } from 'lucide-react'
import PermissionManager from '@/components/admin/PermissionManager'
import RoleManager from '@/components/admin/RoleManager'
import RolePermissionMatrix from '@/components/admin/RolePermissionMatrix'

type TabType = 'overview' | 'permissions' | 'roles' | 'matrix' | 'users'

export default function AdminPage() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const tabs = [
    { id: 'overview' as TabType, name: 'Resumen', icon: Grid },
    { id: 'permissions' as TabType, name: 'Permisos', icon: Key },
    { id: 'roles' as TabType, name: 'Roles', icon: Shield },
    { id: 'matrix' as TabType, name: 'Asignaciones', icon: Settings },
    { id: 'users' as TabType, name: 'Usuarios', icon: Users },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'permissions':
        return <PermissionManager />
      case 'roles':
        return <RoleManager />
      case 'matrix':
        return <RolePermissionMatrix />
      case 'users':
        return (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gestión de Usuarios</h3>
            <p className="text-gray-600">Esta funcionalidad estará disponible próximamente</p>
          </div>
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
                <button
                  key={tab.id}
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