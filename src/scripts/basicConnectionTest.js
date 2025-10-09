import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

console.log('=== Basic Supabase Connection Test ===');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_KEY length:', supabaseKey ? `${supabaseKey.length} characters` : 'NOT SET');

try {
  console.log('\nCreating Supabase client...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client created successfully');
  
  // Test RPC function to check if we can connect
  console.log('\nTesting RPC connection...');
  const { data, error } = await supabase.rpc('version');
  
  if (error) {
    console.log('❌ RPC test failed:', error.message);
    console.log('This might indicate a connection issue or authentication problem');
  } else {
    console.log('✅ RPC test successful!');
    console.log('Database version:', data);
  }
  
  console.log('\n🎉 Basic connection test completed!');
  
} catch (error) {
  console.log('❌ Connection test failed:', error.message);
  console.log('Error stack:', error.stack);
}