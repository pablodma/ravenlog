// DEBUG FRONTEND: Verificar configuración de Supabase en el navegador
// Ejecutar en la consola del navegador (F12)

console.log('=== DEBUG FRONTEND CONFIG ===');

// 1. Verificar variables de entorno
console.log('1. Variables de entorno:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

// 2. Verificar cliente Supabase
console.log('2. Cliente Supabase:');
console.log('Supabase URL:', supabase.supabaseUrl);
console.log('Supabase Key:', supabase.supabaseKey ? 'SET' : 'NOT SET');

// 3. Probar consulta directa
console.log('3. Probando consulta directa...');
supabase
  .from('profiles')
  .select('*')
  .eq('id', 'edeb7c8d-a7ad-440b-89ee-191b6a5136f2')
  .then(({ data, error }) => {
    console.log('Consulta directa resultado:');
    console.log('Data:', data);
    console.log('Error:', error);
  });

// 4. Verificar sesión actual
console.log('4. Sesión actual:');
supabase.auth.getSession().then(({ data: { session } }) => {
  console.log('Session:', session);
  console.log('User ID:', session?.user?.id);
});

// 5. Verificar estado de auth
console.log('5. Estado de auth:');
console.log('Auth state:', supabase.auth.getUser());

console.log('=== FIN DEBUG ===');
