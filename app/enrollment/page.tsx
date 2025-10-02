'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import ApplicationFormOptimized from '@/components/recruitment/ApplicationFormOptimized'

export default function EnrollmentPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <ApplicationFormOptimized />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
