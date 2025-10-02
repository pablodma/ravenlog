-- UNIT POSITIONS: Posiciones de combate dentro de cada unidad
-- Migration: 20240107000000_unit_positions.sql

-- 1. TABLA DE POSICIONES DE UNIDAD (etiquetas descriptivas)
CREATE TABLE public.unit_positions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_leadership BOOLEAN DEFAULT FALSE, -- Marcador visual si es liderazgo
    color VARCHAR(7) DEFAULT '#6B7280', -- Color hex para UI
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, unit_id) -- Mismo nombre puede existir en diferentes unidades
);

-- 2. AGREGAR POSICIÓN A PROFILES
ALTER TABLE public.profiles 
ADD COLUMN position_id UUID REFERENCES public.unit_positions(id);

-- 3. ÍNDICES para performance
CREATE INDEX idx_unit_positions_unit_id ON public.unit_positions(unit_id);
CREATE INDEX idx_profiles_position_id ON public.profiles(position_id);

-- 4. TRIGGER para updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.unit_positions
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 5. RLS POLICIES
ALTER TABLE public.unit_positions ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver las posiciones
CREATE POLICY "unit_positions_select_policy" ON public.unit_positions
    FOR SELECT USING (true);

-- Solo admins pueden crear posiciones
CREATE POLICY "unit_positions_insert_policy" ON public.unit_positions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Solo admins pueden actualizar posiciones
CREATE POLICY "unit_positions_update_policy" ON public.unit_positions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Solo admins pueden eliminar posiciones
CREATE POLICY "unit_positions_delete_policy" ON public.unit_positions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 6. ACTUALIZAR FUNCIÓN process_candidate para incluir posición
CREATE OR REPLACE FUNCTION public.process_candidate(
    application_id UUID,
    rank_id UUID,
    unit_id UUID,
    position_id UUID DEFAULT NULL -- Nuevo parámetro opcional
)
RETURNS VOID AS $$
DECLARE
    applicant_user_id UUID;
BEGIN
    -- Obtener ID del aplicante
    SELECT applicant_id INTO applicant_user_id 
    FROM public.applications 
    WHERE id = application_id;
    
    -- Actualizar perfil del usuario
    UPDATE public.profiles 
    SET 
        role = 'personnel',
        rank_id = process_candidate.rank_id,
        unit_id = process_candidate.unit_id,
        position_id = process_candidate.position_id, -- Nueva columna
        updated_at = NOW()
    WHERE id = applicant_user_id;
    
    -- Marcar aplicación como procesada
    UPDATE public.applications 
    SET 
        status = 'processed',
        assigned_rank_id = process_candidate.rank_id,
        assigned_unit_id = process_candidate.unit_id,
        processed_by = auth.uid(),
        processed_at = NOW(),
        updated_at = NOW()
    WHERE id = application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. COMENTARIOS para documentación
COMMENT ON TABLE public.unit_positions IS 'Posiciones de combate dentro de cada unidad (etiquetas descriptivas sin permisos)';
COMMENT ON COLUMN public.unit_positions.name IS 'Nombre de la posición (ej: Líder de Escuadrón, Piloto de Combate)';
COMMENT ON COLUMN public.unit_positions.unit_id IS 'Unidad a la que pertenece esta posición';
COMMENT ON COLUMN public.unit_positions.is_leadership IS 'Indicador visual si es posición de liderazgo';
COMMENT ON COLUMN public.unit_positions.color IS 'Color para mostrar en UI';
COMMENT ON COLUMN public.profiles.position_id IS 'Posición operacional del usuario en su unidad';

