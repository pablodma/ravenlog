-- CREAR SISTEMA DE PERMISOS DETALLADO PARA RAVENLOG
-- Sistema completo de permisos para gestión militar

-- 1. ELIMINAR PERMISOS EXISTENTES (si los hay)
DELETE FROM public.role_permissions;
DELETE FROM public.permissions;

-- 2. CREAR PERMISOS POR CATEGORÍAS

-- === GESTIÓN DE RECLUTAMIENTO ===
INSERT INTO public.permissions (name, description, category) VALUES
('recruitment.process_applications', 'Puede procesar solicitudes de reclutamiento', 'recruitment'),
('recruitment.review_applications', 'Puede revisar y aprobar/rechazar solicitudes', 'recruitment'),
('recruitment.create_forms', 'Puede crear formularios de reclutamiento', 'recruitment'),
('recruitment.manage_forms', 'Puede modificar/eliminar formularios existentes', 'recruitment');

-- === GESTIÓN DE PERSONAL ===
INSERT INTO public.permissions (name, description, category) VALUES
('personnel.move_units', 'Puede mover miembros entre unidades', 'personnel'),
('personnel.promote_demote', 'Puede promover o degradar personal', 'personnel'),
('personnel.manage_profiles', 'Puede editar perfiles de personal', 'personnel'),
('personnel.discharge', 'Puede dar de baja a personal', 'personnel'),
('personnel.assign_callsigns', 'Puede asignar/cambiar callsigns', 'personnel'),
('personnel.manage_status', 'Puede cambiar estado (activo/licencia/baja)', 'personnel');

-- === GESTIÓN DE RANGOS Y ESTRUCTURA ===
INSERT INTO public.permissions (name, description, category) VALUES
('ranks.create', 'Puede crear nuevos rangos', 'ranks'),
('ranks.modify', 'Puede modificar rangos existentes', 'ranks'),
('ranks.delete', 'Puede eliminar rangos', 'ranks'),
('units.create', 'Puede crear nuevas unidades', 'units'),
('units.modify', 'Puede modificar unidades existentes', 'units'),
('units.delete', 'Puede eliminar unidades', 'units');

-- === SISTEMA DE MEDALLAS Y RECONOCIMIENTOS ===
INSERT INTO public.permissions (name, description, category) VALUES
('medals.create', 'Puede crear nuevas medallas', 'medals'),
('medals.modify', 'Puede modificar medallas existentes', 'medals'),
('medals.delete', 'Puede eliminar medallas', 'medals'),
('medals.assign', 'Puede asignar medallas a personal', 'medals'),
('medals.revoke', 'Puede revocar medallas asignadas', 'medals');

-- === GESTIÓN DE EVENTOS Y MISIONES ===
INSERT INTO public.permissions (name, description, category) VALUES
('events.create', 'Puede crear eventos y misiones', 'events'),
('events.modify', 'Puede modificar eventos existentes', 'events'),
('events.delete', 'Puede eliminar eventos', 'events'),
('events.respond', 'Puede responder a eventos (RSVP)', 'events'),
('events.manage_responses', 'Puede gestionar respuestas de otros', 'events'),
('events.schedule_mandatory', 'Puede programar eventos obligatorios', 'events');

-- === GESTIÓN DE CERTIFICACIONES Y ENTRENAMIENTO ===
INSERT INTO public.permissions (name, description, category) VALUES
('certifications.create', 'Puede crear nuevas certificaciones', 'training'),
('certifications.modify', 'Puede modificar certificaciones', 'training'),
('certifications.assign', 'Puede asignar certificaciones a personal', 'training'),
('certifications.revoke', 'Puede revocar certificaciones', 'training'),
('training.schedule', 'Puede programar entrenamientos', 'training'),
('training.evaluate', 'Puede evaluar desempeño en entrenamientos', 'training');

-- === GESTIÓN DE LOGS Y REPORTES ===
INSERT INTO public.permissions (name, description, category) VALUES
('logs.view_all', 'Puede ver logs de todos los usuarios', 'logs'),
('logs.manage_dcs', 'Puede gestionar integración con DCS', 'logs'),
('reports.generate', 'Puede generar reportes del sistema', 'reports'),
('reports.view_analytics', 'Puede ver analíticas y estadísticas', 'reports'),
('audit.view_logs', 'Puede ver logs de auditoría del sistema', 'audit');

