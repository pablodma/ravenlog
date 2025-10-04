'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
// Imports removidos ya que no se usan los iconos en el menú interno
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
  { id: 'users' as const, name: 'Users' },
  { id: 'groups' as const, name: 'Grupos' },
  { id: 'units' as const, name: 'Units' },
  { id: 'positions' as const, name: 'Posiciones' },
  { id: 'ranks' as const, name: 'Ranks' },
  { id: 'specialties' as const, name: 'Specialties' },
  { id: 'qualifications' as const, name: 'Qualifications' },
  { id: 'awards' as const, name: 'Awards' },
  { id: 'statuses' as const, name: 'Statuses' },
]

export default function OrganizationPage() {
  const searchParams = useSearchParams()
  const [activeSection, setActiveSection] = useState<OrganizationSection>('users')

  useEffect(() => {
    const section = searchParams.get('section') as OrganizationSection
    if (section && organizationSections.some(s => s.id === section)) {
      setActiveSection(section)
    }
  }, [searchParams])

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UsersManager key="users-manager" />
      case 'awards':
        return <MedalManager key="medal-manager" />
      case 'groups':
        return <GroupManager key="group-manager" />
      case 'positions':
        return <PositionManager key="position-manager" />
      case 'qualifications':
        return <QualificationsManager key="qualifications-manager" />
      case 'ranks':
        return <RankManager key="rank-manager" />
      case 'specialties':
        return <SpecialtiesManager key="specialties-manager" />
      case 'statuses':
        return <StatusesManager key="statuses-manager" />
      case 'units':
        return <UnitManager key="unit-manager" />
      default:
        return null
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>
          {renderContent()}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

