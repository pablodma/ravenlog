'use client'

import { CalendarView } from '@/components/calendar/CalendarView'
import PermissionGuard from '@/components/auth/PermissionGuard'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'

export default function CalendarPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
        <PermissionGuard permission="events.view" fallback={
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">🔒</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso Restringido</h3>
            <p className="text-gray-600">
              No tienes permisos para ver el calendario de eventos.
            </p>
          </div>
        }>
          <CalendarView />
        </PermissionGuard>
      </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

