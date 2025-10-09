import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

console.log('=== Basic Authentication Test ===');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('SUPABASE_URL:', supabaseUrl);
console.log('Using service role key');

try {
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client created successfully');
  
  // Try a simple health check
  console.log('\nTesting basic connectivity...');
  
  // Try to get the current user/session info
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.log('❌ Session check failed:', sessionError.message);
  } else {
    console.log('✅ Session check successful');
    console.log('Session data:', JSON.stringify(sessionData, null, 2));
  }
  
  // Try to get user info
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.log('❌ User info check failed:', userError.message);
  } else {
    console.log('✅ User info check successful');
    console.log('User data:', JSON.stringify(userData, null, 2));
  }
  
} catch (error) {
  console.log('❌ Authentication test failed:', error.message);
  console.log('Error details:', error);
}