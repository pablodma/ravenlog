'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import FieldsManager from '@/components/admin/FieldsManager'

export default function FieldsSettingsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <FieldsManager />
      </DashboardLayout>
    </ProtectedRoute>
  )
}




