// Servicio para manejar operaciones DCS con Supabase
import { supabase } from '@/lib/supabase'
import { DCSLogParser, ParsedLogSummary } from '@/utils/dcsLogParser'

export interface UserStatistics {
  total_missions: number
  total_takeoffs: number
  total_landings: number
  total_flight_time: string // Formato HH:MM:SS
  total_shots: number
  total_hits: number
  total_kills: number
  total_deaths: number
  overall_accuracy: number
  kd_ratio: number
}

export interface WeaponStatistic {
  weapon_name: string
  shots: number
  hits: number
  kills: number
  accuracy: number
}

export interface LogFile {
  id: string
  filename: string
  file_size: number
  processed_at: string
  events_count: number
  status: 'processing' | 'processed' | 'error' | 'duplicate'
  error_message?: string
  summary?: {
    missions: number
    takeoffs: number
    landings: number
    shots: number
    hits: number
    kills: number
    deaths: number
    flight_time: number
  }
}

export class DCSService {
  /**
   * Obtiene las estadísticas generales del usuario
   */
  static async getUserStatistics(): Promise<UserStatistics> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: stats, error } = await (supabase as any)
      .from('user_statistics')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Error fetching user statistics:', error)
      throw error
    }

    // Si no hay estadísticas, devolver valores por defecto
    if (!stats) {
      return {
        total_missions: 0,
        total_takeoffs: 0,
        total_landings: 0,
        total_flight_time: '00:00:00',
        total_shots: 0,
        total_hits: 0,
        total_kills: 0,
        total_deaths: 0,
        overall_accuracy: 0,
        kd_ratio: 0
      }
    }

    // Calcular métricas derivadas
    const overall_accuracy = stats.total_shots > 0 ? (stats.total_hits / stats.total_shots) * 100 : 0
    const kd_ratio = stats.total_deaths > 0 ? stats.total_kills / stats.total_deaths : stats.total_kills

    return {
      total_missions: stats.total_missions || 0,
      total_takeoffs: stats.total_takeoffs || 0,
      total_landings: stats.total_landings || 0,
      total_flight_time: this.formatFlightTimeInterval(stats.total_flight_time_seconds || 0),
      total_shots: stats.total_shots || 0,
      total_hits: stats.total_hits || 0,
      total_kills: stats.total_kills || 0,
      total_deaths: stats.total_deaths || 0,
      overall_accuracy: Math.round(overall_accuracy * 100) / 100,
      kd_ratio: Math.round(kd_ratio * 100) / 100
    }
  }

  /**
   * Obtiene las estadísticas por arma del usuario
   */
  static async getWeaponStatistics(): Promise<WeaponStatistic[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: weaponStats, error } = await (supabase as any)
      .from('weapon_statistics')
      .select('*')
      .eq('user_id', user.id)
      .order('shots', { ascending: false })

    if (error) {
      console.error('Error fetching weapon statistics:', error)
      throw error
    }

    return (weaponStats || []).map((stat: any) => ({
      weapon_name: stat.weapon_name,
      shots: stat.shots || 0,
      hits: stat.hits || 0,
      kills: stat.kills || 0,
      accuracy: stat.shots > 0 ? Math.round((stat.hits / stat.shots) * 100 * 100) / 100 : 0
    }))
  }

  /**
   * Verifica si un archivo ya fue procesado (deduplicación)
   */
  static async checkDuplicate(fileHash: string): Promise<{ isDuplicate: boolean; existingFile?: any }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: existingFile, error } = await (supabase as any)
      .from('log_files')
      .select('id, filename, processed_at, status')
      .eq('file_hash', fileHash)
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Error checking duplicate:', error)
      throw error
    }

    return {
      isDuplicate: !!existingFile,
      existingFile: existingFile || undefined
    }
  }

  /**
   * Procesa y sube un archivo de log
   */
  static async uploadLog(file: File, summary: ParsedLogSummary): Promise<{ success: boolean; isDuplicate: boolean }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Calcular hash del archivo
    const content = await file.text()
    const fileHash = await DCSLogParser.calculateFileHash(content)

    // Verificar duplicados
    const duplicateCheck = await this.checkDuplicate(fileHash)
    if (duplicateCheck.isDuplicate) {
      return { success: true, isDuplicate: true }
    }

    // Validar que sea un log de DCS válido
    const validation = DCSLogParser.validateDCSLog(content)
    if (!validation.isValid) {
      throw new Error(validation.reason)
    }

    // Insertar registro del archivo
    const { error: logFileError } = await (supabase as any)
      .from('log_files')
      .insert({
        user_id: user.id,
        filename: file.name,
        file_size: file.size,
        file_hash: fileHash,
        processed_at: new Date().toISOString(),
        events_count: summary.totalEvents,
        status: 'processed',
        summary: {
          missions: summary.missions,
          takeoffs: summary.takeoffs,
          landings: summary.landings,
          shots: summary.shots,
          hits: summary.hits,
          kills: summary.kills,
          deaths: summary.deaths,
          flight_time: summary.flightTime
        }
      })

    if (logFileError) throw logFileError

    // Actualizar estadísticas del usuario
    await this.updateUserStatistics(user.id, summary)

    // Actualizar estadísticas por arma
    await this.updateWeaponStatistics(user.id, summary.weaponStats)

    return { success: true, isDuplicate: false }
  }

  /**
   * Obtiene el historial de archivos de log
   */
  static async getLogHistory(): Promise<LogFile[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: logFiles, error } = await (supabase as any)
      .from('log_files')
      .select('*')
      .eq('user_id', user.id)
      .order('processed_at', { ascending: false })

    if (error) throw error

    return (logFiles || []).map((file: any) => ({
      id: file.id,
      filename: file.filename,
      file_size: file.file_size,
      processed_at: file.processed_at,
      events_count: file.events_count || 0,
      status: file.status,
      error_message: file.error_message,
      summary: file.summary
    }))
  }

  /**
   * Elimina un archivo de log
   */
  static async deleteLogFile(logId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Verificar que el archivo pertenece al usuario
    const { error: fetchError } = await (supabase as any)
      .from('log_files')
      .select('id')
      .eq('id', logId)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new Error('Log file not found')
      }
      throw fetchError
    }

    // Eliminar el archivo
    const { error: deleteError } = await (supabase as any)
      .from('log_files')
      .delete()
      .eq('id', logId)
      .eq('user_id', user.id)

    if (deleteError) throw deleteError
  }

  /**
   * Actualiza las estadísticas del usuario
   */
  private static async updateUserStatistics(userId: string, summary: ParsedLogSummary): Promise<void> {
    // Obtener estadísticas actuales
    const { data: currentStats, error: fetchError } = await (supabase as any)
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    const newStats = {
      total_missions: (currentStats?.total_missions || 0) + summary.missions,
      total_takeoffs: (currentStats?.total_takeoffs || 0) + summary.takeoffs,
      total_landings: (currentStats?.total_landings || 0) + summary.landings,
      total_shots: (currentStats?.total_shots || 0) + summary.shots,
      total_hits: (currentStats?.total_hits || 0) + summary.hits,
      total_kills: (currentStats?.total_kills || 0) + summary.kills,
      total_deaths: (currentStats?.total_deaths || 0) + summary.deaths,
      total_flight_time_seconds: (currentStats?.total_flight_time_seconds || 0) + summary.flightTime,
      last_updated: new Date().toISOString()
    }

    if (currentStats) {
      // Actualizar estadísticas existentes
      const { error: updateError } = await (supabase as any)
        .from('user_statistics')
        .update(newStats)
        .eq('user_id', userId)

      if (updateError) throw updateError
    } else {
      // Crear nuevas estadísticas
      const { error: insertError } = await (supabase as any)
        .from('user_statistics')
        .insert({
          user_id: userId,
          ...newStats
        })

      if (insertError) throw insertError
    }
  }

  /**
   * Actualiza las estadísticas por arma
   */
  private static async updateWeaponStatistics(userId: string, weaponStats: Record<string, { shots: number; hits: number; kills: number }>): Promise<void> {
    for (const [weaponName, stats] of Object.entries(weaponStats)) {
      // Obtener estadísticas actuales del arma
      const { data: currentWeaponStats, error: fetchWeaponError } = await (supabase as any)
        .from('weapon_statistics')
        .select('*')
        .eq('user_id', userId)
        .eq('weapon_name', weaponName)
        .single()

      if (fetchWeaponError && fetchWeaponError.code !== 'PGRST116') {
        throw fetchWeaponError
      }

      if (currentWeaponStats) {
        // Actualizar estadísticas existentes del arma
        const { error: updateWeaponError } = await (supabase as any)
          .from('weapon_statistics')
          .update({
            shots: currentWeaponStats.shots + stats.shots,
            hits: currentWeaponStats.hits + stats.hits,
            kills: (currentWeaponStats.kills || 0) + stats.kills
          })
          .eq('id', currentWeaponStats.id)

        if (updateWeaponError) throw updateWeaponError
      } else {
        // Crear nuevas estadísticas del arma
        const { error: insertWeaponError } = await (supabase as any)
          .from('weapon_statistics')
          .insert({
            user_id: userId,
            weapon_name: weaponName,
            shots: stats.shots,
            hits: stats.hits,
            kills: stats.kills || 0
          })

        if (insertWeaponError) throw insertWeaponError
      }
    }
  }

  /**
   * Formatea segundos a formato HH:MM:SS
   */
  private static formatFlightTimeInterval(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}
