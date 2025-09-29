import { useState } from 'react'
import { Plane, Upload, History, BarChart3 } from 'lucide-react'
import FlightStatistics from '@/components/dcs/FlightStatistics'
import LogUploader from '@/components/dcs/LogUploader'
import LogHistory from '@/components/dcs/LogHistory'
import { ParsedLogSummary } from '@/utils/dcsLogParser'

type ActiveTab = 'statistics' | 'upload' | 'history'

export default function DCSPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('statistics')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadComplete = (summary: ParsedLogSummary) => {
    // Refrescar estadísticas después de una carga exitosa
    setRefreshKey(prev => prev + 1)
    
    // Mostrar un toast de éxito
    console.log('Upload completed:', summary)
    
    // Cambiar a la pestaña de estadísticas para ver los cambios
    setActiveTab('statistics')
  }

  const handleUploadClick = () => {
    setActiveTab('upload')
  }

  const tabs = [
    {
      id: 'statistics' as const,
      name: 'Estadísticas',
      icon: BarChart3,
      description: 'Tu rendimiento acumulado'
    },
    {
      id: 'upload' as const,
      name: 'Subir Log',
      icon: Upload,
      description: 'Cargar nuevos archivos'
    },
    {
      id: 'history' as const,
      name: 'Historial',
      icon: History,
      description: 'Archivos procesados'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Plane className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">DCS World</h1>
                <p className="text-sm text-gray-500">Análisis de logs y estadísticas de vuelo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`mr-2 h-5 w-5 ${
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  <div className="text-left">
                    <div>{tab.name}</div>
                    <div className="text-xs text-gray-400">{tab.description}</div>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'statistics' && (
          <FlightStatistics 
            key={refreshKey}
            onUploadClick={handleUploadClick}
            className="max-w-4xl mx-auto"
          />
        )}

        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Subir log de DCS</h2>
              <p className="text-gray-600">
                Cargá un archivo de log para actualizar tus estadísticas de vuelo. 
                Los datos se suman a tu historial existente.
              </p>
            </div>
            
            <LogUploader onUploadComplete={handleUploadComplete} />

            {/* Información adicional */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                ¿Cómo obtener logs de DCS?
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Los logs se generan automáticamente en: <code className="bg-blue-100 px-1 rounded">Saved Games/DCS/Logs/</code></li>
                <li>• Buscá archivos con extensión <code className="bg-blue-100 px-1 rounded">.log</code></li>
                <li>• También podés usar archivos <code className="bg-blue-100 px-1 rounded">.json</code> o <code className="bg-blue-100 px-1 rounded">.jsonl</code></li>
                <li>• Los archivos se procesan de forma segura y no se almacenan permanentemente</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto">
            <LogHistory />
          </div>
        )}
      </div>
    </div>
  )
}
