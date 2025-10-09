import dotenv from 'dotenv';
dotenv.config();

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY || 'YOUR_SUPABASE_KEY';

console.log('=== Environment Variables ===');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'SET' : 'NOT SET');
console.log('VITE_SUPABASE_KEY:', process.env.VITE_SUPABASE_KEY ? 'SET' : 'NOT SET');

console.log('\n=== Configuration Logic ===');
console.log('supabaseUrl selected:', supabaseUrl);
console.log('supabaseKey selected:', supabaseKey ? 'SET' : 'NOT SET');

// Check which one is being used
if (process.env.SUPABASE_KEY && process.env.SUPABASE_URL) {
  console.log('✅ Using backend configuration (SUPABASE_URL + SUPABASE_KEY)');
} else if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_KEY) {
  console.log('⚠️  Using frontend configuration (VITE_SUPABASE_URL + VITE_SUPABASE_KEY)');
} else {
  console.log('❌ No valid configuration found');
}

// Now test with explicit service role key
import { createClient } from '@supabase/supabase-js';

console.log('\n=== Testing with Explicit Service Role Key ===');
const testClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

testClient
  .from('patients')
  .select('id')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.log('❌ Service role key test failed:', error.message);
      console.log('Error details:', error);
    } else {
      console.log('✅ Service role key test successful!');
      console.log('Data received:', data);
    }
  })
  .catch(error => {
    console.log('❌ Unexpected error with service role key:', error.message);
  });