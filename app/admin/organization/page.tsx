'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { useState } from 'react'
import { 
  Award, 
  Users, 
  Briefcase, 
  GraduationCap, 
  Shield, 
  Zap, 
  Activity,
  Building2,
  Plane
} from 'lucide-react'
import MedalManager from '@/components/admin/MedalManager'
import RankManager from '@/components/admin/RankManager'
import UnitManager from '@/components/admin/UnitManager'
import PositionManager from '@/components/admin/PositionManager'
import GroupManager from '@/components/admin/GroupManager'
import SpecialtiesManager from '@/components/admin/SpecialtiesManager'
import QualificationsManager from '@/components/admin/QualificationsManager'
import StatusesManager from '@/components/admin/StatusesManager'
import UsersManager from '@/components/admin/UsersManager'

type OrganizationSection = 
  | 'awards' 
  | 'groups' 
  | 'positions' 
  | 'qualifications' 
  | 'ranks' 
  | 'specialties' 
  | 'statuses' 
  | 'units'
  | 'users'

const organizationSections = [
  { id: 'users' as const, name: 'Users', icon: Users, color: 'text-blue-600' },
  { id: 'groups' as const, name: 'Groups', icon: Building2, color: 'text-indigo-600' },
  { id: 'units' as const, name: 'Units', icon: Plane, color: 'text-sky-600' },
  { id: 'positions' as const, name: 'Positions', icon: Briefcase, color: 'text-purple-600' },
  { id: 'ranks' as const, name: 'Ranks', icon: Shield, color: 'text-red-600' },
  { id: 'specialties' as const, name: 'Specialties', icon: Zap, color: 'text-orange-600' },
  { id: 'qualifications' as const, name: 'Qualifications', icon: GraduationCap, color: 'text-green-600' },
  { id: 'awards' as const, name: 'Awards', icon: Award, color: 'text-yellow-600' },
  { id: 'statuses' as const, name: 'Statuses', icon: Activity, color: 'text-teal-600' },
]

export default function OrganizationPage() {
  const [activeSection, setActiveSection] = useState<OrganizationSection>('users')

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UsersManager />
      case 'awards':
        return <MedalManager />
      case 'groups':
        return <GroupManager />
      case 'positions':
        return <PositionManager />
      case 'qualifications':
        return <QualificationsManager />
      case 'ranks':
        return <RankManager />
      case 'specialties':
        return <SpecialtiesManager />
      case 'statuses':
        return <StatusesManager />
      case 'units':
        return <UnitManager />
      default:
        return null
    }
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <div className="flex h-full">
          {/* Sidebar */}
          <aside className="w-64 bg-card border-r border-border p-4 space-y-2">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-1">Organization</h2>
              <p className="text-xs text-muted-foreground">Manage organizational structure</p>
            </div>
            
            <nav className="space-y-1">
              {organizationSections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }
                    `}
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

