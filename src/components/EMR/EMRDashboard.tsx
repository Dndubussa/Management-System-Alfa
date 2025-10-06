import React, { useState } from 'react';
import { FileText, Plus, Search, Filter, TestTube, AlertCircle, Heart, Download } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MedicalRecord, Patient } from '../../types';
import { exportEMRToCSV, exportEMRToJSON, exportEMRToText, exportEMRToHTML, downloadFile } from '../../utils/emrExport';

interface EMRDashboardProps {
  onCreateRecord: (patientId: string) => void;
  onViewRecord: (record: MedicalRecord) => void;
}

export function EMRDashboard({ onCreateRecord, onViewRecord }: EMRDashboardProps) {
  const { patients, medicalRecords, labOrders } = useHospital();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [newRecordPatient, setNewRecordPatient] = useState(''); // Separate state for new record dropdown

  // Filter records based on user role
  const userRecords = (user?.role === 'doctor' || user?.role === 'ophthalmologist')
    ? medicalRecords.filter(record => record.doctorId === user.id)
    : medicalRecords;

  // Get completed lab orders for this doctor
  const completedLabOrders = (user?.role === 'doctor' || user?.role === 'ophthalmologist')
    ? labOrders.filter(order => order.doctorId === user.id && order.status === 'completed' && order.results)
    : [];
  const filteredRecords = userRecords.filter(record => {
    const patient = patients.find(p => p.id === record.patientId);
    if (!patient) return false;

    const matchesSearch = searchTerm === '' || 
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPatient = selectedPatient === '' || record.patientId === selectedPatient;

    return matchesSearch && matchesPatient;
  });

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateNewRecord = () => {
    // If a patient is already selected, navigate directly to the new record form
    if (newRecordPatient) {
      navigate(`/emr/new/${newRecordPatient}`);
    }
  };

  // Export all records for selected patient or all records if no patient selected
  const handleExportAllCSV = () => {
    let recordsToExport = userRecords;
    let patientInfo: Patient | null = null;
    
    if (selectedPatient) {
      recordsToExport = userRecords.filter(record => record.patientId === selectedPatient);
      patientInfo = patients.find(p => p.id === selectedPatient) || null;
    }
    
    if (recordsToExport.length === 0) {
      alert('No records to export');
      return;
    }
    
    if (patientInfo) {
      const csvContent = exportEMRToCSV(patientInfo, recordsToExport);
      downloadFile(csvContent, `emr-${patientInfo.firstName}-${patientInfo.lastName}-all-records.csv`, 'text/csv');
    } else {
      // Export all records (this is a simplified version)
      let csvContent = 'All Medical Records Export\n';
      csvContent += 'Generated on: ' + new Date().toLocaleString() + '\n\n';
      csvContent += 'Patient,Visit Date,Chief Complaint,Diagnosis,Treatment,Status\n';
      
      recordsToExport.forEach(record => {
        const patient = patients.find(p => p.id === record.patientId);
        const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
        csvContent += `"${patientName}","${formatDate(record.visitDate)}","${record.chiefComplaint}","${record.diagnosis}","${record.treatment}",${record.status}\n`;
      });
      
      downloadFile(csvContent, 'all-medical-records.csv', 'text/csv');
    }
  };

  const handleExportAllJSON = () => {
    let recordsToExport = userRecords;
    let patientInfo: Patient | null = null;
    
    if (selectedPatient) {
      recordsToExport = userRecords.filter(record => record.patientId === selectedPatient);
      patientInfo = patients.find(p => p.id === selectedPatient) || null;
    }
    
    if (recordsToExport.length === 0) {
      alert('No records to export');
      return;
    }
    
    if (patientInfo) {
      const jsonContent = exportEMRToJSON(patientInfo, recordsToExport);
      downloadFile(jsonContent, `emr-${patientInfo.firstName}-${patientInfo.lastName}-all-records.json`, 'application/json');
    } else {
      // Export all records
      const exportData = {
        exportDate: new Date().toISOString(),
        records: recordsToExport.map(record => {
          const patient = patients.find(p => p.id === record.patientId);
          return {
            patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
            ...record
          };
        })
      };
      
      const jsonContent = JSON.stringify(exportData, null, 2);
      downloadFile(jsonContent, 'all-medical-records.json', 'application/json');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Heart className="w-6 h-6 text-red-500 mr-2" />
            Electronic Medical Records
          </h2>
          <div className="flex space-x-3">
            {(user?.role === 'doctor' || user?.role === 'ophthalmologist') && (
              <>
                <select
                  value={newRecordPatient}
                  onChange={(e) => setNewRecordPatient(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleCreateNewRecord}
                  disabled={!newRecordPatient}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    newRecordPatient
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Record
                </button>
              </>
            )}
            <div className="relative group">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-10">
                <button
                  onClick={handleExportAllCSV}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export All as CSV
                </button>
                <button
                  onClick={handleExportAllJSON}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export All as JSON
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lab Results Alert for Doctors */}
        {(user?.role === 'doctor' || user?.role === 'ophthalmologist') && completedLabOrders.length > 0 && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <TestTube className="w-5 h-5 text-green-600 mr-2" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800">New Lab Results Available</h3>
                <p className="text-sm text-green-700 mt-1">
                  {completedLabOrders.length} lab test{completedLabOrders.length > 1 ? 's have' : ' has'} been completed and results are ready for review.
                </p>
              </div>
              <AlertCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="mt-3 space-y-2">
              {completedLabOrders.slice(0, 3).map(order => {
                const patient = patients.find(p => p.id === order.patientId);
                return (
                  <div key={order.id} className="text-sm text-green-700 bg-green-100 rounded px-3 py-2">
                    <strong>{order.testName}</strong> for {patient?.firstName} {patient?.lastName} - 
                    <span className="ml-1">Completed {order.completedAt ? new Date(order.completedAt).toLocaleDateString() : 'recently'}</span>
                  </div>
                );
              })}
              {completedLabOrders.length > 3 && (
                <div className="text-sm text-green-600 font-medium">
                  +{completedLabOrders.length - 3} more results available
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by patient name, diagnosis, or complaint..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Patients</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.firstName} {patient.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
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
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm || selectedPatient 
                    ? 'No medical records found matching your criteria.' 
                    : 'No medical records available.'}
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getPatientName(record.patientId)}
                    </div>
                    <div className="text-sm text-gray-500">ID: {record.patientId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(record.visitDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.chiefComplaint}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.diagnosis}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onViewRecord(record)}
                      className="text-green-600 hover:text-green-900 transition-colors flex items-center space-x-1"
                    >
                      <FileText className="w-4 h-4" />
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
  );
}