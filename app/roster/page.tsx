'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import RosterView from '@/components/roster/RosterView'

export default function RosterPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <RosterView />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

