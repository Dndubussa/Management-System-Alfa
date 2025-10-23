import { useState } from 'react';
import { Users, FileText, Calendar, TestTube, Pill, CreditCard, BarChart3, Settings, Shield, User, UserPlus, Edit, Trash2, Eye } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { DashboardLoading } from '../Common/DashboardLoading';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

export function AdminDashboard() {
  const { 
    patients, 
    medicalRecords, 
    prescriptions, 
    labOrders, 
    appointments, 
    servicePrices, 
    bills,
    departments,
    users: systemUsers,
    loading,
    error
  } = useHospital();
  
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Dashboard stats
  const stats = [
    {
      title: "Total Patients",
      value: patients.length.toString(),
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-700'
    },
    {
      title: 'Medical Records',
      value: medicalRecords.length.toString(),
      icon: FileText,
      color: 'bg-blue-500',
      textColor: 'text-blue-700'
    },
    {
      title: 'Appointments',
      value: appointments.length.toString(),
      icon: Calendar,
      color: 'bg-purple-500',
      textColor: 'text-purple-700'
    },
    {
      title: 'Pending Prescriptions',
      value: prescriptions.filter(p => p.status === 'pending').length.toString(),
      icon: Pill,
      color: 'bg-orange-500',
      textColor: 'text-orange-700'
    }
  ];

  // Recently registered patients
  const recentPatients = [...patients]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Recent appointments
  const recentAppointments = [...appointments]
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    .slice(0, 5);

  // Get patient name
  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };


  // Show loading state
  if (loading) {
    return (
      <DashboardLoading 
        role="admin" 
        department="Administration" 
        title="Admin" 
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
          </div>
          <p className="text-sm text-red-700 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-600 mt-1">
          System Administrator Dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Registered Patients */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Recently Registered Patients</h2>
            </div>
          </div>
          
          {recentPatients.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients registered</h3>
              <p className="text-gray-500">No patients have been registered yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Registered on {formatDate(patient.createdAt)}
                        </p>
                      </div>
                    </div>
                    <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
            </div>
          </div>
          
          {recentAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments scheduled</h3>
              <p className="text-gray-500">No appointments have been scheduled yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentAppointments.map((appointment) => {
                const patient = patients.find(p => p.id === appointment.patientId);
                const doctor = systemUsers.find(u => u.id === appointment.doctorId);
                return (
                  <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          with {doctor ? doctor.name : 'Unknown Doctor'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDateTime(appointment.dateTime)}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* System Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">System Overview</h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="text-sm font-medium text-gray-900">Medical Records</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{medicalRecords.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total records in system</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <TestTube className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="text-sm font-medium text-gray-900">Lab Orders</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{labOrders.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total lab orders</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Pill className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="text-sm font-medium text-gray-900">Prescriptions</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{prescriptions.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total prescriptions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
