import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { AppointmentStatusUpdate } from './AppointmentStatusUpdate';
import { Calendar, Clock, User, Info } from 'lucide-react';
import { findPatientSafely, getPatientDisplayName } from '../../utils/patientUtils';
import { DashboardLoading } from '../Common/DashboardLoading';

export function DoctorAppointmentDashboard() {
  const { appointments, patients, loading, error } = useHospital();
  const { user } = useAuth();
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  // Get today's appointments for the current doctor that are not completed
  const today = new Date().toISOString().split('T')[0];
  const doctorAppointments = appointments
    .filter(apt => 
      apt.doctorId === user?.id && 
      apt.dateTime.startsWith(today) &&
      apt.status !== 'completed' // Exclude completed appointments
    )
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const getPatientName = (patientId: string) => {
    return getPatientDisplayName(patients, patientId);
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = () => {
    setSelectedAppointment(null);
  };

  // Show loading state
  if (loading) {
    return (
      <DashboardLoading 
        role="doctor" 
        department="Appointments" 
        title="Doctor Appointments" 
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-sm font-medium text-red-800">Error Loading Appointments</h3>
          </div>
          <p className="text-sm text-red-700 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Today's Appointments</h2>
          <div className="flex items-center text-sm text-gray-500">
            <Info className="w-4 h-4 mr-1" />
            <span>Update status for today's appointments only</span>
          </div>
        </div>
        
        {selectedAppointment ? (
          <AppointmentStatusUpdate 
            appointment={selectedAppointment} 
            onStatusUpdate={handleStatusUpdate} 
          />
        ) : (
          <div className="space-y-4">
            {doctorAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>No appointments scheduled for today.</p>
                <p className="text-sm mt-2">Completed appointments are moved to the All Appointments list.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        MRN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {doctorAppointments.map((appointment) => {
                      const dateTime = formatDateTime(appointment.dateTime);
                      const patientName = getPatientName(appointment.patientId);
                      const patient = findPatientSafely(patients, appointment.patientId);
                      
                      return (
                        <tr 
                          key={appointment.id} 
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedAppointment(appointment)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                <User className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{patientName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-blue-600 font-medium">
                              {patient?.mrn || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{dateTime.time}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 capitalize">{appointment.type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Click to update status
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}