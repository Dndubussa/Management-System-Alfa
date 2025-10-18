import { Patient } from '../types';

/**
 * Safely find a patient by ID with null safety checks
 * @param patients - Array of patients
 * @param patientId - ID of the patient to find
 * @returns Patient object or null if not found
 */
export function findPatientSafely(patients: Patient[], patientId: string | null | undefined): Patient | null {
  if (!patients || !Array.isArray(patients) || !patientId) {
    return null;
  }
  
  return patients.find(p => p && p.id === patientId) || null;
}

/**
 * Get patient display name safely
 * @param patients - Array of patients
 * @param patientId - ID of the patient
 * @returns Formatted patient name or "Unknown Patient"
 */
export function getPatientDisplayName(patients: Patient[], patientId: string | null | undefined): string {
  const patient = findPatientSafely(patients, patientId);
  
  if (!patient) {
    return 'Unknown Patient';
  }
  
  return `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown Patient';
}

/**
 * Get patient MRN safely
 * @param patients - Array of patients
 * @param patientId - ID of the patient
 * @returns Patient MRN or "N/A"
 */
export function getPatientMRN(patients: Patient[], patientId: string | null | undefined): string {
  const patient = findPatientSafely(patients, patientId);
  
  return patient?.mrn || 'N/A';
}

/**
 * Check if patient exists safely
 * @param patients - Array of patients
 * @param patientId - ID of the patient
 * @returns Boolean indicating if patient exists
 */
export function patientExists(patients: Patient[], patientId: string | null | undefined): boolean {
  return findPatientSafely(patients, patientId) !== null;
}

/**
 * Filter patients safely with null checks
 * @param patients - Array of patients
 * @param filterFn - Filter function
 * @returns Filtered array of patients
 */
export function filterPatientsSafely(
  patients: Patient[], 
  filterFn: (patient: Patient) => boolean
): Patient[] {
  if (!patients || !Array.isArray(patients)) {
    return [];
  }
  
  return patients.filter(patient => patient && filterFn(patient));
}

/**
 * Search patients safely by name
 * @param patients - Array of patients
 * @param searchTerm - Search term
 * @returns Array of matching patients
 */
export function searchPatientsSafely(patients: Patient[], searchTerm: string): Patient[] {
  if (!patients || !Array.isArray(patients) || !searchTerm) {
    return [];
  }
  
  const term = searchTerm.toLowerCase();
  
  return patients.filter(patient => 
    patient && (
      (patient.firstName && patient.firstName.toLowerCase().includes(term)) ||
      (patient.lastName && patient.lastName.toLowerCase().includes(term)) ||
      (patient.mrn && patient.mrn.toLowerCase().includes(term))
    )
  );
}
