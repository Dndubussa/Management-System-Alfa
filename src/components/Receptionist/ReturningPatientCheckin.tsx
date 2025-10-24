import React, { useState, useEffect } from 'react';
import { Search, User, Stethoscope, Clock, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Patient } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { DuplicateDetection } from '../Common/DuplicateDetection';

export function ReturningPatientCheckin() {
  const { patients, users, addToQueue, addNotification, updatePatient } = useHospital();
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [processing, setProcessing] = useState(false);
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [showDoctorSelection, setShowDoctorSelection] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  // Search for patients
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const results = patients.filter(patient => 
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, patients]);

  // Get available doctors based on insurance type
  const getAvailableDoctors = (patient: Patient) => {
    const allDoctors = users.filter(u => 
      u.role === 'doctor' || 
      u.role === 'ophthalmologist' || 
      u.role === 'radiologist' || 
      u.role === 'physical-therapist'
    );

    if (patient.insuranceInfo?.provider === 'NHIF') {
      return allDoctors.filter(doctor => 
        doctor.role === 'doctor' || doctor.role === 'ophthalmologist'
      );
    } else {
      return allDoctors;
    }
  };

  // Process returning patient with selected doctor
  const processReturningPatient = async (patient: Patient, doctorId: string) => {
    setProcessing(true);
    try {
      const availableDoctors = getAvailableDoctors(patient);
      if (availableDoctors.length === 0) {
        showError('No Doctors Available', 'No doctors are available for this patient type. Please contact administration.');
        return;
      }

      // Use manually selected doctor
      const assignedDoctor = availableDoctors.find(d => d.id === doctorId);
      if (!assignedDoctor) {
        showError('Doctor Not Available', 'The selected doctor is not available for this patient type. Please choose another doctor.');
        return;
      }

      // Update patient with current visit assignment
      await updatePatient(patient.id, {
        assignedDoctorId: assignedDoctor.id,
        assignedDoctorName: assignedDoctor.name,
        assignmentDate: new Date().toISOString(),
        assignmentReason: 'Returning patient - manually assigned doctor'
      });

      // Add patient to triage queue for current visit
      await addToQueue({
        patientId: patient.id,
        department: 'general',
        priority: 'normal',
        status: 'waiting',
        workflowStage: 'reception',
        assignedDoctorId: assignedDoctor.id,
        assignedDoctorName: assignedDoctor.name,
        assignmentReason: 'Returning patient - manually assigned doctor'
      });

      // Notify nurses
      const nurses = users.filter(u => u.role === 'nurse').map(u => u.id);
      if (nurses.length > 0) {
        addNotification({
          userIds: nurses,
          type: 'triage',
          title: 'Returning Patient Check-in',
          message: `Returning patient ${patient.firstName} ${patient.lastName} (${patient.mrn}) has checked in and is waiting for triage. Assigned to Dr. ${assignedDoctor.name}.`,
          isRead: false,
          patientId: patient.id
        });
      }

      // Notify assigned doctor
      addNotification({
        userIds: [assignedDoctor.id],
        type: 'queue',
        title: 'Returning Patient Assigned',
        message: `Returning patient ${patient.firstName} ${patient.lastName} (${patient.mrn}) has checked in and is waiting for triage.`,
        isRead: false,
        patientId: patient.id
      });

      // Clear selection and search
      setSelectedPatient(null);
      setSearchTerm('');
      setSearchResults([]);
      setShowDoctorSelection(false);
      setSelectedDoctorId('');
      
      showSuccess(
        'Patient Checked In Successfully!',
        `${patient.firstName} ${patient.lastName} has been assigned to Dr. ${assignedDoctor.name} and added to the triage queue.`
      );
    } catch (error) {
      console.error('Error processing returning patient:', error);
      showError(
        'Check-in Failed',
        'There was an error processing the returning patient. Please try again or contact support if the issue persists.'
      );
    } finally {
      setProcessing(false);
    }
  };

  const getInsuranceIcon = (provider: string) => {
    switch (provider) {
      case 'NHIF':
        return <div className="w-3 h-3 bg-blue-500 rounded-full" title="NHIF" />;
      case 'Direct':
        return <div className="w-3 h-3 bg-green-500 rounded-full" title="Cash" />;
      case 'Lipa Kwa Simu':
        return <div className="w-3 h-3 bg-purple-500 rounded-full" title="Mobile Payment" />;
      default:
        return <div className="w-3 h-3 bg-gray-500 rounded-full" title="Insurance" />;
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Returning Patient Check-in</h1>
          <p className="text-gray-600 mt-1">
            Check in patients who are already registered and returning for another visit
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{patients.length}</div>
          <div className="text-sm text-gray-500">Total Registered Patients</div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by patient name, MRN, or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setSearchResults([]);
              setSelectedPatient(null);
            }}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>

        {searchTerm.length > 0 && searchTerm.length < 2 && (
          <p className="text-sm text-gray-500 mt-2">
            Type at least 2 characters to search for patients
          </p>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Search Results ({searchResults.length})
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Select a patient to check them in for their return visit
            </p>
          </div>

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
                    Insurance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Doctor
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchResults.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{patient.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">{patient.mrn}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getInsuranceIcon(patient.insuranceInfo?.provider || 'Direct')}
                        <span className="ml-2 text-sm text-gray-900">
                          {patient.insuranceInfo?.provider || 'Cash'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(patient.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {patient.assignedDoctorName || 'Not assigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowDoctorSelection(true);
                        }}
                        disabled={processing}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                      >
                        <User className="w-4 h-4" />
                        <span>Choose Doctor</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Results */}
      {searchTerm.length >= 2 && searchResults.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients Found</h3>
          <p className="text-gray-600">
            No patients found matching "{searchTerm}". Try searching with a different name, MRN, or phone number.
          </p>
        </div>
      )}

      {/* Instructions */}
      {searchTerm.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">How to Check In Returning Patients</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Search for the patient by name, MRN, or phone number</li>
                  <li>Select the correct patient from the search results</li>
                  <li>Click "Check In" to add them to the triage queue</li>
                  <li>The system will assign them to an appropriate doctor</li>
                  <li>Nurses and doctors will be notified automatically</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Patients */}
      {searchTerm.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Patients</h3>
            <p className="text-sm text-gray-600 mt-1">
              Patients who have visited recently (last 30 days)
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients
                .filter(patient => {
                  const lastVisit = new Date(patient.updatedAt);
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return lastVisit > thirtyDaysAgo;
                })
                .slice(0, 6)
                .map((patient) => (
                  <div
                    key={patient.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSearchTerm(`${patient.firstName} ${patient.lastName}`);
                      setSelectedPatient(patient);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{patient.mrn}</div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPatient(patient);
                          setShowDoctorSelection(true);
                        }}
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="Choose Doctor"
                      >
                        <User className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Doctor Selection Modal */}
      {showDoctorSelection && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Doctor for Patient</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient
                </label>
                <div className="text-sm text-gray-900">
                  {selectedPatient.firstName} {selectedPatient.lastName} ({selectedPatient.mrn})
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Doctors
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a doctor...</option>
                  {getAvailableDoctors(selectedPatient).map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.name} ({doctor.role})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDoctorSelection(false);
                    setSelectedPatient(null);
                    setSelectedDoctorId('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedDoctorId) {
                      processReturningPatient(selectedPatient, selectedDoctorId);
                    } else {
                      showWarning('Doctor Selection Required', 'Please select a doctor before checking in the patient.');
                    }
                  }}
                  disabled={!selectedDoctorId || processing}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {processing ? 'Processing...' : 'Check In Patient'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReturningPatientCheckin;
