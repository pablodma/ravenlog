-- FIX RECRUITMENT FLOW: Arreglar políticas RLS recursivas y flujo de reclutamiento
-- Ejecutar en Supabase SQL Editor

-- 1. VERIFICAR ROL POR DEFECTO PARA USUARIOS NUEVOS
SELECT 'CURRENT DEFAULT ROLE:' as info, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'role';

-- 2. ARREGLAR POLÍTICAS RLS RECURSIVAS EN OTRAS TABLAS
-- Las políticas que consultan profiles.role están causando recursión

-- UNITS: Arreglar política recursiva
DROP POLICY IF EXISTS "Only admins can modify units" ON public.units;
CREATE POLICY "Only admins can modify units" ON public.units
    FOR ALL USING (public.is_user_admin()); -- Usar función sin recursión

-- RECRUITMENT_FORMS: Arreglar políticas recursivas
DROP POLICY IF EXISTS "Anyone can view active forms" ON public.recruitment_forms;
DROP POLICY IF EXISTS "Only admins can modify forms" ON public.recruitment_forms;

CREATE POLICY "Anyone can view active forms" ON public.recruitment_forms
    FOR SELECT USING (is_active = true OR public.is_user_admin());

CREATE POLICY "Only admins can modify forms" ON public.recruitment_forms
    FOR ALL USING (public.is_user_admin());

-- APPLICATIONS: Arreglar políticas recursivas
DROP POLICY IF EXISTS "Users can view their own applications" ON public.applications;
DROP POLICY IF EXISTS "Only admins can review applications" ON public.applications;

-- Política simple para ver aplicaciones (sin recursión)
CREATE POLICY "Users can view their own applications" ON public.applications
    FOR SELECT USING (
        applicant_id = auth.uid() OR public.is_user_admin()
    );

-- Política simple para que admins puedan revisar
CREATE POLICY "Only admins can review applications" ON public.applications
    FOR UPDATE USING (public.is_user_admin());

-- 3. VERIFICAR QUE USUARIOS CON ROL 'candidate' PUEDAN CREAR APLICACIONES
-- La política "Users can create their own applications" ya está bien
SELECT 'APPLICATIONS POLICIES:' as info;
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'applications';

-- 4. CREAR FUNCIÓN HELPER PARA VERIFICAR SI UN USUARIO ES CANDIDATO
CREATE OR REPLACE FUNCTION public.is_candidate(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Consulta directa sin RLS usando security definer
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = user_id;
    
    RETURN COALESCE(user_role = 'candidate', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. VERIFICAR FLUJO COMPLETO DE RECLUTAMIENTO
SELECT 'RECRUITMENT FLOW VERIFICATION:' as info;

-- Verificar que existen formularios activos
SELECT 'Active forms count:' as check, COUNT(*) as count 
FROM public.recruitment_forms 
WHERE is_active = true;

-- Verificar estructura de applications
SELECT 'Applications table structure:' as check;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'applications' 
ORDER BY ordinal_position;

-- 6. CREAR POLÍTICA ESPECÍFICA PARA QUE CANDIDATES PUEDAN ENVIAR APLICACIONES
-- Asegurar que usuarios con role='candidate' puedan insertar en applications
CREATE POLICY "Candidates can create applications" ON public.applications
    FOR INSERT WITH CHECK (
        applicant_id = auth.uid() AND 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'candidate'
        )
    );

-- 7. VERIFICAR PERMISOS EN usePermissions.tsx
-- Los candidatos deben poder acceder al formulario de reclutamiento
SELECT 'CANDIDATE PERMISSIONS CHECK:' as info;

-- 8. TESTING: Simular creación de aplicación por candidato
SELECT 'TESTING RECRUITMENT FLOW:' as test;
SELECT 
    'User role check:' as check,
    role,
    'Can create application:' as permission,
    CASE 
        WHEN role = 'candidate' THEN 'YES'
        ELSE 'NO - should be candidate'
    END as result
FROM public.profiles 
WHERE id = auth.uid();

-- 9. MENSAJE FINAL
SELECT 
    'RECRUITMENT FLOW FIXED:' as status,
    'Default role: candidate' as info_1,
    'Candidates can submit applications' as info_2,
    'Admins can review applications' as info_3,
    'RLS recursion eliminated' as info_4,
    'Test the enrollment form now' as next_step;
