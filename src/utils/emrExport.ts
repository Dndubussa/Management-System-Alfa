import { MedicalRecord, Patient } from '../types';
import { formatDate } from './dateUtils';

/**
 * Utility functions for exporting EMR data in various formats
 */

/**
 * Convert EMR data to CSV format
 */
export const exportEMRToCSV = (patient: Patient, records: MedicalRecord[]): string => {
  // CSV header
  let csvContent = 'Patient EMR Export\n';
  csvContent += 'Generated on: ' + new Date().toLocaleString() + '\n\n';
  
  // Patient information
  csvContent += 'Patient Information\n';
  csvContent += 'Name,Date of Birth,Age,Gender,Phone,Address\n';
  csvContent += `"${patient.firstName} ${patient.lastName}",${patient.dateOfBirth},${calculateAge(patient.dateOfBirth)},${patient.gender},"${patient.phone}","${patient.address}"\n\n`;
  
  // Medical records
  csvContent += 'Medical Records\n';
  csvContent += 'Visit Date,Chief Complaint,Diagnosis,Treatment,Status\n';
  
  records.forEach(record => {
    csvContent += `"${formatDate(record.visitDate)}","${record.chiefComplaint}","${record.diagnosis}","${record.treatment}",${record.status}\n`;
    
    // Add prescriptions if any
    if (record.prescriptions.length > 0) {
      csvContent += '\nPrescriptions\n';
      csvContent += 'Medication,Dosage,Frequency,Duration,Instructions\n';
      record.prescriptions.forEach(prescription => {
        csvContent += `"${prescription.medication}","${prescription.dosage}","${prescription.frequency}","${prescription.duration}","${prescription.instructions}"\n`;
      });
    }
    
    // Add lab orders if any
    if (record.labOrders.length > 0) {
      csvContent += '\nLab Orders\n';
      csvContent += 'Test Name,Instructions,Status,Results\n';
      record.labOrders.forEach(labOrder => {
        csvContent += `"${labOrder.testName}","${labOrder.instructions}",${labOrder.status},"${labOrder.results || ''}"\n`;
      });
    }
    
    csvContent += '\n';
  });
  
  return csvContent;
};

/**
 * Convert EMR data to JSON format
 */
export const exportEMRToJSON = (patient: Patient, records: MedicalRecord[]): string => {
  const emrData = {
    exportDate: new Date().toISOString(),
    patient: {
      id: patient.id,
      name: `${patient.firstName} ${patient.lastName}`,
      dateOfBirth: patient.dateOfBirth,
      age: calculateAge(patient.dateOfBirth),
      gender: patient.gender,
      phone: patient.phone,
      address: patient.address,
      emergencyContact: patient.emergencyContact,
      insuranceInfo: patient.insuranceInfo,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt
    },
    medicalRecords: records.map(record => ({
      id: record.id,
      visitDate: record.visitDate,
      chiefComplaint: record.chiefComplaint,
      diagnosis: record.diagnosis,
      diagnosisCodes: record.diagnosisCodes,
      treatment: record.treatment,
      notes: record.notes,
      vitals: record.vitals,
      prescriptions: record.prescriptions.map(prescription => ({
        id: prescription.id,
        medication: prescription.medication,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        instructions: prescription.instructions,
        status: prescription.status,
        createdAt: prescription.createdAt
      })),
      labOrders: record.labOrders.map(labOrder => ({
        id: labOrder.id,
        testName: labOrder.testName,
        instructions: labOrder.instructions,
        status: labOrder.status,
        results: labOrder.results,
        createdAt: labOrder.createdAt,
        completedAt: labOrder.completedAt
      })),
      status: record.status
    }))
  };
  
  return JSON.stringify(emrData, null, 2);
};

/**
 * Convert EMR data to plain text format
 */
