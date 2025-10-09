import { supabase } from '../config/supabase.js';

// Type definitions for seed data
interface Patient {
  id: string;
  mrn: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  insurance_provider: string;
  insurance_membership_number: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface Bill {
  id: string;
  patient_id: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
  payment_method?: string;
  paid_at?: string;
}

interface SurgeryRequest {
  id: string;
  patient_id: string;
  requesting_doctor_id: string;
  surgery_type: string;
  urgency: string;
  requested_date: string;
  status: string;
  diagnosis: string;
  notes: string;
}

const seedDb = async () => {
  try {
    console.log('Seeding database with initial data...');

    // Clear existing data
    const tables = [
      'ot_report_surgeries',
      'ot_reports',
      'surgery_progress',
      'ot_checklist_items',
      'ot_checklists',
      'ot_resources',
      'ot_slots',
      'surgery_requests',
      'insurance_claims',
      'referrals',
      'departments',
      'bill_items',
      'bills',
      'notifications',
      'users',
      'appointments',
      'lab_orders',
      'prescriptions',
      'medical_records',
      'patients'
    ];

    // Clear tables in reverse order to avoid foreign key constraints
    for (const table of [...tables].reverse()) {
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
      if (error) {
        console.error(`Error clearing table ${table}:`, error);
      } else {
        console.log(`Cleared table ${table}`);
      }
    }

    // Insert seed data for patients
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .insert([
        {
          mrn: 'ALFA-2024-00001',
          first_name: 'John',
          last_name: 'Mwalimu',
          date_of_birth: '1985-03-15',
          gender: 'male',
          phone: '+255-754-123456',
          address: 'Msimbazi Street, Kariakoo, Dar es Salaam',
          emergency_contact_name: 'Amina Mwalimu',
          emergency_contact_phone: '+255-754-123457',
          emergency_contact_relationship: 'Mke (Spouse)',
          insurance_provider: 'NHIF',
          insurance_membership_number: 'NHIF-123456789'
        },
        {
          mrn: 'ALFA-2024-00002',
          first_name: 'Fatuma',
          last_name: 'Hassan',
          date_of_birth: '1992-08-22',
          gender: 'female',
          phone: '+255-713-987654',
          address: 'Mwenge, Kinondoni, Dar es Salaam',
          emergency_contact_name: 'Ali Hassan',
          emergency_contact_phone: '+255-713-987655',
          emergency_contact_relationship: 'Baba (Father)',
          insurance_provider: 'Strategis Insurance',
          insurance_membership_number: 'STR-987654321'
        }
      ])
      .select();

    if (patientsError) {
      console.error('Error inserting patients:', patientsError);
      process.exit(1);
    }

    console.log('Inserted patients:', patients);

    // Get patient IDs for foreign key references
    const patientIds = patients ? patients.map((p: Patient) => p.id) : [];

    // Insert seed data for users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert([
        {
          name: 'Amina Mwalimu',
          email: 'amina@alfaspecialized.co.tz',
          role: 'receptionist',
          department: 'Mapokezi (Reception)'
        },
        {
          name: 'Dkt. Hassan Mbwana',
          email: 'hassan@alfaspecialized.co.tz',
          role: 'doctor',
          department: 'Matibabu ya Ndani (Internal Medicine)'
        },
        {
          name: 'Grace Kimaro',
          email: 'grace@alfaspecialized.co.tz',
          role: 'lab',
          department: 'Maabara (Laboratory)'
        },
        {
          name: 'Mohamed Ally',
          email: 'mohamed@alfaspecialized.co.tz',
          role: 'pharmacy',
          department: 'Famasi (Pharmacy)'
        },
        {
          name: 'Dr. Sarah Johnson',
          email: 'sarah@alfaspecialized.co.tz',
          role: 'radiologist',
          department: 'Radiology'
        },
        {
          name: 'Dr. James Mwangi',
          email: 'james@alfaspecialized.co.tz',
          role: 'ophthalmologist',
          department: 'Macho (Ophthalmology)'
        },
        {
          name: 'Dr. Michael Chen',
          email: 'michael@alfaspecialized.co.tz',
          role: 'radiologist',
          department: 'Radiology'
        },
        {
          name: 'Dr. Sarah Kimani',
          email: 'sarah.k@alfaspecialized.co.tz',
          role: 'ophthalmologist',
          department: 'Macho (Ophthalmology)'
        },
        {
          name: 'System Administrator',
          email: 'admin@alfaspecialized.co.tz',
          role: 'admin',
          department: 'Administration'
        },
        {
          name: 'OT Coordinator',
          email: 'ot-coordinator@alfaspecialized.co.tz',
          role: 'ot-coordinator',
          department: 'Operating Theatre'
        }
      ])
      .select();

