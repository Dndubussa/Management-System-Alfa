/**
 * Billing Access Control Utilities
 * Defines which roles can access billing information and at what level
 */

/**
 * Roles that have full billing access (view, edit, process payments)
 */
export const getFullBillingAccessRoles = (): string[] => [
  'cashier',
  'admin'
];

/**
 * Roles that have view-only billing access
 */
export const getViewOnlyBillingAccessRoles = (): string[] => [
  'receptionist',
  'ot-coordinator'
];

/**
 * Roles that have limited billing access (summary only)
 */
export const getLimitedBillingAccessRoles = (): string[] => [
  'doctor',
  'ophthalmologist',
  'radiologist',
  'physical-therapist',
  'nurse'
];

/**
 * Roles that have no billing access
 */
export const getNoBillingAccessRoles = (): string[] => [
  'hr'
];

/**
 * Check if a user role has full billing access
 */
export const hasFullBillingAccess = (userRole: string | undefined): boolean => {
  if (!userRole) return false;
  return getFullBillingAccessRoles().includes(userRole);
};

/**
 * Check if a user role has view-only billing access
 */
export const hasViewOnlyBillingAccess = (userRole: string | undefined): boolean => {
  if (!userRole) return false;
  return getViewOnlyBillingAccessRoles().includes(userRole);
};

/**
 * Check if a user role has limited billing access
 */
export const hasLimitedBillingAccess = (userRole: string | undefined): boolean => {
  if (!userRole) return false;
  return getLimitedBillingAccessRoles().includes(userRole);
};

/**
 * Check if a user role has any billing access
 */
export const hasAnyBillingAccess = (userRole: string | undefined): boolean => {
  if (!userRole) return false;
  return hasFullBillingAccess(userRole) || 
         hasViewOnlyBillingAccess(userRole) || 
         hasLimitedBillingAccess(userRole);
};

/**
 * Check if a user role can edit billing information
 */
export const canEditBilling = (userRole: string | undefined): boolean => {
  return hasFullBillingAccess(userRole);
};

/**
 * Check if a user role can process payments
 */
export const canProcessPayments = (userRole: string | undefined): boolean => {
  return hasFullBillingAccess(userRole);
};

/**
 * Get billing access level for a role
 */
export const getBillingAccessLevel = (userRole: string | undefined): 'none' | 'limited' | 'view-only' | 'full' => {
  if (!userRole) return 'none';
  
  if (hasFullBillingAccess(userRole)) return 'full';
  if (hasViewOnlyBillingAccess(userRole)) return 'view-only';
  if (hasLimitedBillingAccess(userRole)) return 'limited';
  
  return 'none';
};

/**
 * Check if a user can view billing for specific patients (for doctors/specialists)
 */
export const canViewPatientBilling = (userRole: string | undefined, patientId: string, userPatients?: string[]): boolean => {
  if (!userRole) return false;
  
  // Full access roles can see all billing
  if (hasFullBillingAccess(userRole) || hasViewOnlyBillingAccess(userRole)) {
    return true;
  }
  
  // Limited access roles can only see billing for their patients
  if (hasLimitedBillingAccess(userRole)) {
    return userPatients ? userPatients.includes(patientId) : false;
  }
  
  return false;
};
