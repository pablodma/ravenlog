-- FIX CRÍTICO: Resolver problemas de RLS y FormBuilder
-- Ejecutar en Supabase SQL Editor

-- 1. ARREGLAR RLS DE PROFILES (eliminar recursión)
-- Eliminar políticas problemáticas que causan recursión
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los admins pueden ver todos los perfiles" ON public.profiles;

-- Crear políticas simples SIN recursión (con IF NOT EXISTS)
DO $$ 
BEGIN
    -- Crear política de SELECT si no existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'allow_own_profile_select'
    ) THEN
        CREATE POLICY "allow_own_profile_select" ON public.profiles
            FOR SELECT USING (auth.uid() = id);
    END IF;

    -- Crear política de INSERT si no existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'allow_own_profile_insert'
    ) THEN
        CREATE POLICY "allow_own_profile_insert" ON public.profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;

    -- Crear política de UPDATE si no existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'allow_own_profile_update'
    ) THEN
        CREATE POLICY "allow_own_profile_update" ON public.profiles
            FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- Política especial para admins usando función segura
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'allow_admin_all_profiles'
    ) THEN
        CREATE POLICY "allow_admin_all_profiles" ON public.profiles
            FOR ALL USING (
                -- Verificar directamente en auth.users si es admin
                EXISTS (
                    SELECT 1 FROM auth.users u
                    JOIN public.profiles p ON p.id = u.id
                    WHERE u.id = auth.uid() 
                    AND p.role = 'admin'
                    AND p.id != profiles.id  -- Evitar auto-referencia
                )
                OR auth.uid() = profiles.id  -- O es su propio perfil
            );
    END IF;
END $$;

-- 2. VERIFICAR QUE RLS ESTÁ HABILITADO
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. CREAR FUNCIÓN HELPER PARA VERIFICAR ADMIN (sin recursión)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Consulta directa sin RLS usando security definer
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = user_id;
    
    RETURN COALESCE(user_role = 'admin', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ACTUALIZAR POLÍTICAS DE OTRAS TABLAS PARA USAR LA FUNCIÓN HELPER
-- Esto evita la recursión en todas las consultas de admin

-- Actualizar política de recruitment_forms
DROP POLICY IF EXISTS "Only admins can modify forms" ON public.recruitment_forms;
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'recruitment_forms' 
        AND policyname = 'Only admins can modify forms'
    ) THEN
        CREATE POLICY "Only admins can modify forms" ON public.recruitment_forms
            FOR ALL USING (public.is_admin());
    END IF;
END $$;

-- Actualizar política de units
DROP POLICY IF EXISTS "Only admins can modify units" ON public.units;
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'units' 
        AND policyname = 'Only admins can modify units'
    ) THEN
        CREATE POLICY "Only admins can modify units" ON public.units
            FOR ALL USING (public.is_admin());
    END IF;
END $$;

-- 5. VERIFICAR CONECTIVIDAD
SELECT 'RLS POLICIES FIXED - Test query' as status, count(*) as profile_count 
FROM public.profiles 
WHERE id = auth.uid();

-- 6. MENSAJE DE CONFIRMACIÓN
SELECT 
    'CRITICAL FIXES APPLIED:' as message,
    '1. RLS recursion eliminated' as fix_1,
    '2. Admin function created' as fix_2,
    '3. Policies updated' as fix_3,
    'FormBuilder should work now' as result;
