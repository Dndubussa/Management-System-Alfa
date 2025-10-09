import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

// Explicitly use the service role key
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_KEY
);

console.log('=== Final Supabase Connection Test ===');
console.log('Using SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('Using SUPABASE_KEY (first 20 chars):', process.env.SUPABASE_KEY.substring(0, 20) + '...');

// Test connection
supabase
  .from('patients')
  .select('id')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.log('❌ Connection failed:', error.message);
      console.log('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Connection successful!');
      console.log('Data:', data);
    }
  })
  .catch(error => {
    console.log('❌ Unexpected error:', error.message);
  });