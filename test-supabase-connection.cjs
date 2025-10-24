// Test script to check Supabase connection and data fetching
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Get Supabase configuration from environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables');
      console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
      console.log('VITE_SUPABASE_KEY:', supabaseKey ? 'SET' : 'MISSING');
      return false;
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection by fetching a small amount of data
    console.log('📡 Testing connection with a simple query...');
    
    const { data, error } = await supabase
      .from('patients')
      .select('id, mrn, first_name, last_name')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection error:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('📋 Sample patient data:', data);
    
    // Test fetching all patients
    console.log('📊 Fetching all patients...');
    const { data: allPatients, error: patientsError } = await supabase
      .from('patients')
      .select('*')
      .order('mrn', { ascending: true });
    
    if (patientsError) {
      console.error('❌ Error fetching patients:', patientsError);
      return false;
    }
    
    console.log(`✅ Successfully fetched ${allPatients.length} patients`);
    
    // Test fetching appointments
    console.log('📅 Fetching appointments...');
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .limit(5);
    
    if (appointmentsError) {
      console.error('❌ Error fetching appointments:', appointmentsError);
      return false;
    }
    
    console.log(`✅ Successfully fetched ${appointments.length} appointments`);
    
    // Test fetching service prices
    console.log('💰 Fetching service prices...');
    const { data: servicePrices, error: pricesError } = await supabase
      .from('service_prices')
      .select('*')
      .limit(5);
    
    if (pricesError) {
      console.error('❌ Error fetching service prices:', pricesError);
      return false;
    }
    
    console.log(`✅ Successfully fetched ${servicePrices.length} service prices`);
    
    // Test fetching vital signs
    console.log('💓 Fetching vital signs...');
    const { data: vitalSigns, error: vitalsError } = await supabase
      .from('vital_signs')
      .select('*')
      .limit(5);
    
    if (vitalsError) {
      console.error('❌ Error fetching vital signs:', vitalsError);
      return false;
    }
    
    console.log(`✅ Successfully fetched ${vitalSigns.length} vital signs records`);
    
    console.log('🎉 All Supabase tests passed successfully!');
    return true;
    
  } catch (error) {
    console.error('💥 Error during Supabase test:', error);
    return false;
  }
}

// Run the test
testSupabaseConnection().then(success => {
  if (success) {
    console.log('✅ Supabase connection test completed successfully');
  } else {
    console.log('❌ Supabase connection test failed');
  }
});