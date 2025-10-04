# Guía de Migración al Sistema de Diseño

## 🎯 Objetivo
Migrar todos los componentes existentes para usar el sistema de diseño unificado.

## 📋 Checklist de Migración

### ✅ Antes de Migrar
- [ ] Identificar el componente a migrar
- [ ] Revisar patrones de uso actuales
- [ ] Planificar la estructura con PageFrame

### 🔄 Proceso de Migración

#### 1. **Estructura Base**
```tsx
// ❌ ANTES
<div className="space-y-6">
  <div className="flex items-center justify-between">
    <h1>Título</h1>
    <button>Acción</button>
  </div>
  <div className="card">
    {/* contenido */}
  </div>
</div>

// ✅ DESPUÉS
<PageFrame 
  title="Título"
  description="Descripción opcional"
  headerActions={<ActionButton>Acción</ActionButton>}
>
  {/* contenido */}
</PageFrame>
```

#### 2. **Estados de Carga**
```tsx
// ❌ ANTES
if (loading) {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary"></div>
    </div>
  )
}

// ✅ DESPUÉS
if (loading) {
  return (
    <PageFrame title="Título">
      <LoadingState text="Cargando datos..." />
    </PageFrame>
  )
}
```

#### 3. **Estados Vacíos**
```tsx
// ❌ ANTES
{data.length === 0 && (
  <div className="text-center py-12">
    <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
    <h3 className="text-lg font-medium text-foreground mb-2">No hay datos</h3>
    <p className="text-muted-foreground">Descripción</p>
  </div>
)}

// ✅ DESPUÉS
<DataTable
  data={data}
  columns={columns}
  emptyState={
    <EmptyState
      icon={Icon}
      title="No hay datos"
      description="Descripción"
      action={{ label: "Crear", onClick: () => {} }}
    />
  }
/>
```

#### 4. **Botones de Acción**
```tsx
// ❌ ANTES
<button className="btn-primary flex items-center gap-2">
  <Plus className="h-4 w-4" />
  Crear
</button>

// ✅ DESPUÉS
<ActionButton
  variant="primary"
  icon={Plus}
  onClick={() => {}}
>
  Crear
</ActionButton>
```

#### 5. **Tablas de Datos**
```tsx
// ❌ ANTES
<div className="card">
  <table className="w-full">
    <thead>
      <tr>
        <th>Columna 1</th>
        <th>Columna 2</th>
      </tr>
    </thead>
    <tbody>
      {data.map(item => (
        <tr key={item.id}>
          <td>{item.name}</td>
          <td>{item.value}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

// ✅ DESPUÉS
<DataTable
  data={data}
  columns={[
    { key: 'name', label: 'Nombre' },
    { key: 'value', label: 'Valor' }
  ]}
/>
```

## 📝 Componentes a Migrar

### 🔄 En Progreso
- [x] SpecialtiesManager ✅
- [ ] FormsManager
- [ ] UsersManager
- [ ] GroupManager
- [ ] UnitManager
- [ ] PositionManager
- [ ] RolesManager
- [ ] PermissionsManager
- [ ] ApplicationFormOptimized
- [ ] RosterView
- [ ] CalendarView
- [ ] FlightStatistics
- [ ] LogUploader
- [ ] LogHistory

### 🎯 Patrones Identificados

#### **Páginas de Lista**
- Usar `PageFrame` + `DataTable`
- `EmptyState` para listas vacías
- `LoadingState` para cargas
- `ActionButton` para acciones

#### **Formularios**
- Usar `PageFrame` para estructura
- `ActionButton` para botones
- Mantener validaciones existentes

#### **Estados de Error**
- Usar `ErrorState` component
- Botón de reintento consistente

## 🚀 Beneficios de la Migración

1. **Consistencia Visual**: Todos los componentes se ven igual
2. **Mantenibilidad**: Cambios centralizados en componentes base
3. **Accesibilidad**: Focus states y navegación por teclado
4. **Performance**: Componentes optimizados
5. **Developer Experience**: API consistente y predecible

## 📚 Recursos

- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Documentación completa
- [Componentes UI](./src/components/ui/) - Implementación
- [Ejemplos](./src/components/admin/SpecialtiesManager.tsx) - Ejemplo de migración

