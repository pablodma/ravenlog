-- FIX: Eliminar todas las políticas RLS problemáticas y crear políticas simples
-- Este archivo corrige el loop infinito en autenticación

-- 1. Deshabilitar RLS temporalmente para limpiar
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Usuarios pueden ver su perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden insertar su perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los admins pueden ver todos los perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;

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
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
