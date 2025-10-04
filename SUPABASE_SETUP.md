# Configuración de Supabase

## Problema Identificado

La aplicación está intentando conectarse a Supabase pero no tiene las variables de entorno configuradas, lo que causa que las consultas se queden "cargando" eternamente.

## Solución

### 1. Crear archivo de variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# Para desarrollo local con Supabase local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### 2. Iniciar Supabase local

Si tienes Supabase CLI instalado:

```bash
# Iniciar Supabase local
supabase start

# Aplicar migraciones
supabase db reset
```

### 3. Para producción

Si estás usando una instancia de Supabase en la nube, reemplaza las variables con tus credenciales reales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
```

## Verificación

Una vez configurado, deberías ver en la consola:

```
🔧 Supabase Config: {
  url: '✅ Configurado',
  key: '✅ Configurado',
  urlValue: 'http://localhost:54321',
  keyValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

## Cliente Mock

Si no tienes Supabase configurado, la aplicación usará un cliente mock que devuelve datos vacíos pero no causa errores de carga infinita.
