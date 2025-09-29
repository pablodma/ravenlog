// Script para debuggear variables de entorno en Vercel
console.log('=== DEBUG VARIABLES DE ENTORNO ===');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'CONFIGURADA' : 'NO CONFIGURADA');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('=== FIN DEBUG ===');
