import mongoose from 'mongoose';
import connectDB from '../config/db';
import {
  Patient,
  Appointment,
  User,
  Notification,
  Bill,
  Department,
  InsuranceClaim,
  SurgeryRequest,
  OTSlot,
  OTResource
} from '../models';

const seedDb = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Clear existing data
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await User.deleteMany({});
    await Notification.deleteMany({});
    await Bill.deleteMany({});
    await Department.deleteMany({});
    await InsuranceClaim.deleteMany({});
    await SurgeryRequest.deleteMany({});
    await OTSlot.deleteMany({});
    await OTResource.deleteMany({});

    // Insert seed data
    const patients = await Patient.insertMany([
      {
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
        }
      },
      {
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
        }
      }
    ]);

    const appointments = await Appointment.insertMany([
      {
        patientId: patients[0]._id,
        doctorId: '2',
        dateTime: '2024-01-25T09:00:00Z',
        duration: 30,
        type: 'consultation',
        status: 'scheduled',
        notes: 'Uchunguzi wa kawaida (Routine checkup)'
      },
      {
        patientId: patients[1]._id,
        doctorId: '2',
        dateTime: '2024-01-25T10:30:00Z',
        duration: 45,
        type: 'follow-up',
        status: 'scheduled',
        notes: 'Ufuatiliaji wa damu ya juu (High blood pressure follow-up)'
      }
    ]);

    const users = await User.insertMany([
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
    ]);

    const notifications = await Notification.insertMany([
      {
        userIds: [users[1]._id.toString()], // Doctor
        type: 'appointment',
        title: 'New Appointment Scheduled',
        message: 'Appointment with John Mwalimu on 25/1/2024',
        isRead: false
      },
      {
        userIds: [users[0]._id.toString()], // Receptionist
        type: 'billing',
        title: 'New Bill Generated',
        message: 'Bill for Fatuma Hassan has been generated',
        isRead: false
      },
      {
        userIds: [users[3]._id.toString()], // Pharmacy
        type: 'prescription',
        title: 'New Prescription Order',
        message: '1 prescription(s) for John Mwalimu',
        isRead: true
      }
    ]);

    const bills = await Bill.insertMany([
      {
        patientId: patients[0]._id,
        items: [
          {
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
        status: 'pending'
      },
      {
        patientId: patients[1]._id,
        items: [
          {
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
        paidAt: new Date('2024-01-23T15:00:00Z')
      }
    ]);

    const departments = await Department.insertMany([
      { name: 'Mapokezi (Reception)', description: 'Reception and patient registration', doctors: [] },
      { name: 'Matibabu ya Ndani (Internal Medicine)', description: 'General medicine department', doctors: [users[1]._id.toString()] },
      { name: 'Maabara (Laboratory)', description: 'Laboratory services', doctors: [] },
      { name: 'Famasi (Pharmacy)', description: 'Pharmacy services', doctors: [] },
      { name: 'Dharura (Emergency)', description: 'Emergency services', doctors: [] },
      { name: 'Macho (Ophthalmology)', description: 'Eye care and surgery department', doctors: [users[5]._id.toString(), users[7]._id.toString()] },
      { name: 'Radiology', description: 'Radiology and imaging services', doctors: [users[4]._id.toString(), users[6]._id.toString()] },
      { name: 'Operating Theatre', description: 'Surgical services', doctors: [] }
    ]);

    const insuranceClaims = await InsuranceClaim.insertMany([
      {
        billId: bills[0]._id,
        patientId: patients[0]._id,
        insuranceProvider: 'NHIF',
        membershipNumber: 'NHIF-123456789',
        claimAmount: 29500,
        claimedAmount: 29500,
        status: 'submitted',
        submissionDate: new Date('2024-01-24T11:00:00Z'),
        nhifClaimNumber: 'NHIF-2024-001'
      },
      {
        billId: bills[1]._id,
        patientId: patients[1]._id,
        insuranceProvider: 'Strategis Insurance',
        membershipNumber: 'STR-987654321',
        claimAmount: 17700,
        claimedAmount: 15000,
        status: 'approved',
        submissionDate: new Date('2024-01-23T15:30:00Z'),
        approvalDate: new Date('2024-01-25T09:00:00Z'),
        nhifClaimNumber: 'NHIF-2024-002'
      }
    ]);

    const surgeryRequests = await SurgeryRequest.insertMany([
      {
        patientId: patients[0]._id,
        requestingDoctorId: users[1]._id,
        surgeryType: 'Appendectomy',
        urgency: 'routine',
        requestedDate: '2024-01-25T10:00:00Z',
        status: 'pending',
        diagnosis: 'Acute appendicitis',
        notes: 'Patient presents with classic symptoms'
      }
    ]);

    const otSlots = await OTSlot.insertMany([
      {
        date: '2024-01-25',
        startTime: '09:00',
        endTime: '11:00',
        otRoomId: 'ot1',
        status: 'available'
      },
      {
        date: '2024-01-25',
        startTime: '11:30',
        endTime: '13:30',
        otRoomId: 'ot1',
        status: 'available'
      }
    ]);

    const otResources = await OTResource.insertMany([
      {
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
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDb();