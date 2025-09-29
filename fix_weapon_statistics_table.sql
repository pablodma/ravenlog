-- ARREGLAR TABLA weapon_statistics
-- El error indica que no existe la columna "shots"

-- 1. VERIFICAR ESTRUCTURA ACTUAL DE weapon_statistics
SELECT 'ESTRUCTURA ACTUAL DE weapon_statistics:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'weapon_statistics'
ORDER BY ordinal_position;

-- 2. VERIFICAR SI LA TABLA EXISTE
SELECT 'VERIFICAR SI EXISTE weapon_statistics:' as info;
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'weapon_statistics'
) as table_exists;

-- 3. CREAR O ARREGLAR LA TABLA weapon_statistics
DO $$
BEGIN
    -- Si la tabla no existe, crearla completa
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
        
        RAISE NOTICE 'Creada tabla weapon_statistics completa';
        
    ELSE
        -- Si la tabla existe, agregar columnas faltantes
        
        -- Agregar user_id si no existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'weapon_statistics' AND column_name = 'user_id') THEN
            ALTER TABLE public.weapon_statistics ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid();
            RAISE NOTICE 'Agregada columna user_id a weapon_statistics';
        END IF;
        
        -- Agregar weapon_name si no existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'weapon_statistics' AND column_name = 'weapon_name') THEN
            ALTER TABLE public.weapon_statistics ADD COLUMN weapon_name TEXT NOT NULL DEFAULT 'Unknown';
            RAISE NOTICE 'Agregada columna weapon_name a weapon_statistics';
        END IF;
        
        -- Agregar shots si no existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'weapon_statistics' AND column_name = 'shots') THEN
            ALTER TABLE public.weapon_statistics ADD COLUMN shots INTEGER DEFAULT 0;
            RAISE NOTICE 'Agregada columna shots a weapon_statistics';
        END IF;
        
        -- Agregar hits si no existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'weapon_statistics' AND column_name = 'hits') THEN
            ALTER TABLE public.weapon_statistics ADD COLUMN hits INTEGER DEFAULT 0;
            RAISE NOTICE 'Agregada columna hits a weapon_statistics';
        END IF;
        
        -- Agregar kills si no existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'weapon_statistics' AND column_name = 'kills') THEN
            ALTER TABLE public.weapon_statistics ADD COLUMN kills INTEGER DEFAULT 0;
            RAISE NOTICE 'Agregada columna kills a weapon_statistics';
        END IF;
        
        -- Agregar id si no existe (como primary key)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_schema = 'public' AND table_name = 'weapon_statistics' AND column_name = 'id') THEN
            ALTER TABLE public.weapon_statistics ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
            RAISE NOTICE 'Agregada columna id a weapon_statistics';
        END IF;
        
    END IF;
END
$$;

-- 4. CREAR ÍNDICE ÚNICO SI NO EXISTE
DO $$
BEGIN
    -- Crear índice único para user_id + weapon_name si no existe
    IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                   WHERE schemaname = 'public' AND tablename = 'weapon_statistics' 
                   AND indexname = 'weapon_statistics_user_id_weapon_name_key') THEN
        
        -- Primero eliminar duplicados si existen
        DELETE FROM public.weapon_statistics a USING public.weapon_statistics b 
        WHERE a.id > b.id AND a.user_id = b.user_id AND a.weapon_name = b.weapon_name;
        
        -- Crear el índice único
        ALTER TABLE public.weapon_statistics ADD CONSTRAINT weapon_statistics_user_id_weapon_name_key UNIQUE (user_id, weapon_name);
        RAISE NOTICE 'Creado índice único para user_id + weapon_name';
    END IF;
END
$$;

-- 5. HABILITAR RLS Y CREAR POLÍTICAS
ALTER TABLE public.weapon_statistics ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para recrearlas
DO $$
DECLARE
    policy_name text;
BEGIN
    FOR policy_name IN (SELECT policyname FROM pg_policies WHERE tablename = 'weapon_statistics' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.weapon_statistics;';
    END LOOP;
END
$$;

-- Crear políticas RLS
CREATE POLICY "Users can view their own weapon statistics" ON public.weapon_statistics
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own weapon statistics" ON public.weapon_statistics
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own weapon statistics" ON public.weapon_statistics
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own weapon statistics" ON public.weapon_statistics
    FOR DELETE USING (user_id = auth.uid());

-- 6. VERIFICAR ESTRUCTURA FINAL
SELECT 'ESTRUCTURA FINAL DE weapon_statistics:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'weapon_statistics'
ORDER BY ordinal_position;

-- 7. INSERTAR DATOS DE PRUEBA PARA EL USUARIO
INSERT INTO public.weapon_statistics (user_id, weapon_name, shots, hits, kills) 
VALUES 
    ('00078c40-0744-4cec-aefa-73baeda0e7f0', 'AIM-120C', 50, 45, 3),
    ('00078c40-0744-4cec-aefa-73baeda0e7f0', 'M61 Vulcan', 80, 60, 4),
    ('00078c40-0744-4cec-aefa-73baeda0e7f0', 'GBU-12', 20, 15, 1)
ON CONFLICT (user_id, weapon_name) DO UPDATE SET
    shots = EXCLUDED.shots,
    hits = EXCLUDED.hits,
    kills = EXCLUDED.kills;

-- 8. VERIFICAR DATOS INSERTADOS
SELECT 'DATOS DE PRUEBA INSERTADOS:' as info;
SELECT * FROM public.weapon_statistics 
WHERE user_id = '00078c40-0744-4cec-aefa-73baeda0e7f0'
ORDER BY shots DESC;

-- 9. PROBAR LA CONSULTA QUE ESTABA FALLANDO
SELECT 'PRUEBA DE CONSULTA ORDER BY shots DESC:' as info;
SELECT weapon_name, shots, hits, kills
FROM public.weapon_statistics 
WHERE user_id = '00078c40-0744-4cec-aefa-73baeda0e7f0'
ORDER BY shots DESC;
