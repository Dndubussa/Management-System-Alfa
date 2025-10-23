import React, { useState, useEffect } from 'react';
import { User, Stethoscope, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { Patient } from '../../types';

export function ProcessExistingPatients() {
  const { patients, users, addToQueue, addNotification, updatePatient } = useHospital();
  const { user } = useAuth();
  const [unprocessedPatients, setUnprocessedPatients] = useState<Patient[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [showDoctorSelection, setShowDoctorSelection] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  // Find patients who need to be processed
  useEffect(() => {
    const findUnprocessedPatients = () => {
      // Patients who don't have assigned doctors or are missing workflow data
      const unprocessed = patients.filter(patient => 
        !patient.assignedDoctorId || 
        !patient.assignedDoctorName ||
        !patient.assignmentDate
      );
      setUnprocessedPatients(unprocessed);
    };

    findUnprocessedPatients();
  }, [patients]);

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

  // Process a single patient
  const processPatient = async (patient: Patient, doctorId?: string) => {
    try {
      const availableDoctors = getAvailableDoctors(patient);
      if (availableDoctors.length === 0) {
        alert('No doctors available for this patient type');
        return;
      }

      let assignedDoctor;
      
      if (doctorId) {
        // Use manually selected doctor
        assignedDoctor = availableDoctors.find(d => d.id === doctorId);
        if (!assignedDoctor) {
          alert('Selected doctor is not available for this patient type');
          return;
        }
      } else {
        // Auto-assign appropriate doctor
        assignedDoctor = availableDoctors[0];
        if (patient.insuranceInfo?.provider === 'NHIF') {
          const generalDoctors = availableDoctors.filter(d => d.role === 'doctor');
          assignedDoctor = generalDoctors.length > 0 ? generalDoctors[0] : availableDoctors[0];
        }
      }

      // Update patient with assigned doctor
      await updatePatient(patient.id, {
        assignedDoctorId: assignedDoctor.id,
        assignedDoctorName: assignedDoctor.name,
        assignmentDate: new Date().toISOString(),
        assignmentReason: doctorId 
          ? 'Patient manually assigned to selected doctor'
          : patient.insuranceInfo?.provider === 'NHIF' 
            ? 'NHIF patient - assigned to general practitioner' 
            : 'Patient assigned to specialist'
      });

      // Add patient to triage queue
      await addToQueue({
        patientId: patient.id,
        department: 'general',
        priority: 'normal',
        status: 'waiting',
        workflowStage: 'reception',
        assignedDoctorId: assignedDoctor.id,
        assignedDoctorName: assignedDoctor.name,
        assignmentReason: doctorId 
          ? 'Patient manually assigned to selected doctor'
          : patient.insuranceInfo?.provider === 'NHIF' 
            ? 'NHIF patient - assigned to general practitioner' 
            : 'Patient assigned to specialist'
      });

      // Notify nurses
      const nurses = users.filter(u => u.role === 'nurse').map(u => u.id);
      if (nurses.length > 0) {
        addNotification({
          userIds: nurses,
          type: 'triage',
          title: 'Existing Patient Ready for Triage',
          message: `Patient ${patient.firstName} ${patient.lastName} has been processed and is waiting for triage. Assigned to Dr. ${assignedDoctor.name}.`,
          isRead: false,
          patientId: patient.id
        });
      }

      // Notify assigned doctor
      addNotification({
        userIds: [assignedDoctor.id],
        type: 'queue',
        title: 'Patient Assigned',
        message: `Patient ${patient.firstName} ${patient.lastName} has been assigned to you and is waiting for triage.`,
        isRead: false,
        patientId: patient.id
      });

      setProcessedCount(prev => prev + 1);
    } catch (error) {
      console.error('Error processing patient:', error);
      alert('Error processing patient. Please try again.');
    }
  };

  // Process all patients
  const processAllPatients = async () => {
    setProcessing(true);
    setProcessedCount(0);

    for (const patient of unprocessedPatients) {
      await processPatient(patient);
      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setProcessing(false);
    alert(`Successfully processed ${unprocessedPatients.length} patients!`);
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

  if (unprocessedPatients.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">All Patients Processed!</h2>
          <p className="text-gray-600">
            All existing patients have been processed through the new workflow and have assigned doctors.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Process Existing Patients</h1>
          <p className="text-gray-600 mt-1">
            Process patients who were registered before the new workflow implementation
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-600">{unprocessedPatients.length}</div>
          <div className="text-sm text-gray-500">Unprocessed Patients</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <div className="text-sm font-medium text-orange-800">Needs Processing</div>
              <div className="text-2xl font-semibold text-orange-900">{unprocessedPatients.length}</div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <div className="text-sm font-medium text-blue-800">Available Doctors</div>
              <div className="text-2xl font-semibold text-blue-900">
                {users.filter(u => u.role === 'doctor' || u.role === 'ophthalmologist' || u.role === 'radiologist' || u.role === 'physical-therapist').length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <div className="text-sm font-medium text-green-800">Processed Today</div>
              <div className="text-2xl font-semibold text-green-900">{processedCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Bulk Processing</h3>
            <p className="text-sm text-gray-600 mt-1">
              Process all unprocessed patients at once. This will assign doctors and add them to the triage queue.
            </p>
          </div>
          <button
            onClick={processAllPatients}
            disabled={processing || unprocessedPatients.length === 0}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Stethoscope className="w-4 h-4" />
                <span>Process All ({unprocessedPatients.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Unprocessed Patients</h3>
          <p className="text-sm text-gray-600 mt-1">
            Patients who need doctor assignment and triage queue processing
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {unprocessedPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                      Needs Processing
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => processPatient(patient)}
                        className="text-green-600 hover:text-green-900 transition-colors flex items-center space-x-1"
                      >
                        <Stethoscope className="w-4 h-4" />
                        <span>Auto Process</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowDoctorSelection(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 transition-colors flex items-center space-x-1"
                      >
                        <User className="w-4 h-4" />
                        <span>Choose Doctor</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
                      processPatient(selectedPatient, selectedDoctorId);
                      setShowDoctorSelection(false);
                      setSelectedPatient(null);
                      setSelectedDoctorId('');
                    } else {
                      alert('Please select a doctor');
                    }
                  }}
                  disabled={!selectedDoctorId || processing}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {processing ? 'Processing...' : 'Assign & Process'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProcessExistingPatients;
