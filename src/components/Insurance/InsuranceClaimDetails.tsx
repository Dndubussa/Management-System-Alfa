import React from 'react';
import { X, Download, Printer, CheckCircle, XCircle } from 'lucide-react';
import { InsuranceClaim } from '../../types';
import { useHospital } from '../../context/HospitalContext';

interface InsuranceClaimDetailsProps {
  claim: InsuranceClaim;
  onClose: () => void;
}

export function InsuranceClaimDetails({ claim, onClose }: InsuranceClaimDetailsProps) {
  const { patients, bills, updateInsuranceClaimStatus } = useHospital();
  
  const patient = patients.find(p => p.id === claim.patientId);
  const bill = bills.find(b => b.id === claim.billId);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sw-TZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = () => {
    updateInsuranceClaimStatus(claim.id, 'approved');
    onClose();
  };

  const handleReject = () => {
    const reason = prompt('Enter rejection reason:');
    if (reason !== null) {
      updateInsuranceClaimStatus(claim.id, 'rejected', reason);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Insurance Claim Details</h2>
              <p className="text-gray-600 mt-1">Claim ID: #{claim.id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Patient Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Insurance Provider:</span>
                  <span className="font-medium">{claim.insuranceProvider}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Membership Number:</span>
                  <span className="font-medium">{claim.membershipNumber}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Claim Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">NHIF Claim Number:</span>
                  <span className="font-medium">{claim.nhifClaimNumber || 'Not assigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                    {claim.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Submission Date:</span>
                  <span className="font-medium">{formatDate(claim.submissionDate)}</span>
                </div>
                {claim.approvalDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approval Date:</span>
                    <span className="font-medium">{formatDate(claim.approvalDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Financial Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Claim Amount:</span>
                <span className="font-medium">{formatCurrency(claim.claimAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Claimed Amount:</span>
                <span className="font-medium">{formatCurrency(claim.claimedAmount)}</span>
              </div>
              {bill && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Original Bill Amount:</span>
                  <span className="font-medium">{formatCurrency(bill.total)}</span>
                </div>
              )}
            </div>
          </div>

          {claim.notes && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Notes</h3>
              <p className="text-gray-700">{claim.notes}</p>
            </div>
          )}

          {claim.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-red-900 mb-3">Rejection Reason</h3>
              <p className="text-red-700">{claim.rejectionReason}</p>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </button>
              <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500">
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
            
            <div className="flex space-x-3">
              {claim.status === 'submitted' && (
                <>
                  <button
                    onClick={handleReject}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Reject Claim
                  </button>
                  <button
                    onClick={handleApprove}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Approve Claim
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}