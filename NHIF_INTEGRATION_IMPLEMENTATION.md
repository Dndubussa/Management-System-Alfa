# NHIF Integration Implementation Guide

## 🏥 Complete NHIF Integration for Alfa Specialized Hospital

This guide provides step-by-step implementation of NHIF insurance integration in the HMS system.

## 📋 Implementation Overview

### **Phase 1: Patient Verification Flow**
```
Patient Arrives → Reception → NHIF Card → Verification → Member Details
```

### **Phase 2: Treatment & Billing**
```
Doctor Consultation → Services → Diagnosis → Drugs → NHIF Coverage Check
```

### **Phase 3: Claim Processing**
```
Claim Generation → NHIF Submission → Validation → Payment Processing
```

## 🔧 Technical Implementation

### **1. Database Schema for NHIF Integration**

```sql
-- NHIF Member Verifications
CREATE TABLE nhif_verifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid REFERENCES patients(id),
  nhif_number text NOT NULL,
  verification_status text NOT NULL,
  member_details jsonb,
  verified_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- NHIF Claims
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
  patient_amount decimal(10,2),
  status text DEFAULT 'draft'
);

-- NHIF Service Tariffs
CREATE TABLE nhif_service_tariffs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_code text UNIQUE NOT NULL,
  service_name text NOT NULL,
  nhif_tariff decimal(10,2) NOT NULL,
  is_covered boolean DEFAULT true,
  requires_prior_auth boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- NHIF Drug Formulary
CREATE TABLE nhif_drug_formulary (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  drug_code text UNIQUE NOT NULL,
  drug_name text NOT NULL,
  nhif_price decimal(10,2) NOT NULL,
  is_covered boolean DEFAULT true,
  copay_amount decimal(10,2) DEFAULT 0,
  requires_prior_auth boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);
```

### **2. Backend API Implementation**

#### **NHIF Verification API**
```typescript
// server.js - NHIF Verification Endpoint
app.post('/api/nhif/verify-member', async (req, res) => {
  try {
    const { nhifNumber, patientId } = req.body;
    
    // Call NHIF API for verification
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
    const { data, error } = await supabase
      .from('nhif_verifications')
      .insert([{
        patient_id: patientId,
        nhif_number: nhifNumber,
        verification_status: memberData.status,
        member_details: memberData,
        verified_at: new Date().toISOString()
      }])
      .select();
    
    if (error) throw error;
    
    res.json({
      success: true,
      memberDetails: memberData,
      verificationId: data[0].id
    });
  } catch (error) {
    console.error('NHIF verification error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

#### **NHIF Claim Submission API**
```typescript
// server.js - NHIF Claim Submission
app.post('/api/nhif/submit-claim', async (req, res) => {
  try {
    const claim = req.body;
    
    // Validate claim data
    const validation = await validateNHIFClaim(claim);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Claim validation failed', 
        details: validation.errors 
      });
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
    const { data, error } = await supabase
      .from('nhif_claims')
      .insert([{
        claim_id: claim.claimId,
        patient_id: claim.patientId,
        nhif_number: claim.nhifNumber,
        claim_data: claim,
        submission_status: submissionResult.status,
        nhif_reference: submissionResult.reference,
        submitted_at: new Date().toISOString()
      }])
      .select();
    
    if (error) throw error;
    
    res.json({
      success: true,
      claimId: claim.claimId,
      nhifReference: submissionResult.reference,
      status: submissionResult.status
    });
  } catch (error) {
    console.error('NHIF claim submission error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

#### **NHIF Status Tracking API**
```typescript
// server.js - NHIF Claim Status
app.get('/api/nhif/claim-status/:claimId', async (req, res) => {
  try {
    const { claimId } = req.params;
    
    // Get claim from database
    const { data: claim, error } = await supabase
      .from('nhif_claims')
      .select('*')
      .eq('claim_id', claimId)
      .single();
    
    if (error) throw error;
    
    // Check status with NHIF API
    const statusResponse = await fetch(`${NHIF_API_BASE}/claims/status/${claim.nhif_reference}`, {
      headers: {
        'Authorization': `Bearer ${NHIF_API_TOKEN}`
      }
    });
    
    const statusData = await statusResponse.json();
    
    // Update local status
    await supabase
      .from('nhif_claims')
      .update({
        submission_status: statusData.status,
        processed_at: statusData.processedAt,
        approved_amount: statusData.approvedAmount,
        patient_amount: statusData.patientAmount
      })
      .eq('claim_id', claimId);
    
    res.json({
      claimId: claim.claim_id,
      status: statusData.status,
      nhifReference: claim.nhif_reference,
      approvedAmount: statusData.approvedAmount,
      patientAmount: statusData.patientAmount,
      processedDate: statusData.processedAt
    });
  } catch (error) {
    console.error('NHIF status check error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### **3. Frontend Components**

#### **NHIF Verification Component**
```typescript
// src/components/NHIF/NHIFVerification.tsx
import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';

interface NHIFVerificationProps {
  patientId: string;
  onVerificationComplete: (memberDetails: any) => void;
}

export function NHIFVerification({ patientId, onVerificationComplete }: NHIFVerificationProps) {
  const [nhifNumber, setNhifNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleVerification = async () => {
    if (!nhifNumber.trim()) {
      showError('NHIF Number Required', 'Please enter the NHIF membership number');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch('/api/nhif/verify-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nhifNumber, patientId })
      });

      const result = await response.json();

      if (result.success) {
        showSuccess(
          'NHIF Verification Successful',
          `Member: ${result.memberDetails.name} - Status: ${result.memberDetails.status}`
        );
        onVerificationComplete(result.memberDetails);
      } else {
        showError('Verification Failed', result.error || 'Unable to verify NHIF membership');
      }
    } catch (error) {
      showError('Verification Error', 'Failed to verify NHIF membership. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">NHIF Verification</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            NHIF Membership Number
          </label>
          <input
            type="text"
            value={nhifNumber}
            onChange={(e) => setNhifNumber(e.target.value)}
            placeholder="Enter NHIF number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={handleVerification}
          disabled={isVerifying}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? 'Verifying...' : 'Verify NHIF Membership'}
        </button>
      </div>
    </div>
  );
}
```

#### **NHIF Claim Submission Component**
```typescript
// src/components/NHIF/NHIFClaimSubmission.tsx
import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';

interface NHIFClaimSubmissionProps {
  patientId: string;
  nhifNumber: string;
  services: any[];
  diagnosis: any[];
  drugs: any[];
}

export function NHIFClaimSubmission({ 
  patientId, 
  nhifNumber, 
  services, 
  diagnosis, 
  drugs 
}: NHIFClaimSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimId, setClaimId] = useState('');
  const { showSuccess, showError } = useToast();

  const generateClaimId = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CLM-${year}${month}${day}-${random}`;
  };

  const handleClaimSubmission = async () => {
    setIsSubmitting(true);
    try {
      const claim = {
        claimId: generateClaimId(),
        patientId,
        nhifNumber,
        services: services.map(service => ({
          serviceCode: service.code,
          serviceName: service.name,
          nhifTariff: service.nhifTariff,
          quantity: service.quantity,
          totalAmount: service.totalAmount
        })),
        diagnosis: diagnosis.map(diag => ({
          icd10Code: diag.code,
          diagnosis: diag.name,
          nhifCategory: diag.nhifCategory
        })),
        drugs: drugs.map(drug => ({
          drugCode: drug.code,
          drugName: drug.name,
          nhifPrice: drug.nhifPrice,
          copayAmount: drug.copayAmount,
          quantity: drug.quantity
        })),
        totalAmount: services.reduce((sum, s) => sum + s.totalAmount, 0),
        nhifAmount: services.reduce((sum, s) => sum + s.nhifTariff, 0),
        patientAmount: services.reduce((sum, s) => sum + (s.totalAmount - s.nhifTariff), 0)
      };

      const response = await fetch('/api/nhif/submit-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claim)
      });

      const result = await response.json();

      if (result.success) {
        setClaimId(result.claimId);
        showSuccess(
          'Claim Submitted Successfully',
          `Claim ID: ${result.claimId} - NHIF Reference: ${result.nhifReference}`
        );
      } else {
        showError('Claim Submission Failed', result.error || 'Unable to submit claim');
      }
    } catch (error) {
      showError('Submission Error', 'Failed to submit NHIF claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">NHIF Claim Submission</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Amount</label>
            <p className="text-lg font-semibold text-gray-900">
              TZS {services.reduce((sum, s) => sum + s.totalAmount, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">NHIF Coverage</label>
            <p className="text-lg font-semibold text-green-600">
              TZS {services.reduce((sum, s) => sum + s.nhifTariff, 0).toLocaleString()}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleClaimSubmission}
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting Claim...' : 'Submit NHIF Claim'}
        </button>
        
        {claimId && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-800">
              <strong>Claim ID:</strong> {claimId}
            </p>
            <p className="text-sm text-green-800">
              <strong>Status:</strong> Submitted to NHIF
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

### **4. Service Layer Integration**

#### **NHIF Service Functions**
```typescript
// src/services/nhifService.ts
export const nhifService = {
  // Verify NHIF member
  async verifyMember(nhifNumber: string, patientId: string) {
    const response = await fetch('/api/nhif/verify-member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nhifNumber, patientId })
    });
    return response.json();
  },

  // Submit claim
  async submitClaim(claim: any) {
    const response = await fetch('/api/nhif/submit-claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claim)
    });
    return response.json();
  },

  // Check claim status
  async getClaimStatus(claimId: string) {
    const response = await fetch(`/api/nhif/claim-status/${claimId}`);
    return response.json();
  },

  // Get NHIF service tariffs
  async getServiceTariffs() {
    const response = await fetch('/api/nhif/service-tariffs');
    return response.json();
  },

  // Get NHIF drug formulary
  async getDrugFormulary() {
    const response = await fetch('/api/nhif/drug-formulary');
    return response.json();
  }
};
```

## 🎯 Integration Benefits

### **For Patients:**
- ✅ **Instant verification** - Real-time NHIF status check
- ✅ **Transparent billing** - Clear cost breakdown
- ✅ **Reduced waiting** - Faster claim processing
- ✅ **Digital receipts** - Electronic claim confirmations

### **For Hospital:**
- ✅ **Automated claims** - Reduced manual work
- ✅ **Faster payments** - Direct NHIF reimbursement
- ✅ **Error reduction** - Automated validation
- ✅ **Better tracking** - Real-time status updates

### **For NHIF:**
- ✅ **Standardized data** - Consistent claim format
- ✅ **Fraud prevention** - Automated validation
- ✅ **Faster processing** - Digital submission
- ✅ **Better analytics** - Comprehensive reporting

## 🚀 Deployment Checklist

- [ ] **NHIF API Setup** - Configure API credentials
- [ ] **Database Migration** - Run NHIF schema scripts
- [ ] **Frontend Integration** - Add NHIF components
- [ ] **Backend APIs** - Deploy claim submission endpoints
- [ ] **Testing** - Test with NHIF sandbox
- [ ] **Production** - Go live with NHIF integration
- [ ] **Monitoring** - Set up alerts and logging
- [ ] **Training** - Train staff on NHIF workflow

This comprehensive NHIF integration provides seamless insurance processing for the Alfa Specialized Hospital Management System! 🎉
