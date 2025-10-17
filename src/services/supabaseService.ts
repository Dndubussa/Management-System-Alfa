// Supabase service for production deployment
import { createClient } from '@supabase/supabase-js';
import { 
  Patient, 
  MedicalRecord, 
  Prescription, 
  LabOrder, 
  Appointment, 
  Notification, 
  ServicePrice, 
  Bill, 
  Department, 
  Referral, 
  User, 
  InsuranceClaim,
  SurgeryRequest,
  OTSlot,
  OTResource,
  OTChecklist,
  SurgeryProgress,
  OTReport
} from '../types';

// Inventory types
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  expiryDate?: string;
  supplier: string;
  cost: number;
  sellingPrice: number;
  description?: string;
  barcode?: string;
  location?: string;
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: string;
  updatedAt: string;
}

// Audit Trail types
interface AuditLog {
  id: string;
  tableName: string;
  recordId: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'PRINT';
  oldValues?: any;
  newValues?: any;
  userId?: string;
  userName?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  timestamp: string;
  reason?: string;
  notes?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  department?: string;
  patientId?: string;
  createdAt: string;
}

interface PatientAccessLog {
  id: string;
  patientId: string;
  patientName: string;
  accessedBy: string;
  accessedByName: string;
  accessedByRole: string;
  accessType: 'VIEW' | 'EDIT' | 'CREATE' | 'DELETE' | 'EXPORT' | 'PRINT';
  dataAccessed: string[];
  purpose?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  timestamp: string;
  durationSeconds?: number;
  notes?: string;
}

interface PrescriptionAuditLog {
  id: string;
  prescriptionId: string;
  patientId: string;
  doctorId: string;
  action: 'CREATED' | 'MODIFIED' | 'DISPENSED' | 'CANCELLED' | 'VIEWED' | 'PRINTED' | 'EXPORTED';
  oldStatus?: string;
  newStatus?: string;
  medicationName: string;
  dosage?: string;
  quantity?: number;
  notes?: string;
  performedBy: string;
  performedByName: string;
  performedByRole: string;
  ipAddress?: string;
  timestamp: string;
  reason?: string;
  complianceNotes?: string;
}

interface ComplianceViolation {
  violationType: string;
  severity: string;
  userName: string;
  userRole: string;
  timestamp: string;
  details: string;
  patientName?: string;
}

interface AuditStatistics {
  metricName: string;
  metricValue: number;
  description: string;
}

interface InventoryTransaction {
  id: string;
  inventoryItemId: string;
  transactionType: 'in' | 'out' | 'adjustment' | 'expired' | 'damaged' | 'returned';
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  performedBy: string;
  createdAt: string;
}

interface MedicationInventory {
  id: string;
  medicationName: string;
  genericName?: string;
  dosageForm: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'drops' | 'inhaler' | 'patch' | 'suppository';
  strength: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  sellingPrice: number;
  supplier: string;
  storageConditions?: string;
  controlledSubstance: boolean;
  prescriptionRequired: boolean;
  status: 'active' | 'inactive' | 'recalled' | 'expired';
  createdAt: string;
  updatedAt: string;
}

interface MedicationTransaction {
  id: string;
  medicationInventoryId: string;
  transactionType: 'dispensed' | 'received' | 'adjustment' | 'expired' | 'damaged' | 'returned';
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  prescriptionId?: string;
  notes?: string;
  performedBy: string;
  createdAt: string;
}

// Create a single Supabase instance to avoid multiple GoTrueClient instances
let supabaseInstance: any = null;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

if (!supabaseInstance) {
  supabaseInstance = createClient(supabaseUrl, supabaseKey);
}

const supabase = supabaseInstance;

// Helper function to convert snake_case to camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  } else if (obj !== null && typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      converted[camelKey] = toCamelCase(obj[key]);
    }
    return converted;
  }
  return obj;
}

