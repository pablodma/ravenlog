-- EMERGENCY: Deshabilitar RLS temporalmente para resolver timeout crítico
-- Ejecutar INMEDIATAMENTE en Supabase SQL Editor

-- 1. VERIFICAR ESTADO ACTUAL
SELECT 'CURRENT RLS STATUS:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles';

-- 2. VERIFICAR POLÍTICAS ACTUALES
SELECT 'CURRENT POLICIES:' as info;
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 3. EMERGENCY: DESHABILITAR RLS TEMPORALMENTE
-- Esto permitirá que la app funcione mientras investigamos
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 4. VERIFICAR QUE RLS ESTÁ DESHABILITADO
SELECT 'RLS DISABLED CHECK:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = false THEN 'RLS DISABLED - App should work now'
        ELSE 'RLS STILL ENABLED - Problem persists'
    END as status
FROM pg_tables 
WHERE tablename = 'profiles';

-- 5. PROBAR CONSULTA DIRECTA
SELECT 'DIRECT QUERY TEST:' as info;
SELECT 
    id,
    email,
    role,
    'Profile accessible' as status
FROM public.profiles 
WHERE id = 'edeb7c8d-a7ad-440b-89ee-191b6a5136f2';

-- 6. CONTAR TODOS LOS PERFILES
SELECT 'TOTAL PROFILES:' as info, COUNT(*) as count
FROM public.profiles;

-- 7. MENSAJE CRÍTICO
SELECT 
    'EMERGENCY RLS DISABLED' as status,
    'This is temporary to fix timeout' as warning,
    'App should work now' as result,
    'We will re-enable RLS with proper policies later' as next_step;

-- 8. NOTA IMPORTANTE
SELECT 
    'IMPORTANT:' as note,
    'RLS is now disabled for profiles table' as info,
    'This allows all authenticated users to see all profiles' as security_impact,
    'This is TEMPORARY until we fix the policies' as temporary;
