# NHIF Insurance Integration - Technical Flow

## 📋 Overview

This document outlines the complete technical flow for NHIF (National Health Insurance Fund) integration in the Alfa Specialized Hospital Management System, detailing how patient verification, claim generation, submission, and tracking work seamlessly.

## 🔄 Complete Integration Flow

### **Phase 1: Patient Arrival & Verification**

#### **1.1 Patient Arrives with NHIF Card**
```
Patient → Reception Desk → NHIF Card Presented
```

#### **1.2 Reception Enters NHIF Number**
```typescript
// Frontend: Patient Registration Form
interface NHIFVerification {
  nhifNumber: string;
  patientId: string;
  verificationDate: Date;
}

// API Call to NHIF
const verifyNHIFMember = async (nhifNumber: string) => {
  const response = await fetch('/api/nhif/verify-member', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nhifNumber })
  });
  return response.json();
};
```

#### **1.3 HMS Sends Request to NHIF API**
```typescript
// Backend: server.js
app.post('/api/nhif/verify-member', async (req, res) => {
  try {
    const { nhifNumber } = req.body;
    
    // Call NHIF API
    const nhifResponse = await fetch(`${NHIF_API_BASE}/members/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NHIF_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ membershipNumber: nhifNumber })
    });
    
    const memberData = await nhifResponse.json();
    
    // Store verification result
    await supabase
      .from('nhif_verifications')
      .insert([{
        patient_id: req.body.patientId,
        nhif_number: nhifNumber,
        verification_status: memberData.status,
        member_details: memberData,
        verified_at: new Date().toISOString()
      }]);
    
    res.json(memberData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### **1.4 System Returns Member Details**
```json
{
  "status": "verified",
  "memberDetails": {
    "name": "John Doe",
    "id": "123456789",
    "facilityEligibility": true,
    "benefitPlan": "Comprehensive",
    "coverageLimit": 500000,
    "remainingBalance": 450000,
    "validUntil": "2024-12-31"
  },
  "verificationDate": "2024-01-15T10:30:00Z"
}
```

### **Phase 2: Doctor/Treatment Entry**

#### **2.1 Services Entry**
```typescript
// EMR Form Integration
interface NHIFService {
  serviceCode: string;
  serviceName: string;
  nhifTariff: number;
  quantity: number;
  totalAmount: number;
  isNHIFCovered: boolean;
}

// Service selection with NHIF validation
const selectNHIFService = (serviceCode: string) => {
  const service = nhifServices.find(s => s.code === serviceCode);
  if (service && service.isNHIFCovered) {
    return {
      ...service,
      patientPays: 0, // Fully covered by NHIF
      nhifPays: service.nhifTariff
    };
  }
  return service;
};
```

#### **2.2 Diagnosis Entry**
```typescript
// ICD-10 Integration with NHIF
interface NHIFDiagnosis {
  icd10Code: string;
  diagnosis: string;
  nhifCategory: string;
  isNHIFCovered: boolean;
  copayRequired: boolean;
}

// Diagnosis validation
const validateNHIFDiagnosis = (icd10Code: string) => {
  const diagnosis = icd10Codes.find(d => d.code === icd10Code);
  return {
    ...diagnosis,
    isNHIFCovered: diagnosis.nhifCategory !== 'excluded',
    requiresPriorAuth: diagnosis.requiresPriorAuthorization
  };
};
```

#### **2.3 Drug Prescription**
```typescript
// Pharmacy Integration
interface NHIFDrug {
  drugCode: string;
  drugName: string;
  nhifFormulary: boolean;
  copayAmount: number;
  nhifCoverage: number;
}

// Drug coverage check
const checkNHIFDrugCoverage = (drugCode: string) => {
  const drug = nhifFormulary.find(d => d.code === drugCode);
  if (drug && drug.isNHIFCovered) {
    return {
      patientPays: drug.copayAmount,
      nhifPays: drug.nhifCoverage,
      requiresPriorAuth: drug.requiresPriorAuthorization
    };
  }
  return { patientPays: drug.price, nhifPays: 0 };
};
```

### **Phase 3: Claim Generation**

#### **3.1 Services Compilation**
```typescript
// Claim Builder
class NHIFClaimBuilder {
  private claim: NHIFClaim = {
    claimId: '',
    patientId: '',
    facilityId: '',
    services: [],
    diagnosis: [],
    drugs: [],
    totalAmount: 0,
    nhifAmount: 0,
    patientAmount: 0
  };

  addService(service: NHIFService) {
    this.claim.services.push(service);
    this.claim.totalAmount += service.totalAmount;
    this.claim.nhifAmount += service.nhifTariff;
  }

  addDiagnosis(diagnosis: NHIFDiagnosis) {
    this.claim.diagnosis.push(diagnosis);
  }

  addDrug(drug: NHIFDrug) {
    this.claim.drugs.push(drug);
    this.claim.totalAmount += drug.totalAmount;
    this.claim.nhifAmount += drug.nhifCoverage;
    this.claim.patientAmount += drug.copayAmount;
  }

  build(): NHIFClaim {
    this.claim.claimId = generateClaimId();
    return this.claim;
  }
}
```

#### **3.2 Digital Claim File Generation**
```typescript
// JSON Claim Format
interface NHIFClaim {
  claimId: string;
  facilityId: string;
  patientId: string;
  nhifNumber: string;
  visitDate: string;
  services: NHIFService[];
  diagnosis: NHIFDiagnosis[];
  drugs: NHIFDrug[];
  totalAmount: number;
  nhifAmount: number;
  patientAmount: number;
  attachments: string[];
  status: 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected';
}

// XML Claim Format (Alternative)
const generateXMLClaim = (claim: NHIFClaim): string => {
  return `
    <NHIFClaim>
      <ClaimID>${claim.claimId}</ClaimID>
      <FacilityID>${claim.facilityId}</FacilityID>
      <PatientID>${claim.patientId}</PatientID>
      <NHIFNumber>${claim.nhifNumber}</NHIFNumber>
      <VisitDate>${claim.visitDate}</VisitDate>
      <Services>
        ${claim.services.map(service => `
          <Service>
            <Code>${service.serviceCode}</Code>
            <Name>${service.serviceName}</Name>
            <Tariff>${service.nhifTariff}</Tariff>
            <Quantity>${service.quantity}</Quantity>
          </Service>
        `).join('')}
      </Services>
      <TotalAmount>${claim.totalAmount}</TotalAmount>
      <NHIFAmount>${claim.nhifAmount}</NHIFAmount>
      <PatientAmount>${claim.patientAmount}</PatientAmount>
    </NHIFClaim>
  `;
};
```

### **Phase 4: Claim Submission**

#### **4.1 Claim Submission API**
```typescript
// Backend: Claim Submission
app.post('/api/nhif/submit-claim', async (req, res) => {
  try {
    const claim = req.body;
    
    // Validate claim data
    const validation = await validateNHIFClaim(claim);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors });
    }
    
    // Submit to NHIF API
    const nhifResponse = await fetch(`${NHIF_API_BASE}/claims/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NHIF_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(claim)
    });
    
    const submissionResult = await nhifResponse.json();
    
    // Store claim submission
    await supabase
      .from('nhif_claims')
      .insert([{
        claim_id: claim.claimId,
        patient_id: claim.patientId,
        nhif_number: claim.nhifNumber,
        claim_data: claim,
        submission_status: submissionResult.status,
        nhif_reference: submissionResult.reference,
        submitted_at: new Date().toISOString()
      }]);
    
    res.json(submissionResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### **4.2 NHIF Validation Process**
```typescript
// NHIF Validation Rules
const validateNHIFClaim = async (claim: NHIFClaim) => {
  const errors: string[] = [];
  
  // Check member eligibility
  const memberStatus = await checkMemberEligibility(claim.nhifNumber);
  if (!memberStatus.isActive) {
    errors.push('Member is not active');
  }
  
  // Check service limits
  for (const service of claim.services) {
    const limit = await getServiceLimit(service.serviceCode);
    if (service.quantity > limit.maxQuantity) {
      errors.push(`Service ${service.serviceName} exceeds quantity limit`);
    }
  }
  
  // Check benefit limits
  const remainingBalance = await getMemberBalance(claim.nhifNumber);
  if (claim.nhifAmount > remainingBalance) {
    errors.push('Claim amount exceeds member balance');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

### **Phase 5: NHIF Validation & Response**

#### **5.1 NHIF Validation Checks**
```typescript
// NHIF Validation Response
interface NHIFValidationResponse {
  status: 'accepted' | 'pending' | 'rejected';
  reference: string;
  validationResults: {
    memberEligibility: boolean;
    serviceValidation: boolean;
    benefitLimits: boolean;
    codeValidation: boolean;
  };
  errors: string[];
  warnings: string[];
  processingTime: number;
}
```

#### **5.2 Response Handling**
```typescript
// Handle NHIF Response
const handleNHIFResponse = async (response: NHIFValidationResponse) => {
  switch (response.status) {
    case 'accepted':
      await updateClaimStatus(response.reference, 'approved');
      await notifyPatient('Your NHIF claim has been approved');
      break;
      
    case 'pending':
      await updateClaimStatus(response.reference, 'pending');
      await scheduleFollowUp(response.reference);
      break;
      
    case 'rejected':
      await updateClaimStatus(response.reference, 'rejected');
      await notifyPatient('Your NHIF claim was rejected', response.errors);
      break;
  }
};
```

### **Phase 6: Claim Status Tracking**

#### **6.1 Automatic Status Sync**
```typescript
// Scheduled Status Check
const syncClaimStatus = async () => {
  const pendingClaims = await getPendingClaims();
  
  for (const claim of pendingClaims) {
    try {
      const status = await fetchClaimStatus(claim.nhifReference);
      await updateClaimStatus(claim.claimId, status);
      
      if (status === 'approved') {
        await processPayment(claim);
      }
    } catch (error) {
      console.error(`Failed to sync claim ${claim.claimId}:`, error);
    }
  }
};

// Run every 30 minutes
setInterval(syncClaimStatus, 30 * 60 * 1000);
```

#### **6.2 Real-time Status Updates**
```typescript
// WebSocket for real-time updates
const setupNHIFStatusUpdates = () => {
  const ws = new WebSocket('wss://nhif-api.com/status-updates');
  
  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    updateClaimStatus(update.claimId, update.status);
    notifyUser(update);
  };
};
```

## 🔧 Technical Implementation Details

### **API Endpoints**

#### **NHIF Verification**
```typescript
POST /api/nhif/verify-member
{
  "nhifNumber": "123456789",
  "patientId": "uuid"
}

Response:
{
  "status": "verified",
  "memberDetails": { ... },
  "verificationDate": "2024-01-15T10:30:00Z"
}
```

#### **Claim Submission**
```typescript
POST /api/nhif/submit-claim
{
  "claimId": "CLM-2024-001",
  "patientId": "uuid",
  "nhifNumber": "123456789",
  "services": [...],
  "diagnosis": [...],
  "drugs": [...]
}

Response:
{
  "status": "submitted",
  "reference": "NHIF-REF-123456",
  "processingTime": "2-5 business days"
}
```

#### **Status Tracking**
```typescript
GET /api/nhif/claim-status/:claimId

Response:
{
  "claimId": "CLM-2024-001",
  "status": "approved",
  "nhifReference": "NHIF-REF-123456",
  "approvedAmount": 50000,
  "patientAmount": 5000,
  "processedDate": "2024-01-20T14:30:00Z"
}
```

### **Database Schema**

#### **NHIF Verifications Table**
```sql
CREATE TABLE nhif_verifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid REFERENCES patients(id),
  nhif_number text NOT NULL,
  verification_status text NOT NULL,
  member_details jsonb,
  verified_at timestamp with time zone DEFAULT now()
);
```

#### **NHIF Claims Table**
```sql
CREATE TABLE nhif_claims (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id text UNIQUE NOT NULL,
  patient_id uuid REFERENCES patients(id),
  nhif_number text NOT NULL,
  claim_data jsonb NOT NULL,
  submission_status text NOT NULL,
  nhif_reference text,
  submitted_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  approved_amount decimal(10,2),
  patient_amount decimal(10,2)
);
```

## 🎯 Benefits of This Integration

### **For Patients:**
- ✅ **Seamless verification** - Instant NHIF status check
- ✅ **Transparent billing** - Clear breakdown of covered vs. out-of-pocket costs
- ✅ **Real-time updates** - Status notifications via SMS/email
- ✅ **Reduced paperwork** - Digital claim submission

### **For Hospital:**
- ✅ **Automated claims** - Reduced manual processing
- ✅ **Faster payments** - Direct NHIF reimbursement
- ✅ **Reduced errors** - Automated validation
- ✅ **Better tracking** - Real-time claim status

### **For NHIF:**
- ✅ **Standardized data** - Consistent claim format
- ✅ **Reduced fraud** - Automated validation
- ✅ **Faster processing** - Digital submission
- ✅ **Better analytics** - Comprehensive reporting

## 🚀 Implementation Checklist

- [ ] **NHIF API Integration** - Set up API credentials and endpoints
- [ ] **Database Schema** - Create NHIF tables
- [ ] **Frontend Components** - Build verification and claim forms
- [ ] **Backend APIs** - Implement claim submission and tracking
- [ ] **Testing** - Test with NHIF sandbox environment
- [ ] **Production Deployment** - Go live with NHIF integration
- [ ] **Monitoring** - Set up alerts and logging
- [ ] **Training** - Train staff on new NHIF workflow

This comprehensive NHIF integration provides a seamless experience for patients, hospitals, and NHIF, ensuring efficient healthcare delivery and claims processing! 🎉
