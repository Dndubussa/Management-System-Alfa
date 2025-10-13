import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, User, Calendar, Phone } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export function InsuranceVerification() {
  const { patients } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'invalid'>('pending');

  const filteredPatients = patients.filter(patient => 
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.insuranceInfo.membershipNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVerifyInsurance = () => {
    // In a real implementation, this would connect to an insurance API
    // For now, we'll simulate a verification based on the insurance info provided
    setIsVerifying(true);
    setVerificationStatus('verifying');
    
    setTimeout(() => {
      // Simulate verification based on insurance provider and membership number
      const provider = selectedPatient?.insuranceInfo?.provider?.toLowerCase() || '';
      const membershipNumber = selectedPatient?.insuranceInfo?.membershipNumber || '';
      
      // Basic validation - in real implementation, this would be an API call
      const isVerified = provider && membershipNumber && 
                        membershipNumber.length >= 5 && 
                        !provider.includes('invalid');
      
      setVerificationStatus(isVerified ? 'verified' : 'invalid');
      setIsVerifying(false);
    }, 1500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sw-TZ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Patient Insurance Verification</h1>
        <p className="text-gray-600 mt-1">
          Verify patient insurance details before processing claims
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by patient name, MRN, or insurance number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Patient Search Results */}
      {searchTerm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Search Results</h2>
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
                    Insurance Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membership Number
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No patients found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(patient.dateOfBirth)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.mrn}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.insuranceInfo.provider}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.insuranceInfo.membershipNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          Verify Insurance
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insurance Verification Panel */}
      {selectedPatient && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Insurance Verification</h2>
            <p className="text-gray-600 mt-1">
              Verify insurance details for {selectedPatient.firstName} {selectedPatient.lastName}
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Patient Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">MRN:</span>
                    <span className="font-medium">{selectedPatient.mrn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date of Birth:</span>
                    <span className="font-medium">{formatDate(selectedPatient.dateOfBirth)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{selectedPatient.phone}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Insurance Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Provider:</span>
                    <span className="font-medium">{selectedPatient.insuranceInfo.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Membership Number:</span>
                    <span className="font-medium">{selectedPatient.insuranceInfo.membershipNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Policy Validity:</span>
                    <span className="font-medium">2025-12-31</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Co-payment:</span>
                    <span className="font-medium">10%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mb-6">
              {verificationStatus === 'pending' ? (
                <button
                  onClick={handleVerifyInsurance}
                  className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Verify Insurance
                </button>
              ) : verificationStatus === 'verified' ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-6 h-6 mr-2" />
                  <span className="text-lg font-medium">Insurance Verified Successfully</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <XCircle className="w-6 h-6 mr-2" />
                  <span className="text-lg font-medium">Insurance Verification Failed</span>
                </div>
              )}
            </div>
            
            {verificationStatus !== 'pending' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Verification Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verification Date:</span>
                    <span className="font-medium">{new Date().toLocaleString('sw-TZ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verified By:</span>
                    <span className="font-medium">Insurance Officer</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coverage Details:</span>
                    <span className="font-medium">Consultation, Drugs, Labs, Radiology, Surgery</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setSelectedPatient(null);
                  setVerificationStatus('pending');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}