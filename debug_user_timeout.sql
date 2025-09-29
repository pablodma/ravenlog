-- DEBUG: Verificar por qué fetchProfile sigue dando timeout
-- Ejecutar INMEDIATAMENTE en Supabase SQL Editor

-- 1. VERIFICAR POLÍTICAS ACTUALES DE PROFILES
SELECT 'CURRENT PROFILES POLICIES:' as info;
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 2. VERIFICAR SI EL USUARIO ESPECÍFICO EXISTE
SELECT 'USER CHECK:' as info;
SELECT 
    id,
    email,
    role,
    created_at,
    'User exists in profiles' as status
FROM public.profiles 
WHERE id = 'edeb7c8d-a7ad-440b-89ee-191b6a5136f2';

-- 3. VERIFICAR SI EL USUARIO EXISTE EN AUTH.USERS
SELECT 'AUTH USER CHECK:' as info;
SELECT 
    id,
    email,
    created_at,
    'User exists in auth.users' as status
FROM auth.users 
WHERE id = 'edeb7c8d-a7ad-440b-89ee-191b6a5136f2';

-- 4. PROBAR CONSULTA DIRECTA SIN RLS (como admin)
SELECT 'DIRECT QUERY TEST:' as info;
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- 5. VERIFICAR FUNCIÓN is_user_admin
SELECT 'ADMIN FUNCTION TEST:' as info;
SELECT public.is_user_admin() as is_admin_result;

-- 6. VERIFICAR RLS STATUS
SELECT 'RLS STATUS:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    'RLS status' as check
FROM pg_tables 
WHERE tablename = 'profiles';

-- 7. CREAR PERFIL MANUALMENTE SI NO EXISTE
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
    'edeb7c8d-a7ad-440b-89ee-191b6a5136f2',
    'user@example.com',
    'Test User',
    'candidate'
)
ON CONFLICT (id) DO NOTHING;

-- 8. VERIFICAR DESPUÉS DE INSERCIÓN
SELECT 'AFTER INSERT CHECK:' as info;
SELECT 
    id,
    email,
    role,
    'Profile created/exists' as status
FROM public.profiles 
WHERE id = 'edeb7c8d-a7ad-440b-89ee-191b6a5136f2';

-- 9. EMERGENCY: DESHABILITAR RLS TEMPORALMENTE SI ES NECESARIO
-- SOLO DESCOMENTA SI ES ABSOLUTAMENTE NECESARIO
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 10. MENSAJE FINAL
SELECT 
    'DEBUG COMPLETED' as status,
    'Check results above' as action,
    'If user still not found, create manually' as next_step;
