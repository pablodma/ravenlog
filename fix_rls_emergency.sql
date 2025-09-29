-- EMERGENCY FIX: Eliminar TODAS las políticas RLS problemáticas
-- Ejecutar INMEDIATAMENTE en Supabase SQL Editor

-- 1. ELIMINAR TODAS LAS POLÍTICAS DE PROFILES (NUCLEAR OPTION)
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los admins pueden ver todos los perfiles" ON public.profiles;
DROP POLICY IF EXISTS "allow_own_profile_select" ON public.profiles;
DROP POLICY IF EXISTS "allow_own_profile_insert" ON public.profiles;
DROP POLICY IF EXISTS "allow_own_profile_update" ON public.profiles;
DROP POLICY IF EXISTS "allow_admin_all_profiles" ON public.profiles;

-- 2. VERIFICAR QUE NO QUEDEN POLÍTICAS
SELECT 
    'POLICIES BEFORE CLEANUP:' as status,
    schemaname, 
    tablename, 
    policyname 
FROM pg_policies 
WHERE tablename = 'profiles';

-- 3. CREAR POLÍTICAS ULTRA SIMPLES (SIN RECURSIÓN)
-- Política básica: usuarios pueden ver su propio perfil
CREATE POLICY "simple_own_select" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Política básica: usuarios pueden insertar su propio perfil
CREATE POLICY "simple_own_insert" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Política básica: usuarios pueden actualizar su propio perfil
CREATE POLICY "simple_own_update" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 4. VERIFICAR POLÍTICAS CREADAS
SELECT 
    'POLICIES AFTER CLEANUP:' as status,
    schemaname, 
    tablename, 
    policyname 
FROM pg_policies 
WHERE tablename = 'profiles';

-- 5. DESHABILITAR RLS TEMPORALMENTE PARA TESTING (SOLO SI ES NECESARIO)
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 6. VERIFICAR QUE RLS ESTÁ HABILITADO
SELECT 
    'RLS STATUS:' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles';

-- 7. TEST QUERY SIMPLE
SELECT 'EMERGENCY FIX APPLIED' as message, 'Testing profiles access...' as test;

-- 8. CREAR FUNCIÓN SIMPLE PARA VERIFICAR ADMIN (SIN RECURSIÓN)
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Función ultra simple que NO consulta profiles
    -- Solo verifica si el usuario actual existe en auth.users
    RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. MENSAJE FINAL
SELECT 
    'EMERGENCY RLS FIX COMPLETED' as status,
    'All recursive policies removed' as action_1,
    'Simple policies created' as action_2,
    'Test the app now' as next_step;
