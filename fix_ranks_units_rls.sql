-- FIX: Agregar políticas RLS para ranks y units
-- Permitir que todos los usuarios puedan ver rangos y unidades

-- 1. Verificar que RLS está habilitado
ALTER TABLE public.ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Anyone can view ranks" ON public.ranks;
DROP POLICY IF EXISTS "Only admins can modify ranks" ON public.ranks;
DROP POLICY IF EXISTS "Anyone can view units" ON public.units;
DROP POLICY IF EXISTS "Only admins can modify units" ON public.units;

-- 3. Crear políticas para RANKS
-- Todos pueden ver rangos
CREATE POLICY "Anyone can view ranks" ON public.ranks
    FOR SELECT USING (true);

-- Solo admins pueden modificar rangos (usando service_role_key desde backend)
CREATE POLICY "Only admins can modify ranks" ON public.ranks
    FOR ALL USING (false); -- Bloquear modificaciones desde frontend

-- 4. Crear políticas para UNITS  
-- Todos pueden ver unidades
CREATE POLICY "Anyone can view units" ON public.units
    FOR SELECT USING (true);

-- Solo admins pueden modificar unidades (usando service_role_key desde backend)
CREATE POLICY "Only admins can modify units" ON public.units
    FOR ALL USING (false); -- Bloquear modificaciones desde frontend

-- 5. Verificar políticas creadas
SELECT 'Políticas RLS para ranks:' as info;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'ranks' ORDER BY policyname;

SELECT 'Políticas RLS para units:' as info;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'units' ORDER BY policyname;

-- 6. Verificar datos existentes
SELECT 'Rangos disponibles:' as info;
SELECT name, abbreviation, "order" FROM public.ranks ORDER BY "order";

SELECT 'Unidades disponibles:' as info;
SELECT name, unit_type, callsign FROM public.units ORDER BY name;
