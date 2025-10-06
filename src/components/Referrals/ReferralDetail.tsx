import React from 'react';
import { X, User, Stethoscope, FileText, Calendar, AlertCircle } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Referral } from '../../types';

interface ReferralDetailProps {
  referral: Referral;
  onClose: () => void;
  onUpdateStatus: (status: Referral['status']) => void;
}

export function ReferralDetail({ referral, onClose, onUpdateStatus }: ReferralDetailProps) {
  const { patients } = useHospital();
  
  const patient = patients.find(p => p.id === referral.patientId);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Referral Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2 text-green-600" />
                Patient Information
              </h3>
              {patient ? (
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Name:</span> {patient.firstName} {patient.lastName}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">ID:</span> {patient.id}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Phone:</span> {patient.phone}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Patient information not available</p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <Stethoscope className="w-5 h-5 mr-2 text-green-600" />
                Referral Information
              </h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Specialist:</span> {referral.specialist}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Status:</span> 
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(referral.status)}`}>
                    {referral.status}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium">Created:</span> {formatDate(referral.createdAt)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Last Updated:</span> {formatDate(referral.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-green-600" />
              Reason for Referral
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">{referral.reason}</p>
            </div>
          </div>

          {referral.notes && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-600" />
                Additional Notes
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{referral.notes}</p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-green-600" />
              Update Referral Status
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onUpdateStatus('accepted')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                Accept
              </button>
              <button
                onClick={() => onUpdateStatus('rejected')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Reject
              </button>
              <button
                onClick={() => onUpdateStatus('completed')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Mark Completed
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}