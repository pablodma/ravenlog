'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
// Imports removidos ya que no se usan los iconos en el menú interno
import AssignmentRecordsManager from '@/components/records/AssignmentRecordsManager'
import AwardRecordsManager from '@/components/records/AwardRecordsManager'
import CombatRecordsManager from '@/components/records/CombatRecordsManager'
import QualificationRecordsManager from '@/components/records/QualificationRecordsManager'
import RankRecordsManager from '@/components/records/RankRecordsManager'
import ServiceRecordsManager from '@/components/records/ServiceRecordsManager'

type RecordsSection = 
  | 'assignments' 
  | 'awards' 
  | 'combat' 
  | 'qualifications' 
  | 'ranks' 
  | 'service'

const recordsSections = [
  { id: 'assignments' as const, name: 'Asignaciones' },
  { id: 'awards' as const, name: 'Premios' },
  { id: 'combat' as const, name: 'Combate' },
  { id: 'qualifications' as const, name: 'Calificaciones' },
  { id: 'ranks' as const, name: 'Rangos' },
  { id: 'service' as const, name: 'Servicio' },
]

function RecordsContent() {
  const searchParams = useSearchParams()
  const [activeSection, setActiveSection] = useState<RecordsSection>('assignments')

  useEffect(() => {
    const section = searchParams.get('section') as RecordsSection
    if (section && recordsSections.some(s => s.id === section)) {
      setActiveSection(section)
    }
  }, [searchParams])

  const renderContent = () => {
    switch (activeSection) {
      case 'assignments':
        return <AssignmentRecordsManager />
      case 'awards':
        return <AwardRecordsManager />
      case 'combat':
        return <CombatRecordsManager />
      case 'qualifications':
        return <QualificationRecordsManager />
      case 'ranks':
        return <RankRecordsManager />
      case 'service':
        return <ServiceRecordsManager />
      default:
        return null
    }
  }

  return (
    <div>
      {renderContent()}
    </div>
  )
}

export default function RecordsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Suspense fallback={<div className="flex items-center justify-center p-8">Cargando...</div>}>
          <RecordsContent />
        </Suspense>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

