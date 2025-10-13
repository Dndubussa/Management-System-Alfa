import React, { useState } from 'react';
import { FileText, User, Search, Heart, Activity, Calendar, Eye } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Patient, MedicalRecord } from '../../types';

export function PTEMR() {
  const { patients, medicalRecords } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  const filteredPatients = patients.filter(patient => 
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setSelectedRecord(null);
  };

  const handleRecordSelect = (record: MedicalRecord) => {
    setSelectedRecord(record);
  };

  const handleBackToPatients = () => {
    setSelectedPatient(null);
    setSelectedRecord(null);
  };

  const handleBackToRecords = () => {
    setSelectedRecord(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sw-TZ');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('sw-TZ', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (selectedRecord) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Medical Record</h1>
              <p className="text-gray-600 mt-1">
                Detailed view of patient's medical history
              </p>
            </div>
            <button
              onClick={handleBackToRecords}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Back to Records
            </button>
          </div>
        </div>

        {/* Patient Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-500" />
            </div>
            <div className="ml-6">
              <h3 className="text-xl font-medium text-gray-900">
                {selectedPatient && `${selectedPatient.firstName} ${selectedPatient.lastName}`}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                <div>
                  <p className="text-sm text-gray-500">MRN</p>
                  <p className="font-medium">{selectedPatient?.mrn}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium">
                    {selectedPatient ? calculateAge(selectedPatient.dateOfBirth) : ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium capitalize">{selectedPatient?.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Visit Date</p>
                  <p className="font-medium">{formatDate(selectedRecord.visitDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Record Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Medical Record Details</h3>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Chief Complaint */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Chief Complaint</h4>
              <p className="text-gray-700">{selectedRecord.chiefComplaint}</p>
            </div>

            {/* Diagnosis */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Diagnosis</h4>
              <p className="text-gray-700">{selectedRecord.diagnosis}</p>
              
              {selectedRecord.diagnosisCodes.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Diagnosis Codes</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecord.diagnosisCodes.map((code, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {code.code} - {code.description}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Treatment */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Treatment Plan</h4>
              <p className="text-gray-700">{selectedRecord.treatment}</p>
            </div>

            {/* Notes */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Clinical Notes</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{selectedRecord.notes}</p>
            </div>

            {/* Vitals */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Vital Signs</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Blood Pressure</p>
                  <p className="font-medium">{selectedRecord.vitals.bloodPressure}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Heart Rate</p>
                  <p className="font-medium">{selectedRecord.vitals.heartRate} bpm</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Temperature</p>
                  <p className="font-medium">{selectedRecord.vitals.temperature}°C</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-medium">{selectedRecord.vitals.weight} kg</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Height</p>
                  <p className="font-medium">{selectedRecord.vitals.height} cm</p>
                </div>
              </div>
            </div>

            {/* Prescriptions */}
            {selectedRecord.prescriptions.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Prescriptions</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Medication
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dosage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Frequency
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedRecord.prescriptions.map((prescription) => (
                        <tr key={prescription.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {prescription.medication}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {prescription.dosage}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {prescription.frequency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {prescription.duration}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              prescription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              prescription.status === 'dispensed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {prescription.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Lab Orders */}
            {selectedRecord.labOrders.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Lab Orders</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Test Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Instructions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Results
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedRecord.labOrders.map((labOrder) => (
                        <tr key={labOrder.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {labOrder.testName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {labOrder.instructions}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              labOrder.status === 'ordered' ? 'bg-blue-100 text-blue-800' :
                              labOrder.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                              labOrder.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {labOrder.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {labOrder.results || 'Pending'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (selectedPatient) {
    // Filter records for this patient
    const patientRecords = medicalRecords.filter(record => record.patientId === selectedPatient.id);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Medical Records</h1>
              <p className="text-gray-600 mt-1">
                View complete medical history for {selectedPatient.firstName} {selectedPatient.lastName}
              </p>
            </div>
            <button
              onClick={handleBackToPatients}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Back to Patient List
            </button>
          </div>
        </div>

        {/* Patient Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-500" />
            </div>
            <div className="ml-6">
              <h3 className="text-xl font-medium text-gray-900">
                {`${selectedPatient.firstName} ${selectedPatient.lastName}`}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                <div>
                  <p className="text-sm text-gray-500">MRN</p>
                  <p className="font-medium">{selectedPatient.mrn}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium">{calculateAge(selectedPatient.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium capitalize">{selectedPatient.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Records</p>
                  <p className="font-medium">{patientRecords.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Records List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Medical Records</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visit Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chief Complaint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnosis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prescriptions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patientRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No medical records found for this patient.
                    </td>
                  </tr>
                ) : (
                  patientRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(record.visitDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {record.chiefComplaint}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {record.diagnosis}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {record.prescriptions.length}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          record.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRecordSelect(record)}
                          className="text-green-600 hover:text-green-900 transition-colors flex items-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Patient Selection View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Patient History (EMR Access)</h1>
        <p className="text-gray-600 mt-1">
          Access complete medical records for patients under physiotherapy
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by patient name or MRN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Patients Under Physiotherapy</h3>
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
                  Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Records
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'No patients found matching your criteria.' : 'No patients available.'}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  // Filter records for this patient
                  const patientRecords = medicalRecords.filter(record => record.patientId === patient.id);
                  
                  return (
                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {`${patient.firstName} ${patient.lastName}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {patient.mrn}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {calculateAge(patient.dateOfBirth)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {patient.gender}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {patientRecords.length}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handlePatientSelect(patient)}
                          className="text-green-600 hover:text-green-900 transition-colors flex items-center space-x-1"
                        >
                          <FileText className="w-4 h-4" />
                          <span>View Records</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}