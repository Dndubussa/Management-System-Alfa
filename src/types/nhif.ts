// NHIF Integration Types
export interface NHIFConfig {
  apiBaseUrl: string;
  clientId: string;
  clientSecret: string;
  facilityCode: string;
  environment: 'sandbox' | 'production';
}

export interface NHIFPatient {
  membershipNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  phone?: string;
  email?: string;
}

export interface NHIFPractitioner {
  practitionerId: string;
  firstName: string;
  lastName: string;
  qualification: string;
  specialization: string;
  licenseNumber: string;
}

export interface NHIFService {
  serviceCode: string; // SHA code
  serviceName: string;
  tariff: number;
  requiresPreAuth: boolean;
  category: string;
}

export interface NHIFDiagnosis {
  icd11Code: string;
  description: string;
  isPrimary: boolean;
}

export interface NHIFClaimItem {
  serviceCode: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  diagnosisCode: string;
  practitionerId: string;
}

export interface NHIFClaim {
  claimId: string;
  patientMembershipNumber: string;
  facilityCode: string;
  admissionDate: string;
  dischargeDate?: string;
  claimType: 'outpatient' | 'inpatient' | 'emergency';
  totalAmount: number;
  items: NHIFClaimItem[];
  diagnoses: NHIFDiagnosis[];
  practitionerId: string;
  notes?: string;
}

export interface NHIFClaimResponse {
  claimId: string;
  status: 'submitted' | 'approved' | 'rejected' | 'pending';
  message: string;
  approvedAmount?: number;
  rejectionReason?: string;
  processingDate: string;
  referenceNumber?: string;
}

export interface NHIFValidationResponse {
  isValid: boolean;
  patient?: NHIFPatient;
  message: string;
  benefits?: {
    serviceCode: string;
    serviceName: string;
    coverage: number; // percentage
    remainingLimit?: number;
  }[];
}

export interface NHIFPreAuthRequest {
  patientMembershipNumber: string;
  serviceCode: string;
  estimatedCost: number;
  diagnosisCode: string;
  practitionerId: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  notes?: string;
}

export interface NHIFPreAuthResponse {
  preAuthId: string;
  status: 'approved' | 'rejected' | 'pending';
  approvedAmount?: number;
  validityPeriod: number; // days
  message: string;
  referenceNumber?: string;
}

// NHIF API Error Types
export interface NHIFError {
  code: string;
  message: string;
  details?: any;
}

// NHIF Configuration for different environments
export const NHIF_ENVIRONMENTS = {
  sandbox: {
    apiBaseUrl: 'https://api-sandbox.nhif.or.tz',
    facilityCode: 'TEST001'
  },
  production: {
    apiBaseUrl: 'https://api.nhif.or.tz',
    facilityCode: 'ALFA001' // Your actual facility code
  }
} as const;
