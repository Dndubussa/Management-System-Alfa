import { supabase } from '../config/supabase.js';

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test a simple query to see if we can connect
    const { data, error } = await supabase
      .from('patients')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('Supabase connection test failed:', error.message);
      return false;
    }
    
    console.log('Supabase connection successful!');
    console.log('Test query result:', data);
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
}

// Run the test
testSupabaseConnection().then(success => {
  if (success) {
    console.log('✅ Supabase is properly configured!');
  } else {
    console.log('❌ Supabase connection failed. Please check your configuration.');
  }
  process.exit(success ? 0 : 1);
});