import type { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase.js'
import { createError } from './errorHandler.js'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role?: string
  }
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Token de acceso requerido', 401)
    }

    const token = authHeader.substring(7) // Remove 'Bearer '

    // Verificar token con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      throw createError('Token de acceso inválido', 401)
    }

    // Obtener perfil del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    req.user = {
      id: user.id,
      email: user.email!,
      role: profile?.role
    }

    next()
  } catch (error) {
    next(error)
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Usuario no autenticado', 401))
    }

    if (!req.user.role || !roles.includes(req.user.role)) {
      return next(createError('Permisos insuficientes', 403))
    }

    next()
  }
}

export const requireAdmin = requireRole('admin')
export const requirePersonnelOrAdmin = requireRole('personnel', 'admin')
