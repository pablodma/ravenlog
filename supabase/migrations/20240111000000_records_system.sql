-- MÓDULO DE REGISTROS: Sistema de historial de personal
-- Migration: 20240111000000_records_system.sql

-- 1. TABLA DE REGISTROS DE ASIGNACIONES (Assignment Records)
-- Cuando alguien es asignado a una unidad, posición, o cambia de rol
CREATE TABLE IF NOT EXISTS public.assignment_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    assignment_type VARCHAR(50) NOT NULL, -- 'unit', 'position', 'role'
    from_unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
    to_unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
    from_position_id UUID REFERENCES public.unit_positions(id) ON DELETE SET NULL,
    to_position_id UUID REFERENCES public.unit_positions(id) ON DELETE SET NULL,
    from_role VARCHAR(50),
    to_role VARCHAR(50),
    effective_date DATE NOT NULL,
    reason TEXT,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE REGISTROS DE CONDECORACIONES (Award Records)
-- Cuando alguien recibe una medalla o condecoración
CREATE TABLE IF NOT EXISTS public.award_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    medal_id UUID REFERENCES public.medals(id) ON DELETE CASCADE,
    awarded_date DATE NOT NULL,
    reason TEXT NOT NULL,
    operation_name VARCHAR(255),
    citation TEXT, -- Texto de la citación
    awarded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE REGISTROS DE COMBATE (Combat Records)
-- Participación en operaciones y misiones
CREATE TABLE IF NOT EXISTS public.combat_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.flight_events_calendar(id) ON DELETE SET NULL,
    operation_name VARCHAR(255) NOT NULL,
    operation_date DATE NOT NULL,
    aircraft_type VARCHAR(100),
    role VARCHAR(100), -- 'pilot', 'co-pilot', 'gunner', 'navigator', etc.
    flight_hours DECIMAL(5,2),
    mission_type VARCHAR(100), -- 'CAP', 'CAS', 'SEAD', 'Strike', etc.
    outcome VARCHAR(50), -- 'success', 'partial', 'failed'
    kills INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    notes TEXT,
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE REGISTROS DE CALIFICACIONES (Qualification Records)
-- Ya existe profile_qualifications, pero la mejoramos
ALTER TABLE public.profile_qualifications
ADD COLUMN IF NOT EXISTS instructor_notes TEXT,
ADD COLUMN IF NOT EXISTS training_hours DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS certificate_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 5. TABLA DE REGISTROS DE RANGO (Rank Records)
-- Historial de promociones y degradaciones
CREATE TABLE IF NOT EXISTS public.rank_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    from_rank_id UUID REFERENCES public.ranks(id) ON DELETE SET NULL,
    to_rank_id UUID REFERENCES public.ranks(id) ON DELETE CASCADE,
    promotion_date DATE NOT NULL,
    promotion_type VARCHAR(50) DEFAULT 'promotion', -- 'promotion', 'demotion', 'field_promotion'
    reason TEXT NOT NULL,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA DE REGISTROS DE SERVICIO (Service Records)
-- Entrada, salida, cambios de estado
CREATE TABLE IF NOT EXISTS public.service_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    record_type VARCHAR(50) NOT NULL, -- 'enlistment', 'discharge', 'leave', 'return', 'status_change'
    from_status VARCHAR(50),
    to_status VARCHAR(50),
    effective_date DATE NOT NULL,
    end_date DATE,
    reason TEXT,
    notes TEXT,
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ÍNDICES PARA MEJOR PERFORMANCE
CREATE INDEX idx_assignment_records_user_id ON public.assignment_records(user_id);
CREATE INDEX idx_assignment_records_effective_date ON public.assignment_records(effective_date);

CREATE INDEX idx_award_records_user_id ON public.award_records(user_id);
CREATE INDEX idx_award_records_medal_id ON public.award_records(medal_id);
CREATE INDEX idx_award_records_awarded_date ON public.award_records(awarded_date);

CREATE INDEX idx_combat_records_user_id ON public.combat_records(user_id);
CREATE INDEX idx_combat_records_operation_date ON public.combat_records(operation_date);
CREATE INDEX idx_combat_records_event_id ON public.combat_records(event_id);

CREATE INDEX idx_rank_records_user_id ON public.rank_records(user_id);
CREATE INDEX idx_rank_records_promotion_date ON public.rank_records(promotion_date);

