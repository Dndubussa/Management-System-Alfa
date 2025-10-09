import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

console.log('=== Supabase Table List Test ===');

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
  
  // Try to list tables from information schema
  console.log('\nTesting table listing...');
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name, table_schema')
    .eq('table_schema', 'public')
    .limit(5);
  
  if (error) {
    console.log('❌ Table listing failed:', error.message);
    console.log('Error details:', error);
    
    // Try a different approach - check if we can access a specific table
    console.log('\nTrying to access patients table directly...');
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select('count', { count: 'exact', head: true });
    
    if (patientError) {
      console.log('❌ Direct table access failed:', patientError.message);
      console.log('This suggests either:');
      console.log('1. The service role key is not correct');
      console.log('2. The database schema has not been created');
      console.log('3. RLS is enabled and blocking access even with service role key');
      process.exit(1);
    } else {
      console.log('✅ Direct table access successful!');
      console.log(`Patients table has ${patientData} records`);
    }
  } else {
    console.log('✅ Table listing successful!');
    console.log('Tables found:');
    data.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
  }
  
  console.log('\n🎉 Table list test completed!');
  process.exit(0);
  
} catch (error) {
  console.log('❌ Test failed:', error.message);
  console.log('Error details:', error);
  process.exit(1);
}