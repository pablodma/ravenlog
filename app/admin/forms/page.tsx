'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function FormsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir a la página de gestión de formularios
    router.replace('/admin/forms/manage')
  }, [router])

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  )
}