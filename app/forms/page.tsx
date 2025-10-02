'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { useState } from 'react'
import { FileText, Inbox } from 'lucide-react'
import FormsManager from '@/components/forms/FormsManager'
import SubmissionsManager from '@/components/forms/SubmissionsManager'

type FormsSection = 'forms' | 'submissions'

const formsSections = [
  { id: 'forms' as const, name: 'Formularios', icon: FileText, color: 'text-blue-600' },
  { id: 'submissions' as const, name: 'Envíos', icon: Inbox, color: 'text-green-600' },
]

export default function FormsPage() {
  const [activeSection, setActiveSection] = useState<FormsSection>('forms')

  const renderContent = () => {
    switch (activeSection) {
      case 'forms':
        return <FormsManager />
      case 'submissions':
        return <SubmissionsManager />
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
              <h2 className="text-lg font-semibold text-foreground mb-1">Formularios</h2>
              <p className="text-xs text-muted-foreground">Gestiona formularios y envíos</p>
            </div>
            
            <nav className="space-y-1">
              {formsSections.map((section) => {
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