// Patient mapping function to ensure proper structure
function mapPatientFromDb(row: any): Patient {
  const c = toCamelCase(row);
  return {
    id: c.id,
    mrn: c.mrn,
    firstName: c.firstName,
    lastName: c.lastName,
    dateOfBirth: c.dateOfBirth,
    gender: c.gender,
    phone: c.phone,
    address: c.address,
    emergencyContact: {
      name: c.emergencyContactName || '',
      phone: c.emergencyContactPhone || '',
      relationship: c.emergencyContactRelationship || '',
    },
    insuranceInfo: {
      provider: c.insuranceProvider || '',
      membershipNumber: c.insuranceMembershipNumber || '',
    },
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

// Helper function to get all records with pagination
async function getAllRecords(
  tableName: string, 
  orderBy: string = 'id', 
  ascending: boolean = true
): Promise<any[]> {
  let allData: any[] = [];
  let from = 0;
  const batchSize = 1000;
  let hasMore = true;
  
  while (hasMore) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order(orderBy, { ascending })
      .range(from, from + batchSize - 1);
    
    if (error) {
      throw error;
    }
    
    if (data && data.length > 0) {
      allData = [...allData, ...data];
      from += batchSize;
      hasMore = data.length === batchSize;
    } else {
      hasMore = false;
    }
  }
  
  return allData;
}

// Helper function to convert camelCase to snake_case
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  } else if (obj !== null && typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      converted[snakeKey] = toSnakeCase(obj[key]);
    }
    return converted;
  }
  return obj;
}

