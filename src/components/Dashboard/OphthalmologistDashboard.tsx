import React, { useState, useEffect } from 'react';
import { Users, FileText, Calendar, TestTube, Pill, Activity, BarChart3, Eye, Camera } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { Appointment } from '../../types';

export function OphthalmologistDashboard() {
  const { user } = useAuth();
  const { 
    patients, 
    appointments, 
    medicalRecords, 
    prescriptions, 
    labOrders,
    users
  } = useHospital();
  
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState([
    {
      title: "Today's Patients",
      value: '0',
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-700'
    },
    {
      title: 'Pending Prescriptions',
      value: '0',
      icon: Pill,
      color: 'bg-orange-500',
      textColor: 'text-orange-700'
    },
    {
      title: 'Pending Lab Orders',
      value: '0',
      icon: TestTube,
      color: 'bg-blue-500',
      textColor: 'text-blue-700'
    },
    {
      title: 'Pending Imaging',
      value: '0',
      icon: Camera,
      color: 'bg-purple-500',
      textColor: 'text-purple-700'
    }
  ]);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Filter appointments for today and this doctor
  useEffect(() => {
    if (user) {
      const todaysAppointments = appointments.filter(appointment => 
        appointment.doctorId === user.id && 
        appointment.dateTime.startsWith(today)
      );
      setTodayAppointments(todaysAppointments);
      
      // Update stats
      setStats(prev => prev.map(stat => {
        switch (stat.title) {
          case "Today's Patients":
            return { ...stat, value: todaysAppointments.length.toString() };
          case 'Pending Prescriptions':
            const doctorPrescriptions = prescriptions.filter(p => 
              p.doctorId === user.id && p.status === 'pending'
            );
            return { ...stat, value: doctorPrescriptions.length.toString() };
          case 'Pending Lab Orders':
            const doctorLabOrders = labOrders.filter(l => 
              l.doctorId === user.id && l.status === 'ordered'
            );
            return { ...stat, value: doctorLabOrders.length.toString() };
          case 'Pending Imaging':
            const imagingOrders = labOrders.filter(order => 
              order.doctorId === user.id &&
              (order.testName.toLowerCase().includes('oct') || 
               order.testName.toLowerCase().includes('visual field') || 
               order.testName.toLowerCase().includes('fundus')) &&
              order.status === 'ordered'
            );
            return { ...stat, value: imagingOrders.length.toString() };
          default:
            return stat;
        }
      }));
    }
  }, [appointments, prescriptions, labOrders, user, today]);

  // Get doctor's patients
  const doctorPatients = patients.filter(patient => 
    medicalRecords.some(record => record.doctorId === user?.id && record.patientId === patient.id)
  );

  // Get doctor's prescriptions
  const doctorPrescriptions = prescriptions.filter(p => p.doctorId === user?.id);

  // Get doctor's lab orders
  const doctorLabOrders = labOrders.filter(l => l.doctorId === user?.id);

  // Get pending items
  const pendingPrescriptions = doctorPrescriptions.filter(p => p.status === 'pending');
  const pendingLabOrders = doctorLabOrders.filter(l => l.status === 'ordered');
  const completedLabOrders = doctorLabOrders.filter(l => 
    l.status === 'completed' && l.results
  );

  // Get ophthalmology-specific imaging orders
  const imagingOrders = doctorLabOrders.filter(order => 
    order.testName.toLowerCase().includes('oct') || 
    order.testName.toLowerCase().includes('visual field') || 
    order.testName.toLowerCase().includes('fundus')
  );

  // Get pending imaging orders
  const pendingImagingOrders = imagingOrders.filter(order => order.status === 'ordered');

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, Dr. {user?.name}
        </h1>
        <p className="text-gray-600 mt-1">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
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

      {/* Today's Appointments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Today's Appointments</h2>
            <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {todayAppointments.length} patients
            </span>
          </div>
        </div>
        
        {todayAppointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments today</h3>
            <p className="text-gray-500">You don't have any appointments scheduled for today.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {todayAppointments.map((appointment) => {
              const patient = patients.find(p => p.id === appointment.patientId);
              return (
                <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                        <Users className="w-8 h-8 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(appointment.dateTime)}
                        </p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                          {appointment.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Prescriptions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Pill className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Pending Prescriptions</h2>
              <span className="ml-2 bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {pendingPrescriptions.length} items
              </span>
            </div>
          </div>
          
          {pendingPrescriptions.length === 0 ? (
            <div className="p-12 text-center">
              <Pill className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending prescriptions</h3>
              <p className="text-gray-500">All prescriptions have been processed.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingPrescriptions.slice(0, 5).map((prescription) => {
                const patient = patients.find(p => p.id === prescription.patientId);
                return (
                  <div key={prescription.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{prescription.medication}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {prescription.dosage} • {prescription.frequency} • {prescription.duration}
                        </p>
                      </div>
                      <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                        Process
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending Lab Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <TestTube className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Pending Lab Orders</h2>
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {pendingLabOrders.length} items
              </span>
            </div>
          </div>
          
          {pendingLabOrders.length === 0 ? (
            <div className="p-12 text-center">
              <TestTube className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending lab orders</h3>
              <p className="text-gray-500">All lab orders have been processed.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingLabOrders.slice(0, 5).map((order) => {
                const patient = patients.find(p => p.id === order.patientId);
                return (
                  <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{order.testName}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Ordered on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                        Process
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}