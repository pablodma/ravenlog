# Configuración de Desarrollo Local con Supabase

## 🚀 Setup Inicial

### 1. Instalar Supabase CLI
```bash
npm install -g supabase
```

### 2. Inicializar proyecto local
```bash
# En la raíz del proyecto
supabase init
```

### 3. Iniciar servicios locales
```bash
supabase start
```

Esto iniciará:
- PostgreSQL en `localhost:54322`
- API Gateway en `localhost:54321`
- Dashboard en `localhost:54323`
- Inbucket (email testing) en `localhost:54324`

## 🔧 Configuración del Proyecto

### 1. Variables de entorno para desarrollo local
Crear `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_local_aqui
```

### 2. Obtener la clave local
```bash
supabase status
```

### 3. Aplicar migraciones existentes
```bash
supabase db reset
```

## 📊 Ventajas del Desarrollo Local

### ✅ Rendimiento
- Sin latencia de red
- Consultas más rápidas
- Mejor experiencia de desarrollo

### ✅ Seguridad
- Datos aislados
- No afectas producción
- Puedes experimentar libremente

### ✅ Costo
- Sin límites de uso
- Sin costos adicionales
- Recursos ilimitados

### ✅ Debugging
- Logs detallados
- Control total del entorno
- Fácil inspección de datos

## 🔄 Flujo de Trabajo Recomendado

### 1. Desarrollo Local
```bash
# Trabajar en local
supabase start
npm run dev
```

### 2. Aplicar cambios
```bash
# Crear migración
supabase migration new nombre_migracion

# Aplicar migración local
supabase db reset
```

### 3. Deploy a producción
```bash
# Aplicar migraciones a producción
supabase db push

# O usar el dashboard de Supabase
```

## 🛠️ Comandos Útiles

### Gestión de Base de Datos
```bash
# Ver estado
supabase status

# Reiniciar base de datos
supabase db reset

# Aplicar migraciones
supabase migration up

# Crear migración
supabase migration new nombre

# Ver logs
supabase logs
```

### Desarrollo
```bash
# Iniciar servicios
supabase start

# Detener servicios
supabase stop

# Ver dashboard local
open http://localhost:54323
```

## 🔍 Debugging

### Ver datos en tiempo real
```bash
# Conectar a PostgreSQL local
psql postgresql://postgres:postgres@localhost:54322/postgres

# Ver logs de API
supabase logs api

# Ver logs de base de datos
supabase logs db
```

### Testing de Email
- Inbucket: http://localhost:54324
- Todos los emails se capturan aquí
- Perfecto para testing de auth

## 🚀 Deploy a Producción

### 1. Preparar migraciones
```bash
# Verificar migraciones pendientes
supabase migration list

# Aplicar a producción
supabase db push
```

### 2. Variables de entorno de producción
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_de_produccion
```

## 📝 Mejores Prácticas

### 1. Siempre usar migraciones
- No hacer cambios directos en la DB
- Usar `supabase migration new` para cambios
- Documentar cambios importantes

### 2. Testing local
- Probar todas las funcionalidades localmente
- Usar datos de prueba consistentes
- Verificar políticas RLS

### 3. Backup antes de deploy
- Hacer backup de producción
- Probar migraciones en staging
- Tener rollback plan

## 🔧 Troubleshooting

### Problemas comunes
```bash
# Si no inicia
supabase stop
supabase start

# Si hay conflictos de puertos
supabase stop
# Cambiar puertos en supabase/config.toml
supabase start

# Si hay problemas de permisos
sudo supabase start
```

### Reset completo
```bash
supabase stop
supabase db reset
supabase start
```
