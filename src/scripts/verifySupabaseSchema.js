import dotenv from 'dotenv';
dotenv.config();

import { supabase } from '../config/supabase.js';

// List of required tables
const requiredTables = [
  'patients',
  'medical_records',
  'prescriptions',
  'lab_orders',
  'appointments',
  'users',
  'notifications',
  'service_prices',
  'bills',
  'bill_items',
  'departments',
  'referrals',
  'insurance_claims',
  'surgery_requests',
  'ot_slots',
  'ot_resources',
  'ot_checklists',
  'ot_checklist_items',
  'surgery_progress',
  'ot_reports',
  'ot_report_surgeries'
];

async function verifySchema() {
  console.log('=== Verifying Supabase Database Schema ===\n');
  
  let allTablesExist = true;
  
  for (const table of requiredTables) {
    try {
      // Try to query the table with a limit of 1 row
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) {
        // Check if the error is because the table doesn't exist
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log(`❌ Table '${table}' does not exist`);
          allTablesExist = false;
        } else {
          // Some other error occurred
          console.log(`⚠️  Table '${table}' exists but has an issue:`, error.message);
        }
      } else {
        console.log(`✅ Table '${table}' exists and is accessible`);
      }
    } catch (error) {
      console.log(`❌ Error checking table '${table}':`, error.message);
      allTablesExist = false;
    }
  }
  
  console.log('\n=== Schema Verification Summary ===');
  if (allTablesExist) {
    console.log('✅ All required tables exist in the database');
    console.log('✅ Supabase schema is properly set up');
    return true;
  } else {
    console.log('❌ Some required tables are missing');
    console.log('❌ Please run the supabase_schema.sql script to create all tables');
    return false;
  }
}

// Run the verification
verifySchema().then(success => {
  if (success) {
    console.log('\n🎉 Database schema verification completed successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Database schema verification failed.');
    console.log('Please check the output above and ensure all required tables exist.');
    process.exit(1);
  }
});