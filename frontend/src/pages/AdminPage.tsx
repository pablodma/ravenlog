import React from 'react'

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
      </div>
      
      {/* TODO: Implementar panel de administración */}
      <div className="bg-card rounded-lg border p-6">
        <div className="bg-muted/30 rounded-lg p-8 text-center">
          <p className="text-muted-foreground">
            Panel de administración en desarrollo...
          </p>
        </div>
      </div>
    </div>
  )
}
