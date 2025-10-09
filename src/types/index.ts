export interface User {
  id: string;
  name: string;
  email: string;
  role: 'receptionist' | 'doctor' | 'lab' | 'pharmacy' | 'radiologist' | 'ophthalmologist' | 'admin' | 'ot-coordinator';
  department: string;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  insuranceInfo: {
    provider: string;
    membershipNumber: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DiagnosisCode {
  code: string; // ICD-10 or SNOMED CT code
  description: string;
  type: 'ICD-10' | 'SNOMED CT'; // Type of coding system
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  visitDate: string;
  chiefComplaint: string;
  diagnosis: string; // Free text diagnosis
  diagnosisCodes: DiagnosisCode[]; // Structured diagnosis codes
  treatment: string;
  notes: string;
  vitals: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
    height: string;
  };
  prescriptions: Prescription[];
  labOrders: LabOrder[];
  status: 'active' | 'completed' | 'cancelled';
}

export interface Prescription {
  id: string;
  recordId: string;
  patientId: string;
  doctorId: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  status: 'pending' | 'dispensed' | 'cancelled';
  createdAt: string;
}

export interface LabOrder {
  id: string;
  recordId: string;
  patientId: string;
  doctorId: string;
  testName: string;
  instructions: string;
  status: 'ordered' | 'in-progress' | 'completed' | 'cancelled';
  results?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  dateTime: string;
  duration: number;
  type: 'consultation' | 'follow-up' | 'emergency';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Notification {
  id: string;
  userIds: string[]; // Array of user IDs who should receive this notification
  type: 'prescription' | 'lab-order' | 'appointment' | 'general' | 'queue' | 'billing';
  title: string;
  message: string;
  isRead: boolean | { [userId: string]: boolean }; // Either boolean for all users or object tracking per user
  createdAt: string;
  department?: string; // Optional department filter
}

export interface ServicePrice {
  id: string;
  category: 'consultation' | 'lab-test' | 'medication' | 'procedure';
  serviceName: string;
  price: number;
  description: string;
}

export interface BillItem {
  id: string;
  serviceId: string;
  serviceName: string;
  category: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Bill {
  id: string;
  patientId: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  paymentMethod?: 'cash' | 'lipa_kwa_simu' | 'card' | 'insurance';
  createdAt: string;
  paidAt?: string;
}

// New interface for insurance claims
export interface InsuranceClaim {
  id: string;
  billId: string;
  patientId: string;
  insuranceProvider: string;
  membershipNumber: string;
  claimAmount: number;
  claimedAmount: number;
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'paid';
  submissionDate: string;
  approvalDate?: string;
  rejectionReason?: string;
  nhifClaimNumber?: string;
  notes?: string;
}

export interface AutobillingConfig {
  enabled: boolean;
  autoGenerateForAppointments: boolean;
  autoGenerateForMedicalRecords: boolean;
  autoGenerateForPrescriptions: boolean;
  autoGenerateForLabOrders: boolean;
  defaultPaymentMethod: 'cash' | 'lipa_kwa_simu' | 'card' | 'insurance';
}

export interface QueueItem {
  id: string;
  patientId: string;
  department: string;
  priority: 'normal' | 'urgent' | 'emergency';
  status: 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  workflowStage: 'reception' | 'doctor' | 'lab' | 'pharmacy' | 'completed';
  nextStage: 'doctor' | 'lab' | 'pharmacy' | 'completed' | null;
  arrivalTime: string;
  startTime?: string;
  completedTime?: string;
  notes?: string;
  labOrderId?: string; // Link to lab order if applicable
  prescriptionId?: string; // Link to prescription if applicable
}

export interface Department {
  id: string;
  name: string;
  description: string;
  doctors: string[]; // Array of doctor IDs
}

export interface Referral {
  id: string;
  patientId: string;
  referringDoctorId: string;
  specialist: string;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// Ophthalmology-specific interfaces
export interface VisualAcuity {
  rightEye: {
    near: string;
    distance: string;
  };
  leftEye: {
    near: string;
    distance: string;
  };
}

export interface Refraction {
  rightEye: {
    sphere: string;
    cylinder: string;
    axis: string;
    add: string;
  };
  leftEye: {
    sphere: string;
    cylinder: string;
    axis: string;
    add: string;
  };
}

export interface IntraocularPressure {
  rightEye: string;
  leftEye: string;
  method: 'tonometry' | 'palpation';
}

export interface OphthalmologyFinding {
  type: 'external' | 'slitLamp' | 'fundoscopy' | 'other';
  description: string;
  imageUrl?: string;
}

export interface OphthalmologyRecord extends MedicalRecord {
  visualAcuity: VisualAcuity;
  refraction: Refraction;
  intraocularPressure: IntraocularPressure;
  findings: OphthalmologyFinding[];
  systemicHistory: {
    diabetes: boolean;
    hypertension: boolean;
    other: string;
  };
  // Ophthalmology-specific lab orders
  octOrders?: LabOrder[];
  visualFieldOrders?: LabOrder[];
  fundusPhotoOrders?: LabOrder[];
  // Surgery request
  surgeryRequest?: {
    type: string;
    eye: 'right' | 'left' | 'both';
    urgency: 'routine' | 'urgent' | 'emergency';
    notes?: string;
  };
}

// New interfaces for Operating Theatre functionality
export interface SurgeryRequest {
  id: string;
  patientId: string;
  requestingDoctorId: string;
  surgeryType: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  requestedDate: string;
  status: 'pending' | 'reviewed' | 'scheduled' | 'pre-op' | 'in-progress' | 'post-op' | 'completed' | 'cancelled' | 'postponed';
  diagnosis: string;
  notes?: string;
  emrSummary?: string;
  labResults?: string;
  radiologyResults?: string;
  preOpAssessment?: {
    asaClassification: string;
    anesthesiaPlan: string;
    fastingStatus: string;
    preOpMedications: string;
  };
  requiredResources?: {
    surgeonIds: string[];
    anesthesiologistIds: string[];
    nurseIds: string[];
    otRoomId: string;
    equipment: string[];
    instruments: string[];
    bloodUnits?: number;
  };
  scheduledDate?: string;
  scheduledTime?: string;
  assignedStaff?: {
    leadSurgeonId: string;
    assistantSurgeons: string[];
    anesthesiologistId: string;
    nurseIds: string[];
  };
  otRoomId?: string;
  consentFormSigned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OTSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  otRoomId: string;
  surgeryRequestId?: string;
  status: 'available' | 'booked' | 'blocked' | 'maintenance';
  notes?: string;
}

export interface OTResource {
  id: string;
  type: 'surgeon' | 'anesthesiologist' | 'nurse' | 'ot-room' | 'equipment' | 'instrument';
  name: string;
  specialty?: string; // For doctors
  availability: {
    [date: string]: {
      startTime: string;
      endTime: string;
      status: 'available' | 'busy' | 'unavailable';
    }[];
  };
  notes?: string;
}

export interface OTChecklist {
  id: string;
  surgeryRequestId: string;
  items: {
    category: string;
    description: string;
    checked: boolean;
    checkedBy?: string;
    checkedAt?: string;
  }[];
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface SurgeryProgress {
  id: string;
  surgeryRequestId: string;
  status: 'pre-op' | 'in-progress' | 'closed' | 'post-op' | 'completed';
  timestamp: string;
  notes?: string;
  updatedBy: string;
}

export interface OTReport {
  id: string;
  date: string;
  type: 'daily' | 'weekly' | 'monthly';
  metrics: {
    totalSurgeries: number;
    emergencySurgeries: number;
    electiveSurgeries: number;
    cancelledSurgeries: number;
    postponedSurgeries: number;
    complications: number;
    mortality: number;
  };
  surgeries: {
    surgeryRequestId: string;
    surgeryType: string;
    status: 'completed' | 'cancelled' | 'postponed';
    complications?: string;
    notes?: string;
  }[];
  createdAt: string;
}
