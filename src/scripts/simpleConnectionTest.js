import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { supabase } from '../config/supabase.js';

async function testSimpleConnection() {
  console.log('=== Simple Supabase Connection Test ===\n');
  
  try {
    // Test a simple select query with limit 1
    console.log('Testing simple query...');
    const { data, error, count } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Query failed:', error.message);
      console.log('This might be a permissions issue with the Supabase anon key.');
      console.log('For full database access, you might need to use the service role key.');
      return false;
    }
    
    console.log('✅ Simple query successful!');
    console.log(`Found ${count} patients in the database.`);
    return true;
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
    return false;
  }
}

// Run the test
testSimpleConnection().then(success => {
  if (success) {
    console.log('\n🎉 Simple connection test passed!');
    console.log('The application can connect to Supabase.');
    console.log('Note: Some operations may require the service role key for full permissions.');
    process.exit(0);
  } else {
    console.log('\n❌ Simple connection test failed.');
    process.exit(1);
  }
});