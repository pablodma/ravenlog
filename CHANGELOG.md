# 📋 Changelog

Todas las modificaciones notables de este proyecto serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2025-01-29

### ✨ Agregado
- **Sistema de Calendario Completo**
  - Vista de calendario mensual con eventos coloreados
  - 8 tipos de eventos predefinidos (Misión de Combate, BVR, BFM, CAS, SEAD, Vuelo Libre, Ceremonia, Reunión)
  - Sistema RSVP para unirse/salir de eventos
  - Gestión de participantes con roles (participante, líder de vuelo, instructor, observador)
  - Configuración de servidor DCS (nombre, contraseña, canal de voz)
  - Requisitos de aeronaves y nivel de dificultad
  - Briefing y debrief con notas detalladas
  - Filtros por estado y tipo de evento
  - Permisos granulares para gestión de eventos

- **Nuevas Tablas de Base de Datos**
  - `event_types`: Tipos de eventos configurables
  - `flight_events_calendar`: Eventos principales
  - `event_participants`: Participantes en eventos
  - `event_comments`: Comentarios y briefings

- **Nuevos Permisos RBAC**
  - `events.view`: Ver eventos del calendario
  - `events.create`: Crear nuevos eventos
  - `events.edit_own`: Editar eventos propios
  - `events.edit_all`: Editar todos los eventos
  - `events.delete_own`: Eliminar eventos propios
  - `events.delete_all`: Eliminar todos los eventos
  - `events.manage_participants`: Gestionar participantes
  - `events.manage_types`: Gestionar tipos de eventos

### 🔧 Mejorado
- **Navegación**: Agregado "Calendario" al menú principal
- **Permisos**: Integración completa con sistema RBAC existente
- **UI/UX**: Componentes consistentes con el diseño del sistema
- **Tipos TypeScript**: Actualizados para incluir nuevas tablas

### 🐛 Corregido
- Errores de TypeScript en imports de componentes
- Problemas de build en Vercel
- Optimización de queries de base de datos

## [1.0.0] - 2025-01-28

### ✨ Agregado
- **Sistema Base Completo**
  - Autenticación con Google OAuth
  - Sistema RBAC dinámico con roles y permisos configurables
  - Gestión de perfiles de usuario

- **Módulo de Personal**
  - Proceso de enlistamiento con formularios dinámicos
  - Nómina de personal con rangos y unidades
  - Estados de aviador (activo, inactivo, licencia, dado de baja)
  - Asignación de callsigns y unidades de vuelo

- **Sistema de Reconocimientos**
  - Medallas personalizables con categorías y rareza
  - Certificaciones por especialidades
  - Historial de carrera detallado
  - Sistema de puntos y logros

- **Análisis de Logs DCS**
  - Carga de archivos `.log`, `.json`, `.jsonl`
  - Estadísticas acumulativas de vuelo
  - Desglose por armas y precisión
  - Detección de duplicados inteligente
  - Historial de vuelos completo

- **Panel de Administración**
  - Gestión de usuarios y roles
  - Creador de formularios dinámicos
  - Procesamiento de candidatos
  - Gestión de medallas y certificaciones
  - Estadísticas administrativas

- **Páginas Principales**
  - Dashboard con resumen de actividad
  - Perfil unificado con estadísticas DCS
  - Módulo DCS World para análisis de logs
  - Panel administrativo completo

### 🛠️ Técnico
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Supabase con PostgreSQL y RLS
- **Infraestructura**: Vercel para hosting y CI/CD
- **Autenticación**: Supabase Auth con Google OAuth
- **Base de Datos**: 15+ tablas con relaciones complejas
- **Seguridad**: Row Level Security en todas las tablas

### 🔒 Seguridad
- Implementación completa de RLS (Row Level Security)
- Permisos granulares por funcionalidad
- Validación de datos en frontend y backend
- Sanitización de inputs de usuario

### 📊 Estadísticas del Proyecto
- **Archivos de código**: 50+ componentes React
- **Líneas de código**: ~15,000 líneas
- **Migraciones DB**: 5 migraciones principales
- **Tablas**: 15 tablas principales
- **Permisos**: 25+ permisos granulares
- **Roles**: 3 roles base (candidate, personnel, admin)

---

## Tipos de Cambios
- `✨ Agregado` para nuevas funcionalidades
- `🔧 Mejorado` para cambios en funcionalidades existentes
- `🐛 Corregido` para corrección de bugs
- `🛠️ Técnico` para cambios técnicos internos
- `🔒 Seguridad` para mejoras de seguridad
- `📊 Estadísticas` para métricas del proyecto
