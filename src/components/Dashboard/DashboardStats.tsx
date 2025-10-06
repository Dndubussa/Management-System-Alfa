import React from 'react';
import { Users, Calendar, FileText, AlertCircle, FileTextIcon } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { ServicePrice } from '../../types';

export function DashboardStats() {
  const { patients, appointments, medicalRecords, prescriptions, labOrders, bills, servicePrices, insuranceClaims } = useHospital();
  const { user } = useAuth();

  const getStatsForRole = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(apt => 
      apt.dateTime.startsWith(today) && apt.status !== 'cancelled'
    );

    switch (user?.role) {
      case 'receptionist':
        // Calculate insurance claim statistics
        const pendingClaims = insuranceClaims.filter(c => c.status === 'submitted');
        const approvedClaims = insuranceClaims.filter(c => c.status === 'approved');
        
        return [
          {
            title: 'Total Patients',
            value: patients.length.toString(),
            icon: Users,
            color: 'bg-blue-500',
            textColor: 'text-blue-700'
          },
          {
            title: "Today's Appointments",
            value: todayAppointments.length.toString(),
            icon: Calendar,
            color: 'bg-green-500',
            textColor: 'text-green-700'
          },
          {
            title: 'Pending Claims',
            value: pendingClaims.length.toString(),
            icon: FileTextIcon, // Use FileTextIcon for claims
            color: 'bg-yellow-500',
            textColor: 'text-yellow-700'
          },
          {
            title: 'Approved Claims',
            value: approvedClaims.length.toString(),
            icon: FileTextIcon, // Use FileTextIcon for claims
            color: 'bg-green-500',
            textColor: 'text-green-700'
          }
        ];

      case 'doctor':
        const myAppointments = todayAppointments.filter(apt => apt.doctorId === user?.id);
        const myPrescriptions = prescriptions.filter(p => p.doctorId === user?.id && p.status === 'pending');
        const myLabOrders = labOrders.filter(l => l.doctorId === user?.id && l.status === 'ordered');
        const myPatientBills = bills.filter(b => {
          const patient = patients.find(p => p.id === b.patientId);
          return patient && b.status === 'pending';
        });
        
        return [
          {
            title: "Today's Patients",
            value: myAppointments.length.toString(),
            icon: Users,
            color: 'bg-green-500',
            textColor: 'text-green-700'
          },
          {
            title: 'Medical Records',
            value: medicalRecords.filter(r => r.doctorId === user?.id).length.toString(),
            icon: FileText,
            color: 'bg-blue-500',
            textColor: 'text-blue-700'
          },
          {
            title: 'Pending Prescriptions',
            value: myPrescriptions.length.toString(),
            icon: AlertCircle,
            color: 'bg-orange-500',
            textColor: 'text-orange-700'
          },
          {
            title: 'Pending Bills',
            value: myPatientBills.length.toString(),
            icon: AlertCircle,
            color: 'bg-red-500',
            textColor: 'text-red-700'
          }
        ];

      case 'lab':
        const pendingLabOrders = labOrders.filter(l => l.status === 'ordered');
        const inProgressOrders = labOrders.filter(l => l.status === 'in-progress');
        const completedToday = labOrders.filter(l => 
          l.status === 'completed' && 
          l.completedAt?.startsWith(today)
        );
        
        return [
          {
            title: 'Pending Orders',
            value: pendingLabOrders.length.toString(),
            icon: AlertCircle,
            color: 'bg-orange-500',
            textColor: 'text-orange-700'
          },
          {
            title: 'In Progress',
            value: inProgressOrders.length.toString(),
            icon: FileText,
            color: 'bg-blue-500',
            textColor: 'text-blue-700'
          },
          {
            title: 'Completed Today',
            value: completedToday.length.toString(),
            icon: FileText,
            color: 'bg-green-500',
            textColor: 'text-green-700'
          },
          {
            title: 'Total Orders',
            value: labOrders.length.toString(),
            icon: FileText,
            color: 'bg-purple-500',
            textColor: 'text-purple-700'
          }
        ];

      case 'pharmacy':
        const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending');
        const dispensedToday = prescriptions.filter(p => 
          p.status === 'dispensed' && 
          p.createdAt.startsWith(today)
        );
        const medicationBills = bills.filter(bill => 
          bill.items.some(item => {
            const service = servicePrices.find((s: ServicePrice) => s.id === item.serviceId);
            return service?.category === 'medication';
          })
        );
        
        return [
          {
            title: 'Pending Prescriptions',
            value: pendingPrescriptions.length.toString(),
            icon: AlertCircle,
            color: 'bg-orange-500',
            textColor: 'text-orange-700'
          },
          {
            title: 'Dispensed Today',
            value: dispensedToday.length.toString(),
            icon: FileText,
            color: 'bg-green-500',
            textColor: 'text-green-700'
          },
          {
            title: 'Medication Bills',
            value: medicationBills.length.toString(),
            icon: FileText,
            color: 'bg-blue-500',
            textColor: 'text-blue-700'
          },
          {
            title: 'Revenue (TZS)',
            value: new Intl.NumberFormat('sw-TZ', { 
              notation: 'compact', 
              maximumFractionDigits: 1 
            }).format(medicationBills.reduce((sum, bill) => sum + bill.total, 0)),
            icon: FileText,
            color: 'bg-purple-500',
            textColor: 'text-purple-700'
          }
        ];

      case 'radiologist':
        // For radiologists, we'll show imaging-related stats
        // Since we don't have a specific imaging module yet, we'll show general stats
        const imagingTests = ['x-ray', 'scan', 'mri', 'ct', 'ultrasound', 'mammography'];
        const isImagingTest = (testName: string) => {
          return imagingTests.some(test => testName.toLowerCase().includes(test));
        };
        
        const pendingImaging = labOrders.filter(l => 
          isImagingTest(l.testName) && l.status === 'ordered'
        );
        const inProgressImaging = labOrders.filter(l => 
          isImagingTest(l.testName) && l.status === 'in-progress'
        );
        const completedImagingToday = labOrders.filter(l => 
          isImagingTest(l.testName) && 
          l.status === 'completed' && 
          l.completedAt?.startsWith(today)
        );
        
        return [
          {
            title: 'Pending Imaging',
            value: pendingImaging.length.toString(),
            icon: AlertCircle,
            color: 'bg-orange-500',
            textColor: 'text-orange-700'
          },
          {
            title: 'In Progress',
            value: inProgressImaging.length.toString(),
            icon: FileText,
            color: 'bg-blue-500',
            textColor: 'text-blue-700'
          },
          {
            title: 'Completed Today',
            value: completedImagingToday.length.toString(),
            icon: FileText,
            color: 'bg-green-500',
            textColor: 'text-green-700'
          },
          {
            title: 'Total Imaging',
            value: labOrders.filter(l => isImagingTest(l.testName)).length.toString(),
            icon: FileText,
            color: 'bg-purple-500',
            textColor: 'text-purple-700'
          }
        ];

      default:
        return [];
    }
  };

  const stats = getStatsForRole();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-md p-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className={`text-2xl font-semibold ${stat.textColor}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}