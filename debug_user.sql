-- DEBUG: Verificar estado del usuario Pablo Duro
-- ID: 117edfac-fa45-4470-8404-57904f922bc1

-- 1. Ver datos en profiles
SELECT * FROM public.profiles 
WHERE id = '117edfac-fa45-4470-8404-57904f922bc1';

-- 2. Ver datos en auth.users (si tienes acceso)  
SELECT id, email, created_at, updated_at, raw_user_meta_data
FROM auth.users 
WHERE id = '117edfac-fa45-4470-8404-57904f922bc1';

-- 3. Verificar si hay datos duplicados o corruptos
SELECT COUNT(*) as total_profiles 
FROM public.profiles 
WHERE id = '117edfac-fa45-4470-8404-57904f922bc1';