CREATE INDEX idx_service_records_user_id ON public.service_records(user_id);
CREATE INDEX idx_service_records_effective_date ON public.service_records(effective_date);

-- 8. HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE public.assignment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.award_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combat_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rank_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_records ENABLE ROW LEVEL SECURITY;

-- 9. POLÍTICAS RLS - Los usuarios pueden ver sus propios registros
CREATE POLICY "Users can view their own assignment records" ON public.assignment_records
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their own award records" ON public.award_records
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their own combat records" ON public.combat_records
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their own rank records" ON public.rank_records
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their own service records" ON public.service_records
    FOR SELECT USING (user_id = auth.uid());

-- 10. POLÍTICAS RLS - Administradores pueden ver y gestionar todos los registros
CREATE POLICY "Admins can manage assignment records" ON public.assignment_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name = 'admin'
        )
    );

CREATE POLICY "Admins can manage award records" ON public.award_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name = 'admin'
        )
    );

CREATE POLICY "Admins can manage combat records" ON public.combat_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name = 'admin'
        )
    );

CREATE POLICY "Admins can manage rank records" ON public.rank_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name = 'admin'
        )
    );

CREATE POLICY "Admins can manage service records" ON public.service_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name = 'admin'
        )
    );

-- 11. TRIGGERS PARA updated_at
CREATE TRIGGER update_assignment_records_updated_at BEFORE UPDATE ON public.assignment_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_award_records_updated_at BEFORE UPDATE ON public.award_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_combat_records_updated_at BEFORE UPDATE ON public.combat_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rank_records_updated_at BEFORE UPDATE ON public.rank_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_records_updated_at BEFORE UPDATE ON public.service_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. VISTA UNIFICADA DE HISTORIAL DE PERSONAL
CREATE OR REPLACE VIEW public.personnel_history AS
-- Assignment Records
SELECT 
    id,
    'assignment' as record_type,
    user_id,
    created_at as record_date,
    jsonb_build_object(
        'type', assignment_type,
        'from_unit', from_unit_id,
        'to_unit', to_unit_id,
        'from_position', from_position_id,
        'to_position', to_position_id,
        'reason', reason,
        'notes', notes
    ) as record_data
FROM public.assignment_records

UNION ALL

-- Award Records
SELECT 
    id,
    'award' as record_type,
    user_id,
    awarded_date::timestamptz as record_date,
    jsonb_build_object(
        'medal_id', medal_id,
        'reason', reason,
        'operation', operation_name,
        'citation', citation
    ) as record_data
FROM public.award_records

UNION ALL

-- Combat Records
SELECT 
    id,
    'combat' as record_type,
    user_id,
    operation_date::timestamptz as record_date,
    jsonb_build_object(
        'operation', operation_name,
        'aircraft', aircraft_type,
        'role', role,
        'mission_type', mission_type,
        'outcome', outcome,
        'kills', kills,
        'assists', assists,
        'deaths', deaths,
        'flight_hours', flight_hours
    ) as record_data
FROM public.combat_records

UNION ALL

-- Rank Records
SELECT 
    id,
    'rank' as record_type,
    user_id,
    promotion_date::timestamptz as record_date,
    jsonb_build_object(
        'from_rank', from_rank_id,
        'to_rank', to_rank_id,
        'promotion_type', promotion_type,
        'reason', reason
    ) as record_data
FROM public.rank_records

UNION ALL

-- Service Records
SELECT 
    id,
    'service' as record_type,
    user_id,
    effective_date::timestamptz as record_date,
    jsonb_build_object(
        'record_type', record_type,
        'from_status', from_status,
        'to_status', to_status,
        'reason', reason,
        'notes', notes
    ) as record_data
FROM public.service_records

ORDER BY record_date DESC;

-- 13. PERMISOS PARA REGISTROS
INSERT INTO public.permissions (name, description, category) VALUES
('records.view', 'Ver registros de personal', 'Registros'),
('records.create', 'Crear registros de personal', 'Registros'),
('records.edit', 'Editar registros de personal', 'Registros'),
('records.delete', 'Eliminar registros de personal', 'Registros');

-- 14. ASIGNAR PERMISOS A ADMINISTRADORES
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'admin' AND p.name LIKE 'records.%';

