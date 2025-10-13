import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Expected table schemas
const expectedSchemas = {
  users: ['id', 'name', 'email', 'role', 'department'],
  patients: ['id', 'mrn', 'first_name', 'last_name', 'date_of_birth', 'gender', 'phone', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship', 'insurance_provider', 'insurance_membership_number', 'created_at', 'updated_at'],
  medical_records: ['id', 'patient_id', 'doctor_id', 'visit_date', 'chief_complaint', 'diagnosis', 'treatment', 'notes', 'blood_pressure', 'heart_rate', 'temperature', 'weight', 'height', 'status', 'created_at', 'updated_at'],
  appointments: ['id', 'patient_id', 'doctor_id', 'date_time', 'duration', 'type', 'status', 'notes'],
  prescriptions: ['id', 'record_id', 'patient_id', 'doctor_id', 'medication', 'dosage', 'frequency', 'duration', 'instructions', 'status', 'created_at'],
  lab_orders: ['id', 'record_id', 'patient_id', 'doctor_id', 'test_name', 'instructions', 'status', 'results', 'created_at', 'completed_at'],
  bills: ['id', 'patient_id', 'total_amount', 'status', 'payment_method', 'created_at', 'updated_at']
};

async function validateTableSchema(tableName, expectedColumns) {
  try {
    console.log(`\n🔍 Checking table: ${tableName}`);
    
    // Try to get table info by selecting one row
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`❌ ${tableName}: ${error.message}`);
      return false;
    }
    
    // If we get data, the table exists and is accessible
    console.log(`✅ ${tableName}: Table exists and is accessible`);
    
    // Check if we can get column information by trying to select specific columns
    const missingColumns = [];
    for (const column of expectedColumns) {
      try {
        const { error: colError } = await supabase
          .from(tableName)
          .select(column)
          .limit(1);
        
        if (colError) {
          missingColumns.push(column);
        }
      } catch (err) {
        missingColumns.push(column);
      }
    }
    
    if (missingColumns.length > 0) {
      console.log(`⚠️  ${tableName}: Missing columns: ${missingColumns.join(', ')}`);
    } else {
      console.log(`✅ ${tableName}: All expected columns present`);
    }
    
    return missingColumns.length === 0;
  } catch (err) {
    console.log(`❌ ${tableName}: ${err.message}`);
    return false;
  }
}

async function validateDatabaseSchema() {
  console.log('🔍 Validating database schema...');
  
  let allValid = true;
  
  for (const [tableName, expectedColumns] of Object.entries(expectedSchemas)) {
    const isValid = await validateTableSchema(tableName, expectedColumns);
    if (!isValid) {
      allValid = false;
    }
  }
  
  console.log('\n📊 Validation Summary:');
  if (allValid) {
    console.log('✅ All tables and columns are properly configured!');
  } else {
    console.log('❌ Some tables or columns are missing or misconfigured.');
    console.log('\n🔧 To fix schema issues:');
    console.log('1. Run the SQL schema files in your Supabase SQL editor:');
    console.log('   - supabase_schema.sql');
    console.log('   - supabase_missing_tables_schema.sql');
    console.log('   - supabase_hr_schema.sql');
    console.log('2. Make sure all tables are created with the correct column names');
    console.log('3. Ensure RLS policies are properly configured');
  }
  
  return allValid;
}

validateDatabaseSchema().then(success => {
  process.exit(success ? 0 : 1);
});
