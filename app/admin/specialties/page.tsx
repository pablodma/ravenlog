'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import SpecialtiesManager from '@/components/admin/SpecialtiesManager'

export default function SpecialtiesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <SpecialtiesManager />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

