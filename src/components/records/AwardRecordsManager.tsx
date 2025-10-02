'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AwardRecordsManager() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('award_records')
        .select(`
          *,
          user:profiles!user_id(full_name, email),
          medal:medals(name, description, image_url)
        `)
        .order('awarded_date', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Error loading award records')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Award Records</h2>
          <p className="text-muted-foreground mt-1">Track medals and commendations awarded to personnel</p>
        </div>
        <button
          onClick={() => toast.info('Create functionality coming soon')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Award
        </button>
      </div>

      <div className="bg-muted/30 rounded-lg p-12 text-center">
        <p className="text-muted-foreground">
          {records.length} award records in system. Full interface coming soon.
        </p>
      </div>
    </div>
  )
}

