'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { useState } from 'react'
import { 
  Briefcase, 
  Award, 
  Plane, 
  GraduationCap, 
  TrendingUp, 
  FileText 
} from 'lucide-react'
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
  { id: 'assignments' as const, name: 'Asignaciones', icon: Briefcase, color: 'text-blue-600' },
  { id: 'awards' as const, name: 'Premios', icon: Award, color: 'text-yellow-600' },
  { id: 'combat' as const, name: 'Combate', icon: Plane, color: 'text-red-600' },
  { id: 'qualifications' as const, name: 'Calificaciones', icon: GraduationCap, color: 'text-green-600' },
  { id: 'ranks' as const, name: 'Rangos', icon: TrendingUp, color: 'text-purple-600' },
  { id: 'service' as const, name: 'Servicio', icon: FileText, color: 'text-indigo-600' },
]

export default function RecordsPage() {
  const [activeSection, setActiveSection] = useState<RecordsSection>('assignments')

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
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex h-full">
          {/* Sidebar */}
          <aside className="w-64 bg-card border-r border-border p-4 space-y-2">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-1">Records</h2>
              <p className="text-xs text-muted-foreground">Historial de actividad del personal</p>
            </div>
            
            <nav className="space-y-1">
              {recordsSections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-current' : section.color}`} />
                    <span>{section.name}</span>
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              {renderContent()}
            </div>
          </main>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

