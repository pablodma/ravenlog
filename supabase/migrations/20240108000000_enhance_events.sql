-- MEJORAS PARA EVENTOS: Agregar location, URL y calendars
-- Migration: 20240108000000_enhance_events.sql

-- 1. TABLA DE CALENDARIOS (Categorías de eventos)
CREATE TABLE IF NOT EXISTS public.event_calendars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AGREGAR COLUMNAS FALTANTES A flight_events_calendar
ALTER TABLE public.flight_events_calendar
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS event_url TEXT,
ADD COLUMN IF NOT EXISTS calendar_id UUID REFERENCES public.event_calendars(id),
ADD COLUMN IF NOT EXISTS registration_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurrence_pattern VARCHAR(50),
ADD COLUMN IF NOT EXISTS recurrence_end_date TIMESTAMPTZ;

-- 3. INSERTAR CALENDARIOS PREDEFINIDOS
INSERT INTO public.event_calendars (name, description, color, is_default) VALUES
('Operaciones', 'Misiones y operaciones de combate', '#EF4444', true),
('Entrenamiento', 'Sesiones de entrenamiento', '#3B82F6', false),
('Eventos Sociales', 'Eventos y reuniones sociales', '#10B981', false),
('Administrativo', 'Reuniones y eventos administrativos', '#8B5CF6', false),
('Competencias', 'Torneos y competencias', '#F59E0B', false)
ON CONFLICT (name) DO NOTHING;

-- 4. RLS para event_calendars
ALTER TABLE public.event_calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view calendars" ON public.event_calendars
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage calendars" ON public.event_calendars
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- 5. CREAR ÍNDICE
CREATE INDEX IF NOT EXISTS idx_flight_events_calendar_id ON public.flight_events_calendar(calendar_id);

-- 6. TRIGGER para updated_at en event_calendars
CREATE TRIGGER update_event_calendars_updated_at BEFORE UPDATE ON public.event_calendars
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. COMENTARIOS
COMMENT ON TABLE public.event_calendars IS 'Calendarios/categorías para organizar eventos';
COMMENT ON COLUMN public.flight_events_calendar.location IS 'Ubicación física o virtual del evento';
COMMENT ON COLUMN public.flight_events_calendar.event_url IS 'URL relacionada al evento (stream, mapa, etc)';
COMMENT ON COLUMN public.flight_events_calendar.calendar_id IS 'Calendario/categoría al que pertenece el evento';

