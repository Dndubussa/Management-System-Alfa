import dotenv from 'dotenv';
dotenv.config();

import { supabase } from '../config/supabase.js';

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test connection by querying the patients table
    const { data, error } = await supabase
      .from('patients')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
      console.log('Please check your SUPABASE_URL and SUPABASE_KEY in the .env file');
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('Test query result:', data);
    return true;
  } catch (error) {
    console.log('❌ Supabase connection error:', error.message);
    console.log('Please check your SUPABASE_URL and SUPABASE_KEY in the .env file');
    return false;
  }
}

// Test inserting a sample patient
async function testInsertPatient() {
  console.log('\nTesting patient insertion...');
  
  try {
    const newPatient = {
      mrn: 'TEST-001',
      first_name: 'John',
      last_name: 'Doe',
      date_of_birth: '1990-01-01',
      gender: 'male',
      phone: '123-456-7890',
      address: '123 Main St',
      emergency_contact_name: 'Jane Doe',
      emergency_contact_phone: '123-456-7891',
      emergency_contact_relationship: 'Spouse',
      insurance_provider: 'Test Insurance',
      insurance_membership_number: 'TEST-12345'
    };
    
    const { data, error } = await supabase
      .from('patients')
      .insert([newPatient])
      .select()
      .single();
    
    if (error) {
      console.log('❌ Patient insertion failed:', error.message);
      return false;
    }
    
    console.log('✅ Patient insertion successful!');
    console.log('Inserted patient:', data);
    
    // Clean up - delete the test patient
    if (data && data.id) {
      await supabase
        .from('patients')
        .delete()
        .eq('id', data.id);
      console.log('✅ Test patient cleaned up');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Patient insertion error:', error.message);
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log('=== Supabase Integration Tests ===\n');
  
  const connectionSuccess = await testSupabaseConnection();
  if (!connectionSuccess) {
    process.exit(1);
  }
  
  const insertSuccess = await testInsertPatient();
  if (!insertSuccess) {
    process.exit(1);
  }
  
  console.log('\n✅ All tests passed! Supabase integration is working correctly.');
  process.exit(0);
}

runTests();