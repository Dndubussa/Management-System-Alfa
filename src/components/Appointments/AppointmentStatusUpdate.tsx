import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { Appointment } from '../../types';
import { Check, X, Clock, User, ArrowLeft } from 'lucide-react';

interface AppointmentStatusUpdateProps {
  appointment: Appointment;
  onStatusUpdate: () => void;
}

export function AppointmentStatusUpdate({ appointment, onStatusUpdate }: AppointmentStatusUpdateProps) {
  const { updateAppointmentStatus, patients } = useHospital();
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const patient = patients.find(p => p.id === appointment.patientId);
  
  const handleStatusUpdate = (status: Appointment['status']) => {
    setIsUpdating(true);
    updateAppointmentStatus(appointment.id, status);
    setTimeout(() => {
      setIsUpdating(false);
      onStatusUpdate();
    }, 500);
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

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const dateTime = formatDateTime(appointment.dateTime);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <button
            onClick={onStatusUpdate}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Appointments
          </button>
          <h3 className="text-lg font-semibold text-gray-900">Appointment Details</h3>
          <p className="text-sm text-gray-500">Update status for this appointment</p>
        </div>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
            </div>
            <div className="text-sm text-gray-500">
              {dateTime.date} at {dateTime.time}
            </div>
          </div>
        </div>

        {user?.role === 'doctor' && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Update Status</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusUpdate('in-progress')}
                disabled={isUpdating || appointment.status === 'in-progress' || appointment.status === 'completed' || appointment.status === 'cancelled'}
                className="flex items-center px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Clock className="w-4 h-4 mr-1" />
                Mark In Progress
              </button>
              
              <button
                onClick={() => handleStatusUpdate('completed')}
                disabled={isUpdating || appointment.status === 'completed' || appointment.status === 'cancelled'}
                className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Check className="w-4 h-4 mr-1" />
                Mark Completed
              </button>
              
              <button
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={isUpdating || appointment.status === 'completed' || appointment.status === 'cancelled'}
                className="flex items-center px-3 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel Appointment
              </button>
            </div>
          </div>
        )}
      </div>
      
      {appointment.status === 'completed' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            This appointment has been marked as completed and is now visible in the All Appointments list.
          </p>
        </div>
      )}
    </div>
  );
}