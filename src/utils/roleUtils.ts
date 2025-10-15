/**
 * Utility functions for role-based access control and filtering
 */

/**
 * Define which roles should have restricted patient visibility
 * These roles can only see patients who have both appointments AND medical records with them
 */
export const getRestrictedPatientVisibilityRoles = (): string[] => [
  'doctor',
  'ophthalmologist', 
  'radiologist',
  // Add other specialist roles here as needed in the future
  // 'cardiologist', 'neurologist', 'pediatrician', 'dermatologist', etc.
];

/**
 * Check if a user role should have restricted patient visibility
 */
export const hasRestrictedPatientVisibility = (userRole: string | undefined): boolean => {
  if (!userRole) return false;
  return getRestrictedPatientVisibilityRoles().includes(userRole);
};

/**
 * Define which roles can add new patients
 * Typically only receptionists and administrators
 */
export const getPatientCreationRoles = (): string[] => [
  'receptionist',
  'admin',
];

/**
 * Check if a user role can add new patients
 */
export const canCreatePatients = (userRole: string | undefined): boolean => {
  if (!userRole) return false;
  return getPatientCreationRoles().includes(userRole);
};

/**
 * Define which roles can edit patients
 * Typically only receptionists and administrators
 */
export const getPatientEditRoles = (): string[] => [
  'receptionist',
  'admin',
];

/**
 * Check if a user role can edit patients
 */
export const canEditPatients = (userRole: string | undefined): boolean => {
  if (!userRole) return false;
  return getPatientEditRoles().includes(userRole);
};
