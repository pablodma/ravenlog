-- Crear tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'candidate' CHECK (role IN ('admin', 'personnel', 'candidate')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla de rangos
CREATE TABLE IF NOT EXISTS public.ranks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    abbreviation TEXT NOT NULL UNIQUE,
    "order" INTEGER NOT NULL UNIQUE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla de personal
CREATE TABLE IF NOT EXISTS public.personnel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    callsign TEXT NOT NULL UNIQUE,
    rank_id UUID REFERENCES public.ranks(id) ON DELETE RESTRICT NOT NULL,
    flight_unit TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'leave', 'discharged')),
    enlistment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    discord_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla de solicitudes de enlistamiento
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'accepted', 'rejected')),
    callsign_requested TEXT NOT NULL,
    motivation TEXT NOT NULL,
    experience_level TEXT NOT NULL CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    preferred_role TEXT NOT NULL CHECK (preferred_role IN ('fighter', 'attacker', 'transport', 'rotary', 'awacs', 'tanker')),
    availability TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.profiles(id),
    notes TEXT,
    UNIQUE(profile_id) -- Solo una solicitud activa por usuario
);

-- Crear tabla de certificaciones
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    requirements TEXT NOT NULL,
    image_url TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla de certificaciones de personal
CREATE TABLE IF NOT EXISTS public.personnel_certifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    personnel_id UUID REFERENCES public.personnel(id) ON DELETE CASCADE NOT NULL,
    certification_id UUID REFERENCES public.certifications(id) ON DELETE CASCADE NOT NULL,
    awarded_by UUID REFERENCES public.personnel(id) ON DELETE SET NULL NOT NULL,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    UNIQUE(personnel_id, certification_id)
);

-- Crear tabla de medallas
CREATE TABLE IF NOT EXISTS public.medals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    requirements TEXT NOT NULL,
    image_url TEXT,
    rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
    points INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla de medallas de personal
CREATE TABLE IF NOT EXISTS public.personnel_medals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    personnel_id UUID REFERENCES public.personnel(id) ON DELETE CASCADE NOT NULL,
    medal_id UUID REFERENCES public.medals(id) ON DELETE CASCADE NOT NULL,
    awarded_by UUID REFERENCES public.personnel(id) ON DELETE SET NULL NOT NULL,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    reason TEXT,
    UNIQUE(personnel_id, medal_id)
);

-- Crear tabla de logs de DCS
CREATE TABLE IF NOT EXISTS public.dcs_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    personnel_id UUID REFERENCES public.personnel(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    mission_name TEXT,
    server_name TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_personnel_status ON public.personnel(status);
CREATE INDEX IF NOT EXISTS idx_personnel_rank ON public.personnel(rank_id);
CREATE INDEX IF NOT EXISTS idx_personnel_callsign ON public.personnel(callsign);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_submitted ON public.enrollments(submitted_at);
CREATE INDEX IF NOT EXISTS idx_personnel_certs_personnel ON public.personnel_certifications(personnel_id);
CREATE INDEX IF NOT EXISTS idx_personnel_medals_personnel ON public.personnel_medals(personnel_id);
CREATE INDEX IF NOT EXISTS idx_dcs_logs_personnel ON public.dcs_logs(personnel_id);
CREATE INDEX IF NOT EXISTS idx_dcs_logs_timestamp ON public.dcs_logs(timestamp);

-- Configurar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personnel_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personnel_medals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dcs_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para profiles
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Los admins pueden ver todos los perfiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para ranks (lectura pública, escritura solo admins)
CREATE POLICY "Todos pueden ver los rangos" ON public.ranks FOR SELECT TO authenticated USING (true);

CREATE POLICY "Solo admins pueden modificar rangos" ON public.ranks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para personnel
CREATE POLICY "Personal y admins pueden ver el personal" ON public.personnel
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('personnel', 'admin')
        )
    );

CREATE POLICY "Los usuarios pueden ver su propio registro de personal" ON public.personnel
    FOR SELECT USING (profile_id = auth.uid());

-- Políticas para enrollments
CREATE POLICY "Los usuarios pueden ver sus propias solicitudes" ON public.enrollments
    FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Los usuarios pueden crear sus solicitudes" ON public.enrollments
    FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Personal y admins pueden ver todas las solicitudes" ON public.enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('personnel', 'admin')
        )
    );

-- Función para actualizar timestamp de updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.personnel
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
