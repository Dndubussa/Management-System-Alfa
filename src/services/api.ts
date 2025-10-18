// API service for connecting to backend
const API_BASE_URL = (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:3001/api';

// -------------- Case conversion utilities --------------
function isObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function camelToSnake(key: string): string {
	return key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

function snakeToCamel(key: string): string {
	return key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function toSnakeCaseKeys<T = any>(input: any): T {
	if (Array.isArray(input)) return input.map(toSnakeCaseKeys) as unknown as T;
	if (!isObject(input)) return input as T;
	const out: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(input)) {
		out[camelToSnake(k)] = toSnakeCaseKeys(v);
	}
	return out as T;
}

function toCamelCaseKeys<T = any>(input: any): T {
	if (Array.isArray(input)) return input.map(toCamelCaseKeys) as unknown as T;
	if (!isObject(input)) return input as T;
	const out: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(input)) {
		out[snakeToCamel(k)] = toCamelCaseKeys(v);
	}
	return out as T;
}

// -------------- Entity mappers (shape adapters) --------------
function mapPatientToDb(patient: Omit<Patient, 'id' | 'mrn' | 'createdAt' | 'updatedAt'> | Partial<Patient>) {
	const emergency = (patient as Patient).emergencyContact || { name: undefined, phone: undefined, relationship: undefined };
	const insurance = (patient as Patient).insuranceInfo || { provider: undefined, membershipNumber: undefined };
	const base = {
		first_name: (patient as any).firstName,
		last_name: (patient as any).lastName,
		date_of_birth: (patient as any).dateOfBirth,
		gender: (patient as any).gender,
		phone: (patient as any).phone,
		address: (patient as any).address,
		emergency_contact_name: emergency?.name,
		emergency_contact_phone: emergency?.phone,
		emergency_contact_relationship: emergency?.relationship,
		insurance_provider: insurance?.provider,
		insurance_membership_number: insurance?.membershipNumber,
	};
	return base;
}

function mapPatientFromDb(row: any): Patient {
	const c = toCamelCaseKeys<any>(row);
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
			name: c.emergencyContactName,
			phone: c.emergencyContactPhone,
			relationship: c.emergencyContactRelationship,
		},
		insuranceInfo: {
			provider: c.insuranceProvider,
			membershipNumber: c.insuranceMembershipNumber,
		},
		createdAt: c.createdAt,
		updatedAt: c.updatedAt,
	};
}

function mapAppointmentToDb(appointment: Omit<Appointment, 'id'> | Partial<Appointment>) {
	const c = appointment as any;
	return {
		patient_id: c.patientId,
		doctor_id: c.doctorId,
		date_time: c.dateTime,
		duration: c.duration,
		type: c.type,
		status: c.status,
		notes: c.notes,
	};
}

function mapAppointmentFromDb(row: any): Appointment {
	const c = toCamelCaseKeys<any>(row);
	return {
		id: c.id,
		patientId: c.patientId,
		doctorId: c.doctorId,
		dateTime: c.dateTime,
		duration: c.duration,
		type: c.type,
		status: c.status,
		notes: c.notes,
	};
}

function mapMedicalRecordToDb(record: Omit<MedicalRecord, 'id'> | Partial<MedicalRecord>) {
	const c = record as any;
	const vitals = c.vitals || {};
	return {
		patient_id: c.patientId,
		doctor_id: c.doctorId,
		visit_date: c.visitDate,
		chief_complaint: c.chiefComplaint,
		diagnosis: c.diagnosis,
		treatment: c.treatment,
		notes: c.notes,
		blood_pressure: vitals.bloodPressure,
		heart_rate: vitals.heartRate,
		temperature: vitals.temperature,
		weight: vitals.weight,
		height: vitals.height,
		status: c.status,
	};
}

function mapMedicalRecordFromDb(row: any): MedicalRecord {
	const c = toCamelCaseKeys<any>(row);
	return {
		id: c.id,
		patientId: c.patientId,
		doctorId: c.doctorId,
		visitDate: c.visitDate,
		chiefComplaint: c.chiefComplaint,
		diagnosis: c.diagnosis,
		treatment: c.treatment,
		notes: c.notes,
		vitals: {
			bloodPressure: c.bloodPressure,
			heartRate: c.heartRate,
			temperature: c.temperature,
			weight: c.weight,
			height: c.height,
		},
		prescriptions: (c.prescriptions ?? []) as Prescription[],
		labOrders: (c.labOrders ?? []) as LabOrder[],
		status: c.status,
	};
}

// Helper function to handle API requests
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const json = await response.json();
    return json as T;
  } catch (error) {
    console.error(`API request error for ${url}:`, error);
    throw error;
  }
}

// API functions for each entity type
export const api = {
  // Patients
  getPatients: async () => {
    const rows = await apiRequest<any[]>('/patients');
    return rows.map(mapPatientFromDb);
  },
  getPatient: async (id: string) => {
    const row = await apiRequest<any>(`/patients/${id}`);
    return mapPatientFromDb(row);
  },
  createPatient: async (patient: Omit<Patient, 'id' | 'mrn' | 'createdAt' | 'updatedAt'>) => {
    console.log('Creating patient with data:', patient);
    const body = mapPatientToDb(patient);
    console.log('Mapped patient data for database:', body);
    const row = await apiRequest<any>('/patients', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return mapPatientFromDb(row);
  },
  updatePatient: async (id: string, patient: Partial<Patient>) => {
    const body = mapPatientToDb(patient);
    const row = await apiRequest<any>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return mapPatientFromDb(row);
  },
  deletePatient: (id: string) => 
    apiRequest<void>(`/patients/${id}`, {
      method: 'DELETE',
    }),

  // Medical Records
  getMedicalRecords: async () => {
    const rows = await apiRequest<any[]>('/medical-records');
    return rows.map(mapMedicalRecordFromDb);
  },
  getMedicalRecord: async (id: string) => {
    const row = await apiRequest<any>(`/medical-records/${id}`);
    return mapMedicalRecordFromDb(row);
  },
  createMedicalRecord: async (record: Omit<MedicalRecord, 'id'>) => {
    const body = mapMedicalRecordToDb(record);
    const row = await apiRequest<any>('/medical-records', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return mapMedicalRecordFromDb(row);
  },
  updateMedicalRecord: async (id: string, record: Partial<MedicalRecord>) => {
    const body = mapMedicalRecordToDb(record);
    const row = await apiRequest<any>(`/medical-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return mapMedicalRecordFromDb(row);
  },

  // Prescriptions
  getPrescriptions: () => apiRequest<Prescription[]>('/prescriptions'),
  getPrescription: (id: string) => apiRequest<Prescription>(`/prescriptions/${id}`),
  updatePrescriptionStatus: (id: string, status: Prescription['status']) => 
    apiRequest<Prescription>(`/prescriptions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Lab Orders
  getLabOrders: () => apiRequest<LabOrder[]>('/lab-orders'),
  getLabOrder: (id: string) => apiRequest<LabOrder>(`/lab-orders/${id}`),
  updateLabOrderStatus: (id: string, status: LabOrder['status'], results?: string) => 
    apiRequest<LabOrder>(`/lab-orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, results }),
    }),

  // Appointments
  getAppointments: async () => {
    const rows = await apiRequest<any[]>('/appointments');
    return rows.map(mapAppointmentFromDb);
  },
  getAppointment: async (id: string) => {
    const row = await apiRequest<any>(`/appointments/${id}`);
    return mapAppointmentFromDb(row);
  },
  createAppointment: async (appointment: Omit<Appointment, 'id'>) => {
    const body = mapAppointmentToDb(appointment);
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create appointment');
    }
    
    const row = await response.json();
    return mapAppointmentFromDb(row);
  },
  updateAppointmentStatus: async (id: string, status: Appointment['status']) => {
    const row = await apiRequest<any>(`/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return mapAppointmentFromDb(row);
  },

  // Users
  getUsers: async () => {
    const rows = await apiRequest<any[]>('/users');
    return rows.map((r) => toCamelCaseKeys<User>(r));
  },
  getUser: async (id: string) => toCamelCaseKeys<User>(await apiRequest<any>(`/users/${id}`)),
  createUser: async (user: Omit<User, 'id'>) => toCamelCaseKeys<User>(await apiRequest<any>('/users', {
    method: 'POST',
    body: JSON.stringify(toSnakeCaseKeys(user)),
  })),
  updateUser: async (id: string, user: Partial<User>) => toCamelCaseKeys<User>(await apiRequest<any>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toSnakeCaseKeys(user)),
  })),
  deleteUser: (id: string) => 
    apiRequest<void>(`/users/${id}`, {
      method: 'DELETE',
    }),

  // Notifications
  getNotifications: async () => toCamelCaseKeys<Notification[]>(await apiRequest<any[]>('/notifications')),
  getNotification: async (id: string) => toCamelCaseKeys<Notification>(await apiRequest<any>(`/notifications/${id}`)),
  createNotification: async (notification: Omit<Notification, 'id' | 'createdAt'>) => toCamelCaseKeys<Notification>(await apiRequest<any>('/notifications', {
    method: 'POST',
    body: JSON.stringify(toSnakeCaseKeys(notification)),
  })),
  markNotificationRead: async (id: string, userId: string) => toCamelCaseKeys<Notification>(await apiRequest<any>(`/notifications/${id}/read`, {
    method: 'PUT',
    body: JSON.stringify({ userId }),
  })),

  // Service Prices
  getServicePrices: async () => toCamelCaseKeys<ServicePrice[]>(await apiRequest<any[]>('/service-prices')),
  getServicePrice: async (id: string) => toCamelCaseKeys<ServicePrice>(await apiRequest<any>(`/service-prices/${id}`)),
  createServicePrice: async (servicePrice: Omit<ServicePrice, 'id'>) => toCamelCaseKeys<ServicePrice>(await apiRequest<any>('/service-prices', {
    method: 'POST',
    body: JSON.stringify(toSnakeCaseKeys(servicePrice)),
  })),
  updateServicePrice: async (id: string, servicePrice: Partial<ServicePrice>) => toCamelCaseKeys<ServicePrice>(await apiRequest<any>(`/service-prices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toSnakeCaseKeys(servicePrice)),
  })),

  // Bills
  getBills: async () => toCamelCaseKeys<Bill[]>(await apiRequest<any[]>('/bills')),
  getBill: async (id: string) => toCamelCaseKeys<Bill>(await apiRequest<any>(`/bills/${id}`)),
  createBill: async (bill: Omit<Bill, 'id'>) => toCamelCaseKeys<Bill>(await apiRequest<any>('/bills', {
    method: 'POST',
    body: JSON.stringify(toSnakeCaseKeys(bill)),
  })),
  updateBillStatus: async (id: string, status: Bill['status'], paymentMethod?: string) => toCamelCaseKeys<Bill>(await apiRequest<any>(`/bills/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, paymentMethod }),
  })),

  // Departments
  getDepartments: async () => toCamelCaseKeys<Department[]>(await apiRequest<any[]>('/departments')),
  getDepartment: async (id: string) => toCamelCaseKeys<Department>(await apiRequest<any>(`/departments/${id}`)),
  createDepartment: async (department: Omit<Department, 'id'>) => toCamelCaseKeys<Department>(await apiRequest<any>('/departments', {
    method: 'POST',
    body: JSON.stringify(toSnakeCaseKeys(department)),
  })),
  updateDepartment: async (id: string, department: Partial<Department>) => toCamelCaseKeys<Department>(await apiRequest<any>(`/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toSnakeCaseKeys(department)),
  })),

  // Referrals
  getReferrals: async () => toCamelCaseKeys<Referral[]>(await apiRequest<any[]>('/referrals')),
  getReferral: async (id: string) => toCamelCaseKeys<Referral>(await apiRequest<any>(`/referrals/${id}`)),
  createReferral: async (referral: Omit<Referral, 'id' | 'createdAt' | 'updatedAt'>) => toCamelCaseKeys<Referral>(await apiRequest<any>('/referrals', {
    method: 'POST',
    body: JSON.stringify(toSnakeCaseKeys(referral)),
  })),
  updateReferralStatus: async (id: string, status: Referral['status']) => toCamelCaseKeys<Referral>(await apiRequest<any>(`/referrals/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })),

  // Insurance Claims
  getInsuranceClaims: async () => toCamelCaseKeys<InsuranceClaim[]>(await apiRequest<any[]>('/insurance-claims')),
  getInsuranceClaim: async (id: string) => toCamelCaseKeys<InsuranceClaim>(await apiRequest<any>(`/insurance-claims/${id}`)),
  createInsuranceClaim: async (claim: Omit<InsuranceClaim, 'id' | 'submissionDate' | 'status'>) => toCamelCaseKeys<InsuranceClaim>(await apiRequest<any>('/insurance-claims', {
    method: 'POST',
    body: JSON.stringify(toSnakeCaseKeys(claim)),
  })),
  updateInsuranceClaimStatus: async (id: string, status: InsuranceClaim['status'], rejectionReason?: string) => toCamelCaseKeys<InsuranceClaim>(await apiRequest<any>(`/insurance-claims/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, rejectionReason }),
  })),

  // Surgery Requests
  getSurgeryRequests: async () => toCamelCaseKeys<SurgeryRequest[]>(await apiRequest<any[]>('/surgery-requests')),
  getSurgeryRequest: async (id: string) => toCamelCaseKeys<SurgeryRequest>(await apiRequest<any>(`/surgery-requests/${id}`)),
  createSurgeryRequest: async (request: Omit<SurgeryRequest, 'id' | 'createdAt' | 'updatedAt'>) => toCamelCaseKeys<SurgeryRequest>(await apiRequest<any>('/surgery-requests', {
    method: 'POST',
    body: JSON.stringify(toSnakeCaseKeys(request)),
  })),
  updateSurgeryRequest: async (id: string, updates: Partial<SurgeryRequest>) => toCamelCaseKeys<SurgeryRequest>(await apiRequest<any>(`/surgery-requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toSnakeCaseKeys(updates)),
  })),

  // OT Slots
  getOTSlots: async () => toCamelCaseKeys<OTSlot[]>(await apiRequest<any[]>('/ot-slots')),
  getOTSlot: async (id: string) => toCamelCaseKeys<OTSlot>(await apiRequest<any>(`/ot-slots/${id}`)),
  createOTSlot: async (slot: Omit<OTSlot, 'id'>) => toCamelCaseKeys<OTSlot>(await apiRequest<any>('/ot-slots', {
    method: 'POST',
    body: JSON.stringify(toSnakeCaseKeys(slot)),
  })),
  updateOTSlot: async (id: string, updates: Partial<OTSlot>) => toCamelCaseKeys<OTSlot>(await apiRequest<any>(`/ot-slots/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toSnakeCaseKeys(updates)),
  })),

  // OT Resources
  getOTResources: async () => toCamelCaseKeys<OTResource[]>(await apiRequest<any[]>('/ot-resources')),
  getOTResource: async (id: string) => toCamelCaseKeys<OTResource>(await apiRequest<any>(`/ot-resources/${id}`)),
  createOTResource: async (resource: Omit<OTResource, 'id'>) => toCamelCaseKeys<OTResource>(await apiRequest<any>('/ot-resources', {
    method: 'POST',
    body: JSON.stringify(toSnakeCaseKeys(resource)),
  })),
  updateOTResource: async (id: string, updates: Partial<OTResource>) => toCamelCaseKeys<OTResource>(await apiRequest<any>(`/ot-resources/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toSnakeCaseKeys(updates)),
  })),

  // OT Checklists
  getOTChecklists: async () => toCamelCaseKeys<OTChecklist[]>(await apiRequest<any[]>('/ot-checklists')),
  getOTChecklist: async (id: string) => toCamelCaseKeys<OTChecklist>(await apiRequest<any>(`/ot-checklists/${id}`)),
  createOTChecklist: async (checklist: Omit<OTChecklist, 'id' | 'createdAt' | 'updatedAt'>) => toCamelCaseKeys<OTChecklist>(await apiRequest<any>('/ot-checklists', {
    method: 'POST',
    body: JSON.stringify(toSnakeCaseKeys(checklist)),
  })),
  updateOTChecklist: async (id: string, updates: Partial<OTChecklist>) => toCamelCaseKeys<OTChecklist>(await apiRequest<any>(`/ot-checklists/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toSnakeCaseKeys(updates)),
  })),

  // Surgery Progress
  getSurgeryProgress: async () => toCamelCaseKeys<SurgeryProgress[]>(await apiRequest<any[]>('/surgery-progress')),
  getSurgeryProgressItem: async (id: string) => toCamelCaseKeys<SurgeryProgress>(await apiRequest<any>(`/surgery-progress/${id}`)),
  createSurgeryProgress: async (progress: Omit<SurgeryProgress, 'id' | 'timestamp'>) => toCamelCaseKeys<SurgeryProgress>(await apiRequest<any>('/surgery-progress', {
    method: 'POST',
    body: JSON.stringify(toSnakeCaseKeys(progress)),
  })),
  updateSurgeryProgress: async (id: string, updates: Partial<SurgeryProgress>) => toCamelCaseKeys<SurgeryProgress>(await apiRequest<any>(`/surgery-progress/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toSnakeCaseKeys(updates)),
  })),

  // OT Reports
  getOTReports: async () => toCamelCaseKeys<OTReport[]>(await apiRequest<any[]>('/ot-reports')),
  getOTReport: async (id: string) => toCamelCaseKeys<OTReport>(await apiRequest<any>(`/ot-reports/${id}`)),
  createOTReport: async (report: Omit<OTReport, 'id' | 'createdAt'>) => toCamelCaseKeys<OTReport>(await apiRequest<any>('/ot-reports', {
    method: 'POST',
    body: JSON.stringify(toSnakeCaseKeys(report)),
  })),
  updateOTReport: async (id: string, updates: Partial<OTReport>) => toCamelCaseKeys<OTReport>(await apiRequest<any>(`/ot-reports/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toSnakeCaseKeys(updates)),
  })),

  // Inventory Items (placeholder methods for local API)
  getInventoryItems: async () => {
    console.log('⚠️ Local API: getInventoryItems not implemented, returning empty array');
    return [];
  },
  getInventoryItem: async (id: string) => {
    console.log('⚠️ Local API: getInventoryItem not implemented');
    throw new Error('Inventory items not available in local API');
  },
  createInventoryItem: async (item: any) => {
    console.log('⚠️ Local API: createInventoryItem not implemented');
    throw new Error('Inventory items not available in local API');
  },
  updateInventoryItem: async (id: string, updates: any) => {
    console.log('⚠️ Local API: updateInventoryItem not implemented');
    throw new Error('Inventory items not available in local API');
  },
  deleteInventoryItem: async (id: string) => {
    console.log('⚠️ Local API: deleteInventoryItem not implemented');
    throw new Error('Inventory items not available in local API');
  },
  getInventoryTransactions: async () => {
    console.log('⚠️ Local API: getInventoryTransactions not implemented, returning empty array');
    return [];
  },
  createInventoryTransaction: async (transaction: any) => {
    console.log('⚠️ Local API: createInventoryTransaction not implemented');
    throw new Error('Inventory transactions not available in local API');
  },

  // Medication Inventory (placeholder methods for local API)
  getMedicationInventory: async () => {
    console.log('⚠️ Local API: getMedicationInventory not implemented, returning empty array');
    return [];
  },
  getMedicationInventoryItem: async (id: string) => {
    console.log('⚠️ Local API: getMedicationInventoryItem not implemented');
    throw new Error('Medication inventory not available in local API');
  },
  createMedicationInventoryItem: async (item: any) => {
    console.log('⚠️ Local API: createMedicationInventoryItem not implemented');
    throw new Error('Medication inventory not available in local API');
  },
  updateMedicationInventoryItem: async (id: string, updates: any) => {
    console.log('⚠️ Local API: updateMedicationInventoryItem not implemented');
    throw new Error('Medication inventory not available in local API');
  },
  getMedicationTransactions: async () => {
    console.log('⚠️ Local API: getMedicationTransactions not implemented, returning empty array');
    return [];
  },
  createMedicationTransaction: async (transaction: any) => {
    console.log('⚠️ Local API: createMedicationTransaction not implemented');
    throw new Error('Medication transactions not available in local API');
  },
  updateInventoryStock: async (id: string, stock: number) => {
    console.log('⚠️ Local API: updateInventoryStock not implemented');
    throw new Error('Inventory stock updates not available in local API');
  },
  getLowStockItems: async () => {
    console.log('⚠️ Local API: getLowStockItems not implemented, returning empty array');
    return [];
  },
  getExpiringItems: async () => {
    console.log('⚠️ Local API: getExpiringItems not implemented, returning empty array');
    return [];
  },
};

// Type definitions (imported from types)
interface Patient {
  id: string;
  mrn: string;
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

interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  visitDate: string;
  chiefComplaint: string;
  diagnosis: string;
  diagnosisCodes: {
    code: string;
    description: string;
    type: 'ICD-10' | 'SNOMED CT';
  }[];
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

interface Prescription {
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

interface LabOrder {
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

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  dateTime: string;
  duration: number;
  type: 'consultation' | 'follow-up' | 'emergency';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'receptionist' | 'doctor' | 'lab' | 'pharmacy' | 'radiologist' | 'ophthalmologist' | 'admin' | 'ot-coordinator';
  department: string;
}

interface Notification {
  id: string;
  userIds: string[];
  type: 'prescription' | 'lab-order' | 'appointment' | 'general' | 'queue' | 'billing';
  title: string;
  message: string;
  isRead: boolean | { [userId: string]: boolean };
  createdAt: string;
  department?: string;
}

interface ServicePrice {
  id: string;
  category: 'consultation' | 'lab-test' | 'medication' | 'procedure';
  serviceName: string;
  price: number;
  description: string;
}

interface Bill {
  id: string;
  patientId: string;
  items: {
    id: string;
    serviceId: string;
    serviceName: string;
    category: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  paymentMethod?: string;
  createdAt: string;
  paidAt?: string;
}

interface Department {
  id: string;
  name: string;
  description: string;
  doctors: string[];
}

interface Referral {
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

interface InsuranceClaim {
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

interface SurgeryRequest {
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

interface OTSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  otRoomId: string;
  surgeryRequestId?: string;
  status: 'available' | 'booked' | 'blocked' | 'maintenance';
  notes?: string;
}

interface OTResource {
  id: string;
  type: 'surgeon' | 'anesthesiologist' | 'nurse' | 'ot-room' | 'equipment' | 'instrument';
  name: string;
  specialty?: string;
  availability: {
    [date: string]: {
      startTime: string;
      endTime: string;
      status: 'available' | 'busy' | 'unavailable';
    }[];
  };
  notes?: string;
}

interface OTChecklist {
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

interface SurgeryProgress {
  id: string;
  surgeryRequestId: string;
  status: 'pre-op' | 'in-progress' | 'closed' | 'post-op' | 'completed';
  timestamp: string;
  notes?: string;
  updatedBy: string;
}

interface OTReport {
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

// Service Estimates API functions
export const estimatesApi = {
  getEstimates: async (): Promise<ServiceEstimate[]> => {
    const rows = await apiRequest<any[]>('/estimates');
    return rows.map(mapEstimateFromDb);
  },

  getEstimate: async (id: string): Promise<ServiceEstimate> => {
    const row = await apiRequest<any>(`/estimates/${id}`);
    return mapEstimateFromDb(row);
  },

  createEstimate: async (estimate: Omit<ServiceEstimate, 'id' | 'estimateNumber' | 'createdAt' | 'updatedAt'>): Promise<ServiceEstimate> => {
    const estimateData = toSnakeCaseKeys(estimate);
    const row = await apiRequest<any>('/estimates', {
      method: 'POST',
      body: JSON.stringify(estimateData)
    });
    return mapEstimateFromDb(row);
  },

  updateEstimate: async (id: string, estimate: Partial<ServiceEstimate>): Promise<ServiceEstimate> => {
    const estimateData = toSnakeCaseKeys(estimate);
    const row = await apiRequest<any>(`/estimates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(estimateData)
    });
    return mapEstimateFromDb(row);
  },

  deleteEstimate: async (id: string): Promise<void> => {
    await apiRequest(`/estimates/${id}`, {
      method: 'DELETE'
    });
  }
};

// Helper function to map estimate from database format
function mapEstimateFromDb(row: any): ServiceEstimate {
  return {
    id: row.id,
    estimateNumber: row.estimate_number,
    patientName: row.patient_name,
    patientPhone: row.patient_phone,
    patientEmail: row.patient_email,
    services: row.services || [],
    subtotal: parseFloat(row.subtotal) || 0,
    discount: row.discount ? parseFloat(row.discount) : undefined,
    discountReason: row.discount_reason,
    total: parseFloat(row.total) || 0,
    validUntil: row.valid_until,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    notes: row.notes
  };
}