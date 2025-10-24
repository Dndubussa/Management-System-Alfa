import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...');
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('patients')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Check if vital_signs table exists
    console.log('🔍 Checking for vital_signs table...');
    
    const { data: vitalData, error: vitalError } = await supabase
      .from('vital_signs')
      .select('*')
      .limit(1);
    
    if (vitalError) {
      if (vitalError.message.includes('relation "vital_signs" does not exist')) {
        console.log('❌ vital_signs table does NOT exist');
        console.log('💡 You need to create this table in Supabase');
      } else {
        console.log('❌ Error accessing vital_signs:', vitalError.message);
      }
    } else {
      console.log('✅ vital_signs table exists');
      console.log('📊 Sample data:', vitalData);
    }
    
    // List some common tables
    console.log('🔍 Checking common tables...');
    
    const tablesToCheck = ['patients', 'users', 'appointments', 'medical_records', 'vital_signs'];
    
    for (const tableName of tablesToCheck) {
      const { data, error } = await supabase
        .from(tableName)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ ${tableName}: exists`);
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkTables();
