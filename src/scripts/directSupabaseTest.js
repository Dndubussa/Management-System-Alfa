import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

console.log('=== Direct Supabase Connection Test ===');

// Use the service role key directly
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_KEY length:', supabaseKey ? `${supabaseKey.length} characters` : 'NOT SET');

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase configuration');
  process.exit(1);
}

try {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('✅ Supabase client created successfully');
  
  // Test a simple query
  console.log('\nTesting simple query...');
  const { data, error, count } = await supabase
    .from('patients')
    .select('id, mrn, first_name, last_name', { count: 'exact' })
    .limit(1);
  
  if (error) {
    console.log('❌ Query failed:', error.message);
    console.log('Error details:', error);
    process.exit(1);
  }
  
  console.log('✅ Query successful!');
  console.log(`Found ${count} patients`);
  if (data && data.length > 0) {
    console.log('Sample patient:', data[0]);
  } else {
    console.log('No patients found in the database');
  }
  
  console.log('\n🎉 Direct Supabase connection test passed!');
  process.exit(0);
  
} catch (error) {
  console.log('❌ Connection test failed:', error.message);
  console.log('Error details:', error);
  process.exit(1);
}