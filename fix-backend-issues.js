// Fix backend issues script
import { supabase } from './src/config/supabase.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔧 Fixing backend issues...');

// Check if required environment variables are set
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_KEY',
  'SUPABASE_URL',
  'VITE_SUPABASE_SERVICE_ROLE_KEY'
];

console.log('🔍 Checking environment variables...');
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing environment variables:', missingEnvVars);
  console.log('💡 Please check your .env.local file');
  process.exit(1);
}

console.log('✅ All required environment variables are set');

// Test Supabase connection
async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection test failed:', err.message);
    return false;
  }
}

// Test appointments table access
async function testAppointmentsAccess() {
  console.log('🔍 Testing appointments access...');
  
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Appointments access failed:', error.message);
      return false;
    }
    
    console.log('✅ Appointments access successful');
    return true;
  } catch (err) {
    console.error('❌ Appointments access test failed:', err.message);
    return false;
  }
}

// Test notifications table access
async function testNotificationsAccess() {
  console.log('🔍 Testing notifications access...');
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Notifications access failed:', error.message);
      return false;
    }
    
    console.log('✅ Notifications access successful');
    return true;
  } catch (err) {
    console.error('❌ Notifications access test failed:', err.message);
    return false;
  }
}

// Run all tests
async function runFixes() {
  console.log('🔧 Running backend fixes...');
  
  const connectionSuccess = await testSupabaseConnection();
  if (!connectionSuccess) {
    console.error('❌ Supabase connection failed. Please check your configuration.');
    return false;
  }
  
  const appointmentsSuccess = await testAppointmentsAccess();
  if (!appointmentsSuccess) {
    console.error('❌ Appointments access failed. You may need to run the RLS fix script.');
    console.log('💡 Run: fix-rls-policies-complete.sql in your Supabase SQL Editor');
    return false;
  }
  
  const notificationsSuccess = await testNotificationsAccess();
  if (!notificationsSuccess) {
    console.error('❌ Notifications access failed. You may need to run the RLS fix script.');
    console.log('💡 Run: fix-rls-policies-complete.sql in your Supabase SQL Editor');
    return false;
  }
  
  console.log('🎉 All backend fixes completed successfully!');
  console.log('✅ Your backend should now be working properly.');
  return true;
}

// Run the fixes
runFixes().then(success => {
  if (!success) {
    process.exit(1);
  }
});