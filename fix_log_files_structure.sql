-- ARREGLAR ESTRUCTURA DE TABLAS DCS
-- Script para agregar columnas faltantes a las tablas existentes

-- 1. VERIFICAR ESTRUCTURA ACTUAL DE log_files
SELECT 'ESTRUCTURA ACTUAL DE log_files:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'log_files'
ORDER BY ordinal_position;

-- 2. AGREGAR COLUMNAS FALTANTES A log_files
DO $$
BEGIN
    -- Agregar user_id si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'user_id') THEN
        ALTER TABLE public.log_files ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid();
        RAISE NOTICE 'Agregada columna user_id a log_files';
    END IF;
    
    -- Agregar file_name si no existe (puede que se llame diferente)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'file_name') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'filename') THEN
            ALTER TABLE public.log_files ADD COLUMN filename TEXT NOT NULL DEFAULT 'unknown.log';
            RAISE NOTICE 'Agregada columna filename a log_files';
        END IF;
    END IF;
    
    -- Agregar file_hash si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'file_hash') THEN
        ALTER TABLE public.log_files ADD COLUMN file_hash TEXT UNIQUE NOT NULL DEFAULT '';
        RAISE NOTICE 'Agregada columna file_hash a log_files';
    END IF;
    
    -- Agregar upload_date si no existe (puede que se llame processed_at)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'upload_date') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'processed_at') THEN
            ALTER TABLE public.log_files ADD COLUMN processed_at TIMESTAMPTZ DEFAULT NOW();
            RAISE NOTICE 'Agregada columna processed_at a log_files';
        END IF;
    END IF;
    
    -- Agregar file_size si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'file_size') THEN
        ALTER TABLE public.log_files ADD COLUMN file_size INTEGER DEFAULT 0;
        RAISE NOTICE 'Agregada columna file_size a log_files';
    END IF;
    
    -- Agregar events_count si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'events_count') THEN
        ALTER TABLE public.log_files ADD COLUMN events_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Agregada columna events_count a log_files';
    END IF;
    
    -- Agregar status si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'status') THEN
        ALTER TABLE public.log_files ADD COLUMN status TEXT DEFAULT 'processed' CHECK (status IN ('processing', 'processed', 'error', 'duplicate'));
        RAISE NOTICE 'Agregada columna status a log_files';
    END IF;
    
    -- Agregar processing_summary si no existe (puede que se llame summary)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'processing_summary') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'summary') THEN
            ALTER TABLE public.log_files ADD COLUMN summary JSONB;
            RAISE NOTICE 'Agregada columna summary a log_files';
        END IF;
    END IF;
    
    -- Agregar error_message si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'error_message') THEN
        ALTER TABLE public.log_files ADD COLUMN error_message TEXT;
        RAISE NOTICE 'Agregada columna error_message a log_files';
    END IF;
END
$$;

-- 3. VERIFICAR SI EXISTE user_statistics, SI NO CREARLA
DO $$
BEGIN
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
        -- Agregar columnas faltantes si la tabla ya existe
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
    END IF;
END
$$;

-- 4. VERIFICAR SI EXISTE weapon_statistics, SI NO CREARLA
DO $$
BEGIN
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
        -- Agregar columna kills si no existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'weapon_statistics' AND column_name = 'kills') THEN
            ALTER TABLE public.weapon_statistics ADD COLUMN kills INTEGER DEFAULT 0;
            RAISE NOTICE 'Agregada columna kills a weapon_statistics';
        END IF;
    END IF;
END
$$;

-- 5. VERIFICAR SI EXISTE flight_events, SI NO CREARLA (OPCIONAL)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'public' AND table_name = 'flight_events') THEN
        CREATE TABLE public.flight_events (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            log_file_id UUID REFERENCES public.log_files(id) ON DELETE CASCADE NOT NULL,
            user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
            event_type TEXT NOT NULL,
            event_data JSONB,
            event_timestamp TIMESTAMPTZ NOT NULL
        );
        RAISE NOTICE 'Creada tabla flight_events';
    END IF;
END
$$;

-- 6. HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE public.log_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weapon_statistics ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en flight_events si existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'flight_events') THEN
        ALTER TABLE public.flight_events ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- 7. ELIMINAR POLÍTICAS EXISTENTES PARA RECREARLAS
DO $$
DECLARE
    policy_name text;
BEGIN
    -- Eliminar políticas existentes de log_files
    FOR policy_name IN (SELECT policyname FROM pg_policies WHERE tablename = 'log_files' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.log_files;';
    END LOOP;
    
    -- Eliminar políticas existentes de user_statistics
    FOR policy_name IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_statistics' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.user_statistics;';
    END LOOP;
    
    -- Eliminar políticas existentes de weapon_statistics
    FOR policy_name IN (SELECT policyname FROM pg_policies WHERE tablename = 'weapon_statistics' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.weapon_statistics;';
    END LOOP;
END
$$;

-- 8. CREAR POLÍTICAS RLS
-- Políticas para log_files
CREATE POLICY "Users can view their own log files" ON public.log_files
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own log files" ON public.log_files
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own log files" ON public.log_files
    FOR DELETE USING (user_id = auth.uid());

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

-- Políticas para flight_events (si existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'flight_events') THEN
        
        EXECUTE 'CREATE POLICY "Users can view their own flight events" ON public.flight_events
            FOR SELECT USING (user_id = auth.uid());';
            
        EXECUTE 'CREATE POLICY "Users can insert their own flight events" ON public.flight_events
            FOR INSERT WITH CHECK (user_id = auth.uid());';
    END IF;
END
$$;

-- 9. VERIFICAR ESTRUCTURA FINAL
SELECT 'ESTRUCTURA FINAL DE TABLAS DCS:' as info;

SELECT 'log_files:' as tabla;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'log_files'
ORDER BY ordinal_position;

SELECT 'user_statistics:' as tabla;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'user_statistics'
ORDER BY ordinal_position;

SELECT 'weapon_statistics:' as tabla;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'weapon_statistics'
ORDER BY ordinal_position;

-- 10. VERIFICAR POLÍTICAS RLS
SELECT 'POLÍTICAS RLS CREADAS:' as info;
SELECT tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('log_files', 'user_statistics', 'weapon_statistics', 'flight_events')
ORDER BY tablename, policyname;
