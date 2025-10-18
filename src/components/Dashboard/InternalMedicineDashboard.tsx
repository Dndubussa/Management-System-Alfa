import React from 'react';
import { Users, Calendar, FileText, TestTube, Pill, Activity, AlertCircle, Heart } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';

export function InternalMedicineDashboard() {
  const { patients, appointments, medicalRecords, prescriptions, labOrders, bills, loading, error } = useHospital();
  const { user } = useAuth();

  // Debug logging for data loading
  console.log('🏥 Internal Medicine Dashboard - Data Status:', {
    user: user?.name,
    role: user?.role,
    patientsCount: patients.length,
    appointmentsCount: appointments.length,
    medicalRecordsCount: medicalRecords.length,
    prescriptionsCount: prescriptions.length,
    labOrdersCount: labOrders.length
  });

  // Filter data for the current doctor with null safety
  const doctorAppointments = appointments?.filter(apt => apt?.doctorId === user?.id) || [];
  const doctorRecords = medicalRecords?.filter(record => record?.doctorId === user?.id) || [];
  const doctorPrescriptions = prescriptions?.filter(p => p?.doctorId === user?.id) || [];
  const doctorLabOrders = labOrders?.filter(order => order?.doctorId === user?.id) || [];

  console.log('👨‍⚕️ Doctor-specific data:', {
    doctorAppointments: doctorAppointments.length,
    doctorRecords: doctorRecords.length,
    doctorPrescriptions: doctorPrescriptions.length,
    doctorLabOrders: doctorLabOrders.length
  });

  // Get today's date for filtering
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = doctorAppointments.filter(apt => 
    apt.dateTime.startsWith(today) && apt.status !== 'cancelled'
  );

  // Get pending items
  const pendingPrescriptions = doctorPrescriptions.filter(p => p.status === 'pending');
  const pendingLabOrders = doctorLabOrders.filter(l => l.status === 'ordered');
  const completedLabOrders = doctorLabOrders.filter(l => 
    l.status === 'completed' && l.results
  );

  // Get chronic disease patients (only those with both appointments AND medical records with this doctor)
  const chronicDiseasePatients = patients.filter(patient => {
    // First check if patient has appointments with this doctor
    const hasAppointmentWithDoctor = appointments.some(appointment => 
      appointment.doctorId === user?.id && appointment.patientId === patient.id
    );
    
    // Then check if patient has medical records with this doctor
    const hasMedicalRecordWithDoctor = doctorRecords.some(record => 
      record.patientId === patient.id
    );
    
    if (!hasAppointmentWithDoctor || !hasMedicalRecordWithDoctor) return false;
    
    // Finally check if patient has chronic conditions in their records
    const patientRecords = doctorRecords.filter(record => record.patientId === patient.id);
    return patientRecords.some(record => 
      record.diagnosis.toLowerCase().includes('diabetes') ||
      record.diagnosis.toLowerCase().includes('hypertension') ||
      record.diagnosis.toLowerCase().includes('asthma') ||
      record.diagnosis.toLowerCase().includes('copd') ||
      record.diagnosis.toLowerCase().includes('heart') ||
      record.diagnosis.toLowerCase().includes('chronic')
    );
  });

  // Dashboard stats
  const stats = [
    {
      title: "Today's Patients",
      value: todayAppointments.length.toString(),
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-700'
    },
    {
      title: 'Pending Prescriptions',
      value: pendingPrescriptions.length.toString(),
      icon: Pill,
      color: 'bg-orange-500',
      textColor: 'text-orange-700'
    },
    {
      title: 'Pending Lab Orders',
      value: pendingLabOrders.length.toString(),
      icon: TestTube,
      color: 'bg-blue-500',
      textColor: 'text-blue-700'
    },
    {
      title: 'Chronic Disease Patients',
      value: chronicDiseasePatients.length.toString(),
      icon: Activity,
      color: 'bg-red-500',
      textColor: 'text-red-700'
    }
  ];

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get patient name with null safety
  const getPatientName = (patientId: string) => {
    if (!patientId || !patients || patients.length === 0) {
      return 'Unknown Patient';
    }
    const patient = patients.find(p => p?.id === patientId);
    return patient ? `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown Patient' : 'Unknown Patient';
  };

  // Safe patient lookup
  const findPatient = (patientId: string) => {
    if (!patientId || !patients || patients.length === 0) {
      return null;
    }
    return patients.find(p => p?.id === patientId) || null;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
          </div>
          <p className="text-sm text-red-700 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and has the right role
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">Authentication Required</h3>
          </div>
          <p className="text-sm text-yellow-700 mt-2">Please log in to access the Internal Medicine Dashboard.</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'doctor') {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-sm font-medium text-red-800">Access Denied</h3>
          </div>
          <p className="text-sm text-red-700 mt-2">This dashboard is only accessible to doctors.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Heart className="w-6 h-6 text-red-500 mr-2" />
          Dr. {user?.name || 'Doctor'} Dashboard
        </h1>
        <p className="text-gray-600">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })} • Internal Medicine Department
        </p>
        {/* Data Status Indicator */}
        <div className="mt-2 text-xs text-gray-500">
          Data loaded: {patients.length} patients, {appointments.length} appointments, {medicalRecords.length} records
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Lab Results Alert */}
      {completedLabOrders.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <TestTube className="w-5 h-5 text-green-600 mr-2" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800">New Lab Results Available</h3>
              <p className="text-sm text-green-700 mt-1">
                {completedLabOrders.length} lab test{completedLabOrders.length > 1 ? 's have' : ' has'} been completed and results are ready for review.
              </p>
            </div>
            <AlertCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="mt-3 space-y-2">
            {completedLabOrders.slice(0, 3).map(order => {
              const patient = findPatient(order.patientId);
              return (
                <div key={order.id} className="text-sm text-green-700 bg-green-100 rounded px-3 py-2">
                  <strong>{order.testName || 'Lab Test'}</strong> for {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'} - 
                  <span className="ml-1">Completed {order.completedAt ? new Date(order.completedAt).toLocaleDateString() : 'recently'}</span>
                </div>
              );
            })}
            {completedLabOrders.length > 3 && (
              <div className="text-sm text-green-600 font-medium">
                +{completedLabOrders.length - 3} more results available
              </div>
            )}
          </div>
        </div>
      )}

      {/* Today's Appointments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-500" />
            Today's Appointments ({todayAppointments.length})
          </h2>
        </div>
        {todayAppointments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No appointments scheduled for today.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {todayAppointments.map(appointment => {
              const patient = findPatient(appointment.patientId);
              return (
                <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                      </h3>
                      <div className="text-sm text-gray-500">
                        {formatDate(appointment.dateTime)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Type: {appointment.type} • Status: {appointment.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                  {appointment.notes && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {appointment.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chronic Disease Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-red-500" />
            Chronic Disease Management ({chronicDiseasePatients.length})
          </h2>
        </div>
        {chronicDiseasePatients.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No chronic disease patients identified.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {chronicDiseasePatients.slice(0, 5).map(patient => {
              const patientRecords = doctorRecords.filter(record => record.patientId === patient.id);
              const latestRecord = patientRecords[patientRecords.length - 1];
              
              return (
                <div key={patient.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ID: {patient.id} • {patient.phone}
                      </p>
                      {latestRecord && (
                        <p className="text-sm text-gray-500 mt-1">
                          Last Visit: {formatDate(latestRecord.visitDate)} • 
                          Diagnosis: {latestRecord.diagnosis}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <button className="text-sm text-green-600 hover:text-green-800">
                        View Records
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {chronicDiseasePatients.length > 5 && (
              <div className="p-4 text-center text-sm text-gray-500">
                +{chronicDiseasePatients.length - 5} more patients
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}