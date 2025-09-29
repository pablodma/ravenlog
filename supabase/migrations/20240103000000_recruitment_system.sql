-- RECRUITMENT SYSTEM: Formularios, Aplicaciones y Unidades
-- Migration: 20240103000000_recruitment_system.sql

-- 1. TABLA DE UNIDADES MILITARES
CREATE TABLE public.units (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    unit_type VARCHAR(50) NOT NULL, -- 'squadron', 'wing', 'group', etc.
    callsign VARCHAR(20),
    image_url TEXT,
    max_personnel INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE FORMULARIOS DE RECLUTAMIENTO (configurables por admin)
CREATE TABLE public.recruitment_forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    fields JSONB NOT NULL, -- Estructura del formulario dinámico
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE APLICACIONES DE RECLUTAMIENTO
CREATE TABLE public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    form_id UUID REFERENCES public.recruitment_forms(id),
    form_data JSONB NOT NULL, -- Respuestas del formulario
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'processed')),
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    processed_by UUID REFERENCES public.profiles(id),
    processed_at TIMESTAMPTZ,
    assigned_rank_id UUID REFERENCES public.ranks(id),
    assigned_unit_id UUID REFERENCES public.units(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ACTUALIZAR TABLA PROFILES para incluir unidad asignada
ALTER TABLE public.profiles 
ADD COLUMN unit_id UUID REFERENCES public.units(id),
ADD COLUMN rank_id UUID REFERENCES public.ranks(id);

-- 5. ÍNDICES para mejorar performance
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_applicant ON public.applications(applicant_id);
CREATE INDEX idx_profiles_unit ON public.profiles(unit_id);
CREATE INDEX idx_profiles_rank ON public.profiles(rank_id);

-- 6. TRIGGERS para updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.units
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.recruitment_forms
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 7. RLS POLICIES

-- Unidades: todos pueden ver, solo admins pueden modificar
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view units" ON public.units
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify units" ON public.units
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Formularios de reclutamiento: todos pueden ver activos, solo admins pueden modificar
ALTER TABLE public.recruitment_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active forms" ON public.recruitment_forms
    FOR SELECT USING (is_active = true OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can modify forms" ON public.recruitment_forms
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Aplicaciones: usuarios ven las suyas, admins ven todas
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own applications" ON public.applications
    FOR SELECT USING (
        applicant_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can create their own applications" ON public.applications
    FOR INSERT WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "Users can update their pending applications" ON public.applications
    FOR UPDATE USING (
        applicant_id = auth.uid() AND status = 'pending'
    );

CREATE POLICY "Only admins can review applications" ON public.applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 8. FUNCIÓN PARA CAMBIAR ESTADO DE APLICACIÓN
CREATE OR REPLACE FUNCTION public.update_application_status(
    application_id UUID,
    new_status VARCHAR,
    notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    UPDATE public.applications 
    SET 
        status = new_status,
        reviewed_by = CASE WHEN new_status IN ('in_review', 'approved', 'rejected') THEN auth.uid() ELSE reviewed_by END,
        reviewed_at = CASE WHEN new_status IN ('in_review', 'approved', 'rejected') THEN NOW() ELSE reviewed_at END,
        review_notes = COALESCE(notes, review_notes),
        processed_by = CASE WHEN new_status = 'processed' THEN auth.uid() ELSE processed_by END,
        processed_at = CASE WHEN new_status = 'processed' THEN NOW() ELSE processed_at END,
        updated_at = NOW()
    WHERE id = application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. FUNCIÓN PARA PROCESAR CANDIDATO (asignar rango y unidad)
CREATE OR REPLACE FUNCTION public.process_candidate(
    application_id UUID,
    rank_id UUID,
    unit_id UUID
) RETURNS VOID AS $$
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
