import { z } from 'zod'

// Esquemas de validación para formularios
export const enrollmentSchema = z.object({
  callsign_requested: z.string().min(3, 'El callsign debe tener al menos 3 caracteres').max(20, 'El callsign no puede tener más de 20 caracteres'),
  motivation: z.string().min(50, 'La motivación debe tener al menos 50 caracteres').max(1000, 'La motivación no puede tener más de 1000 caracteres'),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert'], {
    errorMap: () => ({ message: 'Debes seleccionar un nivel de experiencia válido' })
  }),
  preferred_role: z.enum(['fighter', 'attacker', 'transport', 'rotary', 'awacs', 'tanker'], {
    errorMap: () => ({ message: 'Debes seleccionar un rol preferido válido' })
  }),
  availability: z.string().min(10, 'Debes especificar tu disponibilidad')
})

export const rankSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  abbreviation: z.string().min(1, 'La abreviación es requerida').max(10, 'La abreviación no puede tener más de 10 caracteres'),
  order: z.number().int().min(1, 'El orden debe ser un número positivo')
})

export const certificationSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  category: z.string().min(1, 'La categoría es requerida'),
  requirements: z.string().min(1, 'Los requisitos son requeridos')
})

export const medalSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  category: z.string().min(1, 'La categoría es requerida'),
  requirements: z.string().min(1, 'Los requisitos son requeridos'),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  points: z.number().int().min(0, 'Los puntos deben ser un número positivo')
})

export const personnelUpdateSchema = z.object({
  callsign: z.string().min(3, 'El callsign debe tener al menos 3 caracteres').max(20, 'El callsign no puede tener más de 20 caracteres'),
  rank_id: z.string().uuid('Debe seleccionar un rango válido'),
  flight_unit: z.string().optional(),
  status: z.enum(['active', 'inactive', 'leave', 'discharged'])
})

// Tipos derivados
export type EnrollmentFormData = z.infer<typeof enrollmentSchema>
export type RankFormData = z.infer<typeof rankSchema>
export type CertificationFormData = z.infer<typeof certificationSchema>
export type MedalFormData = z.infer<typeof medalSchema>
export type PersonnelUpdateData = z.infer<typeof personnelUpdateSchema>
