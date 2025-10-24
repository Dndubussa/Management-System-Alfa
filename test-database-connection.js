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

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const { data: healthData, error: healthError } = await supabase
      .from('vital_signs')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.error('❌ Database connection failed:', healthError.message);
      
      if (healthError.message.includes('relation "vital_signs" does not exist')) {
        console.log('💡 The vital_signs table does not exist. Please run the fix-vital-signs-table.sql script in your Supabase SQL editor.');
      } else if (healthError.message.includes('schema cache')) {
        console.log('💡 Schema cache issue. The table might exist but needs to be refreshed.');
      }
      
      return false;
    }
    
    console.log('✅ Database connection successful!');
    console.log('✅ vital_signs table exists and is accessible');
    
    // Test table structure
    const { data: tableData, error: tableError } = await supabase
      .from('vital_signs')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table structure issue:', tableError.message);
      return false;
    }
    
    console.log('✅ Table structure is correct');
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

testDatabaseConnection().then(success => {
  if (success) {
    console.log('🎉 Database is ready for vital signs!');
  } else {
    console.log('🔧 Please fix the database issues and try again.');
  }
});
