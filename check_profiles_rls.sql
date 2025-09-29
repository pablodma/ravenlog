-- Script para diagnosticar y corregir problemas de RLS en la tabla profiles
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar políticas existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 2. Verificar RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 3. Probar consulta simple como usuario autenticado
-- (Esta consulta debería funcionar si las políticas están bien configuradas)
SELECT 'Testing profiles access' as test;

-- 4. Si hay problemas, recrear políticas básicas
-- NOTA: Solo ejecutar si las políticas actuales están causando problemas

-- Eliminar todas las políticas existentes (CUIDADO!)
-- DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
-- DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
-- DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
-- DROP POLICY IF EXISTS "Los admins pueden ver todos los perfiles" ON profiles;

-- Crear políticas básicas y seguras
-- CREATE POLICY "allow_own_profile_select" ON profiles
--     FOR SELECT USING (auth.uid() = id);

-- CREATE POLICY "allow_own_profile_insert" ON profiles
--     FOR INSERT WITH CHECK (auth.uid() = id);

-- CREATE POLICY "allow_own_profile_update" ON profiles
--     FOR UPDATE USING (auth.uid() = id);

-- 5. Verificar que la tabla tiene la estructura correcta
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 6. Contar registros en profiles
SELECT COUNT(*) as total_profiles FROM profiles;

-- 7. Verificar si hay perfiles huérfanos (sin usuario en auth.users)
SELECT p.id, p.email, u.id as auth_user_id
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;