-- === ADMINISTRACIÓN DEL SISTEMA ===
INSERT INTO public.permissions (name, description, category) VALUES
('admin.manage_roles', 'Puede crear y modificar roles', 'admin'),
('admin.assign_roles', 'Puede asignar roles a usuarios', 'admin'),
('admin.manage_permissions', 'Puede gestionar permisos del sistema', 'admin'),
('admin.system_settings', 'Puede modificar configuraciones del sistema', 'admin'),
('admin.backup_restore', 'Puede realizar backups y restauraciones', 'admin');

-- === COMUNICACIONES Y DISCORD ===
INSERT INTO public.permissions (name, description, category) VALUES
('discord.manage_integration', 'Puede gestionar integración con Discord', 'discord'),
('discord.sync_roles', 'Puede sincronizar roles con Discord', 'discord'),
('communications.send_announcements', 'Puede enviar anuncios generales', 'communications'),
('communications.moderate', 'Puede moderar comunicaciones', 'communications');

-- === OPERACIONES Y MISIONES ===
INSERT INTO public.permissions (name, description, category) VALUES
('operations.plan_missions', 'Puede planificar misiones operacionales', 'operations'),
('operations.assign_roles', 'Puede asignar roles en misiones', 'operations'),
('operations.debrief', 'Puede realizar debriefings post-misión', 'operations'),
('operations.manage_loadouts', 'Puede gestionar loadouts y equipamiento', 'operations');

-- 3. CREAR ROLES BÁSICOS CON PERMISOS

-- ROL: Administrador (todos los permisos)
INSERT INTO public.roles (name, description, color, is_system_role) VALUES
('admin', 'Administrador del sistema con acceso completo', '#DC2626', true);

-- Asignar TODOS los permisos al admin
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM public.roles WHERE name = 'admin'),
    id
FROM public.permissions;

-- ROL: Oficial Comandante
INSERT INTO public.roles (name, description, color, is_system_role) VALUES
('commander', 'Oficial comandante con permisos de liderazgo', '#7C2D12', false);

-- Permisos para comandante
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM public.roles WHERE name = 'commander'),
    id
FROM public.permissions
WHERE name IN (
    'recruitment.process_applications', 'recruitment.review_applications',
    'personnel.move_units', 'personnel.promote_demote', 'personnel.manage_profiles',
    'medals.assign', 'medals.revoke',
    'events.create', 'events.modify', 'events.manage_responses', 'events.schedule_mandatory',
    'operations.plan_missions', 'operations.assign_roles', 'operations.debrief',
    'reports.generate', 'reports.view_analytics'
);

-- ROL: Oficial de Personal
INSERT INTO public.roles (name, description, color, is_system_role) VALUES
('personnel_officer', 'Oficial encargado de gestión de personal', '#1D4ED8', false);

-- Permisos para oficial de personal
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM public.roles WHERE name = 'personnel_officer'),
    id
FROM public.permissions
WHERE name IN (
    'recruitment.process_applications', 'recruitment.review_applications',
    'personnel.move_units', 'personnel.manage_profiles', 'personnel.assign_callsigns',
    'personnel.manage_status', 'medals.assign',
    'events.respond', 'reports.view_analytics'
);

-- ROL: Instructor
INSERT INTO public.roles (name, description, color, is_system_role) VALUES
('instructor', 'Instructor de entrenamiento y certificaciones', '#059669', false);

-- Permisos para instructor
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM public.roles WHERE name = 'instructor'),
    id
FROM public.permissions
WHERE name IN (
    'certifications.assign', 'certifications.revoke',
    'training.schedule', 'training.evaluate',
    'events.create', 'events.modify', 'events.respond',
    'operations.debrief'
);

-- ROL: Personal (usuario básico)
INSERT INTO public.roles (name, description, color, is_system_role) VALUES
('personnel', 'Personal activo de la unidad', '#6B7280', true);

-- Permisos básicos para personal
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM public.roles WHERE name = 'personnel'),
    id
FROM public.permissions
WHERE name IN (
    'events.respond',
    'logs.view_all'
);

-- ROL: Candidato (acceso mínimo)
INSERT INTO public.roles (name, description, color, is_system_role) VALUES
('candidate', 'Candidato en proceso de reclutamiento', '#9CA3AF', true);

-- Sin permisos especiales para candidatos (solo pueden ver su aplicación)

-- 4. VERIFICAR PERMISOS CREADOS
SELECT 'PERMISOS CREADOS POR CATEGORÍA:' as info;
SELECT category, COUNT(*) as total_permissions 
FROM public.permissions 
GROUP BY category 
ORDER BY category;

SELECT 'ROLES Y SUS PERMISOS:' as info;
SELECT 
    r.name as role_name,
    r.description,
    COUNT(rp.permission_id) as total_permissions
FROM public.roles r
LEFT JOIN public.role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name, r.description
ORDER BY total_permissions DESC;
