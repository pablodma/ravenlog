'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/utils/logger'
import DebugPanel from './DebugPanel'
import {
  Home,
  Users,
  UserPlus,
  Settings,
  LogOut,
  Menu,
  X,
  Plane,
  User,
  Calendar,
  List,
  Building2,
  FileText,
  ScrollText,
  Shield,
  Cog,
  ChevronDown,
  ChevronRight,
  Award,
  Briefcase,
  GraduationCap,
  Activity,
  Zap,
  TrendingUp,
  UserCheck,
  ClipboardList,
  Database,
  Inbox
} from 'lucide-react'
import { useState, ReactNode } from 'react'
import toast from 'react-hot-toast'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Calendario', href: '/calendar', icon: Calendar },
  { name: 'Roster', href: '/roster', icon: List },
  { name: 'Formularios', href: '/forms', icon: FileText },
  { name: 'Enlistamiento', href: '/enrollment', icon: UserPlus },
]

// Estructura de navegación colapsable para administradores
const adminNavigationSections = [
  {
    name: 'Organización',
    icon: Building2,
    href: '/admin/organization',
    subcategories: [
      { name: 'Usuarios', href: '/admin/organization?section=users', icon: Users },
      { name: 'Grupos', href: '/admin/organization?section=groups', icon: Building2 },
      { name: 'Posiciones', href: '/admin/organization?section=positions', icon: Briefcase },
      { name: 'Unidades', href: '/admin/organization?section=units', icon: Plane },
      { name: 'Rangos', href: '/admin/organization?section=ranks', icon: Shield },
      { name: 'Especialidades', href: '/admin/organization?section=specialties', icon: Zap },
      { name: 'Calificaciones', href: '/admin/organization?section=qualifications', icon: GraduationCap },
      { name: 'Premios', href: '/admin/organization?section=awards', icon: Award },
      { name: 'Estados', href: '/admin/organization?section=statuses', icon: Activity },
    ]
  },
  {
    name: 'Formularios',
    icon: FileText,
    href: '/admin/forms',
    subcategories: [
      { name: 'Bandeja', href: '/admin/forms/receptions', icon: Inbox },
      { name: 'Gestionar Formularios', href: '/admin/forms/manage', icon: ClipboardList },
    ]
  },
  {
    name: 'Records',
    icon: ScrollText,
    href: '/records',
    subcategories: [
      { name: 'Asignaciones', href: '/records?section=assignments', icon: Briefcase },
      { name: 'Premios', href: '/records?section=awards', icon: Award },
      { name: 'Combate', href: '/records?section=combat', icon: Plane },
      { name: 'Calificaciones', href: '/records?section=qualifications', icon: GraduationCap },
      { name: 'Rangos', href: '/records?section=ranks', icon: TrendingUp },
      { name: 'Servicio', href: '/records?section=service', icon: FileText },
    ]
  },
  {
    name: 'Ajustes',
    icon: Cog,
    href: '/admin/settings',
    subcategories: [
      { name: 'Roles', href: '/admin/settings/roles', icon: Shield },
      { name: 'Permisos', href: '/admin/settings/permissions', icon: UserCheck },
      { name: 'Campos', href: '/admin/settings/fields', icon: Database },
    ]
  }
]

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const isActive = (href: string) => pathname === href

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName)
      } else {
        newSet.add(sectionName)
      }
      return newSet
    })
  }

  const isSectionExpanded = (sectionName: string) => expandedSections.has(sectionName)

  const handleSignOut = async () => {
    try {
      logger.userAction('DashboardLayout', 'Iniciando cierre de sesión')
      await signOut()
      logger.info('DashboardLayout', 'Sesión cerrada exitosamente')
      toast.success('Sesión cerrada exitosamente')
      router.push('/login')
    } catch (error: any) {
      logger.error('DashboardLayout', 'Error al cerrar sesión', error)
      toast.error(error.message || 'Error al cerrar sesión')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/50 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-border/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-primary-foreground font-bold text-sm">RL</span>
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">RavenLog</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`nav-item ${active ? 'nav-item-active' : 'nav-item-inactive'}`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}

            {/* Admin section */}
            {profile?.role === 'admin' && (
              <>
                <div className="divider" />
                <div className="px-4 pt-2 pb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Administración
                  </p>
                </div>
                {adminNavigationSections.map((section) => {
                  const SectionIcon = section.icon
                  const isExpanded = isSectionExpanded(section.name)
                  const hasActiveSubcategory = section.subcategories.some(sub => isActive(sub.href))
                  const isMainActive = isActive(section.href)
                  
                  return (
                    <div key={section.name} className="space-y-1">
                      {/* Main section button */}
                      <button
                        onClick={() => toggleSection(section.name)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-[1.02] ${
                          isMainActive || hasActiveSubcategory
                            ? 'bg-primary/10 text-primary shadow-sm'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <SectionIcon className="w-5 h-5" />
                          <span>{section.name}</span>
                        </div>
                        <ChevronRight 
                          className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                            isExpanded ? 'rotate-90' : 'rotate-0'
                          }`} 
                        />
                      </button>
                      
                      {/* Subcategories */}
                      <div 
                        className={`collapse-content overflow-hidden ${
                          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="ml-4 space-y-1 pt-1">
                          {section.subcategories.map((subcategory, index) => {
                            const SubIcon = subcategory.icon
                            const isSubActive = isActive(subcategory.href)
                            
                            return (
                              <Link
                                key={subcategory.name}
                                href={subcategory.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`subcategory-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ease-in-out transform hover:translate-x-1 hover:scale-[1.02] ${
                                  isSubActive
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                                style={{
                                  animationDelay: isExpanded ? `${index * 50}ms` : '0ms',
                                  animation: isExpanded ? 'slideInFromLeft 0.3s ease-out forwards' : 'none'
                                }}
                              >
                                <SubIcon className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
                                <span className="transition-all duration-200 font-medium">{subcategory.name}</span>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </nav>

          {/* User section */}
          <div className="px-4 py-6 border-t border-border/50 bg-muted/20">
            <div className="flex items-center space-x-3 mb-4 p-2 rounded-lg bg-background/50">
              <img
                className="w-10 h-10 rounded-lg bg-muted ring-2 ring-primary/20"
                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || profile?.email || '')}&background=3B82F6&color=fff`}
                alt={profile?.full_name || 'Usuario'}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {profile?.full_name || profile?.email}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {profile?.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-muted-foreground rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-card/50 backdrop-blur-sm border-b border-border/50 px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                {navigation.find(item => isActive(item.href))?.name || 
                 adminNavigationSections.find(item => isActive(item.href))?.name || 
                 'RavenLog'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground hidden md:block">
                Bienvenido, <span className="font-semibold text-foreground">{profile?.full_name || profile?.email}</span>
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 animate-fade-in">
          {children}
        </main>
      </div>

      {/* Debug Panel - Solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <DebugPanel enabled={true} />
      )}
    </div>
  )
}


