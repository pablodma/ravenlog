-- VERIFICAR ESTADO DE LAS TABLAS DEL CALENDARIO
-- Ejecutar en el SQL Editor de Supabase para diagnosticar problemas

-- 1. Verificar si las tablas existen
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename IN ('event_types', 'flight_events_calendar', 'event_participants', 'event_comments')
ORDER BY tablename;

-- 2. Verificar estructura de event_types
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'event_types' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar estructura de flight_events_calendar
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'flight_events_calendar' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar datos en event_types
SELECT id, name, description, color, icon, is_system_type, created_at
FROM public.event_types
ORDER BY name;

-- 5. Verificar datos en flight_events_calendar
SELECT id, title, status, start_date, end_date, organizer_id, created_at
FROM public.flight_events_calendar
ORDER BY created_at DESC
LIMIT 10;

-- 6. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('event_types', 'flight_events_calendar', 'event_participants', 'event_comments')
ORDER BY tablename, policyname;

-- 7. Verificar permisos de usuario actual
SELECT 
    has_table_privilege('public.event_types', 'SELECT') as event_types_select,
    has_table_privilege('public.flight_events_calendar', 'SELECT') as events_select,
    has_table_privilege('public.event_participants', 'SELECT') as participants_select,
    has_table_privilege('public.event_comments', 'SELECT') as comments_select;

-- 8. Probar consulta simple
SELECT COUNT(*) as total_event_types FROM public.event_types;
SELECT COUNT(*) as total_events FROM public.flight_events_calendar;

-- 9. Verificar usuario actual y rol
SELECT 
    current_user as current_user,
    session_user as session_user,
    auth.uid() as auth_uid,
    auth.role() as auth_role;

-- 10. Verificar perfil del usuario actual
SELECT id, email, role, full_name, created_at
FROM public.profiles
WHERE id = auth.uid();

-- Si hay errores, mostrar información adicional
DO $$
BEGIN
    RAISE NOTICE 'Verificación de tablas del calendario completada';
    RAISE NOTICE 'Usuario actual: %', auth.uid();
    RAISE NOTICE 'Timestamp: %', NOW();
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error durante verificación: %', SQLERRM;
END $$;
