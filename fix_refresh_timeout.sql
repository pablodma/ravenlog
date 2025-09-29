-- FIX REFRESH TIMEOUT: Verificar usuario específico y crear si no existe
-- Ejecutar en Supabase SQL Editor

-- 1. VERIFICAR USUARIO ESPECÍFICO QUE DA PROBLEMAS
SELECT 'CHECKING SPECIFIC USER:' as info;
SELECT 
    id,
    email,
    role,
    created_at,
    'Profile exists' as status
FROM public.profiles 
WHERE email = 'desarrolladores.ksa@gmail.com'
   OR id = 'edeb7c8d-a7ad-440b-89ee-191b6a5136f2';

-- 2. VERIFICAR EN AUTH.USERS
SELECT 'AUTH USERS CHECK:' as info;
SELECT 
    id,
    email,
    created_at,
    'Auth user exists' as status
FROM auth.users 
WHERE email = 'desarrolladores.ksa@gmail.com'
   OR id = 'edeb7c8d-a7ad-440b-89ee-191b6a5136f2';

-- 3. CREAR PERFIL MANUALMENTE SI NO EXISTE
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', 'Usuario Desarrollador'),
    'candidate'
FROM auth.users u
WHERE u.email = 'desarrolladores.ksa@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
  );

-- 4. VERIFICAR DESPUÉS DE INSERCIÓN
SELECT 'AFTER INSERT:' as info;
SELECT 
    id,
    email,
    full_name,
    role,
    created_at,
    'Profile ready' as status
FROM public.profiles 
WHERE email = 'desarrolladores.ksa@gmail.com';

-- 5. PROBAR CONSULTA COMO LA HACE EL FRONTEND
SELECT 'FRONTEND QUERY TEST:' as info;
SELECT *
FROM public.profiles 
WHERE id = 'edeb7c8d-a7ad-440b-89ee-191b6a5136f2';

-- 6. VERIFICAR POLÍTICAS QUE PODRÍAN CAUSAR PROBLEMAS EN REFRESH
SELECT 'POLICIES CHECK:' as info;
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 7. EMERGENCY: SIMPLIFICAR POLÍTICAS SI ES NECESARIO
-- Solo descomenta si el problema persiste
/*
DROP POLICY IF EXISTS "simple_own_select" ON public.profiles;
CREATE POLICY "ultra_simple_select" ON public.profiles
    FOR SELECT USING (true); -- Permitir todo temporalmente
*/

-- 8. MENSAJE FINAL
SELECT 
    'REFRESH FIX APPLIED' as status,
    'User profile verified/created' as action,
    'Test refresh now' as next_step;
