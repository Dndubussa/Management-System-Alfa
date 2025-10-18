// Validate database schema
import { supabase } from './src/config/supabase.js';

async function validateDatabaseSchema() {
  console.log('🔍 Validating database schema...');
  
  // List of required tables
  const requiredTables = [
    'patients',
    'medical_records',
    'appointments',
    'prescriptions',
    'lab_orders',
    'bills',
    'notifications',
    'service_prices',
    'departments',
    'referrals',
    'insurance_claims',
    'surgery_requests',
    'ot_slots',
    'ot_resources',
    'ot_checklists',
    'surgery_progress',
    'ot_reports',
    'users'
  ];
  
  // Check if all tables exist by trying to access each one
  console.log('🔍 Checking if all required tables exist...');
  for (const table of requiredTables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.error(`❌ Failed to access table '${table}':`, error.message);
        return false;
      }
    } catch (err) {
      console.error(`❌ Error accessing table '${table}':`, err.message);
      return false;
    }
  }
  
  console.log('✅ All required tables exist');
  
  // Check appointments table structure by trying to select each required column
  console.log('🔍 Checking appointments table structure...');
  const requiredAppointmentColumns = [
    'id',
    'patient_id',
    'doctor_id',
    'date_time',
    'duration',
    'type',
    'status',
    'notes'
  ];
  
  try {
    const { error: appointmentsError } = await supabase
      .from('appointments')
      .select(requiredAppointmentColumns.join(','))
      .limit(1);
    
    if (appointmentsError) {
      console.error('❌ Failed to get appointments table structure:', appointmentsError.message);
      return false;
    }
  } catch (err) {
    console.error('❌ Error checking appointments table structure:', err.message);
    return false;
  }
  
  console.log('✅ Appointments table structure is correct');
  
  // Check notifications table structure by trying to select each required column
  console.log('🔍 Checking notifications table structure...');
  const requiredNotificationColumns = [
    'id',
    'user_ids',
    'type',
    'title',
    'message',
    'is_read',
    'created_at'
  ];
  
  try {
    const { error: notificationsError } = await supabase
      .from('notifications')
      .select(requiredNotificationColumns.join(','))
      .limit(1);
    
    if (notificationsError) {
      console.error('❌ Failed to get notifications table structure:', notificationsError.message);
      return false;
    }
  } catch (err) {
    console.error('❌ Error checking notifications table structure:', err.message);
    return false;
  }
  
  console.log('✅ Notifications table structure is correct');
  
  // Test inserting a sample appointment
  console.log('🔍 Testing appointment insertion...');
  const testAppointment = {
    patient_id: '00000000-0000-0000-0000-000000000000',
    doctor_id: '00000000-0000-0000-0000-000000000000',
    date_time: new Date().toISOString(),
    duration: 30,
    type: 'consultation',
    status: 'scheduled',
    notes: 'Test appointment'
  };
  
  const { data: insertedAppointment, error: insertError } = await supabase
    .from('appointments')
    .insert([testAppointment])
    .select()
    .single();
  
  if (insertError) {
    console.error('❌ Failed to insert test appointment:', insertError.message);
    console.error('💡 This might be due to RLS policies. Run fix-rls-policies-complete.sql');
    return false;
  }
  
  console.log('✅ Appointment insertion successful');
  
  // Clean up test appointment
  const { error: deleteError } = await supabase
    .from('appointments')
    .delete()
    .eq('id', insertedAppointment.id);
  
  if (deleteError) {
    console.warn('⚠️ Failed to clean up test appointment:', deleteError.message);
  } else {
    console.log('✅ Test appointment cleaned up');
  }
  
  console.log('🎉 Database schema validation completed successfully!');
  return true;
}

// Run the validation
validateDatabaseSchema().then(success => {
  if (!success) {
    process.exit(1);
  }
});