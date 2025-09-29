-- RBAC System: Roles and Permissions for Military Management
-- Migration: 20240102000000_rbac_system.sql

-- 1. TABLA DE PERMISOS (acciones disponibles en el sistema)
CREATE TABLE public.permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'personnel', 'operations', 'admin', etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE ROLES (roles personalizables)
CREATE TABLE public.roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    color VARCHAR(7) DEFAULT '#6B7280', -- Color hex para UI
    is_system_role BOOLEAN DEFAULT FALSE, -- No se puede eliminar
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE RELACIÓN ROLES-PERMISOS (many-to-many)
CREATE TABLE public.role_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES public.profiles(id), -- Quien otorgó el permiso
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- 4. ACTUALIZAR TABLA PROFILES para usar roles dinámicos
ALTER TABLE public.profiles 
ADD COLUMN role_id UUID REFERENCES public.roles(id),
ADD COLUMN secondary_roles UUID[] DEFAULT '{}'; -- Roles adicionales

-- Crear índice para mejorar performance
CREATE INDEX idx_profiles_role_id ON public.profiles(role_id);
CREATE INDEX idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON public.role_permissions(permission_id);

-- 5. FUNCIÓN PARA VERIFICAR PERMISOS
CREATE OR REPLACE FUNCTION public.user_has_permission(
    user_id UUID,
    permission_name VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    has_perm BOOLEAN := FALSE;
BEGIN
    -- Verificar permiso a través del rol principal
    SELECT EXISTS (
        SELECT 1 
        FROM public.profiles p
        JOIN public.role_permissions rp ON rp.role_id = p.role_id
        JOIN public.permissions perm ON perm.id = rp.permission_id
        WHERE p.id = user_id AND perm.name = permission_name
    ) INTO has_perm;
    
    -- Si no lo tiene por rol principal, verificar roles secundarios
    IF NOT has_perm THEN
        SELECT EXISTS (
            SELECT 1 
            FROM public.profiles p
            JOIN public.role_permissions rp ON rp.role_id = ANY(p.secondary_roles)
            JOIN public.permissions perm ON perm.id = rp.permission_id
            WHERE p.id = user_id AND perm.name = permission_name
        ) INTO has_perm;
    END IF;
    
    RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNCIÓN PARA OBTENER TODOS LOS PERMISOS DE UN USUARIO
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id UUID)
RETURNS TABLE(permission_name VARCHAR, permission_description TEXT, category VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.name, p.description, p.category
    FROM public.profiles prof
    LEFT JOIN public.role_permissions rp1 ON rp1.role_id = prof.role_id
    LEFT JOIN public.role_permissions rp2 ON rp2.role_id = ANY(prof.secondary_roles)
    LEFT JOIN public.permissions p ON p.id IN (rp1.permission_id, rp2.permission_id)
    WHERE prof.id = user_id AND p.name IS NOT NULL
    ORDER BY p.category, p.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. TRIGGERS para updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.roles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 8. RLS POLICIES para las nuevas tablas
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas simplificadas - por ahora solo admins pueden gestionar
-- Luego se refinan cuando tengamos la UI lista

-- Permisos: todos pueden ver, solo admins pueden modificar
CREATE POLICY "Anyone can view permissions" ON public.permissions
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify permissions" ON public.permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Roles: todos pueden ver, solo admins pueden modificar  
CREATE POLICY "Anyone can view roles" ON public.roles
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify roles" ON public.roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Role permissions: todos pueden ver, solo admins pueden modificar
CREATE POLICY "Anyone can view role permissions" ON public.role_permissions
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify role permissions" ON public.role_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
