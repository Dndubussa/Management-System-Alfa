# NHIF Integration Guide

This guide explains how to integrate NHIF (National Health Insurance Fund) automatic claims processing into your hospital management system.

## Overview

The NHIF integration allows your hospital to:
- Validate patient membership automatically
- Submit claims electronically
- Check claim status in real-time
- Process pre-authorization requests
- Access NHIF service tariffs and ICD-11 codes

## Setup Instructions

### 1. Obtain NHIF API Credentials

Contact NHIF to obtain:
- **Client ID**: Your application's unique identifier
- **Client Secret**: Secret key for authentication
- **Facility Code**: Your hospital's NHIF facility code
- **API Documentation**: Latest API specifications

### 2. Environment Configuration

Create a `.env.local` file in your project root with the following variables:

```bash
# NHIF API Configuration
REACT_APP_NHIF_API_URL=https://api-sandbox.nhif.or.tz
REACT_APP_NHIF_CLIENT_ID=your_client_id_here
REACT_APP_NHIF_CLIENT_SECRET=your_client_secret_here
REACT_APP_NHIF_FACILITY_CODE=ALFA001
REACT_APP_NHIF_ENVIRONMENT=sandbox
```

For production, use:
```bash
REACT_APP_NHIF_API_URL=https://api.nhif.or.tz
REACT_APP_NHIF_ENVIRONMENT=production
```

### 3. Service Mapping

Map your hospital services to NHIF SHA codes:

```typescript
// Example service mapping
const serviceMapping = {
  'consultation': 'SHA001',
  'lab-test': 'SHA002',
  'medication': 'SHA003',
  'procedure': 'SHA004',
  'radiology': 'SHA005'
};
```

### 4. ICD-11 Implementation

Ensure your system supports ICD-11 diagnostic codes:

```typescript
// Example ICD-11 mapping
const diagnosisMapping = {
  'hypertension': 'BA00',
  'diabetes': '5A10',
  'pneumonia': 'CA40'
};
```

## Integration Components

### 1. NHIF Service (`src/services/nhifService.ts`)

Core service for API interactions:
- Authentication management
- Patient validation
- Claim submission
- Status checking
- Pre-authorization requests

### 2. NHIF Hook (`src/hooks/useNHIF.ts`)

React hook for easy integration:
```typescript
const { validatePatient, submitClaim, isLoading, error } = useNHIF();
```

### 3. NHIF Claims Component (`src/components/Billing/NHIFClaims.tsx`)

UI component for claims processing:
- Patient validation display
- Claim submission interface
- Status tracking
- Error handling

### 4. NHIF Configuration (`src/components/Admin/NHIFConfig.tsx`)

Admin interface for configuration:
- Environment settings
- Credential management
- Connection testing
- Service mapping

## Usage Examples

### Validate Patient Membership

```typescript
const { validatePatient } = useNHIF();

const handleValidate = async (membershipNumber: string) => {
  const result = await validatePatient(membershipNumber);
  if (result.isValid) {
    console.log('Patient validated:', result.patient);
    console.log('Benefits:', result.benefits);
  }
};
```

### Submit Claim

```typescript
const { submitClaim } = useNHIF();

const claim: NHIFClaim = {
  claimId: `NHIF-${Date.now()}`,
  patientMembershipNumber: '123456789',
  facilityCode: 'ALFA001',
  admissionDate: new Date().toISOString(),
  claimType: 'outpatient',
  totalAmount: 50000,
  items: [{
    serviceCode: 'SHA001',
    serviceName: 'Consultation',
    quantity: 1,
    unitPrice: 50000,
    totalAmount: 50000,
    diagnosisCode: 'BA00',
    practitionerId: 'PRAC001'
  }],
  diagnoses: [{
    icd11Code: 'BA00',
    description: 'Hypertension',
    isPrimary: true
  }],
  practitionerId: 'PRAC001'
};

const result = await submitClaim(claim);
```

### Request Pre-Authorization

```typescript
const { requestPreAuth } = useNHIF();

const preAuthRequest: NHIFPreAuthRequest = {
  patientMembershipNumber: '123456789',
  serviceCode: 'SHA004',
  estimatedCost: 200000,
  diagnosisCode: 'CA40',
  practitionerId: 'PRAC001',
  urgency: 'urgent',
  notes: 'Emergency procedure required'
};

const result = await requestPreAuth(preAuthRequest);
```

## Security Considerations

1. **Credential Protection**: Never commit API credentials to version control
2. **HTTPS Only**: Always use HTTPS for API communications
3. **Token Management**: Implement proper token refresh mechanisms
4. **Audit Logging**: Log all NHIF API interactions
5. **Error Handling**: Implement comprehensive error handling

## Testing

### Sandbox Environment

Use the sandbox environment for testing:
- Test patient validation
- Submit test claims
- Verify error handling
- Test pre-authorization flows

### Production Deployment

Before going live:
1. Complete sandbox testing
2. Obtain production credentials
3. Update environment variables
4. Test with real patient data
5. Monitor initial claims

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify client ID and secret
   - Check token expiration
   - Ensure proper API endpoint

2. **Validation Failures**
   - Verify membership number format
   - Check patient data accuracy
   - Ensure facility code is correct

3. **Claim Rejections**
   - Verify service codes (SHA)
   - Check ICD-11 codes
   - Ensure pre-authorization where required
   - Validate practitioner credentials

### Error Codes

Common NHIF error codes:
- `INVALID_CREDENTIALS`: Authentication failed
- `PATIENT_NOT_FOUND`: Membership number invalid
- `SERVICE_NOT_COVERED`: Service not covered by NHIF
- `PREAUTH_REQUIRED`: Pre-authorization needed
- `FACILITY_NOT_AUTHORIZED`: Facility not authorized for service

## Support

For technical support:
1. Check NHIF API documentation
2. Contact NHIF technical support
3. Review system logs
4. Test in sandbox environment

## Updates

Keep your integration updated:
- Monitor NHIF API changes
- Update service mappings
- Refresh ICD-11 codes
- Test after updates

---

**Note**: This integration requires proper NHIF approval and credentials. Contact NHIF for official integration support.
