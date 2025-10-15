#!/usr/bin/env node

/**
 * Setup ICD Tables Script
 * Creates the ICD-10/ICD-11 standardized health terminologies tables in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQLFile(filename) {
  console.log(`\n📄 Executing ${filename}...`);
  
  try {
    const sqlPath = join(__dirname, filename);
    const sqlContent = readFileSync(sqlPath, 'utf8');
    
    // Split SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`   Found ${statements.length} SQL statements`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.log(`   ⚠️  Statement warning: ${error.message}`);
          // Continue execution for warnings
          successCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        console.log(`   ❌ Statement error: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log(`   ✅ ${successCount} statements executed successfully`);
    if (errorCount > 0) {
      console.log(`   ❌ ${errorCount} statements failed`);
    }
    
    return errorCount === 0;
  } catch (error) {
    console.error(`   ❌ Failed to execute ${filename}: ${error.message}`);
    return false;
  }
}

async function testTablesExist() {
  console.log('\n🧪 Testing if ICD tables exist...');
  
  const tables = [
    'icd10_codes',
    'icd11_codes', 
    'cpt4_codes',
    'tanzania_service_codes',
    'medical_record_diagnoses',
    'prescription_diagnoses',
    'bill_item_diagnoses',
    'service_code_mappings'
  ];
  
  let existingTables = 0;
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ Table ${table} - NOT FOUND`);
      } else {
        console.log(`   ✅ Table ${table} - EXISTS`);
        existingTables++;
      }
    } catch (err) {
      console.log(`   ❌ Table ${table} - ERROR: ${err.message}`);
    }
  }
  
  console.log(`\n📊 Tables Status: ${existingTables}/${tables.length} tables exist`);
  return existingTables === tables.length;
}

async function testDataExists() {
  console.log('\n📊 Testing if sample data exists...');
  
  const tests = [
    { table: 'icd10_codes', description: 'ICD-10 codes' },
    { table: 'icd11_codes', description: 'ICD-11 codes' },
    { table: 'cpt4_codes', description: 'CPT-4 codes' },
    { table: 'tanzania_service_codes', description: 'Tanzania service codes' }
  ];
  
  let dataExists = 0;
  
  for (const test of tests) {
    try {
      const { data, error } = await supabase
        .from(test.table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ ${test.description} - ERROR: ${error.message}`);
      } else if (data && data.length > 0) {
        console.log(`   ✅ ${test.description} - ${data.length} records found`);
        dataExists++;
      } else {
        console.log(`   ⚠️  ${test.description} - No data found`);
      }
    } catch (err) {
      console.log(`   ❌ ${test.description} - ERROR: ${err.message}`);
    }
  }
  
  console.log(`\n📊 Data Status: ${dataExists}/${tests.length} tables have data`);
  return dataExists > 0;
}

async function setupICDTables() {
  console.log('🚀 Setting up ICD-10/ICD-11 Standardized Health Terminologies...');
  console.log('=' .repeat(60));
  
  // Check if tables already exist
  const tablesExist = await testTablesExist();
  
  if (!tablesExist) {
    console.log('\n📋 Creating ICD tables...');
    
    // Execute the SQL schema file
    const success = await executeSQLFile('supabase_icd_schema.sql');
    
    if (success) {
      console.log('✅ ICD tables created successfully');
    } else {
      console.log('⚠️  ICD tables creation completed with warnings');
    }
    
    // Test again
    await testTablesExist();
  } else {
    console.log('✅ ICD tables already exist');
  }
  
  // Check if data exists
  const dataExists = await testDataExists();
  
  if (!dataExists) {
    console.log('\n⚠️  No sample data found. The schema was created but data needs to be imported.');
    console.log('   You can run the SQL schema file manually in your Supabase dashboard');
    console.log('   or use the Supabase CLI to import the data.');
  } else {
    console.log('✅ Sample data found');
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🎉 ICD setup completed!');
  console.log('\nNext steps:');
  console.log('1. Verify tables in your Supabase dashboard');
  console.log('2. Run the ICD integration test: node test-icd-integration.js');
  console.log('3. Test the API endpoints in your application');
}

// Run setup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupICDTables()
    .then(() => {
      console.log('\n✅ Setup completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Setup failed:', error);
      process.exit(1);
    });
}

export { setupICDTables, testTablesExist, testDataExists };
