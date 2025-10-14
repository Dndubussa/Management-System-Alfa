import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Send, 
  Search, 
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import { useNHIF } from '../../hooks/useNHIF';
import { useHospital } from '../../context/HospitalContext';
import { Bill, Patient } from '../../types';
import { NHIFClaim, NHIFClaimResponse, NHIFValidationResponse } from '../../types/nhif';

interface NHIFClaimsProps {
  bill: Bill;
  onClaimSubmitted: (response: NHIFClaimResponse) => void;
}

export function NHIFClaims({ bill, onClaimSubmitted }: NHIFClaimsProps) {
  const { patients, users } = useHospital();
  const { 
    isLoading, 
    error, 
    validatePatient, 
    submitClaim, 
    checkClaimStatus,
    clearError 
  } = useNHIF();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [validationResult, setValidationResult] = useState<NHIFValidationResponse | null>(null);
  const [claimStatus, setClaimStatus] = useState<NHIFClaimResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find patient
  useEffect(() => {
    const foundPatient = patients.find(p => p.id === bill.patientId);
    setPatient(foundPatient || null);
  }, [bill.patientId, patients]);

  // Auto-validate patient when component loads
  useEffect(() => {
    if (patient?.insuranceInfo?.provider === 'NHIF' && patient.insuranceInfo.membershipNumber) {
      handleValidatePatient();
    }
  }, [patient]);

  const handleValidatePatient = async () => {
    if (!patient?.insuranceInfo?.membershipNumber) return;

    setIsValidating(true);
    clearError();
    
    try {
      const result = await validatePatient(patient.insuranceInfo.membershipNumber);
      setValidationResult(result);
    } catch (err) {
      console.error('Validation error:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmitClaim = async () => {
    if (!patient || !validationResult?.isValid) return;

    setIsSubmitting(true);
    clearError();

    try {
      // Create NHIF claim
      const claim: NHIFClaim = {
        claimId: `NHIF-${Date.now()}`,
        patientMembershipNumber: patient.insuranceInfo.membershipNumber,
        facilityCode: 'ALFA001', // Your facility code
        admissionDate: new Date().toISOString(),
        claimType: 'outpatient',
        totalAmount: bill.total,
        items: bill.items.map(item => ({
          serviceCode: item.serviceId, // This should be mapped to SHA codes
          serviceName: item.serviceName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalAmount: item.totalPrice,
          diagnosisCode: 'ICD11-UNKNOWN', // Should be mapped to actual ICD-11 codes
          practitionerId: 'PRAC001' // Should be mapped to actual practitioner ID
        })),
        diagnoses: [
          {
            icd11Code: 'ICD11-UNKNOWN',
            description: 'Primary diagnosis',
            isPrimary: true
          }
        ],
        practitionerId: 'PRAC001',
        notes: `Bill ID: ${bill.id}`
      };

      const result = await submitClaim(claim);
      setClaimStatus(result);
      onClaimSubmitted(result);
    } catch (err) {
      console.error('Claim submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!claimStatus?.claimId) return;

    try {
      const result = await checkClaimStatus(claimStatus.claimId);
      setClaimStatus(result);
    } catch (err) {
      console.error('Status check error:', err);
    }
  };

  if (!patient) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <XCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">Patient not found</span>
        </div>
      </div>
    );
  }

  if (patient.insuranceInfo.provider !== 'NHIF') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-gray-600" />
          <span className="text-gray-800">Patient is not covered by NHIF</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">NHIF Claims Processing</h3>
        </div>
        {claimStatus && (
          <button
            onClick={handleCheckStatus}
            disabled={isLoading}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Check Status</span>
          </button>
        )}
      </div>

      {/* Patient Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Patient Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Name:</span>
            <span className="ml-2 font-medium">{patient.firstName} {patient.lastName}</span>
          </div>
          <div>
            <span className="text-blue-700">Membership Number:</span>
            <span className="ml-2 font-mono font-medium">{patient.insuranceInfo.membershipNumber}</span>
          </div>
        </div>
      </div>

      {/* Validation Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Membership Validation</h4>
          <button
            onClick={handleValidatePatient}
            disabled={isValidating}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50"
          >
            <Search className={`w-4 h-4 ${isValidating ? 'animate-spin' : ''}`} />
            <span>{isValidating ? 'Validating...' : 'Validate'}</span>
          </button>
        </div>

        {validationResult && (
          <div className={`flex items-center space-x-2 p-3 rounded-md ${
            validationResult.isValid 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {validationResult.isValid ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={validationResult.isValid ? 'text-green-800' : 'text-red-800'}>
              {validationResult.message}
            </span>
          </div>
        )}

        {validationResult?.benefits && validationResult.benefits.length > 0 && (
          <div className="mt-3">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Coverage Benefits:</h5>
            <div className="space-y-1">
              {validationResult.benefits.map((benefit, index) => (
                <div key={index} className="text-sm text-gray-600">
                  <span className="font-medium">{benefit.serviceName}</span>
                  <span className="ml-2">({benefit.coverage}% covered)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Claim Status */}
      {claimStatus && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Claim Status</h4>
          <div className={`flex items-center space-x-2 p-3 rounded-md ${
            claimStatus.status === 'approved' 
              ? 'bg-green-50 border border-green-200'
              : claimStatus.status === 'rejected'
              ? 'bg-red-50 border border-red-200'
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            {claimStatus.status === 'approved' && <CheckCircle className="w-5 h-5 text-green-600" />}
            {claimStatus.status === 'rejected' && <XCircle className="w-5 h-5 text-red-600" />}
            {claimStatus.status === 'pending' && <Clock className="w-5 h-5 text-yellow-600" />}
            <div className="flex-1">
              <div className="font-medium">
                {claimStatus.status === 'approved' && 'Claim Approved'}
                {claimStatus.status === 'rejected' && 'Claim Rejected'}
                {claimStatus.status === 'pending' && 'Claim Pending'}
              </div>
              <div className="text-sm opacity-75">{claimStatus.message}</div>
              {claimStatus.approvedAmount && (
                <div className="text-sm font-medium text-green-700">
                  Approved Amount: {claimStatus.approvedAmount.toLocaleString()} TZS
                </div>
              )}
              {claimStatus.rejectionReason && (
                <div className="text-sm text-red-700">
                  Reason: {claimStatus.rejectionReason}
                </div>
              )}
              {claimStatus.referenceNumber && (
                <div className="text-sm text-gray-600">
                  Reference: {claimStatus.referenceNumber}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        {!claimStatus && validationResult?.isValid && (
          <button
            onClick={handleSubmitClaim}
            disabled={isSubmitting || isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Claim'}</span>
          </button>
        )}
        
        {claimStatus && (
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <Download className="w-4 h-4" />
            <span>Print Claim</span>
          </button>
        )}
      </div>
    </div>
  );
}
