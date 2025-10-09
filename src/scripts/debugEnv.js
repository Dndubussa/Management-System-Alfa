import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { supabase } from '../config/supabase.js';

console.log('=== Environment Variables Debug ===');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_KEY (first 10 chars):', process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.substring(0, 10) + '...' : 'NOT SET');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_KEY (first 10 chars):', process.env.VITE_SUPABASE_KEY ? process.env.VITE_SUPABASE_KEY.substring(0, 10) + '...' : 'NOT SET');

console.log('\n=== Supabase Client Configuration ===');
console.log('Supabase URL being used:', supabase.supabaseUrl);
// Note: We can't directly access the key for security reasons

console.log('\n=== Testing Connection ===');
supabase
  .from('patients')
  .select('id')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.log('❌ Connection test failed:', error.message);
      console.log('Error details:', error);
    } else {
      console.log('✅ Connection test successful!');
      console.log('Data received:', data);
    }
  })
  .catch(error => {
    console.log('❌ Unexpected error:', error.message);
  });