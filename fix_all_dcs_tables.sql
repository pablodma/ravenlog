-- ARREGLAR TODAS LAS TABLAS DCS DE UNA VEZ
-- Solucionar errores 406/400 en user_statistics y otras tablas

-- 1. VERIFICAR QUE TABLAS EXISTEN ACTUALMENTE
SELECT 'TABLAS DCS EXISTENTES:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('log_files', 'user_statistics', 'weapon_statistics', 'flight_events')
ORDER BY table_name;

-- 2. CREAR/ARREGLAR TABLA user_statistics
DO $$
BEGIN
    -- Si la tabla no existe, crearla
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'public' AND table_name = 'user_statistics') THEN
        
        CREATE TABLE public.user_statistics (
            user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
            total_missions INTEGER DEFAULT 0,
            total_takeoffs INTEGER DEFAULT 0,
            total_landings INTEGER DEFAULT 0,
            total_shots INTEGER DEFAULT 0,
            total_hits INTEGER DEFAULT 0,
            total_kills INTEGER DEFAULT 0,
            total_deaths INTEGER DEFAULT 0,
            total_flight_time_seconds INTEGER DEFAULT 0,
            last_updated TIMESTAMPTZ DEFAULT NOW()
        );
        
        RAISE NOTICE 'Creada tabla user_statistics';
        
    ELSE
        -- Agregar columnas faltantes si la tabla existe
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'user_statistics' AND column_name = 'user_id') THEN
            ALTER TABLE public.user_statistics ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
            RAISE NOTICE 'Agregada columna user_id a user_statistics';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'user_statistics' AND column_name = 'total_missions') THEN
            ALTER TABLE public.user_statistics ADD COLUMN total_missions INTEGER DEFAULT 0;
            RAISE NOTICE 'Agregada columna total_missions a user_statistics';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'user_statistics' AND column_name = 'total_takeoffs') THEN
            ALTER TABLE public.user_statistics ADD COLUMN total_takeoffs INTEGER DEFAULT 0;
            RAISE NOTICE 'Agregada columna total_takeoffs a user_statistics';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'user_statistics' AND column_name = 'total_landings') THEN
            ALTER TABLE public.user_statistics ADD COLUMN total_landings INTEGER DEFAULT 0;
            RAISE NOTICE 'Agregada columna total_landings a user_statistics';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'user_statistics' AND column_name = 'total_shots') THEN
            ALTER TABLE public.user_statistics ADD COLUMN total_shots INTEGER DEFAULT 0;
            RAISE NOTICE 'Agregada columna total_shots a user_statistics';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'user_statistics' AND column_name = 'total_hits') THEN
            ALTER TABLE public.user_statistics ADD COLUMN total_hits INTEGER DEFAULT 0;
            RAISE NOTICE 'Agregada columna total_hits a user_statistics';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'user_statistics' AND column_name = 'total_kills') THEN
            ALTER TABLE public.user_statistics ADD COLUMN total_kills INTEGER DEFAULT 0;
            RAISE NOTICE 'Agregada columna total_kills a user_statistics';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'user_statistics' AND column_name = 'total_deaths') THEN
            ALTER TABLE public.user_statistics ADD COLUMN total_deaths INTEGER DEFAULT 0;
            RAISE NOTICE 'Agregada columna total_deaths a user_statistics';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'user_statistics' AND column_name = 'total_flight_time_seconds') THEN
            ALTER TABLE public.user_statistics ADD COLUMN total_flight_time_seconds INTEGER DEFAULT 0;
            RAISE NOTICE 'Agregada columna total_flight_time_seconds a user_statistics';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'user_statistics' AND column_name = 'last_updated') THEN
            ALTER TABLE public.user_statistics ADD COLUMN last_updated TIMESTAMPTZ DEFAULT NOW();
            RAISE NOTICE 'Agregada columna last_updated a user_statistics';
        END IF;
        
    END IF;
END
$$;

-- 3. CREAR/ARREGLAR TABLA weapon_statistics
DO $$
BEGIN
    -- Si la tabla no existe, crearla
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'public' AND table_name = 'weapon_statistics') THEN
        
        CREATE TABLE public.weapon_statistics (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
            weapon_name TEXT NOT NULL,
            shots INTEGER DEFAULT 0,
            hits INTEGER DEFAULT 0,
            kills INTEGER DEFAULT 0,
            UNIQUE(user_id, weapon_name)
        );
        
        RAISE NOTICE 'Creada tabla weapon_statistics';
        
    ELSE
        -- Agregar columnas faltantes
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'weapon_statistics' AND column_name = 'id') THEN
            ALTER TABLE public.weapon_statistics ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
            RAISE NOTICE 'Agregada columna id a weapon_statistics';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'weapon_statistics' AND column_name = 'user_id') THEN
            ALTER TABLE public.weapon_statistics ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid();
            RAISE NOTICE 'Agregada columna user_id a weapon_statistics';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'weapon_statistics' AND column_name = 'weapon_name') THEN
            ALTER TABLE public.weapon_statistics ADD COLUMN weapon_name TEXT NOT NULL DEFAULT 'Unknown';
            RAISE NOTICE 'Agregada columna weapon_name a weapon_statistics';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'weapon_statistics' AND column_name = 'shots') THEN
            ALTER TABLE public.weapon_statistics ADD COLUMN shots INTEGER DEFAULT 0;
            RAISE NOTICE 'Agregada columna shots a weapon_statistics';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'weapon_statistics' AND column_name = 'hits') THEN
            ALTER TABLE public.weapon_statistics ADD COLUMN hits INTEGER DEFAULT 0;
            RAISE NOTICE 'Agregada columna hits a weapon_statistics';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'weapon_statistics' AND column_name = 'kills') THEN
            ALTER TABLE public.weapon_statistics ADD COLUMN kills INTEGER DEFAULT 0;
            RAISE NOTICE 'Agregada columna kills a weapon_statistics';
        END IF;
        
    END IF;
END
$$;

-- 4. CREAR/ARREGLAR TABLA log_files
DO $$
BEGIN
    -- Si la tabla no existe, crearla
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'public' AND table_name = 'log_files') THEN
        
        CREATE TABLE public.log_files (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
            filename TEXT NOT NULL,
            file_size INTEGER DEFAULT 0,
            file_hash TEXT UNIQUE NOT NULL,
            processed_at TIMESTAMPTZ DEFAULT NOW(),
            events_count INTEGER DEFAULT 0,
            status TEXT DEFAULT 'processed' CHECK (status IN ('processing', 'processed', 'error', 'duplicate')),
            summary JSONB,
            error_message TEXT
        );
        
        RAISE NOTICE 'Creada tabla log_files';
        
    ELSE
        -- Agregar columnas faltantes
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'user_id') THEN
            ALTER TABLE public.log_files ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid();
            RAISE NOTICE 'Agregada columna user_id a log_files';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'filename') THEN
            ALTER TABLE public.log_files ADD COLUMN filename TEXT NOT NULL DEFAULT 'unknown.log';
            RAISE NOTICE 'Agregada columna filename a log_files';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'file_size') THEN
            ALTER TABLE public.log_files ADD COLUMN file_size INTEGER DEFAULT 0;
            RAISE NOTICE 'Agregada columna file_size a log_files';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'file_hash') THEN
            ALTER TABLE public.log_files ADD COLUMN file_hash TEXT UNIQUE NOT NULL DEFAULT '';
            RAISE NOTICE 'Agregada columna file_hash a log_files';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'processed_at') THEN
            ALTER TABLE public.log_files ADD COLUMN processed_at TIMESTAMPTZ DEFAULT NOW();
            RAISE NOTICE 'Agregada columna processed_at a log_files';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'events_count') THEN
            ALTER TABLE public.log_files ADD COLUMN events_count INTEGER DEFAULT 0;
            RAISE NOTICE 'Agregada columna events_count a log_files';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'status') THEN
            ALTER TABLE public.log_files ADD COLUMN status TEXT DEFAULT 'processed' CHECK (status IN ('processing', 'processed', 'error', 'duplicate'));
            RAISE NOTICE 'Agregada columna status a log_files';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'summary') THEN
            ALTER TABLE public.log_files ADD COLUMN summary JSONB;
            RAISE NOTICE 'Agregada columna summary a log_files';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'error_message') THEN
            ALTER TABLE public.log_files ADD COLUMN error_message TEXT;
            RAISE NOTICE 'Agregada columna error_message a log_files';
        END IF;
        
    END IF;
