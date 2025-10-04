'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import PermissionsManager from '@/components/admin/PermissionsManager'

export default function AdminPermissionsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PermissionsManager />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

