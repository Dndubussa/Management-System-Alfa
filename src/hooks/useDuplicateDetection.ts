import { useState, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { duplicateDetectionService } from '../services/duplicateDetectionService';
import { DuplicateCheckResult } from '../utils/duplicateDetection';
import { Patient, User, Appointment, MedicalRecord } from '../types';

interface UseDuplicateDetectionOptions {
  type: 'patient' | 'user' | 'appointment' | 'medical_record';
  autoCheck?: boolean;
  showToast?: boolean;
}

export function useDuplicateDetection(options: UseDuplicateDetectionOptions) {
  const { showToast = true } = options;
  const { showWarning, showError, showSuccess } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [duplicateResult, setDuplicateResult] = useState<DuplicateCheckResult | null>(null);
  const [allowDuplicate, setAllowDuplicate] = useState(false);

  const checkForDuplicates = useCallback(async (data: any) => {
    setIsChecking(true);
    setDuplicateResult(null);
    setAllowDuplicate(false);

    try {
      let result: DuplicateCheckResult;

      switch (options.type) {
        case 'patient':
          result = await duplicateDetectionService.checkDuplicatePatient(data);
          break;
        case 'user':
          result = await duplicateDetectionService.checkDuplicateUser(data);
          break;
        case 'appointment':
          result = await duplicateDetectionService.checkDuplicateAppointment(data);
          break;
        case 'medical_record':
          result = await duplicateDetectionService.checkDuplicateMedicalRecord(data);
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

      if (showToast) {
        if (result.isDuplicate) {
          showWarning('Duplicate Found', result.message);
        } else if (result.suggestions && result.suggestions.length > 0) {
          showWarning('Similar Items Found', result.message);
        } else {
          showSuccess('No Duplicates', result.message);
        }
      }

      return result;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      const errorResult: DuplicateCheckResult = {
        isDuplicate: false,
        duplicateType: null,
        existingItem: null,
        message: 'Unable to check for duplicates. Please try again.',
        suggestions: []
      };
      setDuplicateResult(errorResult);
      
      if (showToast) {
        showError('Duplicate Check Failed', 'Unable to check for duplicates. Please try again.');
      }
      
      return errorResult;
    } finally {
      setIsChecking(false);
    }
  }, [options.type, showToast, showWarning, showError, showSuccess]);

  const validateUniqueness = useCallback(async (data: any) => {
    if (options.type === 'patient') {
      try {
        const validation = await duplicateDetectionService.validatePatientUniqueness(data);
        return validation;
      } catch (error) {
        console.error('Error validating uniqueness:', error);
        return {
          isValid: false,
          duplicates: [],
          warnings: ['Unable to validate uniqueness. Please try again.']
        };
      }
    }
    
    // For other types, use the basic duplicate check
    const result = await checkForDuplicates(data);
    return {
      isValid: !result.isDuplicate,
      duplicates: result.isDuplicate ? [result] : [],
      warnings: result.suggestions && result.suggestions.length > 0 ? [result.message] : []
    };
  }, [options.type, checkForDuplicates]);

  const canProceed = useCallback(() => {
    if (!duplicateResult) return true;
    if (!duplicateResult.isDuplicate) return true;
    return allowDuplicate;
  }, [duplicateResult, allowDuplicate]);

  const reset = useCallback(() => {
    setDuplicateResult(null);
    setAllowDuplicate(false);
    setIsChecking(false);
  }, []);

  return {
    isChecking,
    duplicateResult,
    allowDuplicate,
    setAllowDuplicate,
    checkForDuplicates,
    validateUniqueness,
    canProceed,
    reset
  };
}
