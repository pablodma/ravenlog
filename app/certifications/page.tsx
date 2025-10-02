'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'

export default function CertificationsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Certificaciones</h1>
        </div>
        
        {/* TODO: Implementar sistema de certificaciones */}
        <div className="bg-card rounded-lg border p-6">
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <p className="text-muted-foreground">
              Sistema de certificaciones en desarrollo...
            </p>
          </div>
        </div>
      </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

