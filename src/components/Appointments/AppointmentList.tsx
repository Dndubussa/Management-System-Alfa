import React, { useState } from 'react';
import { Calendar, Clock, User, Plus, Search, Filter } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { Appointment } from '../../types';
import { findPatientSafely, getPatientDisplayName } from '../../utils/patientUtils';
import { formatDateTime } from '../../utils/dateUtils';

interface AppointmentListProps {
  onNewAppointment: () => void;
  onEditAppointment: (appointment: Appointment) => void;
}

export function AppointmentList({ onNewAppointment, onEditAppointment }: AppointmentListProps) {
  const { appointments, patients, users, patientQueue } = useHospital();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientHistory, setShowPatientHistory] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Debug logging
  console.log('🔍 AppointmentList - User:', user?.name, 'Role:', user?.role);
  console.log('🔍 AppointmentList - Total appointments:', appointments.length);
  console.log('🔍 AppointmentList - Total patients:', patients.length);
  console.log('🔍 AppointmentList - Total users:', users.length);

  // Filter appointments based on user role
  const userAppointments = user?.role === 'doctor' 
    ? appointments.filter(apt => apt.doctorId === user.id)
    : appointments;

  console.log('🔍 AppointmentList - User appointments after role filter:', userAppointments.length);

  // For doctors, we still show all appointments including completed ones
  // For receptionists, we show all appointments as well
  const filteredAppointments = userAppointments.filter(appointment => {
    const patient = findPatientSafely(patients, appointment.patientId);
    if (!patient) {
      console.log('🔍 AppointmentList - No patient found for appointment:', appointment.id, 'patientId:', appointment.patientId);
      return false;
    }

    const matchesSearch = searchTerm === '' || 
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.mrn && patient.mrn.toLowerCase().includes(searchTerm.toLowerCase()));

    const matches = matchesSearch;
    if (!matches) {
      console.log('🔍 AppointmentList - Appointment filtered out:', {
        appointmentId: appointment.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        matchesSearch,
        searchTerm
      });
    }

    return matches;
  }).sort((a, b) => {
    // Sort by patient MRN in ascending order (P001, P002, P003...)
    const patientA = findPatientSafely(patients, a.patientId);
    const patientB = findPatientSafely(patients, b.patientId);
    
    if (!patientA || !patientB) return 0;
    
    // Extract numeric part from MRN (P001 -> 1, P002 -> 2, etc.)
    const mrnA = parseInt(patientA.mrn.replace('P', '')) || 0;
    const mrnB = parseInt(patientB.mrn.replace('P', '')) || 0;
    
    return mrnA - mrnB;
  });

  console.log('🔍 AppointmentList - Final filtered appointments:', filteredAppointments.length);

  const getPatientName = (patientId: string) => {
    return getPatientDisplayName(patients, patientId);
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = users.find(u => u.id === doctorId);
    return doctor ? doctor.name : 'Unknown Doctor';
  };

  // Get patient current status (in queue, triage, doctor, etc.)
  const getPatientCurrentStatus = (patientId: string) => {
    const queueItem = patientQueue.find(item => item.patientId === patientId);
    if (queueItem) {
      switch (queueItem.workflowStage) {
        case 'reception': return { status: 'Waiting for Triage', color: 'bg-yellow-100 text-yellow-800' };
        case 'triage': return { status: 'In Triage', color: 'bg-blue-100 text-blue-800' };
        case 'doctor': return { status: 'With Doctor', color: 'bg-green-100 text-green-800' };
        case 'lab': return { status: 'In Lab', color: 'bg-purple-100 text-purple-800' };
        case 'pharmacy': return { status: 'In Pharmacy', color: 'bg-indigo-100 text-indigo-800' };
        case 'completed': return { status: 'Completed', color: 'bg-gray-100 text-gray-800' };
        default: return { status: 'Unknown', color: 'bg-gray-100 text-gray-800' };
      }
    }
    return { status: 'Not in System', color: 'bg-gray-100 text-gray-800' };
  };

  // Get patient history (all appointments)
  const getPatientHistory = (patientId: string) => {
    return appointments.filter(apt => apt.patientId === patientId)
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
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


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white">
        <div className="px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Patient Appointments & History</h1>
            {/* New Appointment button removed for receptionists to avoid workflow conflicts */}
          </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search appointments by patient name or MRN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

      </div>

      <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PATIENT INFO
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MRN
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DOCTOR
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DATE & TIME
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  CURRENT STATUS
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  HISTORY
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm 
                      ? 'No appointments found matching your search.' 
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
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                            <User className="w-5 h-5 text-gray-600" />
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
                        <div className="text-sm font-medium text-blue-600">
                          {(() => {
                            const patient = findPatientSafely(patients, appointment.patientId);
                            return patient?.mrn || 'N/A';
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getDoctorName(appointment.doctorId)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {(() => {
                            const doctor = users.find(u => u.id === appointment.doctorId);
                            return doctor ? doctor.role : '';
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {dateTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPatientCurrentStatus(appointment.patientId).color}`}>
                          {getPatientCurrentStatus(appointment.patientId).status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        <button
                          onClick={() => {
                            setSelectedPatient(findPatientSafely(patients, appointment.patientId));
                            setShowPatientHistory(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View History ({getPatientHistory(appointment.patientId).length})
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <span className="text-gray-500 text-sm">
                          View Only
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      {/* Patient History Modal */}
      {showPatientHistory && selectedPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Patient History - {selectedPatient.firstName} {selectedPatient.lastName}
                </h3>
                <button
                  onClick={() => setShowPatientHistory(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-gray-600">
                  <strong>MRN:</strong> {selectedPatient.mrn} | 
                  <strong> Phone:</strong> {selectedPatient.phone} | 
                  <strong> Insurance:</strong> {selectedPatient.insuranceInfo?.provider || 'None'}
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {getPatientHistory(selectedPatient.id).length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No appointment history found for this patient.
                    </div>
                  ) : (
                    getPatientHistory(selectedPatient.id).map((appointment, index) => (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-gray-900">
                                Appointment #{index + 1}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                                {appointment.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div><strong>Date:</strong> {formatDateTime(appointment.dateTime)}</div>
                              <div><strong>Doctor:</strong> {getDoctorName(appointment.doctorId)}</div>
                              <div><strong>Department:</strong> {appointment.department}</div>
                              {appointment.notes && (
                                <div><strong>Notes:</strong> {appointment.notes}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowPatientHistory(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}