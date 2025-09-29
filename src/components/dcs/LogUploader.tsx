import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { DCSLogParser, ParsedLogSummary } from '@/utils/dcsLogParser'
import { formatFlightTime, calculateAccuracy } from '@/utils/dcsLogParser'

interface LogUploaderProps {
  onUploadComplete?: (summary: ParsedLogSummary) => void
  className?: string
}

type UploadState = 'idle' | 'analyzing' | 'preview' | 'uploading' | 'success' | 'error'

interface UploadResult {
  summary?: ParsedLogSummary
  error?: string
  isDuplicate?: boolean
}

export default function LogUploader({ onUploadComplete, className = '' }: LogUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadResult, setUploadResult] = useState<UploadResult>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setSelectedFile(file)
    setUploadState('analyzing')
    setUploadResult({})

    try {
      // Leer el archivo
      const content = await file.text()
      
      // Validar que sea un log de DCS válido
      const validation = DCSLogParser.validateDCSLog(content)
      if (!validation.isValid) {
        setUploadResult({ error: validation.reason })
        setUploadState('error')
        return
      }

      // Parsear el contenido
      const parser = new DCSLogParser()
      const summary = parser.parseLogContent(content)

      // Verificar si hay errores críticos
      if (summary.errors.length > 0 && summary.totalEvents === 0) {
        setUploadResult({ 
          error: `No se pudieron extraer eventos válidos. Errores: ${summary.errors.slice(0, 3).join(', ')}` 
        })
        setUploadState('error')
        return
      }

      setUploadResult({ summary })
      setUploadState('preview')

    } catch (error) {
      console.error('Error al procesar archivo:', error)
      setUploadResult({ 
        error: error instanceof Error ? error.message : 'Error desconocido al procesar el archivo' 
      })
      setUploadState('error')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.log'],
      'application/json': ['.json'],
      'application/jsonl': ['.jsonl']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: uploadState === 'analyzing' || uploadState === 'uploading'
  })

  const handleConfirmUpload = async () => {
    if (!selectedFile || !uploadResult.summary) return

    setUploadState('uploading')

    try {
      // Calcular hash del archivo para deduplicación
      const content = await selectedFile.text()
      const fileHash = await DCSLogParser.calculateFileHash(content)

      // Verificar si ya existe
      const duplicateCheck = await fetch('/api/dcs/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileHash })
      })

      if (duplicateCheck.ok) {
        const { isDuplicate } = await duplicateCheck.json()
        if (isDuplicate) {
          setUploadResult({ ...uploadResult, isDuplicate: true })
          setUploadState('success')
          return
        }
      }

      // Subir y procesar el archivo
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('fileHash', fileHash)
      formData.append('summary', JSON.stringify(uploadResult.summary))

      const response = await fetch('/api/dcs/upload-log', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Error al subir el archivo')
      }

      const result = await response.json()
      setUploadState('success')
      
      if (onUploadComplete && uploadResult.summary) {
        onUploadComplete(uploadResult.summary)
      }

    } catch (error) {
      console.error('Error al subir archivo:', error)
      setUploadResult({ 
        ...uploadResult, 
        error: error instanceof Error ? error.message : 'Error al subir el archivo' 
      })
      setUploadState('error')
    }
  }

  const resetUploader = () => {
    setUploadState('idle')
    setUploadResult({})
    setSelectedFile(null)
  }

  const renderContent = () => {
    switch (uploadState) {
      case 'idle':
        return (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive ? 'Soltá tu archivo acá' : 'Subir log de DCS'}
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Arrastrá un archivo .log, .json o .jsonl o hacé clic para seleccionarlo
            </p>
            <p className="text-xs text-gray-400">
              Máximo 50MB • Formatos soportados: .log, .json, .jsonl
            </p>
          </div>
        )

      case 'analyzing':
        return (
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">
              Analizando eventos del archivo...
            </div>
            <p className="text-sm text-gray-500">
              Esto puede tardar unos segundos
            </p>
          </div>
        )

      case 'preview':
        const { summary } = uploadResult
        if (!summary) return null

        return (
          <div className="space-y-6">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <div className="text-lg font-medium text-gray-900 mb-2">
                Archivo analizado correctamente
              </div>
              <p className="text-sm text-gray-500">
                Revisá los datos antes de confirmar
              </p>
            </div>

            {/* Resumen de eventos detectados */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Eventos detectados:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Misiones:</span>
                  <span className="ml-2 font-medium">{summary.missions}</span>
                </div>
                <div>
                  <span className="text-gray-500">Despegues:</span>
                  <span className="ml-2 font-medium">{summary.takeoffs}</span>
                </div>
                <div>
                  <span className="text-gray-500">Aterrizajes:</span>
                  <span className="ml-2 font-medium">{summary.landings}</span>
                </div>
                <div>
                  <span className="text-gray-500">Tiempo de vuelo:</span>
                  <span className="ml-2 font-medium">{formatFlightTime(summary.flightTime)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Tiros:</span>
                  <span className="ml-2 font-medium">{summary.shots}</span>
                </div>
                <div>
                  <span className="text-gray-500">Impactos:</span>
                  <span className="ml-2 font-medium">{summary.hits}</span>
                </div>
              </div>

              {summary.aircraftTypes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-gray-500 text-sm">Aeronaves:</span>
                  <span className="ml-2 text-sm font-medium">{summary.aircraftTypes.join(', ')}</span>
                </div>
              )}

              {summary.serverName && (
                <div className="mt-2">
                  <span className="text-gray-500 text-sm">Servidor:</span>
                  <span className="ml-2 text-sm font-medium">{summary.serverName}</span>
                </div>
              )}
            </div>

            {/* Estadísticas por arma */}
            {Object.keys(summary.weaponStats).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Estadísticas por arma:</h3>
                <div className="space-y-2">
                  {Object.entries(summary.weaponStats).map(([weapon, stats]) => (
                    <div key={weapon} className="flex justify-between items-center text-sm">
                      <span className="font-medium">{weapon}</span>
                      <span className="text-gray-500">
                        {stats.shots} tiros • {stats.hits} impactos • {calculateAccuracy(stats.hits, stats.shots)}% precisión
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Errores si los hay */}
            {summary.errors.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">
                      Advertencias durante el procesamiento
                    </h3>
                    <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                      {summary.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {summary.errors.length > 5 && (
                        <li>... y {summary.errors.length - 5} más</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleConfirmUpload}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirmar y actualizar estadísticas
              </button>
              <button
                onClick={resetUploader}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )

      case 'uploading':
        return (
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">
              Actualizando tus estadísticas...
            </div>
            <p className="text-sm text-gray-500">
              Procesando eventos y guardando datos
            </p>
          </div>
        )

      case 'success':
        const { isDuplicate } = uploadResult
        return (
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">
              {isDuplicate ? 'Archivo ya procesado' : '¡Listo! Estadísticas actualizadas'}
            </div>
            <p className="text-sm text-gray-500 mb-6">
              {isDuplicate 
                ? 'Este archivo ya había sido procesado. Tus estadísticas no cambiaron.'
                : 'Se agregaron los nuevos eventos a tu historial de vuelo.'
              }
            </p>
            <button
              onClick={resetUploader}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Subir otro archivo
            </button>
          </div>
        )

      case 'error':
        return (
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">
              Error al procesar archivo
            </div>
            <p className="text-sm text-red-600 mb-6">
              {uploadResult.error || 'Error desconocido'}
            </p>
            <button
              onClick={resetUploader}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 ${className}`}>
      {uploadState === 'idle' ? (
        <div {...getRootProps()} className="cursor-pointer">
          <input {...getInputProps()} />
          {renderContent()}
        </div>
      ) : (
        renderContent()
      )}
    </div>
  )
}
