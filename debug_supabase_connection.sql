-- DEBUG CRÍTICO: Verificar conectividad y configuración de Supabase
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

-- 6. VERIFICAR PERMISOS DE LA TABLA
SELECT 'TABLE PERMISSIONS:' as info;
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'profiles';

-- 7. VERIFICAR CONFIGURACIÓN DE POSTGREST
SELECT 'POSTGREST CONFIG:' as info;
SELECT current_user as current_user, session_user as session_user;

-- 8. CREAR USUARIO DE PRUEBA SIMPLE
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
    gen_random_uuid(),
    'test@ravenlog.com',
    'Test User',
    'candidate'
) ON CONFLICT (email) DO NOTHING;

-- 9. PROBAR CONSULTA SIMPLE
SELECT 'SIMPLE QUERY TEST:' as info;
SELECT 'Test query works' as result;

-- 10. VERIFICAR SI HAY TRIGGERS PROBLEMÁTICOS
SELECT 'TRIGGERS CHECK:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- 11. MENSAJE FINAL
SELECT 
    'CONNECTION DEBUG COMPLETED' as status,
    'Check all results above' as action,
    'If table exists but query fails, its a Supabase config issue' as diagnosis;
