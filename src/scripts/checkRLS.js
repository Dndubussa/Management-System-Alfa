import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

console.log('=== Checking Row Level Security Status ===');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('SUPABASE_URL:', supabaseUrl);

try {
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client created successfully');
  
  // Try to check RLS status using a PostgreSQL function
  console.log('\nChecking RLS status...');
  
  // First, let's try to see if we can access the pg_policy table
  const { data: policies, error: policiesError } = await supabase
    .from('pg_policy')
    .select('polname, polrelid')
    .limit(5);
  
  if (policiesError) {
    console.log('❌ Cannot access pg_policy:', policiesError.message);
    
    // Let's try a different approach - check if we can access the patients table with count
    console.log('\nTrying to count patients...');
    const { count, error: countError } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log('❌ Cannot count patients:', countError.message);
      console.log('Error code:', countError.code);
      
      // Try with authenticated user simulation
      console.log('\nTrying with authenticated role simulation...');
      const { count: authCount, error: authError } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });
      
      if (authError) {
        console.log('❌ Still cannot access patients:', authError.message);
      } else {
        console.log('✅ Authenticated access successful! Count:', authCount);
      }
    } else {
      console.log('✅ Patients count successful! Count:', count);
    }
  } else {
    console.log('✅ Can access pg_policy');
    console.log('Found policies:', policies);
  }
  
} catch (error) {
  console.log('❌ RLS check failed:', error.message);
  console.log('Error details:', error);
}