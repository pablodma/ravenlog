import { Router } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.js'
import { requireAuth } from '../middleware/auth.js'
import { supabase } from '../lib/supabase.js'

const router = Router()

// Obtener perfil del usuario actual
router.get('/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user!.id)
      .single()

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Perfil no encontrado'
      })
    }

    res.json({
      success: true,
      data: profile
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// Actualizar perfil del usuario
router.patch('/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const allowedFields = ['full_name', 'avatar_url']
    const updates: any = {}
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      })
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user!.id)
      .select()
      .single()

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Error al actualizar perfil'
      })
    }

    res.json({
      success: true,
      data
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

export { router as authRouter }
