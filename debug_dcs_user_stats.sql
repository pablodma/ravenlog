-- DIAGNOSTICAR ESTADÍSTICAS DCS PARA USUARIO ESPECÍFICO
-- Usuario: pabloignacio.d@gmail.com (ID: 00078c40-0744-4cec-aefa-73baeda0e7f0)

-- 1. VERIFICAR SI EL USUARIO EXISTE Y SU INFORMACIÓN
SELECT 'INFORMACIÓN DEL USUARIO:' as info;
SELECT id, email, full_name, role, role_id, created_at
FROM public.profiles 
WHERE id = '00078c40-0744-4cec-aefa-73baeda0e7f0' OR email = 'pabloignacio.d@gmail.com';

-- 2. VERIFICAR ESTADÍSTICAS DEL USUARIO EN user_statistics
SELECT 'ESTADÍSTICAS EN user_statistics:' as info;
SELECT * FROM public.user_statistics 
WHERE user_id = '00078c40-0744-4cec-aefa-73baeda0e7f0';

-- 3. VERIFICAR ESTADÍSTICAS POR ARMA EN weapon_statistics
SELECT 'ESTADÍSTICAS EN weapon_statistics:' as info;
SELECT * FROM public.weapon_statistics 
WHERE user_id = '00078c40-0744-4cec-aefa-73baeda0e7f0'
ORDER BY shots DESC;

-- 4. VERIFICAR ARCHIVOS DE LOG EN log_files
SELECT 'ARCHIVOS DE LOG EN log_files:' as info;
SELECT id, filename, file_size, processed_at, events_count, status, summary, error_message
FROM public.log_files 
WHERE user_id = '00078c40-0744-4cec-aefa-73baeda0e7f0'
ORDER BY processed_at DESC;

-- 5. VERIFICAR EVENTOS DE VUELO EN flight_events (si existen)
SELECT 'EVENTOS EN flight_events:' as info;
SELECT COUNT(*) as total_events, event_type, COUNT(*) as count_by_type
FROM public.flight_events 
WHERE user_id = '00078c40-0744-4cec-aefa-73baeda0e7f0'
GROUP BY event_type
ORDER BY count_by_type DESC;

-- 6. VERIFICAR POLÍTICAS RLS PARA LAS TABLAS DCS
SELECT 'POLÍTICAS RLS ACTIVAS:' as info;
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('user_statistics', 'weapon_statistics', 'log_files')
ORDER BY tablename, policyname;

-- 7. PROBAR CONSULTAS DIRECTAS COMO EL USUARIO (simulando RLS)
-- Simular la consulta que hace el frontend para user_statistics
SELECT 'PRUEBA CONSULTA user_statistics (simulando RLS):' as info;
SET LOCAL "request.jwt.claims" = '{"sub": "00078c40-0744-4cec-aefa-73baeda0e7f0"}';
SELECT * FROM public.user_statistics WHERE user_id = auth.uid();
RESET ALL;

-- 8. CREAR ESTADÍSTICAS DE PRUEBA SI NO EXISTEN
DO $$
BEGIN
    -- Insertar estadísticas de prueba si no existen
    IF NOT EXISTS (SELECT 1 FROM public.user_statistics WHERE user_id = '00078c40-0744-4cec-aefa-73baeda0e7f0') THEN
        INSERT INTO public.user_statistics (
            user_id, 
            total_missions, 
            total_takeoffs, 
            total_landings, 
            total_shots, 
            total_hits, 
            total_kills, 
            total_deaths, 
            total_flight_time_seconds
        ) VALUES (
            '00078c40-0744-4cec-aefa-73baeda0e7f0',
            5,    -- misiones
            12,   -- despegues  
            10,   -- aterrizajes
            150,  -- tiros
            120,  -- impactos
            8,    -- kills
            2,    -- deaths
            7200  -- 2 horas de vuelo
        );
        RAISE NOTICE 'Creadas estadísticas de prueba para el usuario';
    END IF;
    
    -- Insertar estadísticas de armas de prueba si no existen
    IF NOT EXISTS (SELECT 1 FROM public.weapon_statistics WHERE user_id = '00078c40-0744-4cec-aefa-73baeda0e7f0') THEN
        INSERT INTO public.weapon_statistics (user_id, weapon_name, shots, hits, kills) VALUES
        ('00078c40-0744-4cec-aefa-73baeda0e7f0', 'AIM-120C', 50, 45, 3),
        ('00078c40-0744-4cec-aefa-73baeda0e7f0', 'M61 Vulcan', 80, 60, 4),
        ('00078c40-0744-4cec-aefa-73baeda0e7f0', 'GBU-12', 20, 15, 1);
        RAISE NOTICE 'Creadas estadísticas de armas de prueba para el usuario';
    END IF;
END
$$;

-- 9. VERIFICAR ESTADÍSTICAS DESPUÉS DE LA INSERCIÓN
SELECT 'ESTADÍSTICAS DESPUÉS DE INSERCIÓN:' as info;
SELECT * FROM public.user_statistics 
WHERE user_id = '00078c40-0744-4cec-aefa-73baeda0e7f0';

SELECT 'ARMAS DESPUÉS DE INSERCIÓN:' as info;
SELECT * FROM public.weapon_statistics 
WHERE user_id = '00078c40-0744-4cec-aefa-73baeda0e7f0'
ORDER BY shots DESC;

-- 10. VERIFICAR PERMISOS DE COLUMNAS EN LAS TABLAS
SELECT 'COLUMNAS EN user_statistics:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'user_statistics'
ORDER BY ordinal_position;

SELECT 'COLUMNAS EN weapon_statistics:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'weapon_statistics'
ORDER BY ordinal_position;
