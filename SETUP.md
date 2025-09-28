# 🚀 Setup Rápido - RavenLog

## Pre-requisitos
- [ ] Cuenta GitHub (ya tienes ✅)
- [ ] Cuenta Vercel
- [ ] Cuenta Supabase  
- [ ] Cuenta Google Cloud Console (para OAuth)

## 1. 📤 Subir a GitHub

```bash
# Ya configurado, solo necesitas hacer push:
git push -u origin main
```

Si te pide credenciales, la opción más rápida es crear un **Personal Access Token**:
- GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Generate new token → Selecciona "repo" scope → Copia el token
- Úsalo como password cuando te lo pida

## 2. 🗄️ Configurar Supabase

1. **Crear proyecto**: [supabase.com](https://supabase.com) → New Project
2. **Configuración**:
   - Nombre: `ravenlog-prod`
   - Password: (guarda la password)
   - Región: closest to your users
3. **Aplicar esquema**:
   ```sql
   -- Copia y pega el contenido de /supabase/migrations/20240101000000_initial_schema.sql
   -- en el SQL Editor de Supabase Dashboard
   ```
4. **Datos iniciales**:
   ```sql
   -- Copia y pega el contenido de /supabase/seed.sql
   -- en el SQL Editor de Supabase Dashboard
   ```
5. **Configurar Google OAuth**:
   - Authentication → Settings → Auth Providers
   - Google → Enable
   - Redirect URL: `https://tu-proyecto.vercel.app/auth/callback`

## 3. 🌐 Deploy en Vercel

1. **Importar proyecto**: [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. **Configuración**:
   - Framework Preset: **Other**
   - Root Directory: `./`
   - Build Command: `npm run vercel-build`
   - Output Directory: `frontend/dist`
   - Install Command: `npm install`

## 4. ⚙️ Variables de Entorno en Vercel

En Vercel Dashboard → Settings → Environment Variables:

```bash
# FRONTEND (REQUERIDO)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# BACKEND (opcional)
SUPABASE_URL=https://xxx.supabase.co  
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
NODE_ENV=production
```

## 5. 🔐 Configurar Google OAuth

1. **Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com)
2. **Crear proyecto** o seleccionar existente
3. **APIs & Services** → **Credentials** → **Create OAuth 2.0 Client ID**
4. **Authorized redirect URIs**:
   - `https://xxx.supabase.co/auth/v1/callback`
   - `https://tu-proyecto.vercel.app/auth/callback`
5. **Copiar Client ID y Secret** a Supabase Dashboard

## 6. ✅ Verificar Deployment

- [ ] App carga en tu dominio de Vercel
- [ ] Login con Google funciona
- [ ] Dashboard muestra datos
- [ ] No hay errores en consola

## 🆘 Troubleshooting

### "Build failed"
- Verificar que las variables de entorno estén configuradas
- Revisar logs de build en Vercel

### "OAuth error"
- Verificar redirect URLs en Google Console y Supabase
- Revisar que el Client ID y Secret sean correctos

### "Database connection error"
- Verificar URL y API keys de Supabase
- Asegurarse de que las migraciones se aplicaron

---

¡Una vez completado, tendrás RavenLog funcionando en producción! 🎉
