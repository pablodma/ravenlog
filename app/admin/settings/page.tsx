'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { useState } from 'react'
// Imports removidos ya que no se usan los iconos en el menú interno
import RolesManager from '@/components/admin/RolesManager'
import PermissionsManager from '@/components/admin/PermissionsManager'
import FieldsManager from '@/components/admin/FieldsManager'

type SettingsSection = 
  | 'roles' 
  | 'permissions' 
  | 'fields'

const settingsSections = [
  { id: 'roles' as const, name: 'Roles' },
  { id: 'permissions' as const, name: 'Permisos' },
  { id: 'fields' as const, name: 'Campos' },
]

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('roles')

  const renderContent = () => {
    switch (activeSection) {
      case 'roles':
        return <RolesManager />
      case 'permissions':
        return <PermissionsManager />
      case 'fields':
        return <FieldsManager />
      default:
        return <RolesManager />
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>
          {renderContent()}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}