-- FIX: Eliminar políticas RLS recursivas y crear políticas simples
-- Este archivo corrige la recursión infinita en policies de profiles

-- 1. Eliminar políticas problemáticas
DROP POLICY IF EXISTS "Los admins pueden ver todos los perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;

-- 2. Crear políticas simples y seguras
-- Política básica: usuarios pueden ver y editar solo su propio perfil
CREATE POLICY "Usuarios pueden ver su perfil" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su perfil" ON public.profiles  
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden insertar su perfil" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Para operaciones de admin, usaremos service_role_key desde el backend
-- No necesitamos política RLS recursiva para admin

-- 4. Verificar que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
