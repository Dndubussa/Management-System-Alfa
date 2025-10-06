import React, { useState } from 'react';
import { Pill, Search, Filter, Check, X } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';

export function PrescriptionList() {
  const { prescriptions, patients, updatePrescriptionStatus, addNotification } = useHospital();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Filter prescriptions based on user role
  const userPrescriptions = user?.role === 'doctor' 
    ? prescriptions.filter(p => p.doctorId === user.id)
    : prescriptions;

  const filteredPrescriptions = userPrescriptions.filter(prescription => {
    const patient = patients.find(p => p.id === prescription.patientId);
    if (!patient) return false;

    const matchesSearch = searchTerm === '' || 
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medication.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === '' || prescription.status === statusFilter;

    return matchesSearch && matchesStatus;
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'dispensed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (prescriptionId: string, newStatus: 'dispensed' | 'cancelled') => {
    updatePrescriptionStatus(prescriptionId, newStatus);
    
    const prescription = prescriptions.find(p => p.id === prescriptionId);
    if (prescription) {
      const patient = patients.find(p => p.id === prescription.patientId);
      addNotification({
        userIds: [prescription.doctorId],
        type: 'prescription',
        title: `Prescription ${newStatus}`,
        message: `${prescription.medication} for ${patient?.firstName} ${patient?.lastName} has been ${newStatus}`,
        isRead: false
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Prescriptions</h2>
          <div className="flex items-center space-x-2">
            <Pill className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">
              {filteredPrescriptions.filter(p => p.status === 'pending').length} pending
            </span>
          </div>
        </div>

        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by patient name or medication..."
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
            <option value="pending">Pending</option>
            <option value="dispensed">Dispensed</option>
            <option value="cancelled">Cancelled</option>
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
                Medication
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dosage & Frequency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prescribed
              </th>
              {user?.role === 'pharmacy' && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPrescriptions.length === 0 ? (
              <tr>
                <td colSpan={user?.role === 'pharmacy' ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm || statusFilter 
                    ? 'No prescriptions found matching your criteria.' 
                    : 'No prescriptions available.'}
                </td>
              </tr>
            ) : (
              filteredPrescriptions.map((prescription) => (
                <tr key={prescription.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getPatientName(prescription.patientId)}
                    </div>
                    <div className="text-sm text-gray-500">ID: {prescription.patientId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{prescription.medication}</div>
                    {prescription.instructions && (
                      <div className="text-sm text-gray-500">{prescription.instructions}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{prescription.dosage}</div>
                    <div className="text-sm text-gray-500">{prescription.frequency}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prescription.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(prescription.status)}`}>
                      {prescription.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(prescription.createdAt)}
                  </td>
                  {user?.role === 'pharmacy' && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {prescription.status === 'pending' && (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleStatusChange(prescription.id, 'dispensed')}
                            className="text-green-600 hover:text-green-900 transition-colors flex items-center space-x-1"
                            title="Mark as Dispensed"
                          >
                            <Check className="w-4 h-4" />
                            <span>Dispense</span>
                          </button>
                          <button
                            onClick={() => handleStatusChange(prescription.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900 transition-colors flex items-center space-x-1"
                            title="Cancel Prescription"
                          >
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}