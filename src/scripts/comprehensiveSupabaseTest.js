import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { supabase } from '../config/supabase.js';

// Test data
const testPatient = {
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

const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  role: 'doctor',
  department: 'Test Department'
};

const testAppointment = {
  date_time: new Date().toISOString(),
  duration: 30,
  type: 'consultation',
  status: 'scheduled',
  notes: 'Test appointment'
};

async function testCRUDOperations() {
  console.log('=== Comprehensive Supabase CRUD Operations Test ===\n');
  
  let patientId = null;
  let userId = null;
  let appointmentId = null;
  
  try {
    // 1. Test Patient Creation
    console.log('1. Testing Patient Creation...');
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .insert([testPatient])
      .select()
      .single();
    
    if (patientError) {
      console.log('❌ Patient creation failed:', patientError.message);
      return false;
    }
    
    patientId = patientData.id;
    console.log('✅ Patient created successfully:', patientData.mrn);
    
    // 2. Test User Creation
    console.log('\n2. Testing User Creation...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([testUser])
      .select()
      .single();
    
    if (userError) {
      console.log('❌ User creation failed:', userError.message);
      return false;
    }
    
    userId = userData.id;
    console.log('✅ User created successfully:', userData.name);
    
    // 3. Test Appointment Creation (with foreign keys)
    console.log('\n3. Testing Appointment Creation...');
    const appointmentWithFK = {
      ...testAppointment,
      patient_id: patientId,
      doctor_id: userId
    };
    
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('appointments')
      .insert([appointmentWithFK])
      .select()
      .single();
    
    if (appointmentError) {
      console.log('❌ Appointment creation failed:', appointmentError.message);
      return false;
    }
    
    appointmentId = appointmentData.id;
    console.log('✅ Appointment created successfully');
    
    // 4. Test Reading All Patients
    console.log('\n4. Testing Reading All Patients...');
    const { data: allPatients, error: readAllError } = await supabase
      .from('patients')
      .select('*');
    
    if (readAllError) {
      console.log('❌ Reading all patients failed:', readAllError.message);
      return false;
    }
    
    console.log(`✅ Successfully read ${allPatients.length} patients`);
    
    // 5. Test Reading Specific Patient
    console.log('\n5. Testing Reading Specific Patient...');
    const { data: specificPatient, error: readOneError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();
    
    if (readOneError) {
      console.log('❌ Reading specific patient failed:', readOneError.message);
      return false;
    }
    
    console.log('✅ Successfully read specific patient:', specificPatient.first_name);
    
    // 6. Test Updating Patient
    console.log('\n6. Testing Patient Update...');
    const { data: updatedPatient, error: updateError } = await supabase
      .from('patients')
      .update({ phone: '999-888-7777' })
      .eq('id', patientId)
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ Patient update failed:', updateError.message);
      return false;
    }
    
    console.log('✅ Patient updated successfully. New phone:', updatedPatient.phone);
    
    // 7. Test Reading Related Data (Join)
    console.log('\n7. Testing Reading Related Data (Join)...');
    const { data: joinedData, error: joinError } = await supabase
      .from('appointments')
      .select(`
        id,
        date_time,
        status,
        patients (first_name, last_name),
        users (name)
      `)
      .eq('id', appointmentId)
      .single();
    
    if (joinError) {
      console.log('❌ Join query failed:', joinError.message);
      return false;
    }
    
    console.log('✅ Successfully performed join query');
    console.log('   Appointment with patient and doctor info:', {
      appointment_id: joinedData.id,
      patient_name: `${joinedData.patients.first_name} ${joinedData.patients.last_name}`,
      doctor_name: joinedData.users.name
    });
    
    // 8. Test Deleting Appointment
    console.log('\n8. Testing Appointment Deletion...');
    const { error: deleteAppointmentError } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId);
    
    if (deleteAppointmentError) {
      console.log('❌ Appointment deletion failed:', deleteAppointmentError.message);
      return false;
    }
    
    console.log('✅ Appointment deleted successfully');
    
    // 9. Test Counting Records
    console.log('\n9. Testing Record Counting...');
    const { count, error: countError } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log('❌ Counting records failed:', countError.message);
      return false;
    }
    
    console.log(`✅ Successfully counted records. Total patients: ${count}`);
    
    // Cleanup
    console.log('\n10. Cleaning up test data...');
    await supabase.from('patients').delete().eq('id', patientId);
    await supabase.from('users').delete().eq('id', userId);
    
    console.log('✅ Test data cleaned up successfully');
    
    return true;
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    // Cleanup on error
    if (patientId) await supabase.from('patients').delete().eq('id', patientId);
    if (userId) await supabase.from('users').delete().eq('id', userId);
    if (appointmentId) await supabase.from('appointments').delete().eq('id', appointmentId);
    return false;
  }
}

// Run the comprehensive test
async function runComprehensiveTest() {
  const success = await testCRUDOperations();
  
  if (success) {
    console.log('\n🎉 All Supabase CRUD operations are working correctly!');
    console.log('✅ The application is properly integrated with Supabase.');
    process.exit(0);
  } else {
    console.log('\n❌ Some Supabase operations failed.');
    console.log('❌ Please check your Supabase configuration and database schema.');
    process.exit(1);
  }
}

runComprehensiveTest();