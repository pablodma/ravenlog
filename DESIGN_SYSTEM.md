# Sistema de Diseño RavenLog

## 🎯 Principios

1. **Consistencia**: Todos los componentes siguen el mismo patrón visual
2. **Reutilización**: Componentes base que se pueden combinar
3. **Accesibilidad**: Focus states, contrastes y navegación por teclado
4. **Tema Militar**: Colores, tipografías y estilos acordes al contexto

## 📦 Componentes Base

### EmptyState
```tsx
<EmptyState
  icon={FileText}
  title="No hay formularios"
  description="Aún no has creado ningún formulario"
  action={{
    label: "Crear Formulario",
    onClick: () => {},
    icon: Plus
  }}
/>
```

### LoadingState
```tsx
<LoadingState 
  text="Cargando datos..." 
  size="medium" 
/>
```

### ErrorState
```tsx
<ErrorState
  title="Error al cargar"
  description="No se pudieron cargar los datos"
  action={{
    label: "Reintentar",
    onClick: () => {}
  }}
/>
```

### ActionButton
```tsx
<ActionButton
  variant="primary"
  size="md"
  icon={Plus}
  onClick={() => {}}
>
  Crear Nuevo
</ActionButton>
```

### PageFrame
```tsx
<PageFrame
  title="Gestión de Usuarios"
  description="Administra los usuarios del sistema"
  headerActions={<ActionButton>Nuevo Usuario</ActionButton>}
>
  {/* Contenido */}
</PageFrame>
```

### DataTable
```tsx
<DataTable
  data={users}
  columns={[
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'actions', label: 'Acciones', render: (_, user) => (
      <ActionButton variant="destructive" onClick={() => deleteUser(user.id)}>
        Eliminar
      </ActionButton>
    )}
  ]}
/>
```

## 🎨 Clases de Utilidad

### Botones
- `.btn-primary` - Botón principal
- `.btn-secondary` - Botón secundario  
- `.btn-ghost` - Botón fantasma
- `.btn-destructive` - Botón de eliminación

### Estados
- `.card` - Contenedor principal
- `.input` - Campos de entrada
- `.badge-*` - Etiquetas de estado

### Tipografía
- Variables CSS automáticas aplicadas a elementos HTML
- `.text-title`, `.text-heading`, etc.

## 📋 Patrones de Uso

### 1. Página con Lista
```tsx
<PageFrame title="Usuarios" description="Gestiona los usuarios">
  {loading ? (
    <LoadingState />
  ) : error ? (
    <ErrorState description={error} />
  ) : data.length === 0 ? (
    <EmptyState icon={Users} title="No hay usuarios" />
  ) : (
    <DataTable data={data} columns={columns} />
  )}
</PageFrame>
```

### 2. Formulario
```tsx
<PageFrame title="Crear Usuario">
  <form className="space-y-4">
    <div>
      <label className="form-label">Nombre</label>
      <input className="input" />
    </div>
    <div className="flex gap-2">
      <ActionButton type="submit">Guardar</ActionButton>
      <ActionButton variant="ghost" onClick={onCancel}>Cancelar</ActionButton>
    </div>
  </form>
</PageFrame>
```

## 🔧 Implementación

1. **Importar componentes base**
2. **Usar PageFrame para estructura**
3. **Aplicar estados consistentes**
4. **Usar ActionButton para acciones**
5. **Seguir patrones establecidos**

## ✅ Checklist de Consistencia

- [ ] Usar PageFrame para páginas
- [ ] EmptyState para listas vacías
- [ ] LoadingState para cargas
- [ ] ErrorState para errores
- [ ] ActionButton para acciones
- [ ] DataTable para listas
- [ ] Clases de utilidad consistentes
- [ ] Estados de focus visibles
- [ ] Colores del tema militar
- [ ] Tipografía unificada