export const exportEMRToText = (patient: Patient, records: MedicalRecord[]): string => {
  let textContent = 'PATIENT EMR EXPORT\n';
  textContent += '='.repeat(50) + '\n';
  textContent += `Generated on: ${new Date().toLocaleString()}\n\n`;
  
  // Patient information
  textContent += 'PATIENT INFORMATION\n';
  textContent += '-'.repeat(20) + '\n';
  textContent += `Name: ${patient.firstName} ${patient.lastName}\n`;
  textContent += `Patient ID: ${patient.id}\n`;
  textContent += `Date of Birth: ${formatDate(patient.dateOfBirth)}\n`;
  textContent += `Age: ${calculateAge(patient.dateOfBirth)}\n`;
  textContent += `Gender: ${patient.gender}\n`;
  textContent += `Phone: ${patient.phone}\n`;
  textContent += `Address: ${patient.address}\n`;
  textContent += `Emergency Contact: ${patient.emergencyContact.name} (${patient.emergencyContact.relationship}) - ${patient.emergencyContact.phone}\n`;
  textContent += `Insurance: ${patient.insuranceInfo.provider} (${patient.insuranceInfo.membershipNumber})\n\n`;
  
  // Medical records
  textContent += 'MEDICAL RECORDS\n';
  textContent += '-'.repeat(20) + '\n';
  
  if (records.length === 0) {
    textContent += 'No medical records found.\n\n';
  } else {
    records.forEach((record, index) => {
      textContent += `Record ${index + 1}\n`;
      textContent += `Visit Date: ${formatDate(record.visitDate)}\n`;
      textContent += `Chief Complaint: ${record.chiefComplaint}\n`;
      textContent += `Diagnosis: ${record.diagnosis}\n`;
      textContent += `Treatment: ${record.treatment}\n`;
      textContent += `Status: ${record.status}\n`;
      
      if (record.notes) {
        textContent += `Notes: ${record.notes}\n`;
      }
      
      // Vitals
      textContent += `Vitals:\n`;
      textContent += `  Blood Pressure: ${record.vitals.bloodPressure}\n`;
      textContent += `  Heart Rate: ${record.vitals.heartRate}\n`;
      textContent += `  Temperature: ${record.vitals.temperature}\n`;
      textContent += `  Weight: ${record.vitals.weight}\n`;
      textContent += `  Height: ${record.vitals.height}\n`;
      
      // Prescriptions
      if (record.prescriptions.length > 0) {
        textContent += `\nPrescriptions:\n`;
        record.prescriptions.forEach((prescription, pIndex) => {
          textContent += `  ${pIndex + 1}. ${prescription.medication}\n`;
          textContent += `     Dosage: ${prescription.dosage}\n`;
          textContent += `     Frequency: ${prescription.frequency}\n`;
          textContent += `     Duration: ${prescription.duration}\n`;
          if (prescription.instructions) {
            textContent += `     Instructions: ${prescription.instructions}\n`;
          }
          textContent += `     Status: ${prescription.status}\n`;
        });
      }
      
      // Lab Orders
      if (record.labOrders.length > 0) {
        textContent += `\nLab Orders:\n`;
        record.labOrders.forEach((labOrder, lIndex) => {
          textContent += `  ${lIndex + 1}. ${labOrder.testName}\n`;
          if (labOrder.instructions) {
            textContent += `     Instructions: ${labOrder.instructions}\n`;
          }
          textContent += `     Status: ${labOrder.status}\n`;
          if (labOrder.results) {
            textContent += `     Results: ${labOrder.results}\n`;
          }
        });
      }
      
      textContent += '\n' + '='.repeat(50) + '\n\n';
    });
  }
  
  return textContent;
};

/**
 * Convert EMR data to HTML format
 */