END
$$;

-- 5. HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weapon_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_files ENABLE ROW LEVEL SECURITY;

-- 6. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
DO $$
DECLARE
    policy_name text;
    table_name text;
BEGIN
    FOR table_name IN VALUES ('user_statistics'), ('weapon_statistics'), ('log_files')
    LOOP
        FOR policy_name IN (SELECT policyname FROM pg_policies WHERE tablename = table_name AND schemaname = 'public')
        LOOP
            EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.' || table_name || ';';
        END LOOP;
    END LOOP;
END
$$;

-- 7. CREAR POLÍTICAS RLS PARA TODAS LAS TABLAS

-- Políticas para user_statistics
CREATE POLICY "Users can view their own statistics" ON public.user_statistics
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own statistics" ON public.user_statistics
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own statistics" ON public.user_statistics
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Políticas para weapon_statistics
CREATE POLICY "Users can view their own weapon statistics" ON public.weapon_statistics
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own weapon statistics" ON public.weapon_statistics
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own weapon statistics" ON public.weapon_statistics
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Políticas para log_files
CREATE POLICY "Users can view their own log files" ON public.log_files
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own log files" ON public.log_files
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own log files" ON public.log_files
    FOR DELETE USING (user_id = auth.uid());

-- 8. INSERTAR DATOS DE PRUEBA PARA EL USUARIO
-- Insertar estadísticas generales
INSERT INTO public.user_statistics (
    user_id, total_missions, total_takeoffs, total_landings, 
    total_shots, total_hits, total_kills, total_deaths, total_flight_time_seconds
) VALUES (
    '00078c40-0744-4cec-aefa-73baeda0e7f0', 5, 12, 10, 150, 120, 8, 2, 7200
) ON CONFLICT (user_id) DO UPDATE SET
    total_missions = EXCLUDED.total_missions,
    total_takeoffs = EXCLUDED.total_takeoffs,
    total_landings = EXCLUDED.total_landings,
    total_shots = EXCLUDED.total_shots,
    total_hits = EXCLUDED.total_hits,
    total_kills = EXCLUDED.total_kills,
    total_deaths = EXCLUDED.total_deaths,
    total_flight_time_seconds = EXCLUDED.total_flight_time_seconds,
    last_updated = NOW();

-- Insertar estadísticas por arma
INSERT INTO public.weapon_statistics (user_id, weapon_name, shots, hits, kills) VALUES
    ('00078c40-0744-4cec-aefa-73baeda0e7f0', 'AIM-120C', 50, 45, 3),
    ('00078c40-0744-4cec-aefa-73baeda0e7f0', 'M61 Vulcan', 80, 60, 4),
    ('00078c40-0744-4cec-aefa-73baeda0e7f0', 'GBU-12', 20, 15, 1)
ON CONFLICT (user_id, weapon_name) DO UPDATE SET
    shots = EXCLUDED.shots,
    hits = EXCLUDED.hits,
    kills = EXCLUDED.kills;

-- 9. VERIFICAR ESTRUCTURA FINAL DE TODAS LAS TABLAS
SELECT 'ESTRUCTURA FINAL - user_statistics:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'user_statistics'
ORDER BY ordinal_position;

SELECT 'ESTRUCTURA FINAL - weapon_statistics:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'weapon_statistics'
ORDER BY ordinal_position;

SELECT 'ESTRUCTURA FINAL - log_files:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'log_files'
ORDER BY ordinal_position;

-- 10. PROBAR LAS CONSULTAS QUE ESTABAN FALLANDO
SELECT 'PRUEBA - user_statistics:' as info;
SELECT * FROM public.user_statistics 
WHERE user_id = '00078c40-0744-4cec-aefa-73baeda0e7f0';

SELECT 'PRUEBA - weapon_statistics ORDER BY shots DESC:' as info;
SELECT weapon_name, shots, hits, kills
FROM public.weapon_statistics 
WHERE user_id = '00078c40-0744-4cec-aefa-73baeda0e7f0'
ORDER BY shots DESC;
