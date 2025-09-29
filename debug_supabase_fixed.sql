-- DEBUG CRÍTICO: Verificar conectividad y configuración de Supabase (FIXED)
-- El problema NO es RLS - es conectividad o configuración

-- 1. VERIFICAR CONFIGURACIÓN DE SUPABASE
SELECT 'SUPABASE CONFIG CHECK:' as info;

-- 2. VERIFICAR QUE LA TABLA PROFILES EXISTE Y ES ACCESIBLE
SELECT 'PROFILES TABLE CHECK:' as info;
SELECT 
    table_name,
    table_type,
    'Table exists' as status
FROM information_schema.tables 
WHERE table_name = 'profiles';

-- 3. VERIFICAR ESTRUCTURA DE LA TABLA
SELECT 'PROFILES STRUCTURE:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. VERIFICAR QUE EL USUARIO ESPECÍFICO EXISTE
SELECT 'USER EXISTS CHECK:' as info;
SELECT 
    id,
    email,
    role,
    created_at,
    'User found in profiles' as status
FROM public.profiles 
WHERE id = 'edeb7c8d-a7ad-440b-89ee-191b6a5136f2'
LIMIT 1;

-- 5. VERIFICAR TODOS LOS USUARIOS
SELECT 'ALL PROFILES COUNT:' as info;
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- 6. VERIFICAR RLS STATUS (debería estar disabled)
SELECT 'RLS STATUS CHECK:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = false THEN 'RLS DISABLED - Good'
        ELSE 'RLS ENABLED - Problem'
    END as status
FROM pg_tables 
WHERE tablename = 'profiles';

-- 7. PROBAR CONSULTA SIMPLE
SELECT 'SIMPLE QUERY TEST:' as info;
SELECT 'Test query works' as result;

-- 8. VERIFICAR PERMISOS BÁSICOS
SELECT 'PERMISSIONS CHECK:' as info;
SELECT current_user as current_user, session_user as session_user;

-- 9. VERIFICAR SI HAY TRIGGERS PROBLEMÁTICOS
SELECT 'TRIGGERS CHECK:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- 10. PROBAR INSERCIÓN SIMPLE (con UUID válido)
DO $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        gen_random_uuid(),
        'test-debug@ravenlog.com',
        'Debug Test User',
        'candidate'
    );
    
    RAISE NOTICE 'INSERT TEST: Success - can insert into profiles';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'INSERT TEST: Failed - %', SQLERRM;
END $$;

-- 11. VERIFICAR DESPUÉS DE INSERCIÓN
SELECT 'AFTER INSERT CHECK:' as info;
SELECT COUNT(*) as total_after_insert FROM public.profiles;

-- 12. MENSAJE FINAL
SELECT 
    'CONNECTION DEBUG COMPLETED' as status,
    'Check all results above' as action,
    'Focus on RLS status and permissions' as key_check;
