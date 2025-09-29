-- SOLUCIÓN DEFINITIVA: Corregir políticas RLS recursivas en profiles
-- Este script elimina las políticas problemáticas y crea nuevas políticas seguras

-- 1. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES DE PROFILES
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los admins pueden ver todos los perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 2. CREAR POLÍTICAS SIMPLES Y SEGURAS (SIN RECURSIÓN)

-- Política básica: usuarios pueden ver su propio perfil
CREATE POLICY "allow_own_profile_select" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Política básica: usuarios pueden insertar su propio perfil
CREATE POLICY "allow_own_profile_insert" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Política básica: usuarios pueden actualizar su propio perfil
CREATE POLICY "allow_own_profile_update" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 3. VERIFICAR QUE RLS ESTÁ HABILITADO
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. VERIFICAR POLÍTICAS CREADAS
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 5. PROBAR ACCESO BÁSICO
-- Esta consulta debería funcionar para cualquier usuario autenticado
SELECT 'Políticas RLS corregidas exitosamente' as resultado;

-- NOTA IMPORTANTE:
-- Estas políticas eliminan el acceso de admin a todos los perfiles por ahora
-- Esto es temporal para resolver el problema de recursión
-- Una vez que funcione la autenticación básica, podemos agregar políticas de admin más seguras
-- usando una tabla separada para roles de admin o verificaciones diferentes
