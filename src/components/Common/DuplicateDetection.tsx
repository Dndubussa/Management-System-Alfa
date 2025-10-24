import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Search, User, Phone, CreditCard, Calendar } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useToast } from '../../context/ToastContext';
import { 
  checkDuplicatePatient, 
  checkDuplicateUser, 
  checkDuplicateAppointment,
  checkDuplicateMedicalRecord,
  DuplicateCheckResult,
  formatDuplicateResult,
  getDuplicateIcon
} from '../../utils/duplicateDetection';
import { Patient, Appointment, MedicalRecord } from '../../types';

interface DuplicateDetectionProps {
  type: 'patient' | 'user' | 'appointment' | 'medical_record';
  data: Partial<Patient> | Partial<Appointment> | Partial<MedicalRecord> | any;
  onDuplicateFound?: (result: DuplicateCheckResult) => void;
  onNoDuplicate?: () => void;
  showSuggestions?: boolean;
  autoCheck?: boolean;
}

export function DuplicateDetection({ 
  type, 
  data, 
  onDuplicateFound, 
  onNoDuplicate, 
  showSuggestions = true,
  autoCheck = true 
}: DuplicateDetectionProps) {
  const { patients, users, appointments, medicalRecords } = useHospital();
  const { showWarning, showError, showSuccess } = useToast();
  const [duplicateResult, setDuplicateResult] = useState<DuplicateCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (autoCheck && data) {
      checkForDuplicates();
    }
  }, [data, autoCheck]);

  const checkForDuplicates = async () => {
    setIsChecking(true);
    try {
      let result: DuplicateCheckResult;

      switch (type) {
        case 'patient':
          result = checkDuplicatePatient(data as Partial<Patient>, patients);
          break;
        case 'user':
          result = checkDuplicateUser(data as Partial<User>, users);
          break;
        case 'appointment':
          result = checkDuplicateAppointment(data as Partial<Appointment>, appointments);
          break;
        case 'medical_record':
          result = checkDuplicateMedicalRecord(data as Partial<MedicalRecord>, medicalRecords);
          break;
        default:
          result = {
            isDuplicate: false,
            duplicateType: null,
            existingItem: null,
            message: 'Unknown type',
            suggestions: []
          };
      }

      setDuplicateResult(result);

      if (result.isDuplicate) {
        showWarning('Duplicate Found', result.message);
        onDuplicateFound?.(result);
      } else if (result.suggestions && result.suggestions.length > 0) {
        showWarning('Similar Items Found', result.message);
      } else {
        showSuccess('No Duplicates', result.message);
        onNoDuplicate?.();
      }
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      showError('Duplicate Check Failed', 'Unable to check for duplicates. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const getIcon = () => {
    if (isChecking) return <Search className="w-4 h-4 animate-spin" />;
    if (!duplicateResult) return <Search className="w-4 h-4" />;
    
    const iconType = getDuplicateIcon(duplicateResult);
    switch (iconType) {
      case '⚠️': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case '🔍': return <Search className="w-4 h-4 text-yellow-500" />;
      case '✅': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getColor = () => {
    if (isChecking) return 'text-gray-500';
    if (!duplicateResult) return 'text-gray-500';
    
    if (duplicateResult.isDuplicate) return 'text-red-600';
    if (duplicateResult.suggestions && duplicateResult.suggestions.length > 0) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getBackgroundColor = () => {
    if (isChecking) return 'bg-gray-50';
    if (!duplicateResult) return 'bg-gray-50';
    
    if (duplicateResult.isDuplicate) return 'bg-red-50 border-red-200';
    if (duplicateResult.suggestions && duplicateResult.suggestions.length > 0) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  if (!duplicateResult && !isChecking) {
    return null;
  }

  return (
    <div className={`rounded-lg border p-4 ${getBackgroundColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <span className={`font-medium ${getColor()}`}>
            {isChecking ? 'Checking for duplicates...' : formatDuplicateResult(duplicateResult!)}
          </span>
        </div>
        
        {duplicateResult && (duplicateResult.isDuplicate || duplicateResult.suggestions?.length) && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        )}
      </div>

      {showDetails && duplicateResult && (
        <div className="mt-4 space-y-3">
          {duplicateResult.isDuplicate && duplicateResult.existingItem && (
            <div className="bg-white rounded-lg border p-3">
              <h4 className="font-medium text-gray-900 mb-2">Existing Item Found:</h4>
              <div className="space-y-2">
                {type === 'patient' && (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Name:</strong> {duplicateResult.existingItem.firstName} {duplicateResult.existingItem.lastName}
                    </span>
                  </div>
                )}
                {type === 'patient' && duplicateResult.existingItem.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Phone:</strong> {duplicateResult.existingItem.phone}
                    </span>
                  </div>
                )}
                {type === 'patient' && duplicateResult.existingItem.insuranceInfo?.membershipNumber && (
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Insurance:</strong> {duplicateResult.existingItem.insuranceInfo.provider} - {duplicateResult.existingItem.insuranceInfo.membershipNumber}
                    </span>
                  </div>
                )}
                {type === 'patient' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">
                      <strong>MRN:</strong> {duplicateResult.existingItem.mrn}
                    </span>
                  </div>
                )}
                {type === 'user' && (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Name:</strong> {duplicateResult.existingItem.name}
                    </span>
                  </div>
                )}
                {type === 'user' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">
                      <strong>Email:</strong> {duplicateResult.existingItem.email}
                    </span>
                  </div>
                )}
                {type === 'appointment' && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Date:</strong> {new Date(duplicateResult.existingItem.dateTime).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {duplicateResult.suggestions && duplicateResult.suggestions.length > 0 && (
            <div className="bg-white rounded-lg border p-3">
              <h4 className="font-medium text-gray-900 mb-2">Similar Items Found:</h4>
              <div className="space-y-2">
                {duplicateResult.suggestions.slice(0, 3).map((suggestion, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-500">•</span>
                    <span>
                      {type === 'patient' && `${suggestion.firstName} ${suggestion.lastName} (MRN: ${suggestion.mrn})`}
                      {type === 'user' && `${suggestion.name} (${suggestion.email})`}
                      {type === 'appointment' && `Appointment on ${new Date(suggestion.dateTime).toLocaleString()}`}
                    </span>
                  </div>
                ))}
                {duplicateResult.suggestions.length > 3 && (
                  <div className="text-sm text-gray-500">
                    ... and {duplicateResult.suggestions.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={checkForDuplicates}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Recheck
            </button>
            {duplicateResult.isDuplicate && (
              <button
                onClick={() => {
                  // Navigate to existing item or show details
                  console.log('Navigate to existing item:', duplicateResult.existingItem);
                }}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                View Existing
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
