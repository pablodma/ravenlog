# 🚁 RavenLog - Sistema de Gestión Militar

Sistema integral de gestión de personal para unidades aéreas de simulación militar en DCS World.

## ✨ Características

### 📋 Gestión de Personal
- **Proceso de enlistamiento** completo con formularios y estados
- **Nómina de personal** con rangos y unidades de vuelo
- **Estados de aviadores** (activo, inactivo, permiso, baja)
- **Hojas de personal** detalladas con historial de carrera

### 🏅 Sistema de Certificaciones
- Creación y gestión de certificaciones por categorías
- Asignación de certificaciones a personal
- Seguimiento de requisitos y vencimientos
- Certificaciones por especialidad (BFM, BVR, CAS, SEAD, etc.)

### 🏆 Medallero
- Sistema de medallas con diferentes raridades
- Puntuación por logros
- Historial de condecoraciones
- Criterios de otorgamiento

### 🎮 Integración DCS
- Parseo automático de logs de DCS World
- Registro de eventos de simulador
- Análisis de rendimiento en misiones
- Historial de vuelos y combates

### 🤖 Integración Discord
- Bot para gestión de roles automática
- Sistema RSVP para eventos
- Sincronización de rangos y certificaciones
- Notificaciones automáticas

### ⚙️ Panel de Administración
- Gestión de rangos con imágenes
- Creación de certificaciones
- Configuración de medallas
- Gestión de usuarios y permisos

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** con TypeScript
- **Vite** para build y desarrollo
- **TailwindCSS** para estilos
- **Radix UI** para componentes
- **React Query** para estado del servidor
- **React Router** para navegación

### Backend
- **Node.js** con TypeScript
- **Express** para API REST
- **Supabase** como base de datos y autenticación
- **Google OAuth** para autenticación

### Base de Datos
- **PostgreSQL** (via Supabase)
- **Row Level Security (RLS)**
- **Migraciones automáticas**
- **Tipos generados automáticamente**

## 🚀 Instalación

### Prerrequisitos
- Node.js >= 18
- npm o yarn
- Cuenta de Supabase
- Proyecto de Google Cloud (para OAuth)

### Configuración Inicial

1. **Clonar el repositorio**
   ```bash
   git clone <repo-url>
   cd ravenlog
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Supabase**
   ```bash
   # Instalar Supabase CLI
   npm install -g supabase
   
   # Inicializar proyecto local
   supabase start
   
   # Aplicar migraciones
   supabase db push
   
   # Generar tipos
   npm run db:generate-types
   ```

4. **Configurar variables de entorno**
   
   **Backend (.env)**:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```

   **Frontend (.env)**:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Configurar Google OAuth en Supabase**
   - Ir a Authentication → Settings → Auth Providers
   - Habilitar Google Provider
   - Configurar Client ID y Secret de Google Cloud Console

## 💻 Desarrollo

### Ejecutar en modo desarrollo
```bash
npm run dev
```

Esto iniciará:
- Frontend en http://localhost:3000
- Backend en http://localhost:5000
- Supabase local en http://localhost:54323

### Scripts disponibles

```bash
# Desarrollo
npm run dev                 # Ejecutar frontend y backend
npm run dev:frontend       # Solo frontend
npm run dev:backend        # Solo backend

# Build
npm run build              # Build completo
npm run build:frontend     # Build frontend
npm run build:backend      # Build backend

# Base de datos
npm run db:generate-types  # Generar tipos de TypeScript desde Supabase

# Linting y testing
npm run lint              # Linter en todos los workspaces
npm run test              # Tests en todos los workspaces
```

## 📊 Estructura del Proyecto

```
ravenlog/
├── frontend/              # React + Vite
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilidades y configuración
│   │   ├── contexts/      # Context providers
│   │   └── services/      # Servicios de API
│   └── public/
├── backend/               # Node.js + Express
│   ├── src/
│   │   ├── routes/        # Rutas de API
│   │   ├── middleware/    # Middleware Express
│   │   ├── services/      # Lógica de negocio
│   │   ├── utils/         # Utilidades
│   │   └── types/         # Tipos TypeScript
│   └── dist/
├── shared/                # Tipos y utilidades compartidas
│   ├── src/
│   │   ├── types/         # Tipos de base de datos
│   │   └── schemas/       # Esquemas de validación
│   └── dist/
└── supabase/             # Configuración de base de datos
    ├── migrations/       # Migraciones SQL
    ├── config.toml       # Configuración Supabase
    └── seed.sql         # Datos iniciales
```

## 🔐 Autenticación y Autorización

### Roles de Usuario
- **Admin**: Acceso completo al sistema
- **Personnel**: Personal activo de la unidad
- **Candidate**: Candidatos en proceso de enlistamiento

### Permisos
- Candidatos solo pueden ver y editar sus solicitudes
- Personal puede ver información de la unidad
- Administradores tienen acceso completo

## 📚 Módulos Principales

### 1. Enlistamiento
- Formulario de solicitud para candidatos
- Sistema de revisión para administradores
- Estados: Pendiente → En Revisión → Aceptado/Rechazado

### 2. Gestión de Personal
- Lista de personal activo
- Gestión de rangos y promociones
- Asignación de unidades de vuelo
- Integración con Discord

### 3. Certificaciones
- Catálogo de certificaciones disponibles
- Proceso de otorgamiento
- Seguimiento de requisitos
- Certificaciones con vencimiento

### 4. Medallero
- Sistema de logros gamificado
- Diferentes raridades de medallas
- Sistema de puntuación
- Historial de condecoraciones

### 5. Integración DCS
- Parser de logs de DCS World
- Análisis automático de eventos
- Estadísticas de rendimiento
- Historial de misiones

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📝 Próximas Funcionalidades

- [ ] Sistema completo de Discord bot
- [ ] Parser avanzado de logs DCS
- [ ] Dashboard de estadísticas
- [ ] Sistema de eventos y RSVP
- [ ] Módulo de entrenamiento
- [ ] Reportes y analíticas
- [ ] Aplicación móvil

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más información.

## 🆘 Soporte

Si tienes problemas o preguntas:
1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue si es necesario

---

**Desarrollado con ❤️ para la comunidad de simulación militar DCS**