export const exportEMRToHTML = (patient: Patient, records: MedicalRecord[]): string => {
  let htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Patient EMR - ${patient.firstName} ${patient.lastName}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      .header { text-align: center; margin-bottom: 30px; }
      .section { margin-bottom: 30px; }
      .section-title { border-bottom: 2px solid #333; padding-bottom: 5px; margin-bottom: 15px; }
      .patient-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      .info-item { margin-bottom: 10px; }
      .info-label { font-weight: bold; }
      .record { border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
      .record-header { background-color: #f5f5f5; padding: 10px; margin: -15px -15px 15px -15px; border-radius: 5px 5px 0 0; }
      .prescriptions, .lab-orders { margin-top: 15px; }
      .prescription, .lab-order { border-left: 3px solid #007bff; padding-left: 10px; margin-bottom: 10px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Patient EMR Export</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="section">
      <h2 class="section-title">Patient Information</h2>
      <div class="patient-info">
        <div>
          <div class="info-item"><span class="info-label">Name:</span> ${patient.firstName} ${patient.lastName}</div>
          <div class="info-item"><span class="info-label">Patient ID:</span> ${patient.id}</div>
          <div class="info-item"><span class="info-label">Date of Birth:</span> ${formatDate(patient.dateOfBirth)}</div>
          <div class="info-item"><span class="info-label">Age:</span> ${calculateAge(patient.dateOfBirth)}</div>
          <div class="info-item"><span class="info-label">Gender:</span> ${patient.gender}</div>
        </div>
        <div>
          <div class="info-item"><span class="info-label">Phone:</span> ${patient.phone}</div>
          <div class="info-item"><span class="info-label">Address:</span> ${patient.address}</div>
          <div class="info-item"><span class="info-label">Emergency Contact:</span> ${patient.emergencyContact.name} (${patient.emergencyContact.relationship}) - ${patient.emergencyContact.phone}</div>
          <div class="info-item"><span class="info-label">Insurance:</span> ${patient.insuranceInfo.provider} (${patient.insuranceInfo.membershipNumber})</div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">Medical Records</h2>
  `;
  
  if (records.length === 0) {
    htmlContent += '<p>No medical records found.</p>';
  } else {
    records.forEach((record, index) => {
      htmlContent += `
      <div class="record">
        <div class="record-header">
          <h3>Record ${index + 1} - Visit on ${formatDate(record.visitDate)}</h3>
        </div>
        <div class="info-item"><span class="info-label">Chief Complaint:</span> ${record.chiefComplaint}</div>
        <div class="info-item"><span class="info-label">Diagnosis:</span> ${record.diagnosis}</div>
        <div class="info-item"><span class="info-label">Treatment:</span> ${record.treatment}</div>
        <div class="info-item"><span class="info-label">Status:</span> ${record.status}</div>
        ${record.notes ? `<div class="info-item"><span class="info-label">Notes:</span> ${record.notes}</div>` : ''}
        
        <div class="info-item"><span class="info-label">Vitals:</span>
          <ul>
            <li>Blood Pressure: ${record.vitals.bloodPressure}</li>
            <li>Heart Rate: ${record.vitals.heartRate}</li>
            <li>Temperature: ${record.vitals.temperature}</li>
            <li>Weight: ${record.vitals.weight}</li>
            <li>Height: ${record.vitals.height}</li>
          </ul>
        </div>
      `;
      
      // Prescriptions
      if (record.prescriptions.length > 0) {
        htmlContent += `
        <div class="prescriptions">
          <h4>Prescriptions</h4>
          <table>
            <thead>
              <tr>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Instructions</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
        `;
        
        record.prescriptions.forEach(prescription => {
          htmlContent += `
              <tr>
                <td>${prescription.medication}</td>
                <td>${prescription.dosage}</td>
                <td>${prescription.frequency}</td>
                <td>${prescription.duration}</td>
                <td>${prescription.instructions || ''}</td>
                <td>${prescription.status}</td>
              </tr>
          `;
        });
        
        htmlContent += `
            </tbody>
          </table>
        </div>
        `;
      }
      
      // Lab Orders
      if (record.labOrders.length > 0) {
        htmlContent += `
        <div class="lab-orders">
          <h4>Lab Orders</h4>
          <table>
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Instructions</th>
                <th>Status</th>
                <th>Results</th>
              </tr>
            </thead>
            <tbody>
        `;
        
        record.labOrders.forEach(labOrder => {
          htmlContent += `
              <tr>
                <td>${labOrder.testName}</td>
                <td>${labOrder.instructions || ''}</td>
                <td>${labOrder.status}</td>
                <td>${labOrder.results || ''}</td>
              </tr>
          `;
        });
        
        htmlContent += `
            </tbody>
          </table>
        </div>
        `;
      }
      
      htmlContent += `
      </div>
      `;
    });
  }
  
  htmlContent += `
    </div>
  </body>
  </html>
  `;
  
  return htmlContent;
};

/**
 * Calculate age from date of birth
 */
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Trigger download of file
 */
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};