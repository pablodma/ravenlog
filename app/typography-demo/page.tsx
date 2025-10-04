'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import TypographyDemo from '@/components/TypographyDemo'

export default function TypographyDemoPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <TypographyDemo />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