    if (usersError) {
      console.error('Error inserting users:', usersError);
      process.exit(1);
    }

    console.log('Inserted users:', users);

    // Get user IDs for foreign key references
    const userIds = users ? users.map((u: User) => u.id) : [];

    // Insert seed data for appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .insert([
        {
          patient_id: patientIds[0],
          doctor_id: userIds[1],
          date_time: '2024-01-25T09:00:00Z',
          duration: 30,
          type: 'consultation',
          status: 'scheduled',
          notes: 'Uchunguzi wa kawaida (Routine checkup)'
        },
        {
          patient_id: patientIds[1],
          doctor_id: userIds[1],
          date_time: '2024-01-25T10:30:00Z',
          duration: 45,
          type: 'follow-up',
          status: 'scheduled',
          notes: 'Ufuatiliaji wa damu ya juu (High blood pressure follow-up)'
        }
      ])
      .select();

    if (appointmentsError) {
      console.error('Error inserting appointments:', appointmentsError);
      process.exit(1);
    }

    console.log('Inserted appointments:', appointments);

    // Insert seed data for notifications
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .insert([
        {
          user_ids: [userIds[1]], // Doctor
          type: 'appointment',
          title: 'New Appointment Scheduled',
          message: 'Appointment with John Mwalimu on 25/1/2024',
          is_read: false
        },
        {
          user_ids: [userIds[0]], // Receptionist
          type: 'billing',
          title: 'New Bill Generated',
          message: 'Bill for Fatuma Hassan has been generated',
          is_read: false
        },
        {
          user_ids: [userIds[3]], // Pharmacy
          type: 'prescription',
          title: 'New Prescription Order',
          message: '1 prescription(s) for John Mwalimu',
          is_read: true
        }
      ])
      .select();

    if (notificationsError) {
      console.error('Error inserting notifications:', notificationsError);
      process.exit(1);
    }

    console.log('Inserted notifications:', notifications);

    // Insert seed data for bills
    const { data: bills, error: billsError } = await supabase
      .from('bills')
      .insert([
        {
          patient_id: patientIds[0],
          subtotal: 25000,
          tax: 4500,
          discount: 0,
          total: 29500,
          status: 'pending'
        },
        {
          patient_id: patientIds[1],
          subtotal: 15000,
          tax: 2700,
          discount: 0,
          total: 17700,
          status: 'paid',
          payment_method: 'cash',
          paid_at: new Date('2024-01-23T15:00:00Z').toISOString()
        }
      ])
      .select();

    if (billsError) {
      console.error('Error inserting bills:', billsError);
      process.exit(1);
    }

    console.log('Inserted bills:', bills);

    // Get bill IDs for foreign key references
    const billIds = bills ? bills.map((b: Bill) => b.id) : [];

    // Insert seed data for bill items
    const { data: billItems, error: billItemsError } = await supabase
      .from('bill_items')
      .insert([
        {
          bill_id: billIds[0],
          service_id: '1',
          service_name: 'General Consultation',
          category: 'consultation',
          unit_price: 25000,
          quantity: 1,
          total_price: 25000
        },
        {
          bill_id: billIds[1],
          service_id: '4',
          service_name: 'Complete Blood Count (CBC)',
          category: 'lab-test',
          unit_price: 15000,
          quantity: 1,
          total_price: 15000
        }
      ])
      .select();

    if (billItemsError) {
      console.error('Error inserting bill items:', billItemsError);
      process.exit(1);
    }

    console.log('Inserted bill items:', billItems);

    // Insert seed data for departments
    const { data: departments, error: departmentsError } = await supabase
      .from('departments')
      .insert([
        { 
          name: 'Mapokezi (Reception)', 
          description: 'Reception and patient registration', 
          doctors: [] 
        },
        { 
          name: 'Matibabu ya Ndani (Internal Medicine)', 
          description: 'General medicine department', 
          doctors: [userIds[1]] 
        },
        { 
          name: 'Maabara (Laboratory)', 
          description: 'Laboratory services', 
          doctors: [] 
        },
        { 
          name: 'Famasi (Pharmacy)', 
          description: 'Pharmacy services', 
          doctors: [] 
        },
        { 
          name: 'Dharura (Emergency)', 
          description: 'Emergency services', 
          doctors: [] 
        },
        { 
          name: 'Macho (Ophthalmology)', 
          description: 'Eye care and surgery department', 
          doctors: [userIds[5], userIds[7]] 
        },
        { 
          name: 'Radiology', 
          description: 'Radiology and imaging services', 
          doctors: [userIds[4], userIds[6]] 
        },
        { 
          name: 'Operating Theatre', 
          description: 'Surgical services', 
          doctors: [] 
        }
      ])
      .select();

    if (departmentsError) {
      console.error('Error inserting departments:', departmentsError);
      process.exit(1);
    }

    console.log('Inserted departments:', departments);

    // Insert seed data for insurance claims
    const { data: insuranceClaims, error: insuranceClaimsError } = await supabase
      .from('insurance_claims')
      .insert([
        {
          bill_id: billIds[0],
          patient_id: patientIds[0],
          insurance_provider: 'NHIF',
          membership_number: 'NHIF-123456789',
          claim_amount: 29500,
          claimed_amount: 29500,
          status: 'submitted',
          submission_date: new Date('2024-01-24T11:00:00Z').toISOString(),
          nhif_claim_number: 'NHIF-2024-001'
        },
        {
          bill_id: billIds[1],
          patient_id: patientIds[1],
          insurance_provider: 'Strategis Insurance',
          membership_number: 'STR-987654321',
          claim_amount: 17700,
          claimed_amount: 15000,
          status: 'approved',
          submission_date: new Date('2024-01-23T15:30:00Z').toISOString(),
          approval_date: new Date('2024-01-25T09:00:00Z').toISOString(),
          nhif_claim_number: 'NHIF-2024-002'
        }
      ])
      .select();

    if (insuranceClaimsError) {
      console.error('Error inserting insurance claims:', insuranceClaimsError);
      process.exit(1);
    }

    console.log('Inserted insurance claims:', insuranceClaims);

    // Insert seed data for surgery requests
    const { data: surgeryRequests, error: surgeryRequestsError } = await supabase
      .from('surgery_requests')
      .insert([
        {
          patient_id: patientIds[0],
          requesting_doctor_id: userIds[1],
          surgery_type: 'Appendectomy',
          urgency: 'routine',
          requested_date: '2024-01-25',
          status: 'pending',
          diagnosis: 'Acute appendicitis',
          notes: 'Patient presents with classic symptoms'
        }
      ])
      .select();

    if (surgeryRequestsError) {
      console.error('Error inserting surgery requests:', surgeryRequestsError);
      process.exit(1);
    }

    console.log('Inserted surgery requests:', surgeryRequests);

    // Get surgery request IDs for foreign key references
    const surgeryRequestIds = surgeryRequests ? surgeryRequests.map((s: SurgeryRequest) => s.id) : [];

    // Insert seed data for OT slots
    const { data: otSlots, error: otSlotsError } = await supabase
      .from('ot_slots')
      .insert([
        {
          date: '2024-01-25',
          start_time: '09:00',
          end_time: '11:00',
          ot_room_id: 'ot1',
          status: 'available'
        },
        {
          date: '2024-01-25',
          start_time: '11:30',
          end_time: '13:30',
          ot_room_id: 'ot1',
          status: 'available'
        }
      ])
      .select();

    if (otSlotsError) {
      console.error('Error inserting OT slots:', otSlotsError);
      process.exit(1);
    }

    console.log('Inserted OT slots:', otSlots);

    // Insert seed data for OT resources
    const { data: otResources, error: otResourcesError } = await supabase
      .from('ot_resources')
      .insert([
        {
          type: 'ot-room',
          name: 'Theatre 1',
          availability: JSON.stringify({
            '2024-01-25': [
              { startTime: '09:00', endTime: '11:00', status: 'available' },
              { startTime: '11:30', endTime: '13:30', status: 'busy' }
            ]
          })
        },
        {
          type: 'ot-room',
          name: 'Theatre 2',
          availability: JSON.stringify({
            '2024-01-25': [
              { startTime: '09:00', endTime: '11:00', status: 'unavailable' },
              { startTime: '11:30', endTime: '13:30', status: 'available' }
            ]
          })
        },
        {
          type: 'surgeon',
          name: 'Dr. Hassan Mbwana',
          specialty: 'General Surgery',
          availability: JSON.stringify({
            '2024-01-25': [
              { startTime: '09:00', endTime: '12:00', status: 'available' },
              { startTime: '13:00', endTime: '17:00', status: 'unavailable' }
            ]
          })
        }
      ])
      .select();

    if (otResourcesError) {
      console.error('Error inserting OT resources:', otResourcesError);
      process.exit(1);
    }

    console.log('Inserted OT resources:', otResources);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDb();