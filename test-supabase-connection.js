// Test Supabase connection and RLS policies
import { supabase } from './src/config/supabase.js';

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Test 2: Test authenticated access to appointments
    console.log('🔍 Testing appointments access...');
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);
    
    if (appointmentsError) {
      console.error('❌ Appointments access failed:', appointmentsError.message);
      console.error('💡 This might be due to RLS policies. Run fix-rls-policies-complete.sql');
      return false;
    }
    
    console.log('✅ Appointments access successful');
    
    // Test 3: Test authenticated access to notifications
    console.log('🔍 Testing notifications access...');
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);
    
    if (notificationsError) {
      console.error('❌ Notifications access failed:', notificationsError.message);
      console.error('💡 This might be due to RLS policies. Run fix-rls-policies-complete.sql');
      return false;
    }
    
    console.log('✅ Notifications access successful');
    
    console.log('🎉 All tests passed! Supabase is properly configured.');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection test failed:', err.message);
    return false;
  }
}

// Run the test
testSupabaseConnection().then(success => {
  if (!success) {
    process.exit(1);
  }
});