-- VERIFICAR Y AJUSTAR TABLAS DCS EXISTENTES
-- Script para verificar el estado actual de las tablas DCS y ajustarlas si es necesario

-- 1. VERIFICAR QUE TABLAS EXISTEN
SELECT 'TABLAS EXISTENTES:' as info;
SELECT table_name, table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('log_files', 'user_statistics', 'weapon_statistics', 'flight_events')
ORDER BY table_name;

-- 2. VERIFICAR ESTRUCTURA DE log_files
SELECT 'ESTRUCTURA DE log_files:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'log_files'
ORDER BY ordinal_position;

-- 3. VERIFICAR ESTRUCTURA DE user_statistics
SELECT 'ESTRUCTURA DE user_statistics:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'user_statistics'
ORDER BY ordinal_position;

-- 4. VERIFICAR ESTRUCTURA DE weapon_statistics
SELECT 'ESTRUCTURA DE weapon_statistics:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'weapon_statistics'
ORDER BY ordinal_position;

-- 5. VERIFICAR POLÍTICAS RLS
SELECT 'POLÍTICAS RLS PARA TABLAS DCS:' as info;
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('log_files', 'user_statistics', 'weapon_statistics', 'flight_events')
ORDER BY tablename, policyname;

-- 6. AGREGAR COLUMNAS FALTANTES SI NO EXISTEN

-- Verificar y agregar columnas a log_files si faltan
DO $$
BEGIN
    -- Agregar file_hash si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'file_hash') THEN
        ALTER TABLE public.log_files ADD COLUMN file_hash TEXT UNIQUE;
        RAISE NOTICE 'Agregada columna file_hash a log_files';
    END IF;
    
    -- Agregar filename si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'filename') THEN
        ALTER TABLE public.log_files ADD COLUMN filename TEXT NOT NULL DEFAULT 'unknown.log';
        RAISE NOTICE 'Agregada columna filename a log_files';
    END IF;
    
    -- Agregar file_size si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'file_size') THEN
        ALTER TABLE public.log_files ADD COLUMN file_size INTEGER DEFAULT 0;
        RAISE NOTICE 'Agregada columna file_size a log_files';
    END IF;
    
    -- Agregar processed_at si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'processed_at') THEN
        ALTER TABLE public.log_files ADD COLUMN processed_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Agregada columna processed_at a log_files';
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
    
    -- Agregar summary si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'summary') THEN
        ALTER TABLE public.log_files ADD COLUMN summary JSONB;
        RAISE NOTICE 'Agregada columna summary a log_files';
    END IF;
    
    -- Agregar error_message si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'log_files' AND column_name = 'error_message') THEN
        ALTER TABLE public.log_files ADD COLUMN error_message TEXT;
        RAISE NOTICE 'Agregada columna error_message a log_files';
    END IF;
END
$$;

-- Verificar y agregar columnas a user_statistics si faltan
DO $$
BEGIN
    -- Agregar total_kills si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'user_statistics' AND column_name = 'total_kills') THEN
        ALTER TABLE public.user_statistics ADD COLUMN total_kills INTEGER DEFAULT 0;
        RAISE NOTICE 'Agregada columna total_kills a user_statistics';
    END IF;
    
    -- Agregar total_deaths si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'user_statistics' AND column_name = 'total_deaths') THEN
        ALTER TABLE public.user_statistics ADD COLUMN total_deaths INTEGER DEFAULT 0;
        RAISE NOTICE 'Agregada columna total_deaths a user_statistics';
    END IF;
END
$$;

-- Verificar y agregar columnas a weapon_statistics si faltan
DO $$
BEGIN
    -- Agregar kills si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'weapon_statistics' AND column_name = 'kills') THEN
        ALTER TABLE public.weapon_statistics ADD COLUMN kills INTEGER DEFAULT 0;
        RAISE NOTICE 'Agregada columna kills a weapon_statistics';
    END IF;
END
$$;

-- 7. CREAR POLÍTICAS RLS SI NO EXISTEN

-- Habilitar RLS en todas las tablas DCS
ALTER TABLE public.log_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weapon_statistics ENABLE ROW LEVEL SECURITY;

-- Crear políticas para log_files si no existen
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'log_files' AND policyname = 'Users can view their own log files') THEN
        CREATE POLICY "Users can view their own log files" ON public.log_files
            FOR SELECT USING (user_id = auth.uid());
        RAISE NOTICE 'Creada política: Users can view their own log files';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'log_files' AND policyname = 'Users can insert their own log files') THEN
        CREATE POLICY "Users can insert their own log files" ON public.log_files
            FOR INSERT WITH CHECK (user_id = auth.uid());
        RAISE NOTICE 'Creada política: Users can insert their own log files';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'log_files' AND policyname = 'Users can delete their own log files') THEN
        CREATE POLICY "Users can delete their own log files" ON public.log_files
            FOR DELETE USING (user_id = auth.uid());
        RAISE NOTICE 'Creada política: Users can delete their own log files';
    END IF;
END
$$;

-- Crear políticas para user_statistics si no existen
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_statistics' AND policyname = 'Users can view their own statistics') THEN
        CREATE POLICY "Users can view their own statistics" ON public.user_statistics
            FOR SELECT USING (user_id = auth.uid());
        RAISE NOTICE 'Creada política: Users can view their own statistics';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_statistics' AND policyname = 'Users can update their own statistics') THEN
        CREATE POLICY "Users can update their own statistics" ON public.user_statistics
            FOR UPDATE USING (user_id = auth.uid());
        RAISE NOTICE 'Creada política: Users can update their own statistics';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_statistics' AND policyname = 'Users can insert their own statistics') THEN
        CREATE POLICY "Users can insert their own statistics" ON public.user_statistics
            FOR INSERT WITH CHECK (user_id = auth.uid());
        RAISE NOTICE 'Creada política: Users can insert their own statistics';
    END IF;
END
$$;

-- Crear políticas para weapon_statistics si no existen
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'weapon_statistics' AND policyname = 'Users can view their own weapon statistics') THEN
        CREATE POLICY "Users can view their own weapon statistics" ON public.weapon_statistics
            FOR SELECT USING (user_id = auth.uid());
        RAISE NOTICE 'Creada política: Users can view their own weapon statistics';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'weapon_statistics' AND policyname = 'Users can update their own weapon statistics') THEN
        CREATE POLICY "Users can update their own weapon statistics" ON public.weapon_statistics
            FOR UPDATE USING (user_id = auth.uid());
        RAISE NOTICE 'Creada política: Users can update their own weapon statistics';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'weapon_statistics' AND policyname = 'Users can insert their own weapon statistics') THEN
        CREATE POLICY "Users can insert their own weapon statistics" ON public.weapon_statistics
            FOR INSERT WITH CHECK (user_id = auth.uid());
        RAISE NOTICE 'Creada política: Users can insert their own weapon statistics';
    END IF;
END
$$;

-- 8. VERIFICAR ESTADO FINAL
SELECT 'VERIFICACIÓN FINAL - TABLAS DCS:' as info;
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as column_count,
       (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.table_name) as policy_count
FROM information_schema.tables t
WHERE t.table_schema = 'public' 
AND t.table_name IN ('log_files', 'user_statistics', 'weapon_statistics', 'flight_events')
ORDER BY t.table_name;
