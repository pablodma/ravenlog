'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import PageFrame from '@/components/ui/PageFrame'
import ActionButton from '@/components/ui/ActionButton'

export default function QualificationRecordsManager() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_qualifications')
        .select(`
          *,
          profile:profiles!profile_id(full_name, email),
          qualification:qualifications(name, description)
        `)
        .order('acquired_at', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Error loading qualification records')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <PageFrame title="Registros de Calificaciones" description="Rastrea certificaciones y calificaciones obtenidas">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageFrame>
    )
  }

  return (
    <PageFrame 
      title="Registros de Calificaciones" 
      description="Rastrea certificaciones y calificaciones obtenidas"
      headerActions={
        <ActionButton
          variant="primary"
          icon={Plus}
          onClick={() => toast('Create functionality coming soon', { icon: '🚀' })}
        >
          Nueva Calificación
        </ActionButton>
      }
    >
      <div className="bg-muted/30 rounded-lg p-12 text-center">
        <p className="text-muted-foreground">
          {records.length} registros de calificaciones en el sistema. Interfaz completa próximamente.
        </p>
      </div>
    </PageFrame>
  )
}

