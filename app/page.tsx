'use client'

import { useContext } from 'react'
import { AuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function HomePage() {
  const { user, profile, loading } = useContext(AuthContext)
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else {
        router.push('/dashboard')
      }
    }
  }, [user, profile, loading, router])

  if (loading) {
    return <LoadingSpinner />
  }

  return <LoadingSpinner />
}
