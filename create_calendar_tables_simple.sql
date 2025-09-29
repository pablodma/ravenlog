-- CREAR TABLAS DEL CALENDARIO - VERSIÓN SIMPLIFICADA
-- Ejecutar en el SQL Editor de Supabase

-- 1. CREAR TABLA DE TIPOS DE EVENTOS
CREATE TABLE IF NOT EXISTS public.event_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    icon TEXT DEFAULT 'calendar',
    is_system_type BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREAR TABLA PRINCIPAL DE EVENTOS
CREATE TABLE IF NOT EXISTS public.flight_events_calendar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_type_id UUID REFERENCES public.event_types(id) ON DELETE SET NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    is_all_day BOOLEAN DEFAULT false,
    server_name TEXT,
    server_password TEXT,
    voice_channel TEXT,
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    max_participants INTEGER,
    min_participants INTEGER DEFAULT 1,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'unit_only', 'private')),
    required_aircraft TEXT[],
    required_certifications UUID[],
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    briefing_notes TEXT,
    debrief_notes TEXT,
    external_links JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREAR TABLA DE PARTICIPANTES
CREATE TABLE IF NOT EXISTS public.event_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.flight_events_calendar(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'attended', 'no_show', 'cancelled')),
    role TEXT DEFAULT 'participant' CHECK (role IN ('participant', 'flight_lead', 'instructor', 'observer')),
    aircraft TEXT,
    callsign TEXT,
    notes TEXT,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- 4. CREAR TABLA DE COMENTARIOS
CREATE TABLE IF NOT EXISTS public.event_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.flight_events_calendar(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    comment TEXT NOT NULL,
    is_briefing BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. HABILITAR RLS
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_events_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_comments ENABLE ROW LEVEL SECURITY;

-- 6. CREAR POLÍTICAS RLS BÁSICAS
-- Todos pueden ver tipos de eventos
DROP POLICY IF EXISTS "Everyone can view event types" ON public.event_types;
CREATE POLICY "Everyone can view event types" ON public.event_types FOR SELECT USING (true);

-- Solo admins pueden gestionar tipos de eventos
DROP POLICY IF EXISTS "Admins can manage event types" ON public.event_types;
CREATE POLICY "Admins can manage event types" ON public.event_types FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Usuarios pueden ver eventos públicos
DROP POLICY IF EXISTS "Users can view public events" ON public.flight_events_calendar;
CREATE POLICY "Users can view public events" ON public.flight_events_calendar FOR SELECT USING (
    visibility = 'public' OR organizer_id = auth.uid()
);

-- Usuarios pueden crear eventos
DROP POLICY IF EXISTS "Users can create events" ON public.flight_events_calendar;
CREATE POLICY "Users can create events" ON public.flight_events_calendar FOR INSERT WITH CHECK (
    organizer_id = auth.uid()
);

-- Usuarios pueden editar sus propios eventos
DROP POLICY IF EXISTS "Users can edit own events" ON public.flight_events_calendar;
CREATE POLICY "Users can edit own events" ON public.flight_events_calendar FOR UPDATE USING (
    organizer_id = auth.uid()
);

-- Usuarios pueden eliminar sus propios eventos
DROP POLICY IF EXISTS "Users can delete own events" ON public.flight_events_calendar;
CREATE POLICY "Users can delete own events" ON public.flight_events_calendar FOR DELETE USING (
    organizer_id = auth.uid()
);

-- Políticas para participantes
DROP POLICY IF EXISTS "Users can view participants" ON public.event_participants;
CREATE POLICY "Users can view participants" ON public.event_participants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can register for events" ON public.event_participants;
CREATE POLICY "Users can register for events" ON public.event_participants FOR INSERT WITH CHECK (
    user_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can update own participation" ON public.event_participants;
CREATE POLICY "Users can update own participation" ON public.event_participants FOR UPDATE USING (
    user_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can cancel own participation" ON public.event_participants;
CREATE POLICY "Users can cancel own participation" ON public.event_participants FOR DELETE USING (
    user_id = auth.uid()
);

-- Políticas para comentarios
DROP POLICY IF EXISTS "Users can view comments" ON public.event_comments;
CREATE POLICY "Users can view comments" ON public.event_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can add comments" ON public.event_comments;
CREATE POLICY "Users can add comments" ON public.event_comments FOR INSERT WITH CHECK (
    user_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can edit own comments" ON public.event_comments;
CREATE POLICY "Users can edit own comments" ON public.event_comments FOR UPDATE USING (
    user_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.event_comments;
CREATE POLICY "Users can delete own comments" ON public.event_comments FOR DELETE USING (
    user_id = auth.uid()
);

-- 7. INSERTAR TIPOS DE EVENTOS PREDEFINIDOS
INSERT INTO public.event_types (name, description, color, icon, is_system_type) VALUES
('Misión de Combate', 'Operaciones de combate aéreo', '#EF4444', 'target', true),
('Entrenamiento BVR', 'Beyond Visual Range training', '#3B82F6', 'radar', true),
('Entrenamiento BFM', 'Basic Fighter Maneuvers', '#10B981', 'plane', true),
('CAS Training', 'Close Air Support training', '#F59E0B', 'crosshair', true),
('SEAD Mission', 'Suppression of Enemy Air Defenses', '#8B5CF6', 'shield-off', true),
('Vuelo Libre', 'Sesión de vuelo libre', '#6B7280', 'wind', true),
('Ceremonia', 'Eventos ceremoniales y graduaciones', '#EC4899', 'award', true),
('Reunión', 'Meetings y briefings', '#14B8A6', 'users', true)
ON CONFLICT (name) DO NOTHING;

-- 8. AGREGAR PERMISOS PARA EVENTOS (si no existen)
INSERT INTO public.permissions (name, description, category) VALUES
('events.view', 'Ver eventos del calendario', 'Eventos'),
('events.create', 'Crear nuevos eventos', 'Eventos'),
('events.edit_own', 'Editar eventos propios', 'Eventos'),
('events.edit_all', 'Editar todos los eventos', 'Eventos'),
('events.delete_own', 'Eliminar eventos propios', 'Eventos'),
('events.delete_all', 'Eliminar todos los eventos', 'Eventos'),
('events.manage_participants', 'Gestionar participantes de eventos', 'Eventos'),
('events.manage_types', 'Gestionar tipos de eventos', 'Eventos')
ON CONFLICT (name) DO NOTHING;

-- 9. ASIGNAR PERMISOS A ROLES (si existen)
-- Admin: todos los permisos
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'admin' AND p.name LIKE 'events.%'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Personnel: permisos básicos
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'personnel' AND p.name IN ('events.view', 'events.create', 'events.edit_own', 'events.delete_own')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Candidate: solo ver
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'candidate' AND p.name = 'events.view'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 10. CREAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_flight_events_start_date ON public.flight_events_calendar(start_date);
CREATE INDEX IF NOT EXISTS idx_flight_events_organizer ON public.flight_events_calendar(organizer_id);
CREATE INDEX IF NOT EXISTS idx_flight_events_status ON public.flight_events_calendar(status);
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON public.event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_event ON public.event_comments(event_id);

-- 11. VERIFICAR CREACIÓN
SELECT 'Tablas creadas exitosamente' as status;
SELECT COUNT(*) as event_types_count FROM public.event_types;
SELECT tablename FROM pg_tables WHERE tablename LIKE '%event%' OR tablename LIKE '%flight_events%';
