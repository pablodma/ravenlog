-- DCS STATISTICS SYSTEM: Tablas para estadísticas de vuelo y logs
-- Migration: 20240104000000_dcs_statistics.sql

-- 1. TABLA DE ARCHIVOS DE LOG PROCESADOS (para deduplicación)
CREATE TABLE public.log_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 del contenido
    file_size BIGINT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    events_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'processed' CHECK (status IN ('processing', 'processed', 'error', 'duplicate')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE ESTADÍSTICAS DE USUARIO (acumulativas)
CREATE TABLE public.user_statistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    
    -- Estadísticas generales de vuelo
    total_missions INTEGER DEFAULT 0,
    total_takeoffs INTEGER DEFAULT 0,
    total_landings INTEGER DEFAULT 0,
    total_flight_time INTERVAL DEFAULT '0 seconds',
    
    -- Estadísticas de combate
    total_shots INTEGER DEFAULT 0,
    total_hits INTEGER DEFAULT 0,
    total_kills INTEGER DEFAULT 0,
    total_deaths INTEGER DEFAULT 0,
    
    -- Metadatos
    first_flight_date TIMESTAMPTZ,
    last_flight_date TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE ESTADÍSTICAS POR ARMA (desglose detallado)
CREATE TABLE public.weapon_statistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    weapon_name VARCHAR(100) NOT NULL,
    weapon_type VARCHAR(50), -- 'gun', 'missile', 'bomb', 'rocket', etc.
    
    -- Estadísticas específicas del arma
    shots_fired INTEGER DEFAULT 0,
    hits_scored INTEGER DEFAULT 0,
    kills_achieved INTEGER DEFAULT 0,
    
    -- Metadatos
    first_used_date TIMESTAMPTZ,
    last_used_date TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, weapon_name)
);

-- 4. TABLA DE EVENTOS DE VUELO (eventos individuales del log)
CREATE TABLE public.flight_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    log_file_id UUID REFERENCES public.log_files(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Información del evento
    event_type VARCHAR(50) NOT NULL, -- 'takeoff', 'landing', 'shot', 'hit', 'kill', 'death', 'mission_start', 'mission_end'
    event_timestamp TIMESTAMPTZ NOT NULL,
    
    -- Contexto del vuelo
    aircraft_type VARCHAR(50),
    mission_name VARCHAR(255),
    server_name VARCHAR(255),
    
    -- Datos específicos del evento (JSON flexible)
    event_data JSONB,
    
    -- Metadatos
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ÍNDICES para optimizar consultas
CREATE INDEX idx_log_files_hash ON public.log_files(file_hash);
CREATE INDEX idx_log_files_uploaded_by ON public.log_files(uploaded_by);
CREATE INDEX idx_user_statistics_user_id ON public.user_statistics(user_id);
CREATE INDEX idx_weapon_statistics_user_id ON public.weapon_statistics(user_id);
CREATE INDEX idx_weapon_statistics_weapon_name ON public.weapon_statistics(weapon_name);
CREATE INDEX idx_flight_events_log_file_id ON public.flight_events(log_file_id);
CREATE INDEX idx_flight_events_user_id ON public.flight_events(user_id);
CREATE INDEX idx_flight_events_event_type ON public.flight_events(event_type);
CREATE INDEX idx_flight_events_timestamp ON public.flight_events(event_timestamp);

-- 6. TRIGGERS para updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_statistics
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.weapon_statistics
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 7. RLS POLICIES

-- Log files: usuarios ven sus propios archivos, admins ven todos
ALTER TABLE public.log_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own log files" ON public.log_files
    FOR SELECT USING (uploaded_by = auth.uid());

CREATE POLICY "Users can insert own log files" ON public.log_files
    FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Admins can view all log files" ON public.log_files
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- User statistics: usuarios ven sus propias estadísticas, admins ven todas
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own statistics" ON public.user_statistics
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own statistics" ON public.user_statistics
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all statistics" ON public.user_statistics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Weapon statistics: usuarios ven sus propias estadísticas, admins ven todas
ALTER TABLE public.weapon_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weapon stats" ON public.weapon_statistics
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own weapon stats" ON public.weapon_statistics
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all weapon stats" ON public.weapon_statistics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Flight events: usuarios ven sus propios eventos, admins ven todos
ALTER TABLE public.flight_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own flight events" ON public.flight_events
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own flight events" ON public.flight_events
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all flight events" ON public.flight_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 8. FUNCIONES ÚTILES

-- Función para calcular accuracy de un arma
CREATE OR REPLACE FUNCTION public.calculate_weapon_accuracy(
    p_user_id UUID,
    p_weapon_name VARCHAR DEFAULT NULL
) RETURNS TABLE (
    weapon_name VARCHAR,
    shots INTEGER,
    hits INTEGER,
    accuracy DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ws.weapon_name,
        ws.shots_fired,
        ws.hits_scored,
        CASE 
            WHEN ws.shots_fired > 0 THEN 
                ROUND((ws.hits_scored::DECIMAL / ws.shots_fired::DECIMAL) * 100, 2)
            ELSE 0
        END as accuracy
    FROM public.weapon_statistics ws
    WHERE ws.user_id = p_user_id
    AND (p_weapon_name IS NULL OR ws.weapon_name = p_weapon_name)
    ORDER BY ws.shots_fired DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener resumen de estadísticas de usuario
CREATE OR REPLACE FUNCTION public.get_user_flight_summary(p_user_id UUID)
RETURNS TABLE (
    total_missions INTEGER,
    total_takeoffs INTEGER,
    total_landings INTEGER,
    total_flight_time INTERVAL,
    total_shots INTEGER,
    total_hits INTEGER,
    overall_accuracy DECIMAL,
    total_kills INTEGER,
    kd_ratio DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        us.total_missions,
        us.total_takeoffs,
        us.total_landings,
        us.total_flight_time,
        us.total_shots,
        us.total_hits,
        CASE 
            WHEN us.total_shots > 0 THEN 
                ROUND((us.total_hits::DECIMAL / us.total_shots::DECIMAL) * 100, 2)
            ELSE 0
        END as overall_accuracy,
        us.total_kills,
        CASE 
            WHEN us.total_deaths > 0 THEN 
                ROUND(us.total_kills::DECIMAL / us.total_deaths::DECIMAL, 2)
            ELSE us.total_kills::DECIMAL
        END as kd_ratio
    FROM public.user_statistics us
    WHERE us.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un archivo ya fue procesado
CREATE OR REPLACE FUNCTION public.check_file_duplicate(p_file_hash VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.log_files 
        WHERE file_hash = p_file_hash AND status != 'error'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
