# 🚀 Guía de Deployment - RavenLog

## Variables de Entorno Requeridas para Vercel

### Frontend (VITE_*)
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NI...
```

### Backend (opcional si usas Vercel Functions)
```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NI...
FRONTEND_URL=https://tu-proyecto.vercel.app
NODE_ENV=production
```

## Pasos de Deployment

### 1. Supabase Setup
```bash
# 1. Crear proyecto en supabase.com
# 2. Copiar URL y API Keys del dashboard
# 3. Aplicar migraciones
supabase link --project-ref TU_PROJECT_REF
supabase db push
```

### 2. Configurar Google OAuth en Supabase
- Dashboard → Authentication → Providers → Google
- Client ID y Secret de Google Console
- Redirect URL: `https://tu-dominio.vercel.app/auth/callback`

### 3. Deploy a Vercel
- Importar repositorio desde GitHub
- Framework: Vite
- Build Command: `npm run vercel-build`
- Output Directory: `frontend/dist`
- Añadir variables de entorno

### 4. Verificar Deployment
- [ ] App funciona en producción
- [ ] Login con Google funciona
- [ ] Base de datos conectada
- [ ] Todas las rutas funcionan

## Comandos Útiles

```bash
# Generar tipos de Supabase
npm run db:generate-types

# Build local para testing
npm run build

# Verificar build funciona
npm run preview
```

## Troubleshooting

### Error: "Invalid API Key"
- Verificar que las variables de entorno estén correctas en Vercel
- Asegurarse de usar VITE_ prefix para variables del frontend

### Error: "OAuth redirect mismatch"  
- Verificar redirect URLs en Google Console
- Añadir dominio de Vercel a allowed origins

### Error: "Database connection failed"
- Verificar URL de Supabase
- Comprobar que las migraciones se aplicaron correctamente
