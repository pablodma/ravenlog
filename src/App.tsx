import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import EnrollmentPage from '@/pages/EnrollmentPage'
import PersonnelPage from '@/pages/PersonnelPage'
import CertificationsPage from '@/pages/CertificationsPage'
import MedalsPage from '@/pages/MedalsPage'
import AdminPage from '@/pages/AdminPage'
import DCSPage from '@/pages/DCSPage'
import LoadingSpinner from '@/components/LoadingSpinner'

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { profile, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!profile) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function App() {
  const { profile, loading, user } = useAuth()

  // Debug logging to console
  console.log('App render:', { profile: !!profile, loading, user: !!user })

  if (loading) {
    return <LoadingSpinner />
  }

  // Si no hay profile pero hay user, mostrar loading (perfil en creación)
  if (user && !profile) {
    console.log('User exists but no profile, showing loading...')
    return <LoadingSpinner />
  }

  return (
    <Routes>
      <Route path="/login" element={!profile ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
      
      {/* Rutas protegidas */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="enrollment" element={<EnrollmentPage />} />
        <Route path="personnel" element={<PersonnelPage />} />
        <Route path="certifications" element={<CertificationsPage />} />
        <Route path="medals" element={<MedalsPage />} />
        <Route path="dcs" element={<DCSPage />} />
        <Route path="admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
      </Route>
      
      

      {/* Fallback - redirigir según estado de auth */}
      <Route path="*" element={profile ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
