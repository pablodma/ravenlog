-- FIX: Eliminar TODAS las políticas RLS y crear políticas simples
-- Versión 2: Maneja políticas existentes correctamente

-- 1. Deshabilitar RLS temporalmente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar TODAS las políticas existentes (sin importar el nombre)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.profiles';
    END LOOP;
END $$;

-- 3. Crear políticas simples sin recursión
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles  
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Habilitar RLS nuevamente
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Verificar que las políticas están correctas
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd, 
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY policyname;
