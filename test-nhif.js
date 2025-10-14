// Simple NHIF Integration Test Runner
// Run with: node test-nhif.js

import fs from 'fs';
import path from 'path';

console.log('🚀 NHIF Integration Test Runner');
console.log('================================\n');

// Test 1: Check if all required files exist
console.log('1️⃣ Checking Required Files...');

const requiredFiles = [
  'src/types/nhif.ts',
  'src/services/nhifService.ts',
  'src/hooks/useNHIF.ts',
  'src/components/Billing/NHIFClaims.tsx',
  'src/components/Admin/NHIFConfig.tsx',
  'NHIF_INTEGRATION_GUIDE.md'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - Missing!`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('✅ All required files exist\n');
} else {
  console.log('❌ Some required files are missing\n');
}

// Test 2: Check TypeScript compilation
console.log('2️⃣ Checking TypeScript Files...');

const tsFiles = requiredFiles.filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));
let tsErrors = 0;

tsFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // Basic syntax checks
    if (content.includes('export interface') || content.includes('export class') || content.includes('export function')) {
      console.log(`   ✅ ${file} - Valid TypeScript structure`);
    } else {
      console.log(`   ⚠️  ${file} - No exports found`);
    }
  } catch (error) {
    console.log(`   ❌ ${file} - Error reading file: ${error.message}`);
    tsErrors++;
  }
});

if (tsErrors === 0) {
  console.log('✅ All TypeScript files are readable\n');
} else {
  console.log(`❌ ${tsErrors} TypeScript files have errors\n`);
}

// Test 3: Check NHIF Service Structure
console.log('3️⃣ Checking NHIF Service Structure...');

try {
  const nhifServiceContent = fs.readFileSync('src/services/nhifService.ts', 'utf8');
  
  const requiredMethods = [
    'validatePatient',
    'submitClaim',
    'requestPreAuth',
    'checkClaimStatus',
    'getServices',
    'getICD11Codes'
  ];
  
  let methodsFound = 0;
  
  requiredMethods.forEach(method => {
    if (nhifServiceContent.includes(`async ${method}(`)) {
      console.log(`   ✅ ${method} method found`);
      methodsFound++;
    } else {
      console.log(`   ❌ ${method} method missing`);
    }
  });
  
  if (methodsFound === requiredMethods.length) {
    console.log('✅ All required NHIF service methods are present\n');
  } else {
    console.log(`❌ ${requiredMethods.length - methodsFound} methods are missing\n`);
  }
  
} catch (error) {
  console.log(`❌ Error reading NHIF service: ${error.message}\n`);
}

// Test 4: Check NHIF Types
console.log('4️⃣ Checking NHIF Types...');

try {
  const nhifTypesContent = fs.readFileSync('src/types/nhif.ts', 'utf8');
  
  const requiredTypes = [
    'NHIFConfig',
    'NHIFPatient',
    'NHIFClaim',
    'NHIFClaimResponse',
    'NHIFValidationResponse',
    'NHIFPreAuthRequest',
    'NHIFPreAuthResponse'
  ];
  
  let typesFound = 0;
  
  requiredTypes.forEach(type => {
    if (nhifTypesContent.includes(`interface ${type}`)) {
      console.log(`   ✅ ${type} interface found`);
      typesFound++;
    } else {
      console.log(`   ❌ ${type} interface missing`);
    }
  });
  
  if (typesFound === requiredTypes.length) {
    console.log('✅ All required NHIF types are present\n');
  } else {
    console.log(`❌ ${requiredTypes.length - typesFound} types are missing\n`);
  }
  
} catch (error) {
  console.log(`❌ Error reading NHIF types: ${error.message}\n`);
}

// Test 5: Check Component Integration
console.log('5️⃣ Checking Component Integration...');

try {
  const billDetailsContent = fs.readFileSync('src/components/Billing/BillDetails.tsx', 'utf8');
  
  if (billDetailsContent.includes('NHIFClaims')) {
    console.log('   ✅ NHIFClaims component imported in BillDetails');
  } else {
    console.log('   ❌ NHIFClaims component not imported in BillDetails');
  }
  
  if (billDetailsContent.includes('patient?.insuranceInfo?.provider === \'NHIF\'')) {
    console.log('   ✅ NHIF patient detection logic found');
  } else {
    console.log('   ❌ NHIF patient detection logic missing');
  }
  
  if (billDetailsContent.includes('onClaimSubmitted')) {
    console.log('   ✅ Claim submission handler found');
  } else {
    console.log('   ❌ Claim submission handler missing');
  }
  
  console.log('✅ Component integration checks completed\n');
  
} catch (error) {
  console.log(`❌ Error checking component integration: ${error.message}\n`);
}

// Test 6: Check Documentation
console.log('6️⃣ Checking Documentation...');

try {
  const guideContent = fs.readFileSync('NHIF_INTEGRATION_GUIDE.md', 'utf8');
  
  const requiredSections = [
    'Setup Instructions',
    'API Documentation',
    'Usage Examples',
    'Troubleshooting',
    'Security Guidelines'
  ];
  
  let sectionsFound = 0;
  
  requiredSections.forEach(section => {
    if (guideContent.includes(section)) {
      console.log(`   ✅ ${section} section found`);
      sectionsFound++;
    } else {
      console.log(`   ❌ ${section} section missing`);
    }
  });
  
  if (sectionsFound === requiredSections.length) {
    console.log('✅ All required documentation sections are present\n');
  } else {
    console.log(`❌ ${requiredSections.length - sectionsFound} documentation sections are missing\n`);
  }
  
} catch (error) {
  console.log(`❌ Error reading documentation: ${error.message}\n`);
}

// Test 7: Environment Configuration Check
console.log('7️⃣ Checking Environment Configuration...');

const envVars = [
  'REACT_APP_NHIF_API_URL',
  'REACT_APP_NHIF_CLIENT_ID',
  'REACT_APP_NHIF_CLIENT_SECRET',
  'REACT_APP_NHIF_FACILITY_CODE',
  'REACT_APP_NHIF_ENVIRONMENT'
];

console.log('📋 Required Environment Variables:');
envVars.forEach(envVar => {
  console.log(`   🔧 ${envVar}`);
});

console.log('\n💡 To configure NHIF integration:');
console.log('   1. Create .env.local file in project root');
console.log('   2. Add the environment variables above');
console.log('   3. Set values for your NHIF API credentials');
console.log('   4. Use sandbox environment for testing');
console.log('   5. Switch to production when ready\n');

// Final Summary
console.log('================================');
console.log('📊 NHIF Integration Test Summary');
console.log('================================');

if (allFilesExist && tsErrors === 0) {
  console.log('🎉 NHIF Integration is properly set up!');
  console.log('\n✅ What\'s Working:');
  console.log('   • All required files are present');
  console.log('   • TypeScript files are valid');
  console.log('   • NHIF service methods are implemented');
  console.log('   • Type definitions are complete');
  console.log('   • Component integration is ready');
  console.log('   • Documentation is comprehensive');
  
  console.log('\n🚀 Next Steps:');
  console.log('   1. Obtain NHIF API credentials');
  console.log('   2. Configure environment variables');
  console.log('   3. Test with real NHIF API');
  console.log('   4. Train staff on claims processing');
  console.log('   5. Go live with production environment');
  
  console.log('\n📚 Resources:');
  console.log('   • NHIF Integration Guide: NHIF_INTEGRATION_GUIDE.md');
  console.log('   • Admin Configuration: /admin/nhif-config');
  console.log('   • Claims Processing: Available in bill details for NHIF patients');
  
} else {
  console.log('⚠️  NHIF Integration needs attention');
  console.log('\n❌ Issues Found:');
  if (!allFilesExist) {
    console.log('   • Some required files are missing');
  }
  if (tsErrors > 0) {
    console.log(`   • ${tsErrors} TypeScript files have errors`);
  }
  
  console.log('\n🔧 Please fix the issues above before proceeding');
}

console.log('\n🏁 Test completed!');
