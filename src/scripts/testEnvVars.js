import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('=== Environment Variables Test ===');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'SET' : 'NOT SET');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_KEY:', process.env.VITE_SUPABASE_KEY ? 'SET' : 'NOT SET');