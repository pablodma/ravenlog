'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import RolesManager from '@/components/admin/RolesManager'

export default function AdminRolesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <RolesManager />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

