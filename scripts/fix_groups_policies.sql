-- =====================================================
-- Script para corregir políticas de grupos
-- Ejecutar si hay problemas con edición/eliminación de grupos
-- =====================================================

-- =====================================================
-- 1. VERIFICAR POLÍTICAS EXISTENTES
-- =====================================================

-- Verificar políticas actuales
SELECT 'Políticas actuales de groups:' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'groups';

-- =====================================================
-- 2. ELIMINAR POLÍTICAS EXISTENTES
-- =====================================================

DROP POLICY IF EXISTS "Everyone can view active groups" ON public.groups;
DROP POLICY IF EXISTS "Admins can manage groups" ON public.groups;

-- =====================================================
-- 3. CREAR POLÍTICAS PERMISIVAS (TEMPORALES)
-- =====================================================

-- Política para lectura
CREATE POLICY "Allow all on groups" ON public.groups
    FOR SELECT USING (true);

-- Política para inserción
CREATE POLICY "Allow all insert on groups" ON public.groups
    FOR INSERT WITH CHECK (true);

-- Política para actualización
CREATE POLICY "Allow all update on groups" ON public.groups
    FOR UPDATE USING (true);

-- Política para eliminación
CREATE POLICY "Allow all delete on groups" ON public.groups
    FOR DELETE USING (true);

-- =====================================================
-- 4. VERIFICAR QUE LAS POLÍTICAS SE CREARON
-- =====================================================

SELECT 'Políticas creadas:' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'groups';

-- =====================================================
-- 5. VERIFICAR RLS ESTÁ HABILITADO
-- =====================================================

SELECT 'RLS habilitado en groups:' as status;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'groups';

-- =====================================================
-- 6. VERIFICAR DATOS DE GRUPOS
-- =====================================================

SELECT 'Grupos existentes:' as status;
SELECT id, name, description, is_active, created_at 
FROM public.groups 
ORDER BY display_order;
