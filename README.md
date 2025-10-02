# 🦅 RavenLog - Sistema de Gestión Militar DCS

[![Deploy Status](https://img.shields.io/badge/deploy-production-green)](https://ravenlog-dcs.vercel.app/)
[![Version](https://img.shields.io/badge/version-1.1.1-blue)](https://github.com/pablodma/ravenlog)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**RavenLog** es un sistema completo de gestión de personal para unidades aéreas militares simuladas en DCS World. Diseñado para escuadrones virtuales que buscan una experiencia realista y profesional.

## 🌐 **Demo en Vivo**
**URL de Producción**: [https://ravenlog-dcs.vercel.app/](https://ravenlog-dcs.vercel.app/)

## ✨ **Características Principales**

### 🔐 **Sistema de Autenticación**
- **Google OAuth** integrado
- **Control de acceso basado en roles** (RBAC)
- **Perfiles de usuario** con información completa

### 👥 **Gestión de Personal**
- **Proceso de enlistamiento** con formularios dinámicos personalizables
- **Roster de personal** completo con rangos, unidades y posiciones
- **Grupos y unidades** organizacionales jerárquicas
- **Posiciones de combate** específicas por unidad
- **Estados de aviador** (activo, inactivo, licencia, dado de baja)
- **Especialidades y calificaciones** asignables
- **Sistema de records** para historial completo de personal

### 🏅 **Sistema de Reconocimientos**
- **Medallas y condecoraciones** personalizables
- **Certificaciones** por especialidades
- **Historial de carrera** detallado
- **Sistema de puntos** y rareza

### 📊 **Análisis de Logs DCS**
- **Carga automática** de archivos `.log`, `.json`, `.jsonl`
- **Estadísticas acumulativas** de vuelo
- **Desglose por armas** y precisión
- **Detección de duplicados** inteligente
- **Historial de vuelos** completo

### 📅 **Calendario de Eventos**
- **Eventos de vuelo** programables con editor rico
- **Eventos recurrentes** (diario, semanal, mensual)
- **Sistema de registro** con límites de participantes
- **Múltiples calendarios** categorizados
- **Tipos de eventos** personalizables
- **Gestión de participantes** con comentarios
- **Briefing, debrief y configuración** de servidor

### ⚙️ **Administración**
- **Panel organizacional** completo (grupos, unidades, posiciones, rangos)
- **Gestión de usuarios** con perfiles detallados
- **Sistema de formularios** dinámicos (enlistamiento, ausencias)
- **Procesamiento unificado** de solicitudes
- **Sistema de records** (asignaciones, premios, combate, rangos, servicio)
- **Especialidades y calificaciones** personalizables
- **Estados y medallas** configurables

## 🛠️ **Stack Tecnológico**

### **Frontend**
- **Next.js 14** con App Router y TypeScript
- **React 18** con Server Components
- **TailwindCSS** para estilos con tema dark militar
- **Lucide React** para iconografía
- **React Query** para gestión de estado y caching

### **Backend**
- **Supabase** como BaaS
- **PostgreSQL** con RLS (Row Level Security)
- **Supabase Auth** para autenticación (Email + Magic Link)
- **Real-time subscriptions**
- **Edge Functions** (próximamente)

### **Infraestructura**
- **Vercel** para hosting con Edge Runtime
- **GitHub** para control de versiones
- **Supabase Cloud** para base de datos
- **CI/CD** automático en cada push

## 🚀 **Instalación y Desarrollo**

### **Prerrequisitos**
- Node.js 18+
- npm o yarn
- Cuenta de Supabase
- Cuenta de Google Cloud (para OAuth)

### **Configuración Local**

1. **Clonar el repositorio**
```bash
git clone https://github.com/pablodma/ravenlog.git
cd ravenlog
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env.local con las siguientes variables:
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

4. **Ejecutar migraciones de base de datos**
- Ejecutar los archivos SQL en `supabase/migrations/` en orden numérico
- Aplicar los datos semilla desde `supabase/seed.sql`

5. **Iniciar desarrollo**
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`

### **Build de Producción**
```bash
npm run build
npm run start
```

## 📋 **Estructura del Proyecto**

```
ravenlog/
├── app/                    # Next.js App Router
│   ├── admin/             # Panel administrativo
│   ├── auth/              # Rutas de autenticación
│   ├── calendar/          # Sistema de calendario
│   ├── dcs/               # Análisis de logs DCS
│   ├── enrollment/        # Proceso de enlistamiento
│   ├── forms/             # Gestión de formularios
│   ├── profile/           # Perfil de usuario
│   ├── records/           # Sistema de records
│   ├── roster/            # Roster de personal
│   └── dashboard/         # Dashboard principal
├── src/
│   ├── components/        # Componentes React
│   │   ├── admin/        # Componentes administrativos
│   │   ├── auth/         # Autenticación
│   │   ├── calendar/     # Calendario
│   │   ├── dcs/          # DCS World
│   │   ├── forms/        # Formularios
│   │   ├── records/      # Records
│   │   ├── roster/       # Roster
│   │   └── ui/           # Componentes UI
│   ├── contexts/         # Contextos React
│   ├── hooks/            # Hooks personalizados
│   ├── lib/              # Utilidades y configuración
│   └── services/         # Servicios de API
├── supabase/             # Migraciones y configuración DB
│   └── migrations/       # Migraciones SQL ordenadas
├── shared/               # Tipos y esquemas compartidos
└── public/               # Archivos estáticos
```

## 🔧 **Configuración de Producción**

### **Supabase Setup**
1. Crear proyecto en Supabase
2. Configurar Google OAuth en Authentication
3. Ejecutar migraciones SQL
4. Configurar RLS policies
5. Agregar datos semilla

### **Vercel Deployment**
1. Conectar repositorio GitHub
2. Configurar variables de entorno
3. Deploy automático en cada push

### **Variables de Entorno Requeridas**
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

## 👥 **Roles y Permisos**

### **Candidate (Candidato)**
- Ver información básica
- Completar proceso de enlistamiento
- Ver eventos públicos

### **Personnel (Personal)**
- Acceso completo a su perfil
- Cargar logs DCS
- Crear y participar en eventos
- Ver estadísticas personales

### **Admin (Administrador)**
- Gestión completa del sistema
- Administrar usuarios y roles
- Crear medallas y certificaciones
- Procesar candidatos
- Acceso a todas las estadísticas

## 📊 **Funcionalidades por Módulo**

### **Dashboard**
- Resumen de actividad
- Estadísticas rápidas
- Acciones frecuentes
- Notificaciones

### **Perfil**
- Información personal
- Estadísticas DCS
- Medallas obtenidas
- Certificaciones

### **Calendario**
- Vista mensual de eventos
- Creación de misiones
- Sistema RSVP
- Gestión de participantes

### **DCS World**
- Carga de logs
- Estadísticas de vuelo
- Historial de misiones
- Análisis de precisión

### **Administración**
- Gestión de usuarios
- Control de permisos
- Configuración del sistema
- Reportes administrativos

## 🔒 **Seguridad**

- **Row Level Security (RLS)** en todas las tablas
- **Autenticación OAuth** segura
- **Permisos granulares** por funcionalidad
- **Validación de datos** en frontend y backend
- **Sanitización** de inputs de usuario

## 🚀 **Roadmap**

### **Próximas Funcionalidades**
- [ ] Sistema de notificaciones push
- [ ] Integración con Discord
- [ ] Reportes avanzados y exportación
- [ ] API pública REST
- [ ] Sistema de misiones y briefings
- [ ] Integración con SRS/SimpleRadio
- [ ] Chat interno

### **Mejoras Técnicas**
- [x] Optimización de performance con React Query
- [ ] Tests automatizados (Jest + Playwright)
- [ ] Documentación completa de API
- [ ] Monitoreo con Sentry
- [ ] Backup automatizado de BD
- [ ] Edge Functions para procesamiento

## 🤝 **Contribuir**

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📝 **Changelog**

### **v2.0.0** (2025-02-02)
- ✅ Migración completa a Next.js 14
- ✅ Dark mode militar profesional
- ✅ Sistema de organización completo (grupos, unidades, posiciones)
- ✅ Roster de personal con filtros y agrupación
- ✅ Sistema de formularios dinámicos
- ✅ Sistema de records para historial de personal
- ✅ Especialidades, calificaciones y estados
- ✅ Eventos recurrentes y sistema de registro
- ✅ Optimización de rendimiento y caching
- ✅ Componentes reutilizables y tema unificado

### **v1.1.1** (2025-01-29)
- ✅ Sistema de calendario completo
- ✅ Gestión de eventos de vuelo
- ✅ Sistema RSVP
- ✅ 8 tipos de eventos predefinidos
- ✅ Mejoras en UI/UX

### **v1.0.0** (2025-01-28)
- ✅ Sistema base completo
- ✅ Autenticación con Email + Magic Link
- ✅ RBAC dinámico
- ✅ Análisis de logs DCS
- ✅ Sistema de medallas y certificaciones
- ✅ Proceso de enlistamiento

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 **Soporte**

- **Issues**: [GitHub Issues](https://github.com/pablodma/ravenlog/issues)
- **Documentación**: [Wiki del Proyecto](https://github.com/pablodma/ravenlog/wiki)
- **Email**: pablo.duro@ravenlog.com

---

**Desarrollado con ❤️ para la comunidad DCS**

*RavenLog - Elevando el realismo en la simulación militar*