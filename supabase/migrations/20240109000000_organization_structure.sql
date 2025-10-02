-- MÓDULO DE ORGANIZACIÓN: Grupos, Especialidades, Calificaciones y Estados
-- Migration: 20240109000000_organization_structure.sql

-- 1. TABLA DE GRUPOS (Grupos pueden contener múltiples unidades)
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6B7280',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ACTUALIZAR TABLA units PARA AGREGAR group_id
ALTER TABLE public.units
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL;

-- 3. TABLA DE ESPECIALIDADES (Especialidades de vuelo, técnicas, etc.)
CREATE TABLE IF NOT EXISTS public.specialties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT, -- 'flight', 'technical', 'tactical', etc.
    icon TEXT,
    color TEXT DEFAULT '#6B7280',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE CALIFICACIONES (Certificaciones, cursos completados)
CREATE TABLE IF NOT EXISTS public.qualifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT, -- 'aircraft', 'weapon_system', 'tactical', etc.
    requirements TEXT, -- Requisitos para obtenerla
    icon TEXT,
    color TEXT DEFAULT '#6B7280',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE ESTADOS PERSONALIZADOS (Más allá de active/inactive)
CREATE TABLE IF NOT EXISTS public.statuses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    type TEXT DEFAULT 'operational', -- 'operational', 'administrative', 'training', etc.
    color TEXT DEFAULT '#6B7280',
    is_default BOOLEAN DEFAULT FALSE,
    allows_operations BOOLEAN DEFAULT TRUE, -- Si permite participar en operaciones
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA DE RELACIÓN: PERFILES Y ESPECIALIDADES (many-to-many)
CREATE TABLE IF NOT EXISTS public.profile_specialties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    specialty_id UUID REFERENCES public.specialties(id) ON DELETE CASCADE,
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    notes TEXT,
    UNIQUE(profile_id, specialty_id)
);

-- 7. TABLA DE RELACIÓN: PERFILES Y CALIFICACIONES (many-to-many)
CREATE TABLE IF NOT EXISTS public.profile_qualifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    qualification_id UUID REFERENCES public.qualifications(id) ON DELETE CASCADE,
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    UNIQUE(profile_id, qualification_id)
);

-- 8. HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_qualifications ENABLE ROW LEVEL SECURITY;

-- 9. POLÍTICAS RLS - LECTURA PÚBLICA
CREATE POLICY "Everyone can view active groups" ON public.groups
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Everyone can view active specialties" ON public.specialties
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Everyone can view active qualifications" ON public.qualifications
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Everyone can view active statuses" ON public.statuses
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can view profile specialties" ON public.profile_specialties
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can view profile qualifications" ON public.profile_qualifications
    FOR SELECT USING (TRUE);

-- 10. POLÍTICAS RLS - ADMINISTRADORES PUEDEN TODO
CREATE POLICY "Admins can manage groups" ON public.groups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name = 'admin'
        )
    );

CREATE POLICY "Admins can manage specialties" ON public.specialties
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name = 'admin'
        )
    );

CREATE POLICY "Admins can manage qualifications" ON public.qualifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name = 'admin'
        )
    );

CREATE POLICY "Admins can manage statuses" ON public.statuses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name = 'admin'
        )
    );

CREATE POLICY "Admins can manage profile specialties" ON public.profile_specialties
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name = 'admin'
        )
    );

CREATE POLICY "Admins can manage profile qualifications" ON public.profile_qualifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name = 'admin'
        )
    );

-- 11. TRIGGERS PARA updated_at
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_specialties_updated_at BEFORE UPDATE ON public.specialties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qualifications_updated_at BEFORE UPDATE ON public.qualifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_statuses_updated_at BEFORE UPDATE ON public.statuses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. INSERTAR DATOS DE EJEMPLO

-- Grupos
INSERT INTO public.groups (name, description, color, display_order) VALUES
('Operaciones de Combate', 'Unidades dedicadas a operaciones de combate y misiones tácticas', '#EF4444', 1),
('Entrenamiento y Desarrollo', 'Unidades enfocadas en formación y desarrollo de personal', '#3B82F6', 2),
('Soporte y Logística', 'Unidades de apoyo operacional y logístico', '#10B981', 3);

-- Especialidades
INSERT INTO public.specialties (name, description, category, color) VALUES
('Air-to-Air Combat', 'Especialización en combate aéreo', 'flight', '#EF4444'),
('Air-to-Ground', 'Especialización en ataque tierra', 'flight', '#F59E0B'),
('Close Air Support', 'Apoyo aéreo cercano', 'tactical', '#10B981'),
('SEAD/DEAD', 'Supresión y destrucción de defensas aéreas enemigas', 'tactical', '#8B5CF6'),
('Aerial Refueling', 'Reabastecimiento en vuelo', 'flight', '#06B6D4'),
('Electronic Warfare', 'Guerra electrónica', 'technical', '#6366F1');

-- Calificaciones
INSERT INTO public.qualifications (name, description, category, color) VALUES
('F/A-18C Hornet', 'Calificación básica en F/A-18C', 'aircraft', '#EF4444'),
('F-16C Viper', 'Calificación básica en F-16C', 'aircraft', '#3B82F6'),
('A-10C Warthog', 'Calificación básica en A-10C', 'aircraft', '#10B981'),
('AH-64D Apache', 'Calificación básica en AH-64D', 'aircraft', '#F59E0B'),
('Instructor Pilot', 'Calificación de piloto instructor', 'tactical', '#8B5CF6'),
('Mission Commander', 'Comandante de misión certificado', 'tactical', '#EC4899');

-- Estados
INSERT INTO public.statuses (name, description, type, color, is_default, allows_operations) VALUES
('Active Duty', 'Personal en servicio activo', 'operational', '#10B981', TRUE, TRUE),
('Training', 'En periodo de entrenamiento', 'training', '#F59E0B', FALSE, FALSE),
('Leave', 'De licencia/permiso', 'administrative', '#6B7280', FALSE, FALSE),
('Reserve', 'Personal de reserva', 'operational', '#3B82F6', FALSE, TRUE),
('Inactive', 'Inactivo temporalmente', 'administrative', '#EF4444', FALSE, FALSE);

-- 13. AGREGAR PERMISOS PARA ORGANIZACIÓN
INSERT INTO public.permissions (name, description, category) VALUES
('organization.groups.manage', 'Gestionar grupos de la organización', 'Organización'),
('organization.specialties.manage', 'Gestionar especialidades', 'Organización'),
('organization.qualifications.manage', 'Gestionar calificaciones', 'Organización'),
('organization.statuses.manage', 'Gestionar estados del personal', 'Organización');

-- 14. ASIGNAR PERMISOS A ADMINISTRADORES
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'admin' AND p.name LIKE 'organization.%';