export const supabaseService = {
  // Patients
  getPatients: async (): Promise<Patient[]> => {
    try {
      const allData = await getAllRecords('patients', 'created_at', false);
      return allData.map(mapPatientFromDb);
    } catch (error) {
      console.error('❌ Supabase: Error getting patients:', error);
      throw error;
    }
  },

  getPatient: async (id: string): Promise<Patient> => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return mapPatientFromDb(data);
  },

  createPatient: async (patient: Omit<Patient, 'id' | 'mrn' | 'createdAt' | 'updatedAt'>): Promise<Patient> => {
    // Generate MRN
    const currentYear = new Date().getFullYear();
    const { count } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });
    
    const mrn = `ALFA-${currentYear}-${String((count || 0) + 1).padStart(5, '0')}`;
    
    const patientData = {
      ...toSnakeCase(patient),
      mrn,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('patients')
      .insert(patientData)
      .select()
      .single();
    
    if (error) throw error;
    return mapPatientFromDb(data);
  },

  updatePatient: async (id: string, patient: Partial<Patient>): Promise<Patient> => {
    const patientData = {
      ...toSnakeCase(patient),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('patients')
      .update(patientData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return mapPatientFromDb(data);
  },

  deletePatient: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Medical Records
  getMedicalRecords: async (): Promise<MedicalRecord[]> => {
    try {
      const allData = await getAllRecords('medical_records', 'visit_date', false);
      return toCamelCase(allData) as MedicalRecord[];
    } catch (error) {
      throw error;
    }
  },

  getMedicalRecord: async (id: string): Promise<MedicalRecord> => {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as MedicalRecord;
  },

  createMedicalRecord: async (record: Omit<MedicalRecord, 'id'>): Promise<MedicalRecord> => {
    const { data, error } = await supabase
      .from('medical_records')
      .insert(toSnakeCase(record))
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as MedicalRecord;
  },

  updateMedicalRecord: async (id: string, record: Partial<MedicalRecord>): Promise<MedicalRecord> => {
    const { data, error } = await supabase
      .from('medical_records')
      .update(toSnakeCase(record))
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as MedicalRecord;
  },

  // Prescriptions
  getPrescriptions: async (): Promise<Prescription[]> => {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return toCamelCase(data) as Prescription[];
  },

  getPrescription: async (id: string): Promise<Prescription> => {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as Prescription;
  },

  updatePrescriptionStatus: async (id: string, status: Prescription['status']): Promise<Prescription> => {
    const { data, error } = await supabase
      .from('prescriptions')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as Prescription;
  },

  // Lab Orders
  getLabOrders: async (): Promise<LabOrder[]> => {
    const { data, error } = await supabase
      .from('lab_orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return toCamelCase(data) as LabOrder[];
  },

  getLabOrder: async (id: string): Promise<LabOrder> => {
    const { data, error } = await supabase
      .from('lab_orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as LabOrder;
  },

  updateLabOrderStatus: async (id: string, status: LabOrder['status'], results?: string): Promise<LabOrder> => {
    const updateData: any = { status };
    if (results) updateData.results = results;
    if (status === 'completed') updateData.completed_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('lab_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as LabOrder;
  },

  // Appointments
  getAppointments: async (): Promise<Appointment[]> => {
    try {
      const allData = await getAllRecords('appointments', 'date_time', false);
      return toCamelCase(allData) as Appointment[];
    } catch (error) {
      throw error;
    }
  },

  getAppointment: async (id: string): Promise<Appointment> => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as Appointment;
  },

  createAppointment: async (appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
    const { data, error } = await supabase
      .from('appointments')
      .insert(toSnakeCase(appointment))
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as Appointment;
  },

  updateAppointmentStatus: async (id: string, status: Appointment['status']): Promise<Appointment> => {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as Appointment;
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return toCamelCase(data) as User[];
  },

  getUser: async (id: string): Promise<User> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as User;
  },

  createUser: async (user: Omit<User, 'id'>): Promise<User> => {
    const { data, error } = await supabase
      .from('users')
      .insert(toSnakeCase(user))
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as User;
  },

  updateUser: async (id: string, user: Partial<User>): Promise<User> => {
    const { data, error } = await supabase
      .from('users')
      .update(toSnakeCase(user))
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as User;
  },

  deleteUser: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Notifications
  getNotifications: async (): Promise<Notification[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return toCamelCase(data) as Notification[];
  },

  getNotification: async (id: string): Promise<Notification> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as Notification;
  },

  createNotification: async (notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> => {
    const notificationData = {
      ...toSnakeCase(notification),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as Notification;
  },

  markNotificationRead: async (id: string, userId: string): Promise<Notification> => {
    // Get current notification
    const { data: currentData, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;

    // Update is_read field
    const isRead = typeof currentData.is_read === 'boolean' 
      ? { [userId]: true } 
      : { ...currentData.is_read, [userId]: true };

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: isRead })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as Notification;
  },

  // Service Prices
  getServicePrices: async (): Promise<ServicePrice[]> => {
    try {
      const allData = await getAllRecords('service_prices', 'service_name', true);
      return toCamelCase(allData) as ServicePrice[];
    } catch (error) {
      console.error('❌ Supabase: Error getting service prices:', error);
      throw error;
    }
  },

  getServicePrice: async (id: string): Promise<ServicePrice> => {
    const { data, error } = await supabase
      .from('service_prices')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as ServicePrice;
  },

  createServicePrice: async (servicePrice: Omit<ServicePrice, 'id'>): Promise<ServicePrice> => {
    const { data, error } = await supabase
      .from('service_prices')
      .insert(toSnakeCase(servicePrice))
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as ServicePrice;
  },

  updateServicePrice: async (id: string, servicePrice: Partial<ServicePrice>): Promise<ServicePrice> => {
    const { data, error } = await supabase
      .from('service_prices')
      .update(toSnakeCase(servicePrice))
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as ServicePrice;
  },

  // Bills
  getBills: async (): Promise<Bill[]> => {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return toCamelCase(data) as Bill[];
  },

  getBill: async (id: string): Promise<Bill> => {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as Bill;
  },

  createBill: async (bill: Omit<Bill, 'id'>): Promise<Bill> => {
    const billData = {
      ...toSnakeCase(bill),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('bills')
      .insert(billData)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as Bill;
  },

  updateBillStatus: async (id: string, status: Bill['status'], paymentMethod?: string): Promise<Bill> => {
    const updateData: any = { status };
    if (paymentMethod) updateData.payment_method = paymentMethod;
    if (status === 'paid') updateData.paid_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('bills')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as Bill;
  },

  // Departments
  getDepartments: async (): Promise<Department[]> => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return toCamelCase(data) as Department[];
  },

  getDepartment: async (id: string): Promise<Department> => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as Department;
  },

  createDepartment: async (department: Omit<Department, 'id'>): Promise<Department> => {
    const { data, error } = await supabase
      .from('departments')
      .insert(toSnakeCase(department))
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as Department;
  },

  updateDepartment: async (id: string, department: Partial<Department>): Promise<Department> => {
    const { data, error } = await supabase
      .from('departments')
      .update(toSnakeCase(department))
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as Department;
  },

  // Referrals
  getReferrals: async (): Promise<Referral[]> => {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return toCamelCase(data) as Referral[];
  },

  getReferral: async (id: string): Promise<Referral> => {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as Referral;
  },

  createReferral: async (referral: Omit<Referral, 'id' | 'createdAt' | 'updatedAt'>): Promise<Referral> => {
    const referralData = {
      ...toSnakeCase(referral),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('referrals')
      .insert(referralData)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as Referral;
  },

  updateReferralStatus: async (id: string, status: Referral['status']): Promise<Referral> => {
    const { data, error } = await supabase
      .from('referrals')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as Referral;
  },

  // Insurance Claims
  getInsuranceClaims: async (): Promise<InsuranceClaim[]> => {
    const { data, error } = await supabase
      .from('insurance_claims')
      .select('*')
      .order('submission_date', { ascending: false });
    
    if (error) throw error;
    return toCamelCase(data) as InsuranceClaim[];
  },

  getInsuranceClaim: async (id: string): Promise<InsuranceClaim> => {
    const { data, error } = await supabase
      .from('insurance_claims')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as InsuranceClaim;
  },

  createInsuranceClaim: async (claim: Omit<InsuranceClaim, 'id' | 'submissionDate' | 'status'>): Promise<InsuranceClaim> => {
    const claimData = {
      ...toSnakeCase(claim),
      submission_date: new Date().toISOString(),
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('insurance_claims')
      .insert(claimData)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as InsuranceClaim;
  },

  updateInsuranceClaimStatus: async (id: string, status: InsuranceClaim['status'], rejectionReason?: string): Promise<InsuranceClaim> => {
    const updateData: any = { status };
    if (rejectionReason) updateData.rejection_reason = rejectionReason;
    if (status === 'approved') updateData.approval_date = new Date().toISOString();

    const { data, error } = await supabase
      .from('insurance_claims')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as InsuranceClaim;
  },

  // Surgery Requests
  getSurgeryRequests: async (): Promise<SurgeryRequest[]> => {
    const { data, error } = await supabase
      .from('surgery_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return toCamelCase(data) as SurgeryRequest[];
  },

  getSurgeryRequest: async (id: string): Promise<SurgeryRequest> => {
    const { data, error } = await supabase
      .from('surgery_requests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as SurgeryRequest;
  },

  createSurgeryRequest: async (request: Omit<SurgeryRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<SurgeryRequest> => {
    const requestData = {
      ...toSnakeCase(request),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('surgery_requests')
      .insert(requestData)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as SurgeryRequest;
  },

  updateSurgeryRequest: async (id: string, updates: Partial<SurgeryRequest>): Promise<SurgeryRequest> => {
    const updateData = {
      ...toSnakeCase(updates),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('surgery_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as SurgeryRequest;
  },

  // OT Slots
  getOTSlots: async (): Promise<OTSlot[]> => {
    const { data, error } = await supabase
      .from('ot_slots')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    return toCamelCase(data) as OTSlot[];
  },

  getOTSlot: async (id: string): Promise<OTSlot> => {
    const { data, error } = await supabase
      .from('ot_slots')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as OTSlot;
  },

  createOTSlot: async (slot: Omit<OTSlot, 'id'>): Promise<OTSlot> => {
    const { data, error } = await supabase
      .from('ot_slots')
      .insert(toSnakeCase(slot))
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as OTSlot;
  },

  updateOTSlot: async (id: string, updates: Partial<OTSlot>): Promise<OTSlot> => {
    const { data, error } = await supabase
      .from('ot_slots')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as OTSlot;
  },

  // OT Resources
  getOTResources: async (): Promise<OTResource[]> => {
    const { data, error } = await supabase
      .from('ot_resources')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return toCamelCase(data) as OTResource[];
  },

  getOTResource: async (id: string): Promise<OTResource> => {
    const { data, error } = await supabase
      .from('ot_resources')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as OTResource;
  },

  createOTResource: async (resource: Omit<OTResource, 'id'>): Promise<OTResource> => {
    const { data, error } = await supabase
      .from('ot_resources')
      .insert(toSnakeCase(resource))
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as OTResource;
  },

  updateOTResource: async (id: string, updates: Partial<OTResource>): Promise<OTResource> => {
    const { data, error } = await supabase
      .from('ot_resources')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as OTResource;
  },

  // OT Checklists
  getOTChecklists: async (): Promise<OTChecklist[]> => {
    const { data, error } = await supabase
      .from('ot_checklists')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return toCamelCase(data) as OTChecklist[];
  },

  getOTChecklist: async (id: string): Promise<OTChecklist> => {
    const { data, error } = await supabase
      .from('ot_checklists')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as OTChecklist;
  },

  createOTChecklist: async (checklist: Omit<OTChecklist, 'id' | 'createdAt' | 'updatedAt'>): Promise<OTChecklist> => {
    const checklistData = {
      ...toSnakeCase(checklist),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('ot_checklists')
      .insert(checklistData)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as OTChecklist;
  },

  updateOTChecklist: async (id: string, updates: Partial<OTChecklist>): Promise<OTChecklist> => {
    const updateData = {
      ...toSnakeCase(updates),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('ot_checklists')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as OTChecklist;
  },

  // Surgery Progress
  getSurgeryProgress: async (): Promise<SurgeryProgress[]> => {
    const { data, error } = await supabase
      .from('surgery_progress')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return toCamelCase(data) as SurgeryProgress[];
  },

  getSurgeryProgressItem: async (id: string): Promise<SurgeryProgress> => {
    const { data, error } = await supabase
      .from('surgery_progress')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as SurgeryProgress;
  },

  createSurgeryProgress: async (progress: Omit<SurgeryProgress, 'id' | 'timestamp'>): Promise<SurgeryProgress> => {
    const progressData = {
      ...toSnakeCase(progress),
      timestamp: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('surgery_progress')
      .insert(progressData)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as SurgeryProgress;
  },

  updateSurgeryProgress: async (id: string, updates: Partial<SurgeryProgress>): Promise<SurgeryProgress> => {
    const { data, error } = await supabase
      .from('surgery_progress')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as SurgeryProgress;
  },

  // OT Reports
  getOTReports: async (): Promise<OTReport[]> => {
    const { data, error } = await supabase
      .from('ot_reports')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return toCamelCase(data) as OTReport[];
  },

  getOTReport: async (id: string): Promise<OTReport> => {
    const { data, error } = await supabase
      .from('ot_reports')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as OTReport;
  },

  createOTReport: async (report: Omit<OTReport, 'id' | 'createdAt'>): Promise<OTReport> => {
    const reportData = {
      ...toSnakeCase(report),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('ot_reports')
      .insert(reportData)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as OTReport;
  },

  updateOTReport: async (id: string, updates: Partial<OTReport>): Promise<OTReport> => {
    const { data, error } = await supabase
      .from('ot_reports')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as OTReport;
  },

  // ==============================================
  // INVENTORY MANAGEMENT METHODS
  // ==============================================

  // Inventory Items
  getInventoryItems: async (): Promise<InventoryItem[]> => {
    try {
      const allData = await getAllRecords('inventory_items', 'name', true);
      return toCamelCase(allData) as InventoryItem[];
    } catch (error) {
      console.error('❌ Supabase: Error getting inventory items:', error);
      throw error;
    }
  },

  getInventoryItem: async (id: string): Promise<InventoryItem> => {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as InventoryItem;
  },

  createInventoryItem: async (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> => {
    const itemData = {
      ...toSnakeCase(item),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('inventory_items')
      .insert(itemData)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as InventoryItem;
  },

  updateInventoryItem: async (id: string, item: Partial<InventoryItem>): Promise<InventoryItem> => {
    const itemData = {
      ...toSnakeCase(item),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('inventory_items')
      .update(itemData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as InventoryItem;
  },

  deleteInventoryItem: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Inventory Transactions
  getInventoryTransactions: async (): Promise<InventoryTransaction[]> => {
    try {
      const allData = await getAllRecords('inventory_transactions', 'created_at', false);
      return toCamelCase(allData) as InventoryTransaction[];
    } catch (error) {
      throw error;
    }
  },

  createInventoryTransaction: async (transaction: Omit<InventoryTransaction, 'id' | 'createdAt'>): Promise<InventoryTransaction> => {
    const transactionData = {
      ...toSnakeCase(transaction),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('inventory_transactions')
      .insert(transactionData)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as InventoryTransaction;
  },

  // Medication Inventory
  getMedicationInventory: async (): Promise<MedicationInventory[]> => {
    try {
      const allData = await getAllRecords('medication_inventory', 'medication_name', true);
      return toCamelCase(allData) as MedicationInventory[];
    } catch (error) {
      console.error('❌ Supabase: Error getting medication inventory:', error);
      throw error;
    }
  },

  getMedicationInventoryItem: async (id: string): Promise<MedicationInventory> => {
    const { data, error } = await supabase
      .from('medication_inventory')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as MedicationInventory;
  },

  createMedicationInventoryItem: async (item: Omit<MedicationInventory, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicationInventory> => {
    const itemData = {
      ...toSnakeCase(item),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('medication_inventory')
      .insert(itemData)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as MedicationInventory;
  },

  updateMedicationInventoryItem: async (id: string, item: Partial<MedicationInventory>): Promise<MedicationInventory> => {
    const itemData = {
      ...toSnakeCase(item),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('medication_inventory')
      .update(itemData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as MedicationInventory;
  },

  // Medication Transactions
  getMedicationTransactions: async (): Promise<MedicationTransaction[]> => {
    try {
      const allData = await getAllRecords('medication_transactions', 'created_at', false);
      return toCamelCase(allData) as MedicationTransaction[];
    } catch (error) {
      throw error;
    }
  },

  createMedicationTransaction: async (transaction: Omit<MedicationTransaction, 'id' | 'createdAt'>): Promise<MedicationTransaction> => {
    const transactionData = {
      ...toSnakeCase(transaction),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('medication_transactions')
      .insert(transactionData)
      .select()
      .single();
    
    if (error) throw error;
    return toCamelCase(data) as MedicationTransaction;
  },

  // Inventory Management Functions
  updateInventoryStock: async (
    itemId: string,
    transactionType: 'in' | 'out' | 'adjustment',
    quantity: number,
    unitCost?: number,
    referenceType?: string,
    referenceId?: string,
    notes?: string,
    performedById?: string
  ): Promise<void> => {
    const { error } = await supabase.rpc('update_inventory_stock', {
      item_id: itemId,
      transaction_type: transactionType,
      quantity: quantity,
      unit_cost: unitCost,
      reference_type: referenceType,
      reference_id: referenceId,
      notes: notes,
      performed_by_id: performedById
    });

    if (error) throw error;
  },

  getLowStockItems: async (): Promise<any[]> => {
    const { data, error } = await supabase.rpc('get_low_stock_items');
    if (error) throw error;
    return data || [];
  },

  getExpiringItems: async (): Promise<any[]> => {
    const { data, error } = await supabase.rpc('get_expiring_items');
    if (error) throw error;
    return data || [];
  },

  // ==============================================
  // AUDIT TRAIL METHODS
  // ==============================================

  // Get audit logs with filtering
  getAuditLogs: async (filters?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    tableName?: string;
    operation?: string;
    severity?: string;
    limit?: number;
  }): Promise<AuditLog[]> => {
    console.log('🔍 Supabase: Getting audit logs...');
    
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('timestamp', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('timestamp', filters.endDate);
      }
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.tableName) {
        query = query.eq('table_name', filters.tableName);
      }
      if (filters?.operation) {
        query = query.eq('operation', filters.operation);
      }
      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      console.log('✅ Supabase: Got audit logs:', data?.length || 0);
      return toCamelCase(data || []) as AuditLog[];
    } catch (error) {
      console.error('❌ Supabase: Error getting audit logs:', error);
      throw error;
    }
  },

  // Get patient access logs
  getPatientAccessLogs: async (filters?: {
    startDate?: string;
    endDate?: string;
    patientId?: string;
    accessedBy?: string;
    accessType?: string;
    limit?: number;
  }): Promise<PatientAccessLog[]> => {
    console.log('🔍 Supabase: Getting patient access logs...');
    
    try {
      let query = supabase
        .from('patient_access_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('timestamp', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('timestamp', filters.endDate);
      }
      if (filters?.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }
      if (filters?.accessedBy) {
        query = query.eq('accessed_by', filters.accessedBy);
      }
      if (filters?.accessType) {
        query = query.eq('access_type', filters.accessType);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      console.log('✅ Supabase: Got patient access logs:', data?.length || 0);
      return toCamelCase(data || []) as PatientAccessLog[];
    } catch (error) {
      console.error('❌ Supabase: Error getting patient access logs:', error);
      throw error;
    }
  },

  // Get prescription audit logs
  getPrescriptionAuditLogs: async (filters?: {
    startDate?: string;
    endDate?: string;
    prescriptionId?: string;
    patientId?: string;
    doctorId?: string;
    action?: string;
    limit?: number;
  }): Promise<PrescriptionAuditLog[]> => {
    console.log('🔍 Supabase: Getting prescription audit logs...');
    
    try {
      let query = supabase
        .from('prescription_audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('timestamp', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('timestamp', filters.endDate);
      }
      if (filters?.prescriptionId) {
        query = query.eq('prescription_id', filters.prescriptionId);
      }
      if (filters?.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }
      if (filters?.doctorId) {
        query = query.eq('doctor_id', filters.doctorId);
      }
      if (filters?.action) {
        query = query.eq('action', filters.action);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      console.log('✅ Supabase: Got prescription audit logs:', data?.length || 0);
      return toCamelCase(data || []) as PrescriptionAuditLog[];
    } catch (error) {
      console.error('❌ Supabase: Error getting prescription audit logs:', error);
      throw error;
    }
  },

  // Get compliance violations
  getComplianceViolations: async (filters?: {
    startDate?: string;
    endDate?: string;
    severity?: string;
  }): Promise<ComplianceViolation[]> => {
    console.log('🔍 Supabase: Getting compliance violations...');
    
    try {
      const { data, error } = await supabase.rpc('get_compliance_violations', {
        p_start_date: filters?.startDate || null,
        p_end_date: filters?.endDate || null
      });
      
      if (error) throw error;
      console.log('✅ Supabase: Got compliance violations:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Supabase: Error getting compliance violations:', error);
      throw error;
    }
  },

  // Get audit trail statistics
  getAuditStatistics: async (days: number = 30): Promise<AuditStatistics[]> => {
    console.log('🔍 Supabase: Getting audit statistics...');
    
    try {
      const { data, error } = await supabase.rpc('get_audit_trail_statistics', {
        p_days: days
      });
      
      if (error) throw error;
      console.log('✅ Supabase: Got audit statistics:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Supabase: Error getting audit statistics:', error);
      throw error;
    }
  },

  // Get complete patient audit trail
  getPatientAuditTrail: async (patientId: string, filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> => {
    console.log('🔍 Supabase: Getting patient audit trail...');
    
    try {
      const { data, error } = await supabase.rpc('get_patient_complete_audit_trail', {
        p_patient_id: patientId,
        p_start_date: filters?.startDate || null,
        p_end_date: filters?.endDate || null
      });
      
      if (error) throw error;
      console.log('✅ Supabase: Got patient audit trail:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Supabase: Error getting patient audit trail:', error);
      throw error;
    }
  },

  // Get user activity summary
  getUserActivitySummary: async (userId: string, days: number = 30): Promise<any[]> => {
    console.log('🔍 Supabase: Getting user activity summary...');
    
    try {
      const { data, error } = await supabase.rpc('get_user_activity_summary', {
        p_user_id: userId,
        p_days: days
      });
      
      if (error) throw error;
      console.log('✅ Supabase: Got user activity summary:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Supabase: Error getting user activity summary:', error);
      throw error;
    }
  },

  // Export audit trail for compliance
  exportAuditTrail: async (filters: {
    startDate: string;
    endDate: string;
    auditType?: string;
  }): Promise<any> => {
    console.log('🔍 Supabase: Exporting audit trail...');
    
    try {
      const { data, error } = await supabase.rpc('export_audit_trail_for_compliance', {
        p_start_date: filters.startDate,
        p_end_date: filters.endDate,
        p_audit_type: filters.auditType || 'ALL'
      });
      
      if (error) throw error;
      console.log('✅ Supabase: Exported audit trail');
      return data;
    } catch (error) {
      console.error('❌ Supabase: Error exporting audit trail:', error);
      throw error;
    }
  },

  // Log patient data access
  logPatientAccess: async (accessData: {
    patientId: string;
    accessType: string;
    dataAccessed: string[];
    purpose?: string;
    notes?: string;
  }): Promise<void> => {
    console.log('🔍 Supabase: Logging patient access...');
    
    try {
      const { error } = await supabase.rpc('log_patient_data_access', {
        p_patient_id: accessData.patientId,
        p_access_type: accessData.accessType,
        p_data_fields: accessData.dataAccessed,
        p_purpose: accessData.purpose || 'Treatment'
      });
      
      if (error) throw error;
      console.log('✅ Supabase: Logged patient access');
    } catch (error) {
      console.error('❌ Supabase: Error logging patient access:', error);
      throw error;
    }
  },

  // Log user authentication
  logUserAuth: async (authData: {
    userId?: string;
    username?: string;
    action: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED';
    success: boolean;
    failureReason?: string;
  }): Promise<void> => {
    console.log('🔍 Supabase: Logging user authentication...');
    
    try {
      const { error } = await supabase.rpc('log_user_login', {
        p_user_id: authData.userId || null,
        p_success: authData.success,
        p_failure_reason: authData.failureReason || null
      });
      
      if (error) throw error;
      console.log('✅ Supabase: Logged user authentication');
    } catch (error) {
      console.error('❌ Supabase: Error logging user authentication:', error);
      throw error;
    }
  },

  // Log inventory transaction
  logInventoryTransaction: async (transactionData: {
    itemId?: string;
    medicationId?: string;
    transactionType: string;
    quantity: number;
    itemName: string;
    batchNumber?: string;
    prescriptionId?: string;
    patientId?: string;
    reason?: string;
  }): Promise<void> => {
    console.log('🔍 Supabase: Logging inventory transaction...');
    
    try {
      const { error } = await supabase.rpc('log_inventory_transaction', {
        p_item_id: transactionData.itemId || null,
        p_medication_id: transactionData.medicationId || null,
        p_transaction_type: transactionData.transactionType,
        p_quantity: transactionData.quantity,
        p_item_name: transactionData.itemName,
        p_batch_number: transactionData.batchNumber || null,
        p_prescription_id: transactionData.prescriptionId || null,
        p_patient_id: transactionData.patientId || null,
        p_reason: transactionData.reason || null
      });
      
      if (error) throw error;
      console.log('✅ Supabase: Logged inventory transaction');
    } catch (error) {
      console.error('❌ Supabase: Error logging inventory transaction:', error);
      throw error;
    }
  }
};
