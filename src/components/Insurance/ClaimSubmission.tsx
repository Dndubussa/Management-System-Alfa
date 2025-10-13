import React, { useState } from 'react';
import { Search, FileText, Plus, Trash2, Save, CheckCircle } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export function ClaimSubmission() {
  const { patients, bills, insuranceClaims, submitInsuranceClaim } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [claimDetails, setClaimDetails] = useState({
    diagnosis: '',
    procedureCodes: '',
    notes: ''
  });

  const filteredPatients = patients.filter(patient => 
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const patientBills = selectedPatient 
    ? bills.filter(bill => bill.patientId === selectedPatient.id) 
    : [];

  const handleSubmitClaim = () => {
    if (selectedBill && selectedPatient) {
      submitInsuranceClaim({
        billId: selectedBill.id,
        patientId: selectedPatient.id,
        insuranceProvider: selectedPatient.insuranceInfo.provider,
        membershipNumber: selectedPatient.insuranceInfo.membershipNumber,
        claimAmount: selectedBill.total,
        claimedAmount: selectedBill.total,
        nhifClaimNumber: `NHIF-${Date.now()}`,
        notes: claimDetails.notes
      });
      
      alert('Claim submitted successfully!');
      setSelectedBill(null);
      setSelectedPatient(null);
      setClaimDetails({
        diagnosis: '',
        procedureCodes: '',
        notes: ''
      });
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Claim Forms & Submission</h1>
        <p className="text-gray-600 mt-1">
          Prepare and submit insurance claims for patient services
        </p>
      </div>

      {/* Patient Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Select Patient</h2>
        <div className="flex space-x-4">
          <div className="flex-1 relative">
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
                        <div className="text-sm font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
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
                          Select Patient
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

      {/* Patient Bills */}
      {selectedPatient && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Bills for {selectedPatient.firstName} {selectedPatient.lastName}
              </h2>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Change Patient
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bill ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (TZS)
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
                {patientBills.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No bills available for this patient.
                    </td>
                  </tr>
                ) : (
                  patientBills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{bill.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(bill.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(bill.total)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                          bill.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedBill(bill)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          disabled={bill.status !== 'pending'}
                        >
                          {bill.status === 'pending' ? 'Create Claim' : 'Already Claimed'}
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

      {/* Claim Form */}
      {selectedBill && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Create Insurance Claim</h2>
              <button
                onClick={() => setSelectedBill(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
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
                    <span className="text-gray-600">Insurance Provider:</span>
                    <span className="font-medium">{selectedPatient.insuranceInfo.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Membership Number:</span>
                    <span className="font-medium">{selectedPatient.insuranceInfo.membershipNumber}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Bill Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bill ID:</span>
                    <span className="font-medium">#{selectedBill.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">{formatCurrency(selectedBill.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date Created:</span>
                    <span className="font-medium">{formatDate(selectedBill.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Claim Details</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Diagnosis (ICD-10 Code)
                  </label>
                  <input
                    type="text"
                    value={claimDetails.diagnosis}
                    onChange={(e) => setClaimDetails({...claimDetails, diagnosis: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter primary diagnosis"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Procedure Codes (MoH/Insurer Tariff Codes)
                  </label>
                  <input
                    type="text"
                    value={claimDetails.procedureCodes}
                    onChange={(e) => setClaimDetails({...claimDetails, procedureCodes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter procedure codes separated by commas"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes & Additional Information
                  </label>
                  <textarea
                    value={claimDetails.notes}
                    onChange={(e) => setClaimDetails({...claimDetails, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter any additional information for the claim..."
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleSubmitClaim}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <FileText className="w-4 h-4 mr-2" />
                Submit Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}