import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Patient, 
  MedicalRecord, 
  Prescription, 
  LabOrder, 
  Appointment, 
  Notification, 
  ServicePrice, 
  Bill, 
  BillItem, 
  Department, 
  Referral, 
  User, 
  AutobillingConfig, 
  InsuranceClaim,
  SurgeryRequest,
  OTSlot,
  OTResource,
  OTChecklist,
  SurgeryProgress,
  OTReport
} from '../types';
import { api } from '../services/api';
import { supabaseService } from '../services/supabaseService';
import { useError } from './ErrorContext';
import { useAuth } from './AuthContext';
import { findPatientSafely, getPatientDisplayName } from '../utils/patientUtils';

// Determine which service to use based on environment
const isProduction = import.meta.env.PROD;
const hasSupabaseUrl = !!import.meta.env.VITE_SUPABASE_URL;
const forceSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
const useSupabase = isProduction || forceSupabase || hasSupabaseUrl;
const service = useSupabase ? supabaseService : api;

// Debug logging for service selection
console.log('Service selection debug:', {
  isProduction,
  hasSupabaseUrl,
  forceSupabase,
  useSupabase,
  serviceType: useSupabase ? 'supabaseService' : 'api',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL
});

// Service selection logic

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

interface HospitalContextType {
  patients: Patient[];
  medicalRecords: MedicalRecord[];
  prescriptions: Prescription[];
  labOrders: LabOrder[];
  appointments: Appointment[];
  notifications: Notification[];
  servicePrices: ServicePrice[];
  bills: Bill[];
  departments: Department[];
  referrals: Referral[];
  users: User[];
  autobillingConfig: AutobillingConfig;
  insuranceClaims: InsuranceClaim[];
  surgeryRequests: SurgeryRequest[];
  otSlots: OTSlot[];
  otResources: OTResource[];
  otChecklists: OTChecklist[];
  surgeryProgress: SurgeryProgress[];
  otReports: OTReport[];
  inventoryItems: InventoryItem[];
  medicationInventory: MedicationInventory[];
  addPatient: (patient: Omit<Patient, 'id' | 'mrn' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePatient: (id: string, patient: Partial<Patient>) => Promise<void>;
  addMedicalRecord: (record: Omit<MedicalRecord, 'id'>) => Promise<void>;
  updatePrescriptionStatus: (id: string, status: Prescription['status']) => Promise<void>;
  updateLabOrderStatus: (id: string, status: LabOrder['status'], results?: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
  getUserNotifications: (userId: string, userDepartment?: string) => Notification[];
  isNotificationRead: (notification: Notification, userId: string) => boolean;
  markNotificationRead: (id: string, userId: string) => Promise<void>;
  generateBill: (patientId: string, appointmentId?: string, recordId?: string) => void;
  updateBillStatus: (id: string, status: Bill['status'], paymentMethod?: Bill['paymentMethod']) => Promise<void>;
  addBillItem: (billId: string, item: Omit<BillItem, 'id'>) => Promise<void>;
  autoGenerateBills: () => Promise<void>;
  updateAutobillingConfig: (config: Partial<AutobillingConfig>) => Promise<void>;
  addReferral: (referral: Omit<Referral, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateReferralStatus: (id: string, status: Referral['status']) => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  removeUser: (id: string) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  submitInsuranceClaim: (claimData: Omit<InsuranceClaim, 'id' | 'submissionDate' | 'status'>) => Promise<void>;
  updateInsuranceClaimStatus: (id: string, status: InsuranceClaim['status'], rejectionReason?: string) => Promise<void>;
  addSurgeryRequest: (request: Omit<SurgeryRequest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSurgeryRequest: (id: string, updates: Partial<SurgeryRequest>) => Promise<void>;
  addOTSlot: (slot: Omit<OTSlot, 'id'>) => Promise<void>;
  updateOTSlot: (id: string, updates: Partial<OTSlot>) => Promise<void>;
  addOTResource: (resource: Omit<OTResource, 'id'>) => Promise<void>;
  updateOTResource: (id: string, updates: Partial<OTResource>) => Promise<void>;
  addOTChecklist: (checklist: Omit<OTChecklist, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateOTChecklist: (id: string, updates: Partial<OTChecklist>) => Promise<void>;
  addSurgeryProgress: (progress: Omit<SurgeryProgress, 'id' | 'timestamp'>) => Promise<void>;
  addOTReport: (report: Omit<OTReport, 'id' | 'createdAt'>) => Promise<void>;
  // Loading states
  loading: boolean;
  error: string | null;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export function HospitalProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [servicePrices, setServicePrices] = useState<ServicePrice[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [autobillingConfig, setAutobillingConfig] = useState<AutobillingConfig>({
    enabled: true,
    autoGenerateForAppointments: true,
    autoGenerateForMedicalRecords: true,
    autoGenerateForPrescriptions: true,
    autoGenerateForLabOrders: true,
    defaultPaymentMethod: 'cash'
  });
  const [insuranceClaims, setInsuranceClaims] = useState<InsuranceClaim[]>([]);
  const [surgeryRequests, setSurgeryRequests] = useState<SurgeryRequest[]>([]);
  const [otSlots, setOTSlots] = useState<OTSlot[]>([]);
  const [otResources, setOTResources] = useState<OTResource[]>([]);
  const [otChecklists, setOTChecklists] = useState<OTChecklist[]>([]);
  const [surgeryProgress, setSurgeryProgress] = useState<SurgeryProgress[]>([]);
  const [otReports, setOTReports] = useState<OTReport[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [medicationInventory, setMedicationInventory] = useState<MedicationInventory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get error context and auth context
  const { addError } = useError();
  const { user } = useAuth();

  // Load all data from API on component mount
  useEffect(() => {
    const loadData = async (currentUser?: User) => {
      try {
        setLoading(true);
        setError(null);
        
        // Determine which patients to load based on user role
        const loadPatients = async () => {
          if (currentUser && (currentUser.role === 'doctor' || currentUser.role === 'ophthalmologist' || currentUser.role === 'radiologist' || currentUser.role === 'physical-therapist')) {
            // For doctors and specialists, only load their assigned patients
            console.log('👨‍⚕️ Loading patients for doctor/specialist:', currentUser.id);
            return service.getPatientsByDoctor(currentUser.id).catch(err => {
              addError({
                type: 'error',
                title: 'Failed to Load Assigned Patients',
                message: 'Unable to load patients assigned to you',
                details: err instanceof Error ? err.message : String(err),
                component: 'HospitalContext',
                action: 'loadData',
                userAction: 'Application startup',
                metadata: { error: err, userId: currentUser.id }
              });
              return [];
            });
          } else {
            // For receptionists, admins, and other roles, load all patients
            console.log('👥 Loading all patients for role:', currentUser?.role || 'unknown');
            return service.getPatients().catch(err => {
              addError({
                type: 'error',
                title: 'Failed to Load Patients',
                message: 'Unable to load patients data',
                details: err instanceof Error ? err.message : String(err),
                component: 'HospitalContext',
                action: 'loadData',
                userAction: 'Application startup',
                metadata: { error: err }
              });
              return [];
            });
          }
        };
        
        // Load all data in parallel with individual error handling
        
        // Load data with individual error handling - don't fail entire load if one table fails
        const [
          patientsData,
          medicalRecordsData,
          prescriptionsData,
          labOrdersData,
          appointmentsData,
          notificationsData,
          servicePricesData,
          billsData,
          departmentsData,
          referralsData,
          usersData,
          insuranceClaimsData,
          surgeryRequestsData,
          otSlotsData,
          otResourcesData,
          inventoryItemsData,
          medicationInventoryData
        ] = await Promise.all([
          loadPatients(),
          service.getMedicalRecords().catch(err => { 
            addError({
              type: 'error',
              title: 'Failed to Load Medical Records',
              message: 'Unable to load medical records data',
              details: err instanceof Error ? err.message : String(err),
              component: 'HospitalContext',
              action: 'loadData',
              userAction: 'Application startup',
              metadata: { error: err }
            });
            return []; 
          }),
          service.getPrescriptions().catch(err => { 
            addError({
              type: 'error',
              title: 'Failed to Load Prescriptions',
              message: 'Unable to load prescriptions data',
              details: err instanceof Error ? err.message : String(err),
              component: 'HospitalContext',
              action: 'loadData',
              userAction: 'Application startup',
              metadata: { error: err }
            });
            return []; 
          }),
          service.getLabOrders().catch(err => { 
            addError({
              type: 'error',
              title: 'Failed to Load Lab Orders',
              message: 'Unable to load lab orders data',
              details: err instanceof Error ? err.message : String(err),
              component: 'HospitalContext',
              action: 'loadData',
              userAction: 'Application startup',
              metadata: { error: err }
            });
            return []; 
          }),
          service.getAppointments().catch(err => { 
            addError({
              type: 'error',
              title: 'Failed to Load Appointments',
              message: 'Unable to load appointments data',
              details: err instanceof Error ? err.message : String(err),
              component: 'HospitalContext',
              action: 'loadData',
              userAction: 'Application startup',
              metadata: { error: err }
            });
            return []; 
          }),
          service.getNotifications().catch(err => { 
            addError({
              type: 'error',
              title: 'Failed to Load Notifications',
              message: 'Unable to load notifications data',
              details: err instanceof Error ? err.message : String(err),
              component: 'HospitalContext',
              action: 'loadData',
              userAction: 'Application startup',
              metadata: { error: err }
            });
            return []; 
          }),
          service.getServicePrices().catch(err => { 
            addError({
              type: 'error',
              title: 'Failed to Load Service Prices',
              message: 'Unable to load service prices data',
              details: err instanceof Error ? err.message : String(err),
              component: 'HospitalContext',
              action: 'loadData',
              userAction: 'Application startup',
              metadata: { error: err }
            });
            return []; 
          }),
          service.getBills().catch(err => { 
            addError({
              type: 'error',
              title: 'Failed to Load Bills',
              message: 'Unable to load bills data',
              details: err instanceof Error ? err.message : String(err),
              component: 'HospitalContext',
              action: 'loadData',
              userAction: 'Application startup',
              metadata: { error: err }
            });
            return []; 
          }),
          service.getDepartments().catch(err => { 
            addError({
              type: 'error',
              title: 'Failed to Load Departments',
              message: 'Unable to load departments data',
              details: err instanceof Error ? err.message : String(err),
              component: 'HospitalContext',
              action: 'loadData',
              userAction: 'Application startup',
              metadata: { error: err }
            });
            return []; 
          }),
          service.getReferrals().catch(err => { 
            addError({
              type: 'error',
              title: 'Failed to Load Referrals',
              message: 'Unable to load referrals data',
              details: err instanceof Error ? err.message : String(err),
              component: 'HospitalContext',
              action: 'loadData',
              userAction: 'Application startup',
              metadata: { error: err }
            });
            return []; 
          }),
          service.getUsers().catch(err => { 
            addError({
              type: 'error',
              title: 'Failed to Load Users',
              message: 'Unable to load users data',
              details: err instanceof Error ? err.message : String(err),
              component: 'HospitalContext',
              action: 'loadData',
              userAction: 'Application startup',
              metadata: { error: err }
            });
            return []; 
          }),
          service.getInsuranceClaims().catch(err => { 
            addError({
              type: 'error',
              title: 'Failed to Load Insurance Claims',
              message: 'Unable to load insurance claims data',
              details: err instanceof Error ? err.message : String(err),
              component: 'HospitalContext',
              action: 'loadData',
              userAction: 'Application startup',
              metadata: { error: err }
            });
            return []; 
          }),
          service.getSurgeryRequests().catch(err => { 
            addError({
              type: 'error',
              title: 'Failed to Load Surgery Requests',
              message: 'Unable to load surgery requests data',
              details: err instanceof Error ? err.message : String(err),
              component: 'HospitalContext',
              action: 'loadData',
              userAction: 'Application startup',
              metadata: { error: err }
            });
            return []; 
          }),
          service.getOTSlots().catch(err => { 
            addError({
              type: 'error',
              title: 'Failed to Load OT Slots',
              message: 'Unable to load OT slots data',
              details: err instanceof Error ? err.message : String(err),
              component: 'HospitalContext',
              action: 'loadData',
              userAction: 'Application startup',
              metadata: { error: err }
            });
            return []; 
          }),
          service.getOTResources().catch(err => { 
            addError({
              type: 'error',
              title: 'Failed to Load OT Resources',
              message: 'Unable to load OT resources data',
              details: err instanceof Error ? err.message : String(err),
              component: 'HospitalContext',
              action: 'loadData',
              userAction: 'Application startup',
              metadata: { error: err }
            });
            return []; 
          }),
          service.getInventoryItems().catch(err => { 
            addError({
              type: 'error',
              title: 'Failed to Load Inventory Items',
              message: 'Unable to load inventory items data',
              details: err instanceof Error ? err.message : String(err),
              component: 'HospitalContext',
              action: 'loadData',
              userAction: 'Application startup',
              metadata: { error: err }
            });
            return []; 
          }),
          service.getMedicationInventory().catch(err => { 
            addError({
              type: 'error',
              title: 'Failed to Load Medication Inventory',
              message: 'Unable to load medication inventory data',
              details: err instanceof Error ? err.message : String(err),
              component: 'HospitalContext',
              action: 'loadData',
              userAction: 'Application startup',
              metadata: { error: err }
            });
            return []; 
          })
        ]);
        
        
        setPatients(patientsData);
        setMedicalRecords(medicalRecordsData);
        setPrescriptions(prescriptionsData);
        setLabOrders(labOrdersData);
        setAppointments(appointmentsData);
        setNotifications(notificationsData);
        setServicePrices(servicePricesData);
        setBills(billsData);
        setDepartments(departmentsData);
        setReferrals(referralsData);
        setUsers(usersData);
        setInsuranceClaims(insuranceClaimsData);
        setSurgeryRequests(surgeryRequestsData);
        setOTSlots(otSlotsData);
        setOTResources(otResourcesData);
        setInventoryItems(inventoryItemsData);
        setMedicationInventory(medicationInventoryData);
      } catch (err) {
        console.error('Error loading data:', err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('Error details:', errorMessage);
        setError(`Failed to load data from server: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadData(user);
  }, [user]);

  // Set up real-time subscriptions for automatic updates
  useEffect(() => {
    if (!user) return;

    console.log('🔄 Setting up real-time subscriptions for user:', user.role);

    // Get the Supabase client for real-time subscriptions
    const supabase = service.getSupabaseClient();
    if (!supabase) {
      console.log('⚠️ Supabase client not available for real-time subscriptions');
      return;
    }

    // Subscribe to appointments changes
    const appointmentsSubscription = supabase
      .channel('appointments_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'appointments' 
        }, 
        async (payload) => {
          console.log('📅 Real-time appointment update:', payload);
          
          // Reload appointments data
          try {
            const updatedAppointments = await service.getAppointments();
            setAppointments(updatedAppointments);
            
            // For doctors, also refresh patient data if they have new appointments
            if (user.role === 'doctor' || user.role === 'ophthalmologist' || user.role === 'radiologist' || user.role === 'physical-therapist') {
              const updatedPatients = await service.getPatientsByDoctor(user.id);
              setPatients(updatedPatients);
            }
          } catch (err) {
            console.error('Error refreshing data after appointment update:', err);
          }
        }
      )
      .subscribe();

    // Subscribe to patients changes
    const patientsSubscription = supabase
      .channel('patients_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'patients' 
        }, 
        async (payload) => {
          console.log('👥 Real-time patient update:', payload);
          
          // Reload patients data based on user role
          try {
            if (user.role === 'doctor' || user.role === 'ophthalmologist' || user.role === 'radiologist' || user.role === 'physical-therapist') {
              const updatedPatients = await service.getPatientsByDoctor(user.id);
              setPatients(updatedPatients);
            } else {
              const updatedPatients = await service.getPatients();
              setPatients(updatedPatients);
            }
          } catch (err) {
            console.error('Error refreshing patients after update:', err);
          }
        }
      )
      .subscribe();

    // Subscribe to notifications changes
    const notificationsSubscription = supabase
      .channel('notifications_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications' 
        }, 
        async (payload) => {
          console.log('🔔 Real-time notification update:', payload);
          
          // Reload notifications data
          try {
            const updatedNotifications = await service.getNotifications();
            setNotifications(updatedNotifications);
          } catch (err) {
            console.error('Error refreshing notifications after update:', err);
          }
        }
      )
      .subscribe();

    // Subscribe to medical records changes
    const medicalRecordsSubscription = supabase
      .channel('medical_records_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'medical_records' 
        }, 
        async (payload) => {
          console.log('📋 Real-time medical record update:', payload);
          
          // Reload medical records data
          try {
            const updatedMedicalRecords = await service.getMedicalRecords();
            setMedicalRecords(updatedMedicalRecords);
          } catch (err) {
            console.error('Error refreshing medical records after update:', err);
          }
        }
      )
      .subscribe();

    // Subscribe to prescriptions changes
    const prescriptionsSubscription = supabase
      .channel('prescriptions_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'prescriptions' 
        }, 
        async (payload) => {
          console.log('💊 Real-time prescription update:', payload);
          
          // Reload prescriptions data
          try {
            const updatedPrescriptions = await service.getPrescriptions();
            setPrescriptions(updatedPrescriptions);
          } catch (err) {
            console.error('Error refreshing prescriptions after update:', err);
          }
        }
      )
      .subscribe();

    // Subscribe to lab orders changes
    const labOrdersSubscription = supabase
      .channel('lab_orders_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'lab_orders' 
        }, 
        async (payload) => {
          console.log('🧪 Real-time lab order update:', payload);
          
          // Reload lab orders data
          try {
            const updatedLabOrders = await service.getLabOrders();
            setLabOrders(updatedLabOrders);
          } catch (err) {
            console.error('Error refreshing lab orders after update:', err);
          }
        }
      )
      .subscribe();

    // Subscribe to bills changes
    const billsSubscription = supabase
      .channel('bills_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'bills' 
        }, 
        async (payload) => {
          console.log('💰 Real-time bill update:', payload);
          
          // Reload bills data
          try {
            const updatedBills = await service.getBills();
            setBills(updatedBills);
          } catch (err) {
            console.error('Error refreshing bills after update:', err);
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount or user change
    return () => {
      console.log('🧹 Cleaning up real-time subscriptions');
      appointmentsSubscription.unsubscribe();
      patientsSubscription.unsubscribe();
      notificationsSubscription.unsubscribe();
      medicalRecordsSubscription.unsubscribe();
      prescriptionsSubscription.unsubscribe();
      labOrdersSubscription.unsubscribe();
      billsSubscription.unsubscribe();
    };
  }, [user]);

  const addPatient = async (patientData: Omit<Patient, 'id' | 'mrn' | 'createdAt' | 'updatedAt'>) => {
    try {
      // MRN generation is now handled by the service layer
      const newPatient = await service.createPatient(patientData);
      
      // For doctors/specialists, only add if they can see this patient
      // For other roles, add to the list
      if (user && (user.role === 'doctor' || user.role === 'ophthalmologist' || user.role === 'radiologist' || user.role === 'physical-therapist')) {
        // For doctors, only add if they have appointments with this patient
        // This will be handled when an appointment is created
        console.log('👨‍⚕️ Doctor created patient, will be visible when appointment is scheduled');
      } else {
        // For receptionists and other roles, add immediately
        setPatients(prev => [...prev, newPatient]);
      }
    } catch (err) {
      console.error('Error creating patient:', err);
      setError('Failed to create patient');
      throw err;
    }
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    try {
      const updatedPatient = await service.updatePatient(id, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      setPatients(prev => prev.map(patient => 
        patient.id === id ? updatedPatient : patient
      ));
    } catch (err) {
      console.error('Error updating patient:', err);
      setError('Failed to update patient');
      throw err;
    }
  };

  const addMedicalRecord = async (recordData: Omit<MedicalRecord, 'id'>) => {
    try {
      const newRecord = await service.createMedicalRecord(recordData);
      setMedicalRecords(prev => [...prev, newRecord]);

      // Add prescriptions and lab orders to their respective arrays
      if (recordData.prescriptions.length > 0) {
        setPrescriptions(prev => [...prev, ...recordData.prescriptions]);
      }
      if (recordData.labOrders.length > 0) {
        setLabOrders(prev => [...prev, ...recordData.labOrders]);
      }

      // Automatically generate bill if autobilling is enabled for medical records
      if (autobillingConfig.enabled && autobillingConfig.autoGenerateForMedicalRecords) {
        // Delay slightly to ensure all data is saved
        setTimeout(() => {
          generateBill(recordData.patientId, undefined, newRecord.id);
        }, 100);
      }
    } catch (err) {
      console.error('Error creating medical record:', err);
      setError('Failed to create medical record');
      throw err;
    }
  };

  const updatePrescriptionStatus = async (id: string, status: Prescription['status']) => {
    try {
      const updatedPrescription = await service.updatePrescriptionStatus(id, status);
      setPrescriptions(prev => prev.map(prescription =>
        prescription.id === id ? updatedPrescription : prescription
      ));

      // Handle inventory deduction when prescription is dispensed
      if (status === 'dispensed') {
        const prescription = prescriptions.find(p => p.id === id);
        if (prescription) {
          // Find matching medication in inventory
          const medication = medicationInventory.find(med => 
            med.medicationName.toLowerCase() === prescription.medication.toLowerCase() &&
            med.status === 'active'
          );

          if (medication) {
            try {
              // Calculate quantity to deduct (assuming 1 prescription = 1 unit for now)
              const quantityToDeduct = 1;
              
              // Check if we have enough stock
              if (medication.currentStock >= quantityToDeduct) {
                // Create medication transaction record
                await service.createMedicationTransaction({
                  medicationInventoryId: medication.id,
                  transactionType: 'dispensed',
                  quantity: quantityToDeduct,
                  unitCost: medication.unitCost,
                  totalCost: medication.unitCost * quantityToDeduct,
                  prescriptionId: prescription.id,
                  notes: `Dispensed for prescription ${prescription.id}`,
                  performedBy: prescription.doctorId // Using doctor ID as performer
                });

                // Update medication inventory stock
                await service.updateMedicationInventoryItem(medication.id, {
                  currentStock: medication.currentStock - quantityToDeduct
                });

                // Refresh medication inventory
                const updatedMedicationInventory = await service.getMedicationInventory();
                setMedicationInventory(updatedMedicationInventory);

              } else {
                console.warn(`⚠️ Insufficient stock for ${medication.medicationName}. Required: ${quantityToDeduct}, Available: ${medication.currentStock}`);
                // You might want to show a warning to the user here
              }
            } catch (inventoryError) {
              console.error('Error updating medication inventory:', inventoryError);
              // Don't fail the prescription update if inventory update fails
            }
          } else {
            console.warn(`⚠️ Medication ${prescription.medication} not found in inventory`);
          }
        }
      }

      // Automatically generate bill for prescriptions if autobilling is enabled
      if (autobillingConfig.enabled && autobillingConfig.autoGenerateForPrescriptions && status === 'dispensed') {
        const prescription = prescriptions.find(p => p.id === id);
        if (prescription) {
          // Find the medical record associated with this prescription
          const record = medicalRecords.find(r => r.id === prescription.recordId);
          if (record && !bills.some(bill => bill.items.some(item => item.serviceId === prescription.id))) {
            // Generate bill for this prescription
            setTimeout(() => {
              generateBill(prescription.patientId, undefined, record.id);
            }, 100);
          }
        }
      }
    } catch (err) {
      console.error('Error updating prescription status:', err);
      setError('Failed to update prescription status');
      throw err;
    }
  };

  const updateLabOrderStatus = async (id: string, status: LabOrder['status'], results?: string) => {
    try {
      const updatedLabOrder = await service.updateLabOrderStatus(id, status, results);
      setLabOrders(prev => prev.map(order =>
        order.id === id 
          ? { 
              ...order, 
              status, 
              results: results || order.results,
              completedAt: status === 'completed' ? new Date().toISOString() : order.completedAt
            }
          : order
      ));
      
      // Automatically generate bill for lab orders if autobilling is enabled
      if (autobillingConfig.enabled && autobillingConfig.autoGenerateForLabOrders && status === 'completed') {
        const labOrder = labOrders.find(l => l.id === id);
        if (labOrder) {
          // Find the medical record associated with this lab order
          const record = medicalRecords.find(r => r.id === labOrder.recordId);
          if (record && !bills.some(bill => bill.items.some(item => item.serviceId === labOrder.id))) {
            // Generate bill for this lab order
            setTimeout(() => {
              generateBill(labOrder.patientId, undefined, record.id);
            }, 100);
          }
        }
      }
      
      // If status is completed and results are provided, create a notification for the doctor
      if (status === 'completed' && results) {
        const labOrder = labOrders.find(l => l.id === id);
        if (labOrder) {
          const patient = findPatientSafely(patients, labOrder.patientId);
          addNotification({
            userIds: [labOrder.doctorId],
            type: 'lab-order',
            title: 'Lab Results Ready',
            message: `${labOrder.testName} results for ${patient?.firstName} ${patient?.lastName} are now available`,
            isRead: false
          });
        }
      }
    } catch (err) {
      console.error('Error updating lab order status:', err);
      setError('Failed to update lab order status');
      throw err;
    }
  };

  const addNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    try {
      const newNotification = await service.createNotification(notificationData);
      setNotifications(prev => [newNotification, ...prev]);
    } catch (err) {
      console.error('Error creating notification:', err);
      setError('Failed to create notification');
      throw err;
    }
  };

  // New function to get notifications for a specific user
  const getUserNotifications = (userId: string, userDepartment?: string) => {
    return notifications.filter(notification => {
      // Check if user is in the userIds array
      const isForUser = notification.userIds.includes(userId);
      
      // Check if notification is for user's department
      const isForDepartment = userDepartment && notification.department === userDepartment;
      
      // Return notifications that are either:
      // 1. For this specific user, or
      // 2. For this user's department
      return (isForUser || isForDepartment);
    });
  };

  // Helper function to check if a notification is read for a specific user
  const isNotificationRead = (notification: Notification, userId: string): boolean => {
    if (typeof notification.isRead === 'boolean') {
      return notification.isRead;
    }
    if (notification.isRead && typeof notification.isRead === 'object') {
      return notification.isRead[userId] ?? false;
    }
    return false;
  };

  // New function to mark notification as read for a specific user
  const markNotificationRead = async (id: string, userId: string) => {
    try {
      await service.markNotificationRead(id, userId);
      setNotifications(prev => prev.map(notification => {
        if (notification.id === id) {
          // Track read status per user
          let isRead: { [userId: string]: boolean };
          
          if (typeof notification.isRead === 'boolean') {
            isRead = { [userId]: true };
          } else if (notification.isRead && typeof notification.isRead === 'object') {
            isRead = { ...notification.isRead, [userId]: true };
          } else {
            isRead = { [userId]: true };
          }
            
          return { ...notification, isRead };
        }
        return notification;
      }));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read');
      throw err;
    }
  };

  // Add function to update autobilling configuration
  const updateAutobillingConfig = async (config: Partial<AutobillingConfig>) => {
    try {
      setAutobillingConfig(prev => ({ ...prev, ...config }));
    } catch (err) {
      console.error('Error updating autobilling config:', err);
      setError('Failed to update autobilling configuration');
      throw err;
    }
  };

  // Enhanced generateBill function that uses the autobilling configuration
  const generateBill = (patientId: string, appointmentId?: string, recordId?: string) => {
    // Check if autobilling is enabled
    if (!autobillingConfig.enabled) {
      return;
    }

    // Find the patient
    const patient = findPatientSafely(patients, patientId);
    if (!patient) return;

    // Create a new bill
    const newBill: Bill = {
      id: Date.now().toString(),
      patientId,
      items: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // If this is for an appointment
    if (appointmentId) {
      const appointment = appointments.find(a => a.id === appointmentId);
      if (appointment) {
        // Prefer explicit consultation service name if present, else fallback via category
        const preferredNames = ['Consultation', 'Doctor Consultation', 'Medical Consultation'];
        let consultationPrice = preferredNames
          .map(n => findBestPriceByName(n, 'consultation'))
          .find(Boolean) as ServicePrice | undefined;
        if (!consultationPrice) consultationPrice = findBestPriceByName('consultation', 'consultation');
        if (!consultationPrice) consultationPrice = servicePrices.find(sp => sp.category === 'consultation');
        if (consultationPrice) {
          const billItem: BillItem = {
            id: Date.now().toString() + '-1',
            serviceId: consultationPrice.id,
            serviceName: consultationPrice.serviceName,
            category: consultationPrice.category,
            unitPrice: consultationPrice.price,
            quantity: 1,
            totalPrice: consultationPrice.price
          };
          newBill.items.push(billItem);
        }
      }
    }

    // If this is for a medical record
    if (recordId) {
      const record = medicalRecords.find(r => r.id === recordId);
      if (record) {
        // Prescriptions -> try exact/fuzzy medication name in medication category
        const recordPrescriptions = prescriptions.filter(p => p && p.recordId === recordId);
        recordPrescriptions.forEach(prescription => {
          let matchedPrice = findBestPriceByName(prescription.medication, 'medication');
          if (!matchedPrice) matchedPrice = findBestPriceByName(prescription.medication);
          if (!matchedPrice) matchedPrice = servicePrices.find(sp => sp.category === 'medication');
          if (matchedPrice) {
            const billItem: BillItem = {
              id: Date.now().toString() + '-' + prescription.id,
              serviceId: matchedPrice.id,
              serviceName: matchedPrice.serviceName,
              category: matchedPrice.category,
              unitPrice: matchedPrice.price,
              quantity: 1,
              totalPrice: matchedPrice.price
            };
            newBill.items.push(billItem);
          }
        });

        // Lab orders -> fuzzy match testName within lab-test category
        const recordLabOrders = labOrders.filter(lo => lo && lo.recordId === recordId);
        recordLabOrders.forEach(labOrder => {
          let labTestPrice = findBestPriceByName(labOrder.testName, 'lab-test');
          if (!labTestPrice) labTestPrice = findBestPriceByName(labOrder.testName);
          if (labTestPrice) {
            const billItem: BillItem = {
              id: Date.now().toString() + '-' + labOrder.id,
              serviceId: labTestPrice.id,
              serviceName: labTestPrice.serviceName,
              category: labTestPrice.category,
              unitPrice: labTestPrice.price,
              quantity: 1,
              totalPrice: labTestPrice.price
            };
            newBill.items.push(billItem);
          }
        });
      }
    }

    // Calculate totals
    newBill.subtotal = newBill.items.reduce((sum, item) => sum + item.totalPrice, 0);
    newBill.tax = 0; // No tax applied
    newBill.total = newBill.subtotal - newBill.discount;

    // Add the new bill to the bills array
    setBills(prev => [...prev, newBill]);
  };

  const autoGenerateBills = async () => {
    // Check all patients for unbilled services
    patients.forEach(patient => {
      // Check for unbilled appointments
      const unbilledAppointments = appointments.filter(a => 
        a && a.patientId === patient.id && 
        a.status === 'completed' &&
        !bills.some(bill => bill.items.some(item => item.serviceId === a.id)) &&
        autobillingConfig.autoGenerateForAppointments
      );
      
      // Check for unbilled medical records
      const unbilledRecords = medicalRecords.filter(r => 
        r && r.patientId === patient.id && 
        !bills.some(bill => bill.items.some(item => item.serviceId === r.id)) &&
        autobillingConfig.autoGenerateForMedicalRecords
      );
      
      // Generate bills for unbilled appointments
      unbilledAppointments.forEach(appointment => {
        generateBill(patient.id, appointment.id);
      });
      
      // Generate bills for unbilled records
      unbilledRecords.forEach(record => {
        generateBill(patient.id, undefined, record.id);
      });
    });
  };

  // Add referrals functions
  const addReferral = async (referralData: Omit<Referral, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newReferral = await service.createReferral(referralData);
      setReferrals(prev => [...prev, newReferral]);
      
      // Create notification for the referring doctor
      const patient = findPatientSafely(patients, referralData.patientId);
      if (patient) {
        addNotification({
          userIds: [referralData.referringDoctorId],
          type: 'general',
          title: 'Referral Created',
          message: `Referral for ${patient.firstName} ${patient.lastName} to ${referralData.specialist} has been created`,
          isRead: false
        });
      }
    } catch (err) {
      console.error('Error creating referral:', err);
      setError('Failed to create referral');
      throw err;
    }
  };

  const updateReferralStatus = async (id: string, status: Referral['status']) => {
    try {
      const updatedReferral = await service.updateReferralStatus(id, status);
      setReferrals(prev => prev.map(referral =>
        referral.id === id 
          ? { 
              ...referral, 
              status,
              updatedAt: new Date().toISOString()
            }
          : referral
      ));
      
      // Create notification for status update
      const referral = referrals.find(r => r.id === id);
      if (referral) {
        const patient = findPatientSafely(patients, referral.patientId);
        if (patient) {
          addNotification({
            userIds: [referral.referringDoctorId],
            type: 'general',
            title: `Referral ${status}`,
            message: `Referral for ${patient.firstName} ${patient.lastName} has been ${status}`,
            isRead: false
          });
        }
      }
    } catch (err) {
      console.error('Error updating referral status:', err);
      setError('Failed to update referral status');
      throw err;
    }
  };

  // User management functions
  const addUser = async (userData: Omit<User, 'id'>) => {
    try {
      const newUser = await service.createUser(userData);
      setUsers(prev => [...prev, newUser]);
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Failed to create user');
      throw err;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const updatedUser = await service.updateUser(id, updates);
      setUsers(prev => prev.map(user => 
        user.id === id ? updatedUser : user
      ));
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
      throw err;
    }
  };

  const removeUser = async (id: string) => {
    try {
      await service.deleteUser(id);
      setUsers(prev => prev.filter(user => user && user.id !== id));
    } catch (err) {
      console.error('Error removing user:', err);
      setError('Failed to remove user');
      throw err;
    }
  };

  const addAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
    try {
      console.log('Creating appointment with data:', appointmentData);
      
      const newAppointment = await service.createAppointment(appointmentData);
      console.log('Appointment created successfully:', newAppointment);
      
      if (!newAppointment) {
        throw new Error('Failed to create appointment - no data returned from server');
      }
      
      setAppointments(prev => [...prev, newAppointment]);

      // For doctors/specialists, refresh patient data to include the new patient
      if (user && (user.role === 'doctor' || user.role === 'ophthalmologist' || user.role === 'radiologist' || user.role === 'physical-therapist')) {
        try {
          const updatedPatients = await service.getPatientsByDoctor(user.id);
          setPatients(updatedPatients);
          console.log('👨‍⚕️ Refreshed patient data for doctor after new appointment');
        } catch (err) {
          console.error('Error refreshing patient data for doctor:', err);
        }
      }

      // Automatically generate bill if autobilling is enabled for appointments
      if (autobillingConfig.enabled && autobillingConfig.autoGenerateForAppointments) {
        // Delay slightly to ensure all data is saved
        setTimeout(() => {
          generateBill(appointmentData.patientId, newAppointment.id);
        }, 100);
      }
      
      return newAppointment;
    } catch (err) {
      console.error('Error creating appointment:', err);
      addError({
        type: 'error',
        title: 'Failed to Create Appointment',
        message: 'Unable to create new appointment',
        details: err instanceof Error ? err.message : String(err),
        component: 'HospitalContext',
        action: 'addAppointment',
        userAction: 'Create new appointment',
        metadata: { appointmentData, error: err }
      });
      setError('Failed to create appointment');
      throw err;
    }
  };

  // Add this new function to update appointment status
  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    try {
      console.log('🔄 Updating appointment status:', { id, status });
      const updatedAppointment = await service.updateAppointmentStatus(id, status);
      console.log('✅ Appointment status updated successfully:', updatedAppointment);
      
      setAppointments(prev => prev.map(appointment =>
        appointment.id === id ? updatedAppointment : appointment
      ));

      // Create notification for receptionist when doctor updates appointment status
      if (status === 'completed' || status === 'in-progress' || status === 'cancelled') {
        const appointment = appointments.find(a => a.id === id);
        if (appointment) {
          const patient = findPatientSafely(patients, appointment.patientId);
          const doctor = users.find(u => u.id === appointment.doctorId);
          
          if (patient && doctor) {
            let message = '';
            let title = '';
            switch (status) {
              case 'in-progress':
                title = 'Appointment In Progress';
                message = `Appointment with ${patient.firstName} ${patient.lastName} is now in progress`;
                break;
              case 'completed':
                title = 'Appointment Completed';
                message = `Appointment with ${patient.firstName} ${patient.lastName} has been completed`;
                break;
              case 'cancelled':
                title = 'Appointment Cancelled';
                message = `Appointment with ${patient.firstName} ${patient.lastName} has been cancelled`;
                break;
            }

            // Notify all receptionists
            const receptionists = users.filter(u => u.role === 'receptionist').map(u => u.id);
            console.log('📢 Notifying receptionists:', { receptionists, title, message });
            if (receptionists.length > 0) {
              addNotification({
                userIds: receptionists,
                type: 'appointment',
                title,
                message,
                isRead: false
              });
              console.log('✅ Notification sent to receptionists');
            } else {
              console.log('⚠️ No receptionists found to notify');
            }
          }
        }
      }
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setError('Failed to update appointment status');
      throw err;
    }
  };

  const updateBillStatus = async (id: string, status: Bill['status'], paymentMethod?: Bill['paymentMethod']) => {
    try {
      const updatedBill = await service.updateBillStatus(id, status, paymentMethod);
      setBills(prev => prev.map(bill =>
        bill.id === id 
          ? { 
              ...bill, 
              status,
              paymentMethod,
              paidAt: status === 'paid' ? new Date().toISOString() : bill.paidAt
            }
          : bill
      ));
    } catch (err) {
      console.error('Error updating bill status:', err);
      setError('Failed to update bill status');
      throw err;
    }
  };

  const addBillItem = async (billId: string, item: Omit<BillItem, 'id'>) => {
    try {
      setBills(prev => prev.map(bill => {
        if (bill.id === billId) {
          const newItem: BillItem = {
            ...item,
            id: Date.now().toString()
          };
          const updatedItems = [...bill.items, newItem];
          
          // Recalculate totals (no tax)
          const subtotal = updatedItems.reduce((sum, i) => sum + i.totalPrice, 0);
          const tax = 0;
          const total = subtotal - bill.discount;
          
          return {
            ...bill,
            items: updatedItems,
            subtotal,
            tax,
            total
          };
        }
        return bill;
      }));
    } catch (err) {
      console.error('Error adding bill item:', err);
      setError('Failed to add bill item');
      throw err;
    }
  };

  // Insurance claim functions
  const submitInsuranceClaim = async (claimData: Omit<InsuranceClaim, 'id' | 'submissionDate' | 'status'>) => {
    try {
      const newClaim = await service.createInsuranceClaim(claimData);
      setInsuranceClaims(prev => [...prev, newClaim]);
      
      // Create notification for billing
      addNotification({
        userIds: ['1'], // This should be the receptionist or billing user ID
        type: 'billing',
        title: 'Insurance Claim Submitted',
        message: `Insurance claim for patient ${getPatientDisplayName(patients, claimData.patientId)} has been submitted to ${claimData.insuranceProvider}`,
        isRead: false
      });
    } catch (err) {
      console.error('Error submitting insurance claim:', err);
      setError('Failed to submit insurance claim');
      throw err;
    }
  };

  const updateInsuranceClaimStatus = async (id: string, status: InsuranceClaim['status'], rejectionReason?: string) => {
    try {
      const updatedClaim = await service.updateInsuranceClaimStatus(id, status, rejectionReason);
      setInsuranceClaims(prev => prev.map(claim =>
        claim.id === id 
          ? { 
              ...claim, 
              status,
              approvalDate: status === 'approved' ? new Date().toISOString() : claim.approvalDate,
              rejectionReason: status === 'rejected' ? rejectionReason : claim.rejectionReason
            }
          : claim
      ));
      
      // Create notification for status update
      const claim = insuranceClaims.find(c => c.id === id);
      if (claim) {
        const patient = findPatientSafely(patients, claim.patientId);
        if (patient) {
          addNotification({
            userIds: ['1'], // This should be the receptionist or billing user ID
            type: 'billing',
            title: `Insurance Claim ${status}`,
            message: `Insurance claim for ${patient.firstName} ${patient.lastName} has been ${status}`,
            isRead: false
          });
        }
      }
    } catch (err) {
      console.error('Error updating insurance claim status:', err);
      setError('Failed to update insurance claim status');
      throw err;
    }
  };

  // OT Coordinator functions
  const addSurgeryRequest = async (requestData: Omit<SurgeryRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newRequest = await service.createSurgeryRequest(requestData);
      setSurgeryRequests(prev => [...prev, newRequest]);
      
      // Create notification for OT Coordinator
      addNotification({
        userIds: ['10'], // OT Coordinator ID
        type: 'general',
        title: 'New Surgery Request',
        message: `New surgery request for ${getPatientDisplayName(patients, requestData.patientId)}`,
        isRead: false
      });
    } catch (err) {
      console.error('Error creating surgery request:', err);
      setError('Failed to create surgery request');
      throw err;
    }
  };

  const updateSurgeryRequest = async (id: string, updates: Partial<SurgeryRequest>) => {
    try {
      const updatedRequest = await service.updateSurgeryRequest(id, updates);
      setSurgeryRequests(prev => prev.map(request =>
        request.id === id 
          ? updatedRequest
          : request
      ));
      
      // Create notification for relevant parties
      const request = surgeryRequests.find(r => r.id === id);
      if (request && updates.status) {
        const patient = findPatientSafely(patients, request.patientId);
        if (patient) {
          let message = '';
          let title = '';
          switch (updates.status) {
            case 'reviewed':
              title = 'Surgery Request Reviewed';
              message = `Surgery request for ${patient.firstName} ${patient.lastName} has been reviewed`;
              break;
            case 'scheduled':
              title = 'Surgery Scheduled';
              message = `Surgery for ${patient.firstName} ${patient.lastName} has been scheduled`;
              break;
            case 'completed':
              title = 'Surgery Completed';
              message = `Surgery for ${patient.firstName} ${patient.lastName} has been completed`;
              break;
            case 'cancelled':
              title = 'Surgery Cancelled';
              message = `Surgery for ${patient.firstName} ${patient.lastName} has been cancelled`;
              break;
            case 'postponed':
              title = 'Surgery Postponed';
              message = `Surgery for ${patient.firstName} ${patient.lastName} has been postponed`;
              break;
          }
          
          // Notify requesting doctor and OT Coordinator
          addNotification({
            userIds: [request.requestingDoctorId, '10'],
            type: 'general',
            title,
            message,
            isRead: false
          });
        }
      }
    } catch (err) {
      console.error('Error updating surgery request:', err);
      setError('Failed to update surgery request');
      throw err;
    }
  };

  const addOTSlot = async (slotData: Omit<OTSlot, 'id'>) => {
    try {
      const newSlot = await service.createOTSlot(slotData);
      setOTSlots(prev => [...prev, newSlot]);
    } catch (err) {
      console.error('Error creating OT slot:', err);
      setError('Failed to create OT slot');
      throw err;
    }
  };

  const updateOTSlot = async (id: string, updates: Partial<OTSlot>) => {
    try {
      const updatedSlot = await service.updateOTSlot(id, updates);
      setOTSlots(prev => prev.map(slot =>
        slot.id === id ? updatedSlot : slot
      ));
    } catch (err) {
      console.error('Error updating OT slot:', err);
      setError('Failed to update OT slot');
      throw err;
    }
  };

  const addOTResource = async (resourceData: Omit<OTResource, 'id'>) => {
    try {
      const newResource = await service.createOTResource(resourceData);
      setOTResources(prev => [...prev, newResource]);
    } catch (err) {
      console.error('Error creating OT resource:', err);
      setError('Failed to create OT resource');
      throw err;
    }
  };

  const updateOTResource = async (id: string, updates: Partial<OTResource>) => {
    try {
      const updatedResource = await service.updateOTResource(id, updates);
      setOTResources(prev => prev.map(resource =>
        resource.id === id ? updatedResource : resource
      ));
    } catch (err) {
      console.error('Error updating OT resource:', err);
      setError('Failed to update OT resource');
      throw err;
    }
  };

  const addOTChecklist = async (checklistData: Omit<OTChecklist, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newChecklist = await service.createOTChecklist(checklistData);
      setOTChecklists(prev => [...prev, newChecklist]);
    } catch (err) {
      console.error('Error creating OT checklist:', err);
      setError('Failed to create OT checklist');
      throw err;
    }
  };

  const updateOTChecklist = async (id: string, updates: Partial<OTChecklist>) => {
    try {
      const updatedChecklist = await service.updateOTChecklist(id, updates);
      setOTChecklists(prev => prev.map(checklist =>
        checklist.id === id 
          ? updatedChecklist
          : checklist
      ));
    } catch (err) {
      console.error('Error updating OT checklist:', err);
      setError('Failed to update OT checklist');
      throw err;
    }
  };

  const addSurgeryProgress = async (progressData: Omit<SurgeryProgress, 'id' | 'timestamp'>) => {
    try {
      const newProgress = await service.createSurgeryProgress(progressData);
      setSurgeryProgress(prev => [...prev, newProgress]);
    } catch (err) {
      console.error('Error creating surgery progress:', err);
      setError('Failed to create surgery progress');
      throw err;
    }
  };

  const addOTReport = async (reportData: Omit<OTReport, 'id' | 'createdAt'>) => {
    try {
      const newReport = await service.createOTReport(reportData);
      setOTReports(prev => [...prev, newReport]);
    } catch (err) {
      console.error('Error creating OT report:', err);
      setError('Failed to create OT report');
      throw err;
    }
  };

  // ---------- Price lookup helpers (fuzzy matching) ----------
  function normalizeName(value: string): string {
    return (value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ') // keep alnum, collapse others to space
      .replace(/\s+/g, ' ') // collapse spaces
      .trim();
  }

  function scoreMatch(a: string, b: string): number {
    if (!a || !b) return 0;
    if (a === b) return 100; // exact
    if (a.includes(b) || b.includes(a)) return 80; // substring
    // token overlap
    const ta = new Set(a.split(' '));
    const tb = new Set(b.split(' '));
    let overlap = 0;
    ta.forEach(t => { if (tb.has(t)) overlap++; });
    if (overlap > 0) return 60 + Math.min(20, overlap * 5); // small boost per overlap
    return 0;
  }

  function findBestPriceByName(name: string, category?: ServicePrice['category']): ServicePrice | undefined {
    const normName = normalizeName(name);
    const candidates = category ? servicePrices.filter(sp => sp && sp.category === category) : servicePrices;
    let best: { item: ServicePrice; score: number } | null = null;
    for (const sp of candidates) {
      const score = scoreMatch(normalizeName(sp.serviceName), normName);
      if (!best || score > best.score) {
        best = { item: sp, score };
      }
    }
    return best && best.score >= 60 ? best.item : undefined; // require reasonable similarity
  }

  return (
    <HospitalContext.Provider value={{
      patients,
      medicalRecords,
      prescriptions,
      labOrders,
      appointments,
      notifications,
      servicePrices,
      bills,
      departments,
      referrals,
      users,
      autobillingConfig,
      insuranceClaims,
      surgeryRequests,
      otSlots,
      otResources,
      otChecklists,
      surgeryProgress,
      otReports,
      inventoryItems,
      medicationInventory,
      addPatient,
      updatePatient,
      addMedicalRecord,
      updatePrescriptionStatus,
      updateLabOrderStatus,
      addNotification,
      getUserNotifications,
      isNotificationRead,
      markNotificationRead,
      generateBill,
      updateBillStatus,
      addBillItem,
      autoGenerateBills,
      updateAutobillingConfig,
      addReferral,
      updateReferralStatus,
      addUser,
      updateUser,
      removeUser,
      addAppointment,
      updateAppointmentStatus,
      submitInsuranceClaim,
      updateInsuranceClaimStatus,
      addSurgeryRequest,
      updateSurgeryRequest,
      addOTSlot,
      updateOTSlot,
      addOTResource,
      updateOTResource,
      addOTChecklist,
      updateOTChecklist,
      addSurgeryProgress,
      addOTReport,
      loading,
      error
    }}>
      {children}
    </HospitalContext.Provider>
  );
}

export function useHospital() {
  const context = useContext(HospitalContext);
  if (context === undefined) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
}