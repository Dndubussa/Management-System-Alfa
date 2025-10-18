// Comprehensive script to fix all remaining unsafe patient lookups
const fs = require('fs');
const path = require('path');

// List of all files that still need to be updated
const filesToUpdate = [
  'src/components/Dashboard/OphthalmologistDashboard.tsx',
  'src/components/Dashboard/InternalMedicineDashboard.tsx',
  'src/components/EMR/MedicalRecordForm.tsx',
  'src/components/Billing/BillDetails.tsx',
  'src/components/Billing/NHIFClaims.tsx',
  'src/components/OT/OTSchedule.tsx',
  'src/components/Lab/LabOrderForm.tsx',
  'src/hooks/useServiceBilling.ts',
  'src/hooks/useConsultationBilling.ts',
  'src/components/Reports/ReportsDashboard.tsx',
  'src/components/Insurance/InsuranceReports.tsx',
  'src/components/Cashier/ReportsReconciliations.tsx',
  'src/components/PhysicalTherapist/PTReports.tsx',
  'src/components/EMR/OphthalmologyEMRForm.tsx',
  'src/components/PhysicalTherapist/PTAppointments.tsx',
  'src/components/PhysicalTherapist/PTDashboard.tsx',
  'src/components/Cashier/CashierDashboard.tsx',
  'src/components/Cashier/OutstandingBills.tsx',
  'src/components/Cashier/InsuranceClaims.tsx',
  'src/components/Cashier/InvoiceGeneration.tsx',
  'src/components/Insurance/InsuranceOfficerDashboard.tsx',
  'src/components/Insurance/ClaimTracking.tsx',
  'src/components/Insurance/InsuranceClaimDetails.tsx',
  'src/components/OT/OTChecklists.tsx',
  'src/components/OT/SurgeryRequests.tsx',
  'src/components/EMR/InternalMedicineEMRForm.tsx',
  'src/components/Receptionist/ReceptionistDashboard.tsx',
  'src/components/Billing/BillingDashboard.tsx',
  'src/components/OT/OTPatientQueue.tsx',
  'src/components/Admin/AdminDashboard.tsx',
  'src/components/Receptionist/InsuranceClaimDetails.tsx',
  'src/components/Dashboard/DashboardStats.tsx',
  'src/components/Billing/InsuranceClaimsList.tsx',
  'src/components/EMR/OphthalmologyImaging.tsx',
  'src/components/Referrals/ReferralForm.tsx',
  'src/components/Referrals/ReferralDetail.tsx'
];

// Function to update a file
function updateFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Add import if not present
    if (!content.includes('import { findPatientSafely, getPatientDisplayName }')) {
      // Find the last import statement
      const importRegex = /import.*from.*['"];?\s*$/gm;
      const imports = content.match(importRegex);
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const insertIndex = lastImportIndex + lastImport.length;
        
        // Determine the correct import path based on file location
        const depth = filePath.split('/').length - 2; // -2 for src/ and filename
        const importPath = '../'.repeat(depth) + 'utils/patientUtils';
        
        content = content.slice(0, insertIndex) + 
          `\nimport { findPatientSafely, getPatientDisplayName } from '${importPath}';` +
          content.slice(insertIndex);
        modified = true;
      }
    }
    
    // Replace unsafe patient lookups
    const originalContent = content;
    
    // Replace simple patient lookups
    content = content.replace(
      /const patient = patients\.find\(p => p\.id === ([^)]+)\);/g,
      'const patient = findPatientSafely(patients, $1);'
    );
    
    content = content.replace(
      /const foundPatient = patients\.find\(p => p\.id === ([^)]+)\);/g,
      'const foundPatient = findPatientSafely(patients, $1);'
    );
    
    // Replace patient lookups in ternary operations
    content = content.replace(
      /patients\.find\(p => p\.id === ([^)]+)\) \? patients\.find\(p => p\.id === \1\)/g,
      'findPatientSafely(patients, $1) ? findPatientSafely(patients, $1)'
    );
    
    // Replace complex patient name displays
    content = content.replace(
      /\$\{patients\.find\(p => p\.id === ([^)]+)\)\?\.firstName\} \$\{patients\.find\(p => p\.id === \1\)\?\.lastName\}/g,
      '${getPatientDisplayName(patients, $1)}'
    );
    
    // Replace patient lookups in filter functions
    content = content.replace(
      /patients\.find\(p => p\.id === ([^)]+)\)\?\.firstName\.toLowerCase\(\)\.includes\(/g,
      'findPatientSafely(patients, $1)?.firstName?.toLowerCase()?.includes('
    );
    
    content = content.replace(
      /patients\.find\(p => p\.id === ([^)]+)\)\?\.lastName\.toLowerCase\(\)\.includes\(/g,
      'findPatientSafely(patients, $1)?.lastName?.toLowerCase()?.includes('
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated: ${filePath}`);
      modified = true;
    }
    
    if (!modified) {
      console.log(`No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

// Update all files
console.log('Starting comprehensive patient lookup fixes...');
filesToUpdate.forEach(updateFile);
console.log('All patient lookups updated!');
