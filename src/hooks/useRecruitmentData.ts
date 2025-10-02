import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

// ==================== QUERIES ====================

// Obtener formularios activos (caché: 10 minutos)
export function useActiveForms() {
  return useQuery({
    queryKey: ['recruitment-forms', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recruitment_forms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Parsear campos JSONB si vienen como string
      return data?.map(form => ({
        ...form,
        fields: typeof form.fields === 'string' ? JSON.parse(form.fields) : (form.fields || []),
      }))
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  })
}

// Obtener aplicación actual del usuario (caché: 30 segundos)
export function useMyApplication() {
  const { profile } = useAuth()

  return useQuery({
    queryKey: ['my-application', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null

      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('applicant_id', profile.id)
        .in('status', ['pending', 'in_review', 'approved'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      
      // Parsear form_data JSONB si viene como string
      if (data && data.form_data) {
        data.form_data = typeof data.form_data === 'string' ? JSON.parse(data.form_data) : data.form_data
      }
      
      return data
    },
    enabled: !!profile?.id,
    staleTime: 1000 * 30, // 30 segundos
  })
}

// Obtener todas las aplicaciones (Admin) (caché: 1 minuto)
export function useAllApplications() {
  return useQuery({
    queryKey: ['applications', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          applicant:profiles!applicant_id(full_name, email, avatar_url),
          recruitment_form:recruitment_forms!form_id(title, fields)
        `)
        .order('created_at', { ascending: false })
        .limit(100) // Limitar a 100 más recientes

      if (error) throw error
      
      // Parsear JSONB fields
      return data?.map(app => ({
        ...app,
        form_data: typeof app.form_data === 'string' ? JSON.parse(app.form_data) : (app.form_data || {}),
        recruitment_form: app.recruitment_form ? {
          ...app.recruitment_form,
          fields: typeof app.recruitment_form.fields === 'string' 
            ? JSON.parse(app.recruitment_form.fields) 
            : (app.recruitment_form.fields || []),
        } : null,
      }))
    },
    staleTime: 1000 * 60, // 1 minuto
  })
}

// Obtener aplicaciones aprobadas (Admin) (caché: 1 minuto)
export function useApprovedApplications() {
  return useQuery({
    queryKey: ['applications', 'approved'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          applicant:profiles!applicant_id(full_name, email, avatar_url),
          recruitment_form:recruitment_forms!form_id(title)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(50) // Limitar a 50

      if (error) throw error
      
      // Parsear form_data JSONB
      return data?.map(app => ({
        ...app,
        form_data: typeof app.form_data === 'string' ? JSON.parse(app.form_data) : (app.form_data || {}),
      }))
    },
    staleTime: 1000 * 60, // 1 minuto
  })
}

// Obtener rangos (caché: 1 hora)
export function useRanks() {
  return useQuery({
    queryKey: ['ranks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ranks')
        .select('*')
        .order('order')

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 60, // 1 hora - casi nunca cambian
  })
}

// Obtener unidades (caché: 1 hora)
export function useUnits() {
  return useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  })
}

// Obtener posiciones de una unidad (caché: 1 hora)
export function useUnitPositions(unitId: string | null) {
  return useQuery({
    queryKey: ['unit-positions', unitId],
    queryFn: async () => {
      if (!unitId) return []

      const { data, error } = await supabase
        .from('unit_positions')
        .select('*')
        .eq('unit_id', unitId)
        .order('display_order')

      if (error) throw error
      return data
    },
    enabled: !!unitId,
    staleTime: 1000 * 60 * 60, // 1 hora
  })
}

// Obtener todas las posiciones (Admin)
export function useAllPositions() {
  return useQuery({
    queryKey: ['unit-positions', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unit_positions')
        .select(`
          *,
          unit:units!unit_id(name)
        `)
        .order('unit_id')
        .order('display_order')

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  })
}

// ==================== MUTATIONS ====================

// Enviar/actualizar aplicación
export function useSubmitApplication() {
  const queryClient = useQueryClient()
  const { profile } = useAuth()

  return useMutation({
    mutationFn: async ({
      formId,
      formData,
      existingApplicationId,
    }: {
      formId: string
      formData: Record<string, any>
      existingApplicationId?: string
    }) => {
      if (existingApplicationId) {
        // Actualizar
        const { error } = await supabase
          .from('applications')
          .update({ form_data: formData })
          .eq('id', existingApplicationId)

        if (error) throw error
      } else {
        // Crear
        const { error } = await supabase
          .from('applications')
          .insert([{
            applicant_id: profile?.id,
            form_id: formId,
            form_data: formData,
            status: 'pending',
          }])

        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-application'] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      toast.success('Solicitud enviada exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al enviar solicitud')
    },
  })
}

// Actualizar estado de aplicación (Admin)
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      applicationId,
      newStatus,
      notes,
    }: {
      applicationId: string
      newStatus: string
      notes?: string
    }) => {
      const { error } = await supabase.rpc('update_application_status', {
        application_id: applicationId,
        new_status: newStatus,
        notes: notes || null,
      })

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      toast.success(`Solicitud actualizada`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar solicitud')
    },
  })
}

// Procesar candidato (Admin)
export function useProcessCandidate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      applicationId,
      rankId,
      unitId,
      positionId,
    }: {
      applicationId: string
      rankId: string
      unitId: string
      positionId?: string
    }) => {
      const { error } = await supabase.rpc('process_candidate', {
        application_id: applicationId,
        rank_id: rankId,
        unit_id: unitId,
        position_id: positionId || null,
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      toast.success('Candidato procesado exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al procesar candidato')
    },
  })
}

// ==================== MUTATIONS PARA POSICIONES ====================

// Crear posición
export function useCreatePosition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (position: {
      name: string
      description?: string
      unit_id: string
      display_order?: number
      is_leadership?: boolean
      color?: string
    }) => {
      const { error } = await supabase
        .from('unit_positions')
        .insert([position])

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit-positions'] })
      toast.success('Posición creada exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear posición')
    },
  })
}

// Actualizar posición
export function useUpdatePosition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string
      name?: string
      description?: string
      display_order?: number
      is_leadership?: boolean
      color?: string
    }) => {
      const { error } = await supabase
        .from('unit_positions')
        .update(updates)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit-positions'] })
      toast.success('Posición actualizada')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar posición')
    },
  })
}

// Eliminar posición
export function useDeletePosition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('unit_positions')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit-positions'] })
      toast.success('Posición eliminada')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar posición')
    },
  })
}

