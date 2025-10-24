import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseTables() {
  try {
    console.log('🔍 Checking database tables...');
    console.log('📊 Supabase URL:', supabaseUrl);
    console.log('🔑 Using key:', supabaseKey.substring(0, 20) + '...');
    console.log('');
    
    // Get all tables in the public schema
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (tablesError) {
      console.error('❌ Error fetching tables:', tablesError.message);
      return;
    }
    
    console.log('📋 Tables in your database:');
    console.log('================================');
    
    if (tables && tables.length > 0) {
      tables.forEach(table => {
        console.log(`✅ ${table.table_name} (${table.table_type})`);
      });
    } else {
      console.log('❌ No tables found');
    }
    
    console.log('');
    console.log('🔍 Checking for vital_signs table specifically...');
    
    // Check if vital_signs table exists
    const { data: vitalSignsCheck, error: vitalSignsError } = await supabase
      .from('vital_signs')
      .select('count')
      .limit(1);
    
    if (vitalSignsError) {
      if (vitalSignsError.message.includes('relation "vital_signs" does not exist')) {
        console.log('❌ vital_signs table does NOT exist');
        console.log('💡 You need to run the create-vital-signs-simple.sql script');
      } else {
        console.log('❌ Error checking vital_signs:', vitalSignsError.message);
      }
    } else {
      console.log('✅ vital_signs table exists and is accessible');
    }
    
    console.log('');
    console.log('🔍 Checking table columns for vital_signs...');
    
    // Get columns for vital_signs if it exists
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'vital_signs')
      .eq('table_schema', 'public')
      .order('ordinal_position');
    
    if (columnsError) {
      console.log('❌ Could not fetch columns:', columnsError.message);
    } else if (columns && columns.length > 0) {
      console.log('📊 vital_signs table columns:');
      columns.forEach(column => {
        console.log(`  - ${column.column_name}: ${column.data_type} (${column.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    } else {
      console.log('❌ No columns found for vital_signs table');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkDatabaseTables();
