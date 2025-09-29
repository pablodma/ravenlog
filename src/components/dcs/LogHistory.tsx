import { useState, useEffect } from 'react'
import { FileText, CheckCircle, AlertCircle, XCircle, Clock, Eye, Trash2 } from 'lucide-react'
import { formatFlightTime } from '@/utils/dcsLogParser'
import { DCSService, LogFile } from '@/services/dcsService'


interface LogHistoryProps {
  onViewDetails?: (logFile: LogFile) => void
  className?: string
}

export default function LogHistory({ onViewDetails, className = '' }: LogHistoryProps) {
  const [logFiles, setLogFiles] = useState<LogFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLogHistory()
  }, [])

  const fetchLogHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await DCSService.getLogHistory()
      setLogFiles(data)
    } catch (error) {
      console.error('Error fetching log history:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLog = async (logId: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar este archivo? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      await DCSService.deleteLogFile(logId)
      
      // Actualizar la lista
      setLogFiles(prev => prev.filter(file => file.id !== logId))
    } catch (error) {
      console.error('Error deleting log file:', error)
      alert('Error al eliminar el archivo')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: LogFile['status']) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'processed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'duplicate':
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: LogFile['status']) => {
    switch (status) {
      case 'processing':
        return 'Procesando...'
      case 'processed':
        return 'Procesado'
      case 'duplicate':
        return 'Duplicado'
      case 'error':
        return 'Error'
      default:
        return 'Desconocido'
    }
  }

  const getStatusColor = (status: LogFile['status']) => {
    switch (status) {
      case 'processing':
        return 'text-yellow-600 bg-yellow-50'
      case 'processed':
        return 'text-green-600 bg-green-50'
      case 'duplicate':
        return 'text-blue-600 bg-blue-50'
      case 'error':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getSummaryText = (logFile: LogFile): string => {
    if (logFile.status === 'duplicate') {
      return 'Archivo ya procesado — no se realizaron cambios.'
    }

    if (logFile.status === 'error') {
      return logFile.error_message || 'No pudimos leer el archivo. Probá con otro o revisá el formato.'
    }

    if (!logFile.summary) {
      return `${logFile.events_count} eventos procesados`
    }

    const { missions, takeoffs, landings, shots, hits, flight_time } = logFile.summary
    const parts = []

    if (missions > 0) parts.push(`${missions} misión${missions !== 1 ? 'es' : ''}`)
    if (takeoffs > 0) parts.push(`${takeoffs} despegue${takeoffs !== 1 ? 's' : ''}`)
    if (landings > 0) parts.push(`${landings} aterrizaje${landings !== 1 ? 's' : ''}`)
    if (shots > 0) parts.push(`${shots} tiro${shots !== 1 ? 's' : ''}`)
    if (hits > 0) parts.push(`${hits} impacto${hits !== 1 ? 's' : ''}`)
    if (flight_time > 0) parts.push(`${formatFlightTime(flight_time)} de vuelo`)

    return parts.length > 0 ? `Sumó: ${parts.join(', ')}` : 'Sin eventos de vuelo detectados'
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar historial</h3>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchLogHistory}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Historial de cargas</h2>
        <p className="text-sm text-gray-500">
          Archivos de log que subiste y su estado de procesamiento
        </p>
      </div>

      <div className="p-6">
        {logFiles.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin archivos cargados</h3>
            <p className="text-sm text-gray-500">
              Los archivos que subas aparecerán acá con su estado de procesamiento
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {logFiles.map((logFile) => (
              <div
                key={logFile.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <FileText className="h-5 w-5 text-gray-400 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {logFile.filename}
                        </h3>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(logFile.status)}`}>
                          {getStatusIcon(logFile.status)}
                          <span className="ml-1">{getStatusText(logFile.status)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                        <span>{formatFileSize(logFile.file_size)}</span>
                        <span>{formatDate(logFile.processed_at)}</span>
                        {logFile.events_count > 0 && (
                          <span>{logFile.events_count} eventos</span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600">
                        {getSummaryText(logFile)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {onViewDetails && logFile.status === 'processed' && (
                      <button
                        onClick={() => onViewDetails(logFile)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteLog(logFile.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Eliminar archivo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
