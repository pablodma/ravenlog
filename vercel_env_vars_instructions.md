# 🚀 CONFIGURAR VARIABLES DE ENTORNO EN VERCEL

## 🎯 PROBLEMA RESUELTO:
✅ Next.js compila correctamente
✅ TypeScript errors ignorados
❌ Variables de entorno de Supabase no configuradas

## 🔧 SOLUCIÓN:

### 1. **IR A VERCEL DASHBOARD**
- Ve a https://vercel.com/dashboard
- Selecciona tu proyecto: ravenlog-dcs

### 2. **CONFIGURAR VARIABLES DE ENTORNO**
- Ve a **Settings** → **Environment Variables**
- Agregar estas variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://sjajpvjypxkiarsurtqz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. **REDEPLOY**
- Después de configurar las variables
- Ve a **Deployments** → **Redeploy** (último deploy)

## 🎯 RESULTADO ESPERADO:
- ✅ Build exitoso
- ✅ App funcionando
- ✅ Supabase conectado
- ✅ Login sin timeout
