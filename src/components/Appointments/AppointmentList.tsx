import React, { useState } from 'react';
import { Calendar, Clock, User, Plus, Search, Filter } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { Appointment } from '../../types';
import { AppointmentStatusUpdate } from './AppointmentStatusUpdate';
import { findPatientSafely, getPatientDisplayName } from '../../utils/patientUtils';

interface AppointmentListProps {
  onNewAppointment: () => void;
  onEditAppointment: (appointment: Appointment) => void;
}

export function AppointmentList({ onNewAppointment, onEditAppointment }: AppointmentListProps) {
  const { appointments, patients } = useHospital();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Filter appointments based on user role
  const userAppointments = user?.role === 'doctor' 
    ? appointments.filter(apt => apt.doctorId === user.id)
    : appointments;

  // For doctors, we still show all appointments including completed ones
  // For receptionists, we show all appointments as well
  const filteredAppointments = userAppointments.filter(appointment => {
    const patient = findPatientSafely(patients, appointment.patientId);
    if (!patient) return false;

    const matchesSearch = searchTerm === '' || 
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === '' || appointment.status === statusFilter;
    
    const matchesDate = dateFilter === '' || 
      appointment.dateTime.startsWith(dateFilter);

    return matchesSearch && matchesStatus && matchesDate;
  });

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-purple-100 text-purple-800';
      case 'follow-up': return 'bg-orange-100 text-orange-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = () => {
    // Refresh the appointment list or perform any necessary updates
    setSelectedAppointment(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">All Appointments</h2>
          {user?.role === 'receptionist' && (
            <button
              onClick={onNewAppointment}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Appointment</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {selectedAppointment ? (
        <div className="p-6">
          <AppointmentStatusUpdate 
            appointment={selectedAppointment} 
            onStatusUpdate={handleStatusUpdate} 
          />
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
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || statusFilter || dateFilter 
                      ? 'No appointments found matching your criteria.' 
                      : 'No appointments scheduled.'}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => {
                  const dateTime = formatDateTime(appointment.dateTime);
                  return (
                    <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {getPatientName(appointment.patientId)}
                            </div>
                            <div className="text-sm text-gray-500">ID: {appointment.patientId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <div>
                            <div>{dateTime.date}</div>
                            <div className="text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {dateTime.time}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(appointment.type)}`}>
                          {appointment.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {user?.role === 'doctor' ? (
                          // Doctors can only update status for today's appointments that are not completed
                          <button
                            onClick={() => {
                              const today = new Date().toISOString().split('T')[0];
                              const isToday = appointment.dateTime.startsWith(today);
                              const isCompleted = appointment.status === 'completed';
                              
                              // Only allow status update for today's appointments that are not completed
                              if (isToday && !isCompleted) {
                                setSelectedAppointment(appointment);
                              }
                            }}
                            className={`${
                              (() => {
                                const today = new Date().toISOString().split('T')[0];
                                const isToday = appointment.dateTime.startsWith(today);
                                const isCompleted = appointment.status === 'completed';
                                return isToday && !isCompleted 
                                  ? 'text-green-600 hover:text-green-900' 
                                  : 'text-gray-400 cursor-not-allowed';
                              })()
                            } transition-colors`}
                            disabled={(() => {
                              const today = new Date().toISOString().split('T')[0];
                              const isToday = appointment.dateTime.startsWith(today);
                              const isCompleted = appointment.status === 'completed';
                              return !(isToday && !isCompleted);
                            })()}
                          >
                            {(() => {
                              const today = new Date().toISOString().split('T')[0];
                              const isToday = appointment.dateTime.startsWith(today);
                              const isCompleted = appointment.status === 'completed';
                              
                              if (isCompleted) return 'Completed';
                              if (!isToday) return 'View Only';
                              return 'Update Status';
                            })()}
                          </button>
                        ) : (
                          <button
                            onClick={() => onEditAppointment(appointment)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}