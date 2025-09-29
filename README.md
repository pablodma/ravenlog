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
- **Proceso de enlistamiento** con formularios dinámicos
- **Nómina de personal** con rangos y unidades
- **Estados de aviador** (activo, inactivo, licencia, dado de baja)
- **Asignación de callsigns** y unidades de vuelo

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
- **Eventos de vuelo** programables
- **Sistema RSVP** para participación
- **8 tipos de eventos** predefinidos (Combate, BVR, BFM, CAS, SEAD, etc.)
- **Gestión de participantes** con roles
- **Briefing y debrief** integrados
- **Configuración de servidor** DCS

### ⚙️ **Administración**
- **Panel de control** completo
- **Gestión de roles y permisos** granular
- **Creador de formularios** dinámicos
- **Procesamiento de candidatos** automatizado
- **Estadísticas administrativas**

## 🛠️ **Stack Tecnológico**

### **Frontend**
- **React 18** con TypeScript
- **Vite** para build y desarrollo
- **TailwindCSS** para estilos
- **Lucide React** para iconografía
- **React Router DOM** para navegación
- **TanStack Query** para gestión de estado

### **Backend**
- **Supabase** como BaaS
- **PostgreSQL** con RLS (Row Level Security)
- **Supabase Auth** para autenticación
- **Real-time subscriptions**

### **Infraestructura**
- **Vercel** para hosting y CI/CD
- **GitHub** para control de versiones
- **Supabase Cloud** para base de datos

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
# Crear archivo .env con las siguientes variables:
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

4. **Ejecutar migraciones de base de datos**
- Ejecutar los archivos SQL en `supabase/migrations/` en orden
- Aplicar los datos semilla desde `supabase/seed.sql`

5. **Iniciar desarrollo**
```bash
npm run dev
```

### **Build de Producción**
```bash
npm run build
```

## 📋 **Estructura del Proyecto**

```
ravenlog/
├── src/
│   ├── components/          # Componentes React
│   │   ├── admin/          # Panel administrativo
│   │   ├── auth/           # Autenticación y permisos
│   │   ├── calendar/       # Sistema de calendario
│   │   ├── dcs/            # Análisis de logs DCS
│   │   └── recruitment/    # Sistema de enlistamiento
│   ├── contexts/           # Contextos de React
│   ├── hooks/              # Hooks personalizados
│   ├── pages/              # Páginas principales
│   ├── services/           # Servicios de API
│   └── utils/              # Utilidades
├── shared/                 # Tipos y esquemas compartidos
├── supabase/              # Migraciones y configuración DB
└── public/                # Archivos estáticos
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
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
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
- [ ] Integración con Discord
- [ ] Sistema de notificaciones
- [ ] Reportes avanzados
- [ ] API pública
- [ ] Aplicación móvil
- [ ] Integración con SRS

### **Mejoras Técnicas**
- [ ] Optimización de performance
- [ ] Tests automatizados
- [ ] Documentación API
- [ ] Monitoreo y logging
- [ ] Backup automatizado

## 🤝 **Contribuir**

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📝 **Changelog**

### **v1.1.1** (2025-01-29)
- ✅ Sistema de calendario completo
- ✅ Gestión de eventos de vuelo
- ✅ Sistema RSVP
- ✅ 8 tipos de eventos predefinidos
- ✅ Mejoras en UI/UX

### **v1.0.0** (2025-01-28)
- ✅ Sistema base completo
- ✅ Autenticación Google OAuth
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