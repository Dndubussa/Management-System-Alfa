import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { AppointmentStatusUpdate } from './AppointmentStatusUpdate';
import { Calendar, Clock, User, Info } from 'lucide-react';

export function DoctorAppointmentDashboard() {
  const { appointments, patients } = useHospital();
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
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctorAppointments.map((appointment) => {
                  const dateTime = formatDateTime(appointment.dateTime);
                  const patientName = getPatientName(appointment.patientId);
                  
                  return (
                    <div 
                      key={appointment.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <h3 className="font-medium text-gray-900">{patientName}</h3>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {dateTime.time}
                            </div>
                          </div>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Click to update status
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}