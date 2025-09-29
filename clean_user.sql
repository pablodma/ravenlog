-- LIMPIEZA: Eliminar usuario problemático y permitir recreación
-- ID: 117edfac-fa45-4470-8404-57904f922bc1 (Pablo Duro)

-- 1. Eliminar perfil de la tabla profiles
DELETE FROM public.profiles 
WHERE id = '117edfac-fa45-4470-8404-57904f922bc1';

-- 2. Si tienes acceso, eliminar de auth.users (opcional)
-- DELETE FROM auth.users 
-- WHERE id = '117edfac-fa45-4470-8404-57904f922bc1';

-- NOTA: Después de esto:
-- 1. Cierra sesión en RavenLog
-- 2. Borra caché del navegador (Ctrl+Shift+Del)
-- 3. Vuelve a loguearte con Google
-- 4. Se creará un perfil nuevo limpio
