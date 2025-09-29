-- MIGRACIÓN COMPLETA A RBAC
-- Migrar de roles simples (admin/personnel/candidate) a sistema RBAC completo

-- 1. VERIFICAR ESTADO ACTUAL
SELECT 'ESTADO ACTUAL - Usuarios por rol:' as info;
SELECT role, COUNT(*) as total_users 
FROM public.profiles 
GROUP BY role 
ORDER BY total_users DESC;

-- 2. AGREGAR COLUMNA role_id A PROFILES (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN role_id UUID REFERENCES public.roles(id);
        
        RAISE NOTICE 'Columna role_id agregada a profiles';
    ELSE
        RAISE NOTICE 'Columna role_id ya existe en profiles';
    END IF;
END $$;

-- 3. CREAR ROLES BÁSICOS SI NO EXISTEN
INSERT INTO public.roles (name, description, color, is_system_role) VALUES
('admin', 'Administrador del sistema con acceso completo', '#DC2626', true),
('commander', 'Oficial comandante con permisos de liderazgo', '#7C2D12', false),
('personnel_officer', 'Oficial encargado de gestión de personal', '#1D4ED8', false),
('instructor', 'Instructor de entrenamiento y certificaciones', '#059669', false),
('personnel', 'Personal activo de la unidad', '#6B7280', true),
('candidate', 'Candidato en proceso de reclutamiento', '#9CA3AF', true)
ON CONFLICT (name) DO NOTHING;

-- 4. MIGRAR USUARIOS EXISTENTES A ROLES RBAC
UPDATE public.profiles 
SET role_id = (
    CASE 
        WHEN role = 'admin' THEN (SELECT id FROM public.roles WHERE name = 'admin')
        WHEN role = 'personnel' THEN (SELECT id FROM public.roles WHERE name = 'personnel')  
        WHEN role = 'candidate' THEN (SELECT id FROM public.roles WHERE name = 'candidate')
        ELSE (SELECT id FROM public.roles WHERE name = 'candidate') -- Default fallback
    END
)
WHERE role_id IS NULL;

-- 5. VERIFICAR MIGRACIÓN
SELECT 'DESPUÉS DE MIGRACIÓN - Usuarios por rol RBAC:' as info;
SELECT 
    r.name as role_name,
    r.description,
    COUNT(p.id) as total_users
FROM public.roles r
LEFT JOIN public.profiles p ON r.id = p.role_id
GROUP BY r.id, r.name, r.description
ORDER BY total_users DESC;

-- 6. CREAR FUNCIÓN PARA OBTENER PERMISOS DE USUARIO (actualizada)
CREATE OR REPLACE FUNCTION public.get_user_permissions_rbac(user_id UUID)
RETURNS TABLE(permission_name TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT p.name::TEXT
    FROM public.profiles pr
    JOIN public.roles r ON pr.role_id = r.id
    JOIN public.role_permissions rp ON r.id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE pr.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNCIÓN PARA VERIFICAR SI USUARIO TIENE PERMISO
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    has_perm BOOLEAN := FALSE;
    user_role TEXT;
BEGIN
    -- Obtener rol del usuario
    SELECT r.name INTO user_role
    FROM public.profiles pr
    JOIN public.roles r ON pr.role_id = r.id
    WHERE pr.id = user_id;
    
    -- Admin siempre tiene todos los permisos
    IF user_role = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar permiso específico
    SELECT EXISTS(
        SELECT 1 FROM public.get_user_permissions_rbac(user_id) 
        WHERE permission_name = $2
    ) INTO has_perm;
    
    RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. ACTUALIZAR POLÍTICAS RLS PARA USAR RBAC
-- Eliminar políticas antiguas basadas en role
DROP POLICY IF EXISTS "Los admins pueden ver todos los perfiles" ON public.profiles;

-- Crear nueva política RLS usando role_id
CREATE POLICY "Admins can view all profiles via RBAC" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.roles r 
            WHERE r.id = (
                SELECT role_id FROM public.profiles 
                WHERE id = auth.uid()
            ) 
            AND r.name = 'admin'
        )
        OR id = auth.uid()
    );

-- 9. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_lookup ON public.role_permissions(role_id, permission_id);

-- 10. VERIFICACIÓN FINAL
SELECT 'VERIFICACIÓN FINAL:' as info;

-- Contar permisos por rol
SELECT 
    r.name as role_name,
    COUNT(rp.permission_id) as total_permissions,
    ARRAY_AGG(p.name ORDER BY p.category, p.name) as permissions_list
FROM public.roles r
LEFT JOIN public.role_permissions rp ON r.id = rp.role_id
LEFT JOIN public.permissions p ON rp.permission_id = p.id
GROUP BY r.id, r.name
ORDER BY total_permissions DESC;

-- Verificar que todos los usuarios tienen role_id
SELECT 
    'Usuarios sin role_id asignado:' as check_type,
    COUNT(*) as count
FROM public.profiles 
WHERE role_id IS NULL;

-- Ejemplo de uso de las funciones
SELECT 'EJEMPLO - Permisos del primer admin:' as info;
SELECT permission_name 
FROM public.get_user_permissions_rbac(
    (SELECT id FROM public.profiles WHERE role_id = (SELECT id FROM public.roles WHERE name = 'admin') LIMIT 1)
) 
LIMIT 5;
