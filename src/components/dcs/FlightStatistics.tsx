import { useState, useEffect } from 'react'
import { Plane, Target, Clock, TrendingUp, Upload, BarChart3 } from 'lucide-react'
import { formatFlightTime } from '@/utils/dcsLogParser'
import { useAuth } from '@/contexts/AuthContext'
import { DCSService, UserStatistics, WeaponStatistic } from '@/services/dcsService'


interface FlightStatisticsProps {
  onUploadClick?: () => void
  className?: string
}

export default function FlightStatistics({ onUploadClick, className = '' }: FlightStatisticsProps) {
  const { profile } = useAuth()
  const [statistics, setStatistics] = useState<UserStatistics | null>(null)
  const [weaponStats, setWeaponStats] = useState<WeaponStatistic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (profile?.id) {
      fetchStatistics()
    }
  }, [profile?.id])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener estadísticas generales
      const statsData = await DCSService.getUserStatistics()
      setStatistics(statsData)

      // Obtener estadísticas por arma
      const weaponsData = await DCSService.getWeaponStatistics()
      setWeaponStats(weaponsData)

    } catch (error) {
      console.error('Error fetching statistics:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const parsePostgresInterval = (interval: string): number => {
    // Parsear formato PostgreSQL interval (ej: "01:23:45" o "1 day 02:30:15")
    if (!interval) return 0
    
    const timeMatch = interval.match(/(\d{2}):(\d{2}):(\d{2})/)
    if (timeMatch) {
      const [, hours, minutes, seconds] = timeMatch
      return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds)
    }
    
    return 0
  }

  const formatKDRatio = (ratio: number): string => {
    return ratio % 1 === 0 ? ratio.toString() : ratio.toFixed(2)
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar estadísticas</h3>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchStatistics}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!statistics || statistics.total_missions === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center">
          <Plane className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tus estadísticas</h3>
          <p className="text-sm text-gray-500 mb-6">
            Todavía no subiste logs. Empezá cargando uno para ver tus estadísticas.
          </p>
          <button
            onClick={onUploadClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Subir primer log
          </button>
        </div>
      </div>
    )
  }

  const flightTimeSeconds = parsePostgresInterval(statistics.total_flight_time)

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Tus estadísticas</h2>
            <p className="text-sm text-gray-500">Se actualizan cuando subís nuevos logs. No se reinician.</p>
          </div>
          <button
            onClick={onUploadClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center text-sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Subir log
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Plane className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-blue-900">{statistics.total_missions}</div>
                <div className="text-sm text-blue-600">Misiones</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-green-900">
                  {statistics.total_takeoffs}/{statistics.total_landings}
                </div>
                <div className="text-sm text-green-600">Despegues/Aterrizajes</div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-purple-900">
                  {statistics.total_hits}/{statistics.total_shots}
                </div>
                <div className="text-sm text-purple-600">Impactos/Tiros</div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-orange-900">
                  {formatFlightTime(flightTimeSeconds)}
                </div>
                <div className="text-sm text-orange-600">Tiempo de vuelo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-lg font-semibold text-gray-900">
              {statistics.overall_accuracy.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">
              Precisión general
              <span className="block text-xs text-gray-400 mt-1">
                Impactos / Tiros
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-lg font-semibold text-gray-900">
              {statistics.total_kills}
            </div>
            <div className="text-sm text-gray-500">Eliminaciones</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-lg font-semibold text-gray-900">
              {formatKDRatio(statistics.kd_ratio)}
            </div>
            <div className="text-sm text-gray-500">K/D Ratio</div>
          </div>
        </div>

        {/* Tabla de estadísticas por arma */}
        {weaponStats.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas por arma</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Arma
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiros
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Impactos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span className="cursor-help" title="Impactos / Tiros">
                        Accuracy %
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {weaponStats.map((weapon) => (
                    <tr key={weapon.weapon_name} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {weapon.weapon_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {weapon.shots}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {weapon.hits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="mr-2">{weapon.accuracy.toFixed(1)}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.min(weapon.accuracy, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mensaje si no hay estadísticas por arma */}
        {weaponStats.length === 0 && statistics.total_shots === 0 && (
          <div className="text-center py-8 border-t border-gray-200">
            <Target className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              No se detectaron eventos de combate en tus logs
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
