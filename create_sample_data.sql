-- CREAR DATOS DE MUESTRA PARA TESTING
-- Este script crea rangos y unidades de ejemplo

-- 1. Verificar que las tablas existen
SELECT 'Verificando tablas...' as status;

-- Verificar tabla ranks
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'ranks'
) as ranks_exists;

-- Verificar tabla units
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'units'
) as units_exists;

-- 2. Crear rangos de ejemplo (solo si no existen)
INSERT INTO public.ranks (name, title, description, order_index) 
VALUES 
  ('cadet', 'Cadete', 'Rango inicial para nuevos reclutas', 1),
  ('airman', 'Aviador', 'Rango básico de aviador', 2),
  ('corporal', 'Cabo', 'Rango de suboficial junior', 3),
  ('sergeant', 'Sargento', 'Rango de suboficial', 4),
  ('lieutenant', 'Teniente', 'Rango de oficial junior', 5),
  ('captain', 'Capitán', 'Rango de oficial', 6),
  ('major', 'Mayor', 'Rango de oficial senior', 7),
  ('colonel', 'Coronel', 'Rango de oficial superior', 8)
ON CONFLICT (name) DO NOTHING;

-- 3. Crear unidades de ejemplo (solo si no existen)
INSERT INTO public.units (name, description, unit_type, callsign, max_personnel)
VALUES 
  ('1st Fighter Squadron', 'Escuadrón de caza principal', 'squadron', 'VIPER', 24),
  ('2nd Attack Squadron', 'Escuadrón de ataque terrestre', 'squadron', 'WARTHOG', 18),
  ('Transport Wing', 'Ala de transporte y logística', 'wing', 'CARGO', 36),
  ('Training Flight', 'Vuelo de entrenamiento', 'flight', 'ROOKIE', 12),
  ('Reconnaissance Group', 'Grupo de reconocimiento', 'group', 'EAGLE-EYE', 20)
ON CONFLICT (name) DO NOTHING;

-- 4. Verificar datos creados
SELECT 'Rangos creados:' as info;
SELECT name, title, order_index FROM public.ranks ORDER BY order_index;

SELECT 'Unidades creadas:' as info;
SELECT name, unit_type, callsign, max_personnel FROM public.units ORDER BY name;

-- 5. Verificar permisos y políticas RLS
SELECT 'Políticas RLS para ranks:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'ranks';

SELECT 'Políticas RLS para units:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'units';
