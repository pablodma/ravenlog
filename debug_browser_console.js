// DEBUG FRONTEND: Verificar configuración de Supabase en el navegador
// Ejecutar en la consola del navegador (F12)

console.log('=== DEBUG FRONTEND CONFIG ===');

// 1. Verificar si supabase está disponible globalmente
console.log('1. Cliente Supabase disponible:');
console.log('Supabase object:', typeof supabase !== 'undefined' ? 'Available' : 'Not available');

if (typeof supabase !== 'undefined') {
    console.log('Supabase URL:', supabase.supabaseUrl);
    console.log('Supabase Key:', supabase.supabaseKey ? 'SET' : 'NOT SET');
    
    // 2. Probar consulta directa
    console.log('2. Probando consulta directa...');
    supabase
        .from('profiles')
        .select('*')
        .eq('id', 'edeb7c8d-a7ad-440b-89ee-191b6a5136f2')
        .then(({ data, error }) => {
            console.log('Consulta directa resultado:');
            console.log('Data:', data);
            console.log('Error:', error);
            if (error) {
                console.log('Error details:', error.message);
                console.log('Error code:', error.code);
                console.log('Error details:', error.details);
            }
        })
        .catch(err => {
            console.log('Catch error:', err);
        });
    
    // 3. Verificar sesión actual
    console.log('3. Verificando sesión...');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
        console.log('Session result:');
        console.log('Session:', session);
        console.log('Error:', error);
        if (session) {
            console.log('User ID:', session.user.id);
            console.log('User email:', session.user.email);
        }
    });
    
    // 4. Probar consulta sin filtro
    console.log('4. Probando consulta sin filtro...');
    supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .then(({ data, error }) => {
            console.log('Consulta sin filtro:');
            console.log('Data:', data);
            console.log('Error:', error);
        });
        
} else {
    console.log('ERROR: Supabase no está disponible globalmente');
    console.log('Verificar que la app esté cargada correctamente');
}

console.log('=== FIN DEBUG ===');
