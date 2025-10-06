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
  users: User[]; // Add users to the context type
  autobillingConfig: AutobillingConfig; // Add autobilling config to the context type
  insuranceClaims: InsuranceClaim[]; // Add insurance claims to the context type
  surgeryRequests: SurgeryRequest[];
  otSlots: OTSlot[];
  otResources: OTResource[];
  otChecklists: OTChecklist[];
  surgeryProgress: SurgeryProgress[];
  otReports: OTReport[];
  addPatient: (patient: Omit<Patient, 'id' | 'mrn' | 'createdAt' | 'updatedAt'>) => void;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  addMedicalRecord: (record: Omit<MedicalRecord, 'id'>) => void;
  updatePrescriptionStatus: (id: string, status: Prescription['status']) => void;
  updateLabOrderStatus: (id: string, status: LabOrder['status'], results?: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  getUserNotifications: (userId: string, userDepartment?: string) => Notification[];
  isNotificationRead: (notification: Notification, userId: string) => boolean;
  markNotificationRead: (id: string, userId: string) => void;
  generateBill: (patientId: string, appointmentId?: string, recordId?: string) => void;
  updateBillStatus: (id: string, status: Bill['status'], paymentMethod?: string) => void;
  addBillItem: (billId: string, item: Omit<BillItem, 'id'>) => void;
  // New autobilling functions
  autoGenerateBills: () => void;
  updateAutobillingConfig: (config: Partial<AutobillingConfig>) => void; // Add function to update config
  addReferral: (referral: Omit<Referral, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReferralStatus: (id: string, status: Referral['status']) => void;
  addUser: (user: Omit<User, 'id'>) => void; // Add user management functions
  updateUser: (id: string, user: Partial<User>) => void;
  removeUser: (id: string) => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void; // Add this line
  // Insurance claim functions
  submitInsuranceClaim: (claimData: Omit<InsuranceClaim, 'id' | 'submissionDate' | 'status'>) => void;
  updateInsuranceClaimStatus: (id: string, status: InsuranceClaim['status'], rejectionReason?: string) => void;
  // OT Coordinator functions
  addSurgeryRequest: (request: Omit<SurgeryRequest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSurgeryRequest: (id: string, updates: Partial<SurgeryRequest>) => void;
  addOTSlot: (slot: Omit<OTSlot, 'id'>) => void;
  updateOTSlot: (id: string, updates: Partial<OTSlot>) => void;
  addOTResource: (resource: Omit<OTResource, 'id'>) => void;
  updateOTResource: (id: string, updates: Partial<OTResource>) => void;
  addOTChecklist: (checklist: Omit<OTChecklist, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOTChecklist: (id: string, updates: Partial<OTChecklist>) => void;
  addSurgeryProgress: (progress: Omit<SurgeryProgress, 'id' | 'timestamp'>) => void;
  addOTReport: (report: Omit<OTReport, 'id' | 'createdAt'>) => void;
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
  const [users, setUsers] = useState<User[]>([]); // Add users state
  const [autobillingConfig, setAutobillingConfig] = useState<AutobillingConfig>({
    enabled: true,
    autoGenerateForAppointments: true,
    autoGenerateForMedicalRecords: true,
    autoGenerateForPrescriptions: true,
    autoGenerateForLabOrders: true,
    defaultPaymentMethod: 'cash'
  });
  const [insuranceClaims, setInsuranceClaims] = useState<InsuranceClaim[]>([]); // Add insurance claims state
  const [surgeryRequests, setSurgeryRequests] = useState<SurgeryRequest[]>([]);
  const [otSlots, setOTSlots] = useState<OTSlot[]>([]);
  const [otResources, setOTResources] = useState<OTResource[]>([]);
  const [otChecklists, setOTChecklists] = useState<OTChecklist[]>([]);
  const [surgeryProgress, setSurgeryProgress] = useState<SurgeryProgress[]>([]);
  const [otReports, setOTReports] = useState<OTReport[]>([]);

  useEffect(() => {
    // Initialize with mock data

    // Mock Patients with updated insurance info
    const mockPatients: Patient[] = [
      {
        id: '1',
        mrn: 'ALFA-2024-00001',
        firstName: 'John',
        lastName: 'Mwalimu',
        dateOfBirth: '1985-03-15',
        gender: 'male',
        phone: '+255-754-123456',
        address: 'Msimbazi Street, Kariakoo, Dar es Salaam',
        emergencyContact: {
          name: 'Amina Mwalimu',
          phone: '+255-754-123457',
          relationship: 'Mke (Spouse)'
        },
        insuranceInfo: {
          provider: 'NHIF',
          membershipNumber: 'NHIF-123456789'
        },
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        mrn: 'ALFA-2024-00002',
        firstName: 'Fatuma',
        lastName: 'Hassan',
        dateOfBirth: '1992-08-22',
        gender: 'female',
        phone: '+255-713-987654',
        address: 'Mwenge, Kinondoni, Dar es Salaam',
        emergencyContact: {
          name: 'Ali Hassan',
          phone: '+255-713-987655',
          relationship: 'Baba (Father)'
        },
        insuranceInfo: {
          provider: 'Strategis Insurance',
          membershipNumber: 'STR-987654321'
        },
        createdAt: '2024-01-10T14:20:00Z',
        updatedAt: '2024-01-10T14:20:00Z'
      }
    ];

    const mockAppointments: Appointment[] = [
      {
        id: '1',
        patientId: '1',
        doctorId: '2',
        dateTime: '2024-01-25T09:00:00Z',
        duration: 30,
        type: 'consultation',
        status: 'scheduled',
        notes: 'Uchunguzi wa kawaida (Routine checkup)'
      },
      {
        id: '2',
        patientId: '2',
        doctorId: '2',
        dateTime: '2024-01-25T10:30:00Z',
        duration: 45,
        type: 'follow-up',
        status: 'scheduled',
        notes: 'Ufuatiliaji wa damu ya juu (High blood pressure follow-up)'
      }
    ];

    // Tanzania Service Prices in TZS - Updated with 998 services
    const mockServicePrices: ServicePrice[] = [
      // ... existing service prices ...
    ]

    // Mock Departments
    const mockDepartments: Department[] = [
      { id: '1', name: 'Mapokezi (Reception)', description: 'Reception and patient registration', doctors: [] },
      { id: '2', name: 'Matibabu ya Ndani (Internal Medicine)', description: 'General medicine department', doctors: ['2'] },
      { id: '3', name: 'Maabara (Laboratory)', description: 'Laboratory services', doctors: [] },
      { id: '4', name: 'Famasi (Pharmacy)', description: 'Pharmacy services', doctors: [] },
      { id: '5', name: 'Dharura (Emergency)', description: 'Emergency services', doctors: [] },
      { id: '6', name: 'Macho (Ophthalmology)', description: 'Eye care and surgery department', doctors: ['6', '8'] },
      { id: '7', name: 'Radiology', description: 'Radiology and imaging services', doctors: ['5', '7'] },
      { id: '8', name: 'Operating Theatre', description: 'Surgical services', doctors: [] }
    ];

    // Mock Notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        userIds: ['2'], // Doctor
        type: 'appointment',
        title: 'New Appointment Scheduled',
        message: 'Appointment with John Mwalimu on 25/1/2024',
        isRead: false,
        createdAt: '2024-01-24T10:00:00Z'
      },
      {
        id: '2',
        userIds: ['1'], // Receptionist
        type: 'billing',
        title: 'New Bill Generated',
        message: 'Bill for Fatuma Hassan has been generated',
        isRead: false,
        createdAt: '2024-01-24T11:00:00Z'
      },
      {
        id: '3',
        userIds: ['4'], // Pharmacy
        type: 'prescription',
        title: 'New Prescription Order',
        message: '1 prescription(s) for John Mwalimu',
        isRead: true,
        createdAt: '2024-01-24T09:00:00Z'
      }
    ];

    // Mock Referrals
    const mockReferrals: Referral[] = [
      {
        id: '1',
        patientId: '1',
        referringDoctorId: '2',
        specialist: 'Cardiologist',
        reason: 'Chest pain and irregular heartbeat',
        status: 'pending',
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z'
      },
      {
        id: '2',
        patientId: '2',
        referringDoctorId: '2',
        specialist: 'Endocrinologist',
        reason: 'Poorly controlled diabetes',
        status: 'accepted',
        createdAt: '2024-01-18T14:30:00Z',
        updatedAt: '2024-01-19T09:15:00Z'
      }
    ];

    // Mock Users (from AuthContext)
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Amina Mwalimu',
        email: 'amina@alfaspecialized.co.tz',
        role: 'receptionist',
        department: 'Mapokezi (Reception)'
      },
      {
        id: '2',
        name: 'Dkt. Hassan Mbwana',
        email: 'hassan@alfaspecialized.co.tz',
        role: 'doctor',
        department: 'Matibabu ya Ndani (Internal Medicine)'
      },
      {
        id: '3',
        name: 'Grace Kimaro',
        email: 'grace@alfaspecialized.co.tz',
        role: 'lab',
        department: 'Maabara (Laboratory)'
      },
      {
        id: '4',
        name: 'Mohamed Ally',
        email: 'mohamed@alfaspecialized.co.tz',
        role: 'pharmacy',
        department: 'Famasi (Pharmacy)'
      },
      {
        id: '5',
        name: 'Dr. Sarah Johnson',
        email: 'sarah@alfaspecialized.co.tz',
        role: 'radiologist',
        department: 'Radiology'
      },
      {
        id: '6',
        name: 'Dr. James Mwangi',
        email: 'james@alfaspecialized.co.tz',
        role: 'ophthalmologist',
        department: 'Macho (Ophthalmology)'
      },
      {
        id: '7',
        name: 'Dr. Michael Chen',
        email: 'michael@alfaspecialized.co.tz',
        role: 'radiologist',
        department: 'Radiology'
      },
      {
        id: '8',
        name: 'Dr. Sarah Kimani',
        email: 'sarah.k@alfaspecialized.co.tz',
        role: 'ophthalmologist',
        department: 'Macho (Ophthalmology)'
      },
      {
        id: '9',
        name: 'System Administrator',
        email: 'admin@alfaspecialized.co.tz',
        role: 'admin',
        department: 'Administration'
      },
      {
        id: '10',
        name: 'OT Coordinator',
        email: 'ot-coordinator@alfaspecialized.co.tz',
        role: 'ot-coordinator',
        department: 'Operating Theatre'
      }
    ];

    // Mock Bills
    const mockBills: Bill[] = [
      {
        id: '1',
        patientId: '1',
        items: [
          {
            id: '1-1',
            serviceId: '1',
            serviceName: 'General Consultation',
            category: 'consultation',
            unitPrice: 25000,
            quantity: 1,
            totalPrice: 25000
          }
        ],
        subtotal: 25000,
        tax: 4500,
        discount: 0,
        total: 29500,
        status: 'pending',
        createdAt: '2024-01-24T10:00:00Z'
      },
      {
        id: '2',
        patientId: '2',
        items: [
          {
            id: '2-1',
            serviceId: '4',
            serviceName: 'Complete Blood Count (CBC)',
            category: 'lab-test',
            unitPrice: 15000,
            quantity: 1,
            totalPrice: 15000
          }
        ],
        subtotal: 15000,
        tax: 2700,
        discount: 0,
        total: 17700,
        status: 'paid',
        paymentMethod: 'cash',
        createdAt: '2024-01-23T14:30:00Z',
        paidAt: '2024-01-23T15:00:00Z'
      }
    ];

    // Mock Insurance Claims
    const mockInsuranceClaims: InsuranceClaim[] = [
      {
        id: '1',
        billId: '1',
        patientId: '1',
        insuranceProvider: 'NHIF',
        membershipNumber: 'NHIF-123456789',
        claimAmount: 29500,
        claimedAmount: 29500,
        status: 'submitted',
        submissionDate: '2024-01-24T11:00:00Z',
        nhifClaimNumber: 'NHIF-2024-001'
      },
      {
        id: '2',
        billId: '2',
        patientId: '2',
        insuranceProvider: 'Strategis Insurance',
        membershipNumber: 'STR-987654321',
        claimAmount: 17700,
        claimedAmount: 15000,
        status: 'approved',
        submissionDate: '2024-01-23T15:30:00Z',
        approvalDate: '2024-01-25T09:00:00Z',
        nhifClaimNumber: 'NHIF-2024-002'
      }
    ];

    // Mock Surgery Requests
    const mockSurgeryRequests: SurgeryRequest[] = [
      {
        id: '1',
        patientId: '1',
        requestingDoctorId: '2',
        surgeryType: 'Appendectomy',
        urgency: 'routine',
        requestedDate: '2024-01-25T10:00:00Z',
        status: 'pending',
        diagnosis: 'Acute appendicitis',
        notes: 'Patient presents with classic symptoms',
        createdAt: '2024-01-24T10:00:00Z',
        updatedAt: '2024-01-24T10:00:00Z'
      }
    ];

    // Mock OT Slots
    const mockOTSlots: OTSlot[] = [
      {
        id: '1',
        date: '2024-01-25',
        startTime: '09:00',
        endTime: '11:00',
        otRoomId: 'ot1',
        status: 'available'
      },
      {
        id: '2',
        date: '2024-01-25',
        startTime: '11:30',
        endTime: '13:30',
        otRoomId: 'ot1',
        status: 'available'
      }
    ];

    // Mock OT Resources
    const mockOTResources: OTResource[] = [
      {
        id: 'ot1',
        type: 'ot-room',
        name: 'Theatre 1',
        availability: {
          '2024-01-25': [
            { startTime: '09:00', endTime: '11:00', status: 'available' },
            { startTime: '11:30', endTime: '13:30', status: 'busy' }
          ]
        }
      },
      {
        id: 'ot2',
        type: 'ot-room',
        name: 'Theatre 2',
        availability: {
          '2024-01-25': [
            { startTime: '09:00', endTime: '11:00', status: 'unavailable' },
            { startTime: '11:30', endTime: '13:30', status: 'available' }
          ]
        }
      },
      {
        id: 'dr1',
        type: 'surgeon',
        name: 'Dr. Hassan Mbwana',
        specialty: 'General Surgery',
        availability: {
          '2024-01-25': [
            { startTime: '09:00', endTime: '12:00', status: 'available' },
            { startTime: '13:00', endTime: '17:00', status: 'unavailable' }
          ]
        }
      }
    ];

    setPatients(mockPatients);
    setAppointments(mockAppointments);
    setServicePrices(mockServicePrices);
    setDepartments(mockDepartments);
    setNotifications(mockNotifications);
    setReferrals(mockReferrals);
    setUsers(mockUsers);
    setBills(mockBills);
    setInsuranceClaims(mockInsuranceClaims);
    setSurgeryRequests(mockSurgeryRequests);
    setOTSlots(mockOTSlots);
    setOTResources(mockOTResources);
  }, []);

  const addPatient = (patientData: Omit<Patient, 'id' | 'mrn' | 'createdAt' | 'updatedAt'>) => {
    // Generate MRN: ALFA-YYYY-XXXXX (where XXXXX is a 5-digit sequential number)
    const currentYear = new Date().getFullYear();
    const patientCount = patients.length + 1;
    const mrn = `ALFA-${currentYear}-${String(patientCount).padStart(5, '0')}`;
    
    const newPatient: Patient = {
      ...patientData,
      id: Date.now().toString(),
      mrn,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setPatients(prev => [...prev, newPatient]);
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients(prev => prev.map(patient => 
      patient.id === id 
        ? { ...patient, ...updates, updatedAt: new Date().toISOString() }
        : patient
    ));
  };

  const addMedicalRecord = (recordData: Omit<MedicalRecord, 'id'>) => {
    const newRecord: MedicalRecord = {
      ...recordData,
      id: Date.now().toString()
    };
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
  };

  const updatePrescriptionStatus = (id: string, status: Prescription['status']) => {
    setPrescriptions(prev => prev.map(prescription =>
      prescription.id === id ? { ...prescription, status } : prescription
    ));

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
  };

  const updateLabOrderStatus = (id: string, status: LabOrder['status'], results?: string) => {
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
        const patient = patients.find(p => p.id === labOrder.patientId);
        addNotification({
          userIds: [labOrder.doctorId],
          type: 'lab-order',
          title: 'Lab Results Ready',
          message: `${labOrder.testName} results for ${patient?.firstName} ${patient?.lastName} are now available`,
          isRead: false
        });
      }
    }
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isRead: false // Initialize as unread for all users
    };
    setNotifications(prev => [newNotification, ...prev]);
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
    return notification.isRead[userId] ?? false;
  };

  // New function to mark notification as read for a specific user
  const markNotificationRead = (id: string, userId: string) => {
    setNotifications(prev => prev.map(notification => {
      if (notification.id === id) {
        // Track read status per user
        const isRead = typeof notification.isRead === 'boolean' 
          ? { [userId]: true } 
          : { ...notification.isRead, [userId]: true };
          
        return { ...notification, isRead };
      }
      return notification;
    }));
  };

  // Add function to update autobilling configuration
  const updateAutobillingConfig = (config: Partial<AutobillingConfig>) => {
    setAutobillingConfig(prev => ({ ...prev, ...config }));
  };

  // Enhanced generateBill function that uses the autobilling configuration
  const generateBill = (patientId: string, appointmentId?: string, recordId?: string) => {
    // Check if autobilling is enabled
    if (!autobillingConfig.enabled) {
      return;
    }

    // Find the patient
    const patient = patients.find(p => p.id === patientId);
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

    // Add consultation fee if there's an appointment
    if (appointmentId && autobillingConfig.autoGenerateForAppointments) {
      const appointment = appointments.find(a => a.id === appointmentId);
      if (appointment) {
        const consultationPrice = servicePrices.find(s => s.category === 'consultation' && s.serviceName.includes('Consultation'));
        if (consultationPrice) {
          newBill.items.push({
            id: Date.now().toString() + '-1',
            serviceId: consultationPrice.id,
            serviceName: consultationPrice.serviceName,
            category: consultationPrice.category,
            unitPrice: consultationPrice.price,
            quantity: 1,
            totalPrice: consultationPrice.price
          });
        }
      }
    }

    // Add services from medical record if provided
    if (recordId && autobillingConfig.autoGenerateForMedicalRecords) {
      const record = medicalRecords.find(r => r.id === recordId);
      if (record) {
        // Add medications if enabled
        if (autobillingConfig.autoGenerateForPrescriptions) {
          record.prescriptions.forEach(prescription => {
            const medicationPrice = servicePrices.find(s => s.category === 'medication' && s.serviceName.includes(prescription.medication));
            if (medicationPrice) {
              newBill.items.push({
                id: Date.now().toString() + '-' + prescription.id,
                serviceId: medicationPrice.id,
                serviceName: medicationPrice.serviceName,
                category: medicationPrice.category,
                unitPrice: medicationPrice.price,
                quantity: 1, // In a real app, this would be based on dosage/duration
                totalPrice: medicationPrice.price
              });
            }
          });
        }

        // Add lab tests if enabled
        if (autobillingConfig.autoGenerateForLabOrders) {
          record.labOrders.forEach(labOrder => {
            const labTestPrice = servicePrices.find(s => s.category === 'lab-test' && s.serviceName.includes(labOrder.testName));
            if (labTestPrice) {
              newBill.items.push({
                id: Date.now().toString() + '-' + labOrder.id,
                serviceId: labTestPrice.id,
                serviceName: labTestPrice.serviceName,
                category: labTestPrice.category,
                unitPrice: labTestPrice.price,
                quantity: 1,
                totalPrice: labTestPrice.price
              });
            }
          });
        }
      }
    }

    // Calculate totals
    newBill.subtotal = newBill.items.reduce((sum, item) => sum + item.totalPrice, 0);
    newBill.tax = 0; // No tax
    newBill.total = newBill.subtotal + newBill.tax - newBill.discount;

    setBills(prev => [...prev, newBill]);
    
    // Create notification for billing
    addNotification({
      userIds: ['1'], // This should be the receptionist or billing user ID
      type: 'billing',
      title: 'New Bill Generated',
      message: `Bill for ${patient.firstName} ${patient.lastName} has been generated`,
      isRead: false
    });
  };

  const updateBillStatus = (id: string, status: Bill['status'], paymentMethod?: string) => {
    setBills(prev => prev.map(bill =>
      bill.id === id 
        ? { 
            ...bill, 
            status,
            paymentMethod: paymentMethod || bill.paymentMethod,
            paidAt: status === 'paid' ? new Date().toISOString() : bill.paidAt
          }
        : bill
    ));
  };

  const addBillItem = (billId: string, itemData: Omit<BillItem, 'id'>) => {
    setBills(prev => prev.map(bill => {
      if (bill.id === billId) {
        const newItem: BillItem = {
          ...itemData,
          id: Date.now().toString()
        };
        const updatedItems = [...bill.items, newItem];
        
        // Recalculate totals
        const subtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const tax = 0; // No tax
        const total = subtotal + tax - bill.discount;
        
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
  };

  // Enhanced autoGenerateBills function that uses the autobilling configuration
  const autoGenerateBills = () => {
    // Check if autobilling is enabled
    if (!autobillingConfig.enabled) {
      return;
    }

    // For each patient with unbilled services, generate a bill
    patients.forEach(patient => {
      // Check for unbilled appointments
      const unbilledAppointments = appointments.filter(a => 
        a.patientId === patient.id && 
        !bills.some(bill => bill.items.some(item => item.serviceId === a.id)) &&
        autobillingConfig.autoGenerateForAppointments
      );
      
      // Check for unbilled medical records
      const unbilledRecords = medicalRecords.filter(r => 
        r.patientId === patient.id && 
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
  const addReferral = (referralData: Omit<Referral, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newReferral: Referral = {
      ...referralData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setReferrals(prev => [...prev, newReferral]);
    
    // Create notification for the referring doctor
    const patient = patients.find(p => p.id === referralData.patientId);
    if (patient) {
      addNotification({
        userIds: [referralData.referringDoctorId],
        type: 'general',
        title: 'Referral Created',
        message: `Referral for ${patient.firstName} ${patient.lastName} to ${referralData.specialist} has been created`,
        isRead: false
      });
    }
  };

  const updateReferralStatus = (id: string, status: Referral['status']) => {
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
      const patient = patients.find(p => p.id === referral.patientId);
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
  };

  // User management functions
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString()
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...updates } : user
    ));
  };

  const removeUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const addAppointment = (appointmentData: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Date.now().toString()
    };
    setAppointments(prev => [...prev, newAppointment]);

    // Automatically generate bill if autobilling is enabled for appointments
    if (autobillingConfig.enabled && autobillingConfig.autoGenerateForAppointments) {
      // Delay slightly to ensure all data is saved
      setTimeout(() => {
        generateBill(appointmentData.patientId, newAppointment.id);
      }, 100);
    }
  };

  // Add this new function to update appointment status
  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(appointment =>
      appointment.id === id ? { ...appointment, status } : appointment
    ));

    // Create notification for receptionist when doctor updates appointment status
    if (status === 'completed' || status === 'in-progress' || status === 'cancelled') {
      const appointment = appointments.find(a => a.id === id);
      if (appointment) {
        const patient = patients.find(p => p.id === appointment.patientId);
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

          // Notify receptionist
          addNotification({
            userIds: ['1'], // Assuming receptionist has ID '1'
            type: 'appointment',
            title,
            message,
            isRead: false
          });
        }
      }
    }
  };

  // Insurance claim functions
  const submitInsuranceClaim = (claimData: Omit<InsuranceClaim, 'id' | 'submissionDate' | 'status'>) => {
    const newClaim: InsuranceClaim = {
      ...claimData,
      id: Date.now().toString(),
      submissionDate: new Date().toISOString(),
      status: 'submitted'
    };
    setInsuranceClaims(prev => [...prev, newClaim]);
    
    // Create notification for billing
    addNotification({
      userIds: ['1'], // This should be the receptionist or billing user ID
      type: 'billing',
      title: 'Insurance Claim Submitted',
      message: `Insurance claim for patient ${patients.find(p => p.id === claimData.patientId)?.firstName} ${patients.find(p => p.id === claimData.patientId)?.lastName} has been submitted to ${claimData.insuranceProvider}`,
      isRead: false
    });
  };

  const updateInsuranceClaimStatus = (id: string, status: InsuranceClaim['status'], rejectionReason?: string) => {
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
      const patient = patients.find(p => p.id === claim.patientId);
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
  };

  // OT Coordinator functions
  const addSurgeryRequest = (requestData: Omit<SurgeryRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRequest: SurgeryRequest = {
      ...requestData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSurgeryRequests(prev => [...prev, newRequest]);
    
    // Create notification for OT Coordinator
    addNotification({
      userIds: ['10'], // OT Coordinator ID
      type: 'general',
      title: 'New Surgery Request',
      message: `New surgery request for ${patients.find(p => p.id === requestData.patientId)?.firstName} ${patients.find(p => p.id === requestData.patientId)?.lastName}`,
      isRead: false
    });
  };

  const updateSurgeryRequest = (id: string, updates: Partial<SurgeryRequest>) => {
    setSurgeryRequests(prev => prev.map(request =>
      request.id === id 
        ? { 
            ...request, 
            ...updates,
            updatedAt: new Date().toISOString()
          }
        : request
    ));
    
    // Create notification for relevant parties
    const request = surgeryRequests.find(r => r.id === id);
    if (request && updates.status) {
      const patient = patients.find(p => p.id === request.patientId);
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
  };

  const addOTSlot = (slotData: Omit<OTSlot, 'id'>) => {
    const newSlot: OTSlot = {
      ...slotData,
      id: Date.now().toString()
    };
    setOTSlots(prev => [...prev, newSlot]);
  };

  const updateOTSlot = (id: string, updates: Partial<OTSlot>) => {
    setOTSlots(prev => prev.map(slot =>
      slot.id === id ? { ...slot, ...updates } : slot
    ));
  };

  const addOTResource = (resourceData: Omit<OTResource, 'id'>) => {
    const newResource: OTResource = {
      ...resourceData,
      id: Date.now().toString()
    };
    setOTResources(prev => [...prev, newResource]);
  };

  const updateOTResource = (id: string, updates: Partial<OTResource>) => {
    setOTResources(prev => prev.map(resource =>
      resource.id === id ? { ...resource, ...updates } : resource
    ));
  };

  const addOTChecklist = (checklistData: Omit<OTChecklist, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newChecklist: OTChecklist = {
      ...checklistData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setOTChecklists(prev => [...prev, newChecklist]);
  };

  const updateOTChecklist = (id: string, updates: Partial<OTChecklist>) => {
    setOTChecklists(prev => prev.map(checklist =>
      checklist.id === id 
        ? { 
            ...checklist, 
            ...updates,
            updatedAt: new Date().toISOString()
          }
        : checklist
    ));
  };

  const addSurgeryProgress = (progressData: Omit<SurgeryProgress, 'id' | 'timestamp'>) => {
    const newProgress: SurgeryProgress = {
      ...progressData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setSurgeryProgress(prev => [...prev, newProgress]);
  };

  const addOTReport = (reportData: Omit<OTReport, 'id' | 'createdAt'>) => {
    const newReport: OTReport = {
      ...reportData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setOTReports(prev => [...prev, newReport]);
  };

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
      users, // Add users to the context value
      autobillingConfig, // Add autobilling config to the context value
      insuranceClaims, // Add insurance claims to the context value
      surgeryRequests,
      otSlots,
      otResources,
      otChecklists,
      surgeryProgress,
      otReports,
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
      updateAutobillingConfig, // Add function to update config
      addReferral,
      updateReferralStatus,
      addUser, // Add user management functions to the context value
      updateUser,
      removeUser,
      addAppointment,
      updateAppointmentStatus, // Add this line
      submitInsuranceClaim, // Add insurance claim functions to the context value
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
      addOTReport
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