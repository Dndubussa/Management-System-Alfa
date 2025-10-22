import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader, Shield, CreditCard } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useNHIF } from '../../hooks/useNHIF';
import { Patient } from '../../types';
import { NHIFValidationResponse } from '../../types/nhif';

interface InsuranceValidationProps {
  patient: Patient;
  onValidationComplete: (isValid: boolean, validationData?: any) => void;
  onCancel: () => void;
}

export function InsuranceValidation({ patient, onValidationComplete, onCancel }: InsuranceValidationProps) {
  const { updatePatient } = useHospital();
  const { validatePatient, isLoading, error } = useNHIF();
  const [validationResult, setValidationResult] = useState<NHIFValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStep, setValidationStep] = useState<'initial' | 'validating' | 'validated' | 'error'>('initial');

  // Auto-validate if patient has NHIF
  useEffect(() => {
    if (patient.insuranceInfo?.provider === 'NHIF' && patient.insuranceInfo.membershipNumber) {
      handleValidateInsurance();
    } else if (patient.insuranceInfo?.provider && patient.insuranceInfo.provider !== 'Direct' && patient.insuranceInfo.provider !== 'Lipa Kwa Simu') {
      // For private insurance, just mark as validated
      setValidationStep('validated');
      setValidationResult({
        isValid: true,
        message: 'Private insurance - validation not required',
        patient: {
          membershipNumber: patient.insuranceInfo.membershipNumber,
          firstName: patient.firstName,
          lastName: patient.lastName
        }
      });
    }
  }, [patient]);

  const handleValidateInsurance = async () => {
    if (!patient.insuranceInfo?.membershipNumber) return;

    setIsValidating(true);
    setValidationStep('validating');

    try {
      const result = await validatePatient(patient.insuranceInfo.membershipNumber);
      setValidationResult(result);
      
      if (result.isValid) {
        setValidationStep('validated');
        // Update patient with validation data
        await updatePatient(patient.id, {
          insuranceInfo: {
            ...patient.insuranceInfo,
            validationStatus: 'validated',
            validationDate: new Date().toISOString(),
            benefits: result.benefits
          }
        });
      } else {
        setValidationStep('error');
      }
    } catch (err) {
      console.error('Insurance validation error:', err);
      setValidationStep('error');
    } finally {
      setIsValidating(false);
    }
  };

  const handleContinue = () => {
    onValidationComplete(validationResult?.isValid || false, validationResult);
  };

  const handleRetry = () => {
    setValidationStep('initial');
    setValidationResult(null);
    handleValidateInsurance();
  };

  const getInsuranceIcon = () => {
    switch (patient.insuranceInfo?.provider) {
      case 'NHIF':
        return <Shield className="w-8 h-8 text-blue-600" />;
      case 'AAR':
      case 'Jubilee':
        return <CreditCard className="w-8 h-8 text-green-600" />;
      default:
        return <CreditCard className="w-8 h-8 text-gray-600" />;
    }
  };

  const getInsuranceProviderName = () => {
    switch (patient.insuranceInfo?.provider) {
      case 'NHIF':
        return 'National Health Insurance Fund (NHIF)';
      case 'AAR':
        return 'AAR Insurance';
      case 'Jubilee':
        return 'Jubilee Insurance';
      default:
        return patient.insuranceInfo?.provider || 'Unknown Provider';
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {getInsuranceIcon()}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Insurance Validation</h2>
              <p className="text-sm text-gray-600">Validating insurance coverage for patient</p>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Patient Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 font-medium">{patient.firstName} {patient.lastName}</span>
            </div>
            <div>
              <span className="text-gray-600">MRN:</span>
              <span className="ml-2 font-medium">{patient.mrn}</span>
            </div>
            <div>
              <span className="text-gray-600">Insurance Provider:</span>
              <span className="ml-2 font-medium">{getInsuranceProviderName()}</span>
            </div>
            <div>
              <span className="text-gray-600">Membership Number:</span>
              <span className="ml-2 font-medium">{patient.insuranceInfo?.membershipNumber}</span>
            </div>
          </div>
        </div>

        {/* Validation Status */}
        {validationStep === 'initial' && (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Validate</h3>
            <p className="text-gray-600 mb-4">Click below to validate the patient's insurance coverage.</p>
            <button
              onClick={handleValidateInsurance}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Validate Insurance
            </button>
          </div>
        )}

        {validationStep === 'validating' && (
          <div className="text-center py-8">
            <Loader className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Validating Insurance</h3>
            <p className="text-gray-600">Please wait while we verify the patient's insurance coverage...</p>
          </div>
        )}

        {validationStep === 'validated' && validationResult && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-medium text-green-900">Insurance Validated Successfully</h3>
                <p className="text-sm text-green-700">{validationResult.message}</p>
              </div>
            </div>

            {/* NHIF Benefits (if applicable) */}
            {patient.insuranceInfo?.provider === 'NHIF' && validationResult.benefits && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">Coverage Benefits</h4>
                <div className="space-y-2">
                  {validationResult.benefits.map((benefit, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-blue-800">{benefit.serviceName}</span>
                      <span className="font-medium text-blue-900">
                        {benefit.coverage}% covered
                        {benefit.remainingLimit && (
                          <span className="text-blue-700 ml-2">
                            (Limit: {benefit.remainingLimit.toLocaleString()} TZS)
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Continue to Triage
              </button>
            </div>
          </div>
        )}

        {validationStep === 'error' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-medium text-red-900">Insurance Validation Failed</h3>
                <p className="text-sm text-red-700">
                  {validationResult?.message || error || 'Unable to validate insurance coverage'}
                </p>
              </div>
            </div>

            {/* Error Actions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">What to do next:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Verify the membership number is correct</li>
                <li>• Check if the patient's insurance is active</li>
                <li>• Contact the insurance provider if needed</li>
                <li>• You can still proceed with cash payment</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel Registration
              </button>
              <button
                onClick={handleRetry}
                className="px-4 py-2 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors"
              >
                Retry Validation
              </button>
              <button
                onClick={() => onValidationComplete(false, validationResult)}
                className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                Continue with Cash Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InsuranceValidation;
