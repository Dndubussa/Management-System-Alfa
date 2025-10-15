#!/usr/bin/env node

/**
 * Manual ICD Setup Script
 * Provides instructions for manually setting up ICD tables in Supabase
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function displaySetupInstructions() {
  console.log('🏥 ICD-10/ICD-11 Standardized Health Terminologies Setup');
  console.log('=' .repeat(60));
  
  console.log('\n📋 Manual Setup Instructions:');
  console.log('\n1. Open your Supabase Dashboard:');
  console.log('   https://supabase.com/dashboard');
  
  console.log('\n2. Navigate to your project and go to the SQL Editor');
  
  console.log('\n3. Copy and paste the following SQL schema:');
  console.log('   (The schema is in: supabase_icd_schema.sql)');
  
  console.log('\n4. Execute the SQL to create the following tables:');
  console.log('   ✅ icd10_codes - ICD-10 diagnostic codes');
  console.log('   ✅ icd11_codes - ICD-11 diagnostic codes');
  console.log('   ✅ cpt4_codes - CPT-4 procedure codes');
  console.log('   ✅ tanzania_service_codes - Tanzania SHA codes');
  console.log('   ✅ medical_record_diagnoses - Links medical records to ICD codes');
  console.log('   ✅ prescription_diagnoses - Links prescriptions to ICD codes');
  console.log('   ✅ bill_item_diagnoses - Links bill items to ICD codes');
  console.log('   ✅ service_code_mappings - Maps services to standardized codes');
  
  console.log('\n5. Verify the tables were created successfully');
  
  console.log('\n6. Run the ICD integration test:');
  console.log('   node test-icd-integration.js');
  
  console.log('\n📄 SQL Schema Preview:');
  console.log('-' .repeat(40));
  
  try {
    const sqlPath = join(__dirname, 'supabase_icd_schema.sql');
    const sqlContent = readFileSync(sqlPath, 'utf8');
    
    // Show first 20 lines of the SQL file
    const lines = sqlContent.split('\n').slice(0, 20);
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`   ${line}`);
      }
    });
    
    if (sqlContent.split('\n').length > 20) {
      console.log('   ... (truncated - see full file for complete schema)');
    }
    
  } catch (error) {
    console.log('   ❌ Could not read SQL schema file');
    console.log(`   Error: ${error.message}`);
  }
  
  console.log('\n' + '-' .repeat(40));
  
  console.log('\n🎯 What this implementation provides:');
  console.log('   ✅ ICD-10 diagnostic codes (100+ common conditions)');
  console.log('   ✅ ICD-11 diagnostic codes (100+ common conditions)');
  console.log('   ✅ CPT-4 procedure codes (medical procedures)');
  console.log('   ✅ Tanzania Service Codes (SHA codes for NHIF)');
  console.log('   ✅ Service code mappings for interoperability');
  console.log('   ✅ Integration with medical records');
  console.log('   ✅ Integration with prescriptions');
  console.log('   ✅ Integration with billing system');
  console.log('   ✅ NHIF claims processing support');
  console.log('   ✅ Ministry of Health compliance');
  
  console.log('\n🔧 API Endpoints Available:');
  console.log('   GET /api/icd10-codes - Search ICD-10 codes');
  console.log('   GET /api/icd11-codes - Search ICD-11 codes');
  console.log('   GET /api/cpt4-codes - Search CPT-4 codes');
  console.log('   GET /api/tanzania-service-codes - Search SHA codes');
  console.log('   GET /api/medical-record-diagnoses/:id - Get record diagnoses');
  console.log('   POST /api/medical-record-diagnoses - Add record diagnosis');
  console.log('   GET /api/service-code-mappings - Get service mappings');
  console.log('   POST /api/service-code-mappings - Create service mapping');
  
  console.log('\n🧪 Testing:');
  console.log('   After setting up the tables, run:');
  console.log('   node test-icd-integration.js');
  
  console.log('\n📚 Documentation:');
  console.log('   See: ICD_IMPLEMENTATION_GUIDE.md');
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ Setup instructions complete!');
  console.log('   Follow the steps above to complete the ICD implementation.');
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  displaySetupInstructions();
}

export { displaySetupInstructions };
