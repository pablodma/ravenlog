-- APLICAR MIGRACIÓN DEL MÓDULO DE CALENDARIO
-- Este archivo debe ejecutarse en el SQL Editor de Supabase

-- 1. TABLA PARA TIPOS DE EVENTOS
CREATE TABLE IF NOT EXISTS public.event_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#3B82F6', -- Color hex para el calendario
    icon TEXT DEFAULT 'calendar', -- Nombre del icono
    is_system_type BOOLEAN DEFAULT false, -- Tipos predefinidos del sistema
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA PRINCIPAL DE EVENTOS
CREATE TABLE IF NOT EXISTS public.flight_events_calendar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_type_id UUID REFERENCES public.event_types(id) ON DELETE SET NULL,
    
    -- Fechas y horarios
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    is_all_day BOOLEAN DEFAULT false,
    
    -- Ubicación y servidor
    server_name TEXT,
    server_password TEXT,
    voice_channel TEXT,
    
    -- Organización
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    max_participants INTEGER,
    min_participants INTEGER DEFAULT 1,
    
    -- Estado del evento
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'unit_only', 'private')),
    
    -- Requisitos
    required_aircraft TEXT[], -- Array de aeronaves requeridas
    required_certifications UUID[], -- Array de IDs de certificaciones requeridas
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    
    -- Metadatos
    briefing_notes TEXT,
    debrief_notes TEXT,
    external_links JSONB, -- Links a archivos, mapas, etc.
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE PARTICIPANTES EN EVENTOS
CREATE TABLE IF NOT EXISTS public.event_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.flight_events_calendar(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Estado de participación
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'attended', 'no_show', 'cancelled')),
    role TEXT DEFAULT 'participant' CHECK (role IN ('participant', 'flight_lead', 'instructor', 'observer')),
    
    -- Información específica del participante
    aircraft TEXT, -- Aeronave que usará
    callsign TEXT,
    notes TEXT,
    
    -- Timestamps
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(event_id, user_id)
);

-- 4. TABLA DE COMENTARIOS EN EVENTOS
CREATE TABLE IF NOT EXISTS public.event_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.flight_events_calendar(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    comment TEXT NOT NULL,
    is_briefing BOOLEAN DEFAULT false, -- Si es parte del briefing oficial
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INSERTAR TIPOS DE EVENTOS PREDEFINIDOS
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

-- 6. AGREGAR PERMISOS PARA EL MÓDULO DE CALENDARIO
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

-- 7. ASIGNAR PERMISOS A ROLES EXISTENTES
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

-- 8. HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_events_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_comments ENABLE ROW LEVEL SECURITY;

-- 9. POLÍTICAS RLS PARA event_types
DROP POLICY IF EXISTS "Everyone can view event types" ON public.event_types;
CREATE POLICY "Everyone can view event types" ON public.event_types
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage event types" ON public.event_types;
CREATE POLICY "Admins can manage event types" ON public.event_types
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name = 'admin'
        )
    );

-- 10. POLÍTICAS RLS PARA flight_events_calendar
DROP POLICY IF EXISTS "Users can view public events" ON public.flight_events_calendar;
CREATE POLICY "Users can view public events" ON public.flight_events_calendar
    FOR SELECT USING (
        visibility = 'public' OR
        organizer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.event_participants ep
            WHERE ep.event_id = id AND ep.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can create events" ON public.flight_events_calendar;
CREATE POLICY "Users can create events" ON public.flight_events_calendar
    FOR INSERT WITH CHECK (organizer_id = auth.uid());

DROP POLICY IF EXISTS "Users can edit own events" ON public.flight_events_calendar;
CREATE POLICY "Users can edit own events" ON public.flight_events_calendar
    FOR UPDATE USING (
        organizer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name = 'admin'
        )
    );

DROP POLICY IF EXISTS "Users can delete own events" ON public.flight_events_calendar;
CREATE POLICY "Users can delete own events" ON public.flight_events_calendar
    FOR DELETE USING (
        organizer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name = 'admin'
        )
    );

-- 11. POLÍTICAS RLS PARA event_participants
DROP POLICY IF EXISTS "Users can view participants of visible events" ON public.event_participants;
CREATE POLICY "Users can view participants of visible events" ON public.event_participants
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.flight_events_calendar e
            WHERE e.id = event_id AND (
                e.visibility = 'public' OR
                e.organizer_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.event_participants ep2
                    WHERE ep2.event_id = e.id AND ep2.user_id = auth.uid()
                )
            )
        )
    );

DROP POLICY IF EXISTS "Users can register for events" ON public.event_participants;
CREATE POLICY "Users can register for events" ON public.event_participants
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own participation" ON public.event_participants;
CREATE POLICY "Users can update own participation" ON public.event_participants
    FOR UPDATE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.flight_events_calendar e
            WHERE e.id = event_id AND e.organizer_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can cancel own participation" ON public.event_participants;
CREATE POLICY "Users can cancel own participation" ON public.event_participants
    FOR DELETE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.flight_events_calendar e
            WHERE e.id = event_id AND e.organizer_id = auth.uid()
        )
    );

-- 12. POLÍTICAS RLS PARA event_comments
DROP POLICY IF EXISTS "Users can view comments of visible events" ON public.event_comments;
CREATE POLICY "Users can view comments of visible events" ON public.event_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.flight_events_calendar e
            WHERE e.id = event_id AND (
                e.visibility = 'public' OR
                e.organizer_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.event_participants ep
                    WHERE ep.event_id = e.id AND ep.user_id = auth.uid()
                )
            )
        )
    );

DROP POLICY IF EXISTS "Participants can comment on events" ON public.event_comments;
CREATE POLICY "Participants can comment on events" ON public.event_comments
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.event_participants ep
            WHERE ep.event_id = event_id AND ep.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can edit own comments" ON public.event_comments;
CREATE POLICY "Users can edit own comments" ON public.event_comments
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own comments" ON public.event_comments;
CREATE POLICY "Users can delete own comments" ON public.event_comments
    FOR DELETE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.flight_events_calendar e
            WHERE e.id = event_id AND e.organizer_id = auth.uid()
        )
    );

-- 13. CREAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_flight_events_start_date ON public.flight_events_calendar(start_date);
CREATE INDEX IF NOT EXISTS idx_flight_events_organizer ON public.flight_events_calendar(organizer_id);
CREATE INDEX IF NOT EXISTS idx_flight_events_status ON public.flight_events_calendar(status);
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON public.event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_event ON public.event_comments(event_id);

-- 14. CREAR TRIGGERS PARA UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_event_types_updated_at ON public.event_types;
CREATE TRIGGER update_event_types_updated_at BEFORE UPDATE ON public.event_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_flight_events_updated_at ON public.flight_events_calendar;
CREATE TRIGGER update_flight_events_updated_at BEFORE UPDATE ON public.flight_events_calendar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_participants_updated_at ON public.event_participants;
CREATE TRIGGER update_event_participants_updated_at BEFORE UPDATE ON public.event_participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_comments_updated_at ON public.event_comments;
CREATE TRIGGER update_event_comments_updated_at BEFORE UPDATE ON public.event_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
