-- DEBUG: Diagnosticar y corregir error 500 al obtener perfiles
-- Usuario ID problemático: 00078c40-0744-4cec-aefa-73baeda0e7f0

-- 1. VERIFICAR SI EL USUARIO EXISTE
SELECT 'VERIFICANDO USUARIO ESPECÍFICO:' as info;
SELECT id, email, full_name, role, role_id, created_at 
FROM public.profiles 
WHERE id = '00078c40-0744-4cec-aefa-73baeda0e7f0';

-- 2. VERIFICAR TODAS LAS POLÍTICAS RLS ACTUALES
SELECT 'POLÍTICAS RLS ACTUALES EN PROFILES:' as info;
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- 3. VERIFICAR SI HAY PROBLEMAS CON role_id
SELECT 'USUARIOS CON role_id NULO:' as info;
SELECT id, email, role, role_id 
FROM public.profiles 
WHERE role_id IS NULL 
LIMIT 5;

-- 4. VERIFICAR SI LAS TABLAS RBAC EXISTEN
SELECT 'VERIFICANDO TABLAS RBAC:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('roles', 'permissions', 'role_permissions');

-- 5. DESHABILITAR RLS TEMPORALMENTE PARA DIAGNÓSTICO
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 6. VERIFICAR QUE PODEMOS LEER EL USUARIO SIN RLS
SELECT 'LECTURA SIN RLS:' as info;
SELECT id, email, full_name, role, role_id 
FROM public.profiles 
WHERE id = '00078c40-0744-4cec-aefa-73baeda0e7f0';

-- 7. LIMPIAR POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "Admins can view all profiles via RBAC" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden ver su perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden insertar su perfil" ON public.profiles;

-- 8. CREAR POLÍTICAS RLS SIMPLES Y SEGURAS
CREATE POLICY "Simple user profile access" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Simple user profile update" ON public.profiles  
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Simple user profile insert" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 9. REHABILITAR RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 10. ASEGURAR QUE EL USUARIO TENGA UN ROLE VÁLIDO
UPDATE public.profiles 
SET role = 'candidate' 
WHERE id = '00078c40-0744-4cec-aefa-73baeda0e7f0' 
AND (role IS NULL OR role = '');

-- 11. SI EXISTE TABLA ROLES, ASIGNAR role_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles' AND table_schema = 'public') THEN
        -- Asignar role_id basado en el role actual
        UPDATE public.profiles 
        SET role_id = (
            CASE 
                WHEN role = 'admin' THEN (SELECT id FROM public.roles WHERE name = 'admin' LIMIT 1)
                WHEN role = 'personnel' THEN (SELECT id FROM public.roles WHERE name = 'personnel' LIMIT 1)
                WHEN role = 'candidate' THEN (SELECT id FROM public.roles WHERE name = 'candidate' LIMIT 1)
                ELSE (SELECT id FROM public.roles WHERE name = 'candidate' LIMIT 1)
            END
        )
        WHERE id = '00078c40-0744-4cec-aefa-73baeda0e7f0' 
        AND role_id IS NULL;
        
        RAISE NOTICE 'role_id asignado para usuario problemático';
    ELSE
        RAISE NOTICE 'Tabla roles no existe, saltando asignación de role_id';
    END IF;
END $$;

-- 12. VERIFICACIÓN FINAL
SELECT 'ESTADO FINAL DEL USUARIO:' as info;
SELECT id, email, full_name, role, role_id, created_at, updated_at 
FROM public.profiles 
WHERE id = '00078c40-0744-4cec-aefa-73baeda0e7f0';

-- 13. PROBAR CONSULTA COMO LA HACE EL FRONTEND
SELECT 'SIMULANDO CONSULTA DEL FRONTEND:' as info;
-- Esta es la consulta exacta que hace AuthContext
SELECT * FROM public.profiles WHERE id = '00078c40-0744-4cec-aefa-73baeda0e7f0';

-- 14. VERIFICAR POLÍTICAS FINALES
SELECT 'POLÍTICAS RLS FINALES:' as info;
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';
