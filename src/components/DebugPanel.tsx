'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/utils/logger'

interface DebugPanelProps {
  enabled?: boolean
}

export default function DebugPanel({ enabled = false }: DebugPanelProps) {
  const { user, session, profile, loading } = useAuth()
  const [logs, setLogs] = useState<string[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!enabled) return

    // Intercept console.log to capture logs
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn

    console.log = (...args) => {
      originalLog(...args)
      if (args[0]?.includes('🔄') || args[0]?.includes('✅') || args[0]?.includes('❌')) {
        setLogs(prev => [...prev.slice(-50), `${new Date().toLocaleTimeString()}: ${args.join(' ')}`])
      }
    }

    console.error = (...args) => {
      originalError(...args)
      setLogs(prev => [...prev.slice(-50), `${new Date().toLocaleTimeString()}: ERROR: ${args.join(' ')}`])
    }

    console.warn = (...args) => {
      originalWarn(...args)
      setLogs(prev => [...prev.slice(-50), `${new Date().toLocaleTimeString()}: WARN: ${args.join(' ')}`])
    }

    return () => {
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-colors"
        title="Debug Panel"
      >
        🐛
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 bg-black text-white p-4 rounded-lg shadow-lg max-w-md max-h-96 overflow-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold">Debug Panel</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {/* Auth State */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold mb-1">Auth State:</h4>
            <div className="text-xs space-y-1">
              <div>User: {user ? '✅' : '❌'}</div>
              <div>Session: {session ? '✅' : '❌'}</div>
              <div>Profile: {profile ? '✅' : '❌'}</div>
              <div>Loading: {loading ? '🔄' : '✅'}</div>
            </div>
          </div>

          {/* Recent Logs */}
          <div>
            <h4 className="text-xs font-semibold mb-1">Recent Logs:</h4>
            <div className="text-xs space-y-1 max-h-32 overflow-auto">
              {logs.slice(-10).map((log, index) => (
                <div key={index} className="text-gray-300">
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-2 space-x-2">
            <button
              onClick={() => setLogs([])}
              className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
            >
              Clear Logs
            </button>
            <button
              onClick={() => {
                logger.info('DebugPanel', 'Manual test log')
                console.log('🔄 Manual test log from debug panel')
              }}
              className="text-xs bg-blue-700 px-2 py-1 rounded hover:bg-blue-600"
            >
              Test Log
            </button>
          </div>
        </div>
      )}
    </>
  )
}




