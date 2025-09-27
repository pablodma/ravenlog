// Exportar todos los tipos y esquemas
export * from './types/database'
export * from './schemas'

// Constantes compartidas
export const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
  { value: 'expert', label: 'Experto' }
] as const

export const PREFERRED_ROLES = [
  { value: 'fighter', label: 'Caza' },
  { value: 'attacker', label: 'Ataque' },
  { value: 'transport', label: 'Transporte' },
  { value: 'rotary', label: 'Helicópteros' },
  { value: 'awacs', label: 'AWACS' },
  { value: 'tanker', label: 'Reabastecimiento' }
] as const

export const PERSONNEL_STATUS = [
  { value: 'active', label: 'Activo', color: 'green' },
  { value: 'inactive', label: 'Inactivo', color: 'gray' },
  { value: 'leave', label: 'Permiso', color: 'yellow' },
  { value: 'discharged', label: 'De baja', color: 'red' }
] as const

export const ENROLLMENT_STATUS = [
  { value: 'pending', label: 'Pendiente', color: 'yellow' },
  { value: 'under_review', label: 'En revisión', color: 'blue' },
  { value: 'accepted', label: 'Aceptado', color: 'green' },
  { value: 'rejected', label: 'Rechazado', color: 'red' }
] as const

export const MEDAL_RARITIES = [
  { value: 'common', label: 'Común', color: 'gray' },
  { value: 'uncommon', label: 'Poco común', color: 'green' },
  { value: 'rare', label: 'Raro', color: 'blue' },
  { value: 'epic', label: 'Épico', color: 'purple' },
  { value: 'legendary', label: 'Legendario', color: 'orange' }
] as const
