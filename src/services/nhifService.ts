import { 
  NHIFConfig, 
  NHIFPatient, 
  NHIFClaim, 
  NHIFClaimResponse, 
  NHIFValidationResponse,
  NHIFPreAuthRequest,
  NHIFPreAuthResponse,
  NHIFError,
  NHIF_ENVIRONMENTS
} from '../types/nhif';

class NHIFService {
  private config: NHIFConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: NHIFConfig) {
    this.config = config;
  }

  // Authentication
  private async authenticate(): Promise<void> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return; // Token is still valid
    }

    try {
      const response = await fetch(`${this.config.apiBaseUrl}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          grant_type: 'client_credentials'
        })
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000));
    } catch (error) {
      console.error('NHIF Authentication Error:', error);
      throw new Error('Failed to authenticate with NHIF API');
    }
  }

  // Get authenticated headers
  private async getHeaders(): Promise<HeadersInit> {
    await this.authenticate();
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'X-Facility-Code': this.config.facilityCode
    };
  }

  // Validate patient membership
  async validatePatient(membershipNumber: string): Promise<NHIFValidationResponse> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(
        `${this.config.apiBaseUrl}/patients/validate/${membershipNumber}`,
        { headers }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          isValid: false,
          message: errorData.message || 'Patient validation failed'
        };
      }

      const data = await response.json();
      return {
        isValid: true,
        patient: data.patient,
        message: 'Patient validated successfully',
        benefits: data.benefits
      };
    } catch (error) {
      console.error('NHIF Patient Validation Error:', error);
      return {
        isValid: false,
        message: 'Failed to validate patient with NHIF'
      };
    }
  }

  // Submit claim
  async submitClaim(claim: NHIFClaim): Promise<NHIFClaimResponse> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.config.apiBaseUrl}/claims/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify(claim)
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          claimId: claim.claimId,
          status: 'rejected',
          message: data.message || 'Claim submission failed',
          rejectionReason: data.reason,
          processingDate: new Date().toISOString()
        };
      }

      return {
        claimId: claim.claimId,
        status: data.status || 'submitted',
        message: data.message || 'Claim submitted successfully',
        approvedAmount: data.approvedAmount,
        processingDate: new Date().toISOString(),
        referenceNumber: data.referenceNumber
      };
    } catch (error) {
      console.error('NHIF Claim Submission Error:', error);
      return {
        claimId: claim.claimId,
        status: 'rejected',
        message: 'Failed to submit claim to NHIF',
        processingDate: new Date().toISOString()
      };
    }
  }

  // Request pre-authorization
  async requestPreAuth(request: NHIFPreAuthRequest): Promise<NHIFPreAuthResponse> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.config.apiBaseUrl}/preauth/request`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          preAuthId: `PA-${Date.now()}`,
          status: 'rejected',
          message: data.message || 'Pre-authorization request failed',
          validityPeriod: 0
        };
      }

      return {
        preAuthId: data.preAuthId,
        status: data.status || 'pending',
        approvedAmount: data.approvedAmount,
        validityPeriod: data.validityPeriod || 30,
        message: data.message || 'Pre-authorization request submitted',
        referenceNumber: data.referenceNumber
      };
    } catch (error) {
      console.error('NHIF Pre-Auth Error:', error);
      return {
        preAuthId: `PA-${Date.now()}`,
        status: 'rejected',
        message: 'Failed to request pre-authorization',
        validityPeriod: 0
      };
    }
  }

  // Check claim status
  async checkClaimStatus(claimId: string): Promise<NHIFClaimResponse> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(
        `${this.config.apiBaseUrl}/claims/status/${claimId}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Failed to check claim status: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        claimId,
        status: data.status,
        message: data.message,
        approvedAmount: data.approvedAmount,
        rejectionReason: data.rejectionReason,
        processingDate: data.processingDate,
        referenceNumber: data.referenceNumber
      };
    } catch (error) {
      console.error('NHIF Claim Status Error:', error);
      return {
        claimId,
        status: 'rejected',
        message: 'Failed to check claim status',
        processingDate: new Date().toISOString()
      };
    }
  }

  // Get available services and tariffs
  async getServices(): Promise<any[]> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.config.apiBaseUrl}/services`, { headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('NHIF Services Error:', error);
      return [];
    }
  }

  // Get ICD-11 codes
  async getICD11Codes(searchTerm?: string): Promise<any[]> {
    try {
      const headers = await this.getHeaders();
      const url = searchTerm 
        ? `${this.config.apiBaseUrl}/icd11/search?q=${encodeURIComponent(searchTerm)}`
        : `${this.config.apiBaseUrl}/icd11/codes`;
      
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch ICD-11 codes: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('NHIF ICD-11 Error:', error);
      return [];
    }
  }
}

// Create singleton instance
let nhifServiceInstance: NHIFService | null = null;

export const getNHIFService = (): NHIFService => {
  if (!nhifServiceInstance) {
    // Get configuration from environment variables
    const config: NHIFConfig = {
      apiBaseUrl: process.env.REACT_APP_NHIF_API_URL || NHIF_ENVIRONMENTS.sandbox.apiBaseUrl,
      clientId: process.env.REACT_APP_NHIF_CLIENT_ID || '',
      clientSecret: process.env.REACT_APP_NHIF_CLIENT_SECRET || '',
      facilityCode: process.env.REACT_APP_NHIF_FACILITY_CODE || NHIF_ENVIRONMENTS.sandbox.facilityCode,
      environment: (process.env.REACT_APP_NHIF_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    };

    nhifServiceInstance = new NHIFService(config);
  }
  return nhifServiceInstance;
};

export default NHIFService;
