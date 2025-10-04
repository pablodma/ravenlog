'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import PageFrame from '@/components/ui/PageFrame'
import ActionButton from '@/components/ui/ActionButton'

export default function ServiceRecordsManager() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('service_records')
        .select(`
          *,
          user:profiles!user_id(full_name, email)
        `)
        .order('effective_date', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Error loading service records')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <PageFrame title="Registros de Servicio" description="Rastrea enlistamiento, baja y cambios de estado de servicio">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageFrame>
    )
  }

  return (
    <PageFrame 
      title="Registros de Servicio" 
      description="Rastrea enlistamiento, baja y cambios de estado de servicio"
      headerActions={
        <ActionButton
          variant="primary"
          icon={Plus}
          onClick={() => toast('Create functionality coming soon', { icon: '🚀' })}
        >
          Nuevo Registro
        </ActionButton>
      }
    >
      <div className="bg-muted/30 rounded-lg p-12 text-center">
        <p className="text-muted-foreground">
          {records.length} registros de servicio en el sistema. Interfaz completa próximamente.
        </p>
      </div>
    </PageFrame>
  )
}

