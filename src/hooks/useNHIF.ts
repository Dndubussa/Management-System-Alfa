import { useState, useCallback } from 'react';
import { getNHIFService } from '../services/nhifService';
import { 
  NHIFClaim, 
  NHIFClaimResponse, 
  NHIFValidationResponse,
  NHIFPreAuthRequest,
  NHIFPreAuthResponse
} from '../types/nhif';

export function useNHIF() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nhifService = getNHIFService();

  // Validate patient membership
  const validatePatient = useCallback(async (membershipNumber: string): Promise<NHIFValidationResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await nhifService.validatePatient(membershipNumber);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to validate patient');
      return {
        isValid: false,
        message: err.message || 'Failed to validate patient'
      };
    } finally {
      setIsLoading(false);
    }
  }, [nhifService]);

  // Submit claim
  const submitClaim = useCallback(async (claim: NHIFClaim): Promise<NHIFClaimResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await nhifService.submitClaim(claim);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to submit claim');
      return {
        claimId: claim.claimId,
        status: 'rejected',
        message: err.message || 'Failed to submit claim',
        processingDate: new Date().toISOString()
      };
    } finally {
      setIsLoading(false);
    }
  }, [nhifService]);

  // Request pre-authorization
  const requestPreAuth = useCallback(async (request: NHIFPreAuthRequest): Promise<NHIFPreAuthResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await nhifService.requestPreAuth(request);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to request pre-authorization');
      return {
        preAuthId: `PA-${Date.now()}`,
        status: 'rejected',
        message: err.message || 'Failed to request pre-authorization',
        validityPeriod: 0
      };
    } finally {
      setIsLoading(false);
    }
  }, [nhifService]);

  // Check claim status
  const checkClaimStatus = useCallback(async (claimId: string): Promise<NHIFClaimResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await nhifService.checkClaimStatus(claimId);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to check claim status');
      return {
        claimId,
        status: 'rejected',
        message: err.message || 'Failed to check claim status',
        processingDate: new Date().toISOString()
      };
    } finally {
      setIsLoading(false);
    }
  }, [nhifService]);

  // Get services
  const getServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await nhifService.getServices();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch services');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [nhifService]);

  // Get ICD-11 codes
  const getICD11Codes = useCallback(async (searchTerm?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await nhifService.getICD11Codes(searchTerm);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch ICD-11 codes');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [nhifService]);

  return {
    isLoading,
    error,
    validatePatient,
    submitClaim,
    requestPreAuth,
    checkClaimStatus,
    getServices,
    getICD11Codes,
    clearError: () => setError(null)
  };
}
