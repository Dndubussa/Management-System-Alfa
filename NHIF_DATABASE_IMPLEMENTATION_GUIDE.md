# NHIF Database Implementation Guide

## 📋 Overview

This guide provides step-by-step instructions for implementing the NHIF database schema in the Alfa Specialized Hospital Management System.

## 🗄️ Database Schema Options

### **Option 1: Complete Schema (Recommended for Production)**
- **File**: `nhif-database-schema.sql`
- **Tables**: 12 comprehensive tables
- **Features**: Full NHIF integration with audit, payments, prior auth
- **Use Case**: Production environment with full NHIF functionality

### **Option 2: Simplified Schema (Quick Start)**
- **File**: `nhif-database-schema-simple.sql`
- **Tables**: 4 core tables
- **Features**: Basic NHIF integration
- **Use Case**: Development/testing or minimal NHIF requirements

## 🚀 Implementation Steps

### **Step 1: Choose Your Schema**

#### **For Production (Complete Schema):**
```sql
-- Copy and paste nhif-database-schema.sql in Supabase SQL Editor
-- This creates 12 tables with full NHIF functionality
```

#### **For Development (Simplified Schema):**
```sql
-- Copy and paste nhif-database-schema-simple.sql in Supabase SQL Editor
-- This creates 4 core tables for basic NHIF functionality
```

### **Step 2: Verify Table Creation**

```sql
-- Check if NHIF tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'nhif_%'
ORDER BY table_name;
```

### **Step 3: Test Sample Data**

```sql
-- Check sample service tariffs
SELECT COUNT(*) as service_count FROM nhif_service_tariffs;

-- Check sample drug formulary
SELECT COUNT(*) as drug_count FROM nhif_drug_formulary;

-- Check sample diagnosis codes (complete schema only)
SELECT COUNT(*) as diagnosis_count FROM nhif_diagnosis_codes;
```

## 📊 Database Schema Details

### **Core Tables (Both Schemas)**

#### **1. nhif_verifications**
- **Purpose**: Store NHIF member verification results
- **Key Fields**: `patient_id`, `nhif_number`, `verification_status`, `member_details`
- **Use Case**: Patient registration and insurance validation

#### **2. nhif_claims**
- **Purpose**: Store NHIF claim submissions and status
- **Key Fields**: `claim_id`, `patient_id`, `nhif_number`, `submission_status`, `approved_amount`
- **Use Case**: Claim processing and tracking

#### **3. nhif_service_tariffs**
- **Purpose**: NHIF service pricing and coverage
- **Key Fields**: `service_code`, `service_name`, `nhif_tariff`, `is_covered`
- **Use Case**: Service selection and billing

#### **4. nhif_drug_formulary**
- **Purpose**: NHIF drug pricing and coverage
- **Key Fields**: `drug_code`, `drug_name`, `nhif_price`, `copay_amount`
- **Use Case**: Drug prescription and billing

### **Extended Tables (Complete Schema Only)**

#### **5. nhif_claim_items**
- **Purpose**: Individual items within a claim
- **Key Fields**: `claim_id`, `item_type`, `item_code`, `quantity`, `total_amount`
- **Use Case**: Detailed claim breakdown

#### **6. nhif_prior_auth_requests**
- **Purpose**: Prior authorization requests
- **Key Fields**: `request_id`, `patient_id`, `service_code`, `request_status`
- **Use Case**: Services requiring pre-approval

#### **7. nhif_payments**
- **Purpose**: NHIF payment processing
- **Key Fields**: `payment_id`, `claim_id`, `payment_amount`, `payment_status`
- **Use Case**: Payment tracking and reconciliation

#### **8. nhif_api_logs**
- **Purpose**: API call logging and monitoring
- **Key Fields**: `api_endpoint`, `request_data`, `response_data`, `response_time_ms`
- **Use Case**: Debugging and performance monitoring

## 🔧 Integration with Existing System

### **Update Patient Registration**

```typescript
// Add NHIF verification to patient registration
const verifyNHIFMember = async (nhifNumber: string, patientId: string) => {
  const response = await fetch('/api/nhif/verify-member', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nhifNumber, patientId })
  });
  return response.json();
};
```

### **Update Billing System**

```typescript
// Add NHIF coverage check to billing
const checkNHIFCoverage = async (serviceCode: string) => {
  const response = await fetch(`/api/nhif/service-tariffs/${serviceCode}`);
  return response.json();
};
```

### **Update Claim Submission**

```typescript
// Add NHIF claim submission
const submitNHIFClaim = async (claimData: any) => {
  const response = await fetch('/api/nhif/submit-claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(claimData)
  });
  return response.json();
};
```

## 📈 Performance Optimization

### **Indexes Created**

#### **Core Indexes:**
- ✅ `idx_nhif_verifications_patient_id` - Fast patient lookups
- ✅ `idx_nhif_verifications_nhif_number` - Fast NHIF number lookups
- ✅ `idx_nhif_claims_patient_id` - Fast claim lookups by patient
- ✅ `idx_nhif_claims_status` - Fast status filtering
- ✅ `idx_nhif_service_tariffs_code` - Fast service code lookups
- ✅ `idx_nhif_drug_formulary_code` - Fast drug code lookups

#### **Extended Indexes (Complete Schema):**
- ✅ `idx_nhif_claim_items_claim_id` - Fast claim item lookups
- ✅ `idx_nhif_prior_auth_patient_id` - Fast prior auth lookups
- ✅ `idx_nhif_payments_claim_id` - Fast payment lookups
- ✅ `idx_nhif_api_logs_endpoint` - Fast API log filtering

### **Row Level Security (RLS)**

All NHIF tables have RLS enabled for:
- ✅ **Data Isolation** - Users can only access their own data
- ✅ **Security** - Prevents unauthorized access
- ✅ **Compliance** - Meets healthcare data protection requirements

## 🧪 Testing the Implementation

### **Test 1: Verify Tables Exist**

```sql
-- Check table creation
SELECT 
    table_name,
    CASE 
        WHEN table_name LIKE 'nhif_%' THEN '✅ NHIF Table'
        ELSE '❌ Not NHIF Table'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'nhif_%'
ORDER BY table_name;
```

### **Test 2: Check Sample Data**

```sql
-- Verify sample data insertion
SELECT 
    'Service Tariffs' as table_name,
    COUNT(*) as record_count
FROM nhif_service_tariffs
UNION ALL
SELECT 
    'Drug Formulary' as table_name,
    COUNT(*) as record_count
FROM nhif_drug_formulary
UNION ALL
SELECT 
    'Diagnosis Codes' as table_name,
    COUNT(*) as record_count
FROM nhif_diagnosis_codes;
```

### **Test 3: Test Data Insertion**

```sql
-- Test inserting a verification record
INSERT INTO nhif_verifications (patient_id, nhif_number, verification_status, member_details)
VALUES (
    (SELECT id FROM patients LIMIT 1),
    'NHIF123456789',
    'verified',
    '{"name": "Test Patient", "status": "active"}'
);

-- Test inserting a claim record
INSERT INTO nhif_claims (claim_id, patient_id, nhif_number, claim_data, total_amount)
VALUES (
    'CLM-TEST-001',
    (SELECT id FROM patients LIMIT 1),
    'NHIF123456789',
    '{"services": [{"code": "SHA001", "name": "General Consultation", "amount": 50000}]}',
    50000.00
);
```

## 🚨 Troubleshooting

### **Common Issues**

#### **Issue 1: Table Already Exists**
```sql
-- Error: relation "nhif_verifications" already exists
-- Solution: Use IF NOT EXISTS or DROP TABLE first
DROP TABLE IF EXISTS nhif_verifications CASCADE;
-- Then run the schema again
```

#### **Issue 2: Foreign Key Constraint**
```sql
-- Error: insert or update on table "nhif_verifications" violates foreign key constraint
-- Solution: Ensure patients table exists and has data
SELECT COUNT(*) FROM patients;
-- If 0, insert sample patients first
```

#### **Issue 3: Permission Denied**
```sql
-- Error: permission denied for table nhif_verifications
-- Solution: Grant permissions to your user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
```

### **Verification Queries**

```sql
-- Check if all NHIF tables exist
SELECT COUNT(*) as nhif_table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'nhif_%';

-- Check if indexes were created
SELECT COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename LIKE 'nhif_%';

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'nhif_%';
```

## 🎯 Success Metrics

### **Database Health Checks**

```sql
-- 1. All tables created successfully
SELECT COUNT(*) as expected_tables FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'nhif_%';
-- Expected: 4 (simple) or 12 (complete)

-- 2. Sample data inserted
SELECT COUNT(*) as service_tariffs FROM nhif_service_tariffs;
-- Expected: 10

-- 3. Indexes created
SELECT COUNT(*) as indexes_created FROM pg_indexes 
WHERE schemaname = 'public' AND tablename LIKE 'nhif_%';
-- Expected: 6 (simple) or 15+ (complete)

-- 4. RLS enabled
SELECT COUNT(*) as rls_enabled FROM pg_tables 
WHERE schemaname = 'public' AND tablename LIKE 'nhif_%' AND rowsecurity = true;
-- Expected: 4 (simple) or 12 (complete)
```

## 🚀 Next Steps

### **After Database Setup**

1. **Update Backend APIs** - Add NHIF endpoints to server.js
2. **Update Frontend Components** - Integrate with existing NHIF components
3. **Configure NHIF API** - Set up NHIF API credentials
4. **Test Integration** - Test end-to-end NHIF workflow
5. **Deploy to Production** - Go live with NHIF integration

### **Monitoring and Maintenance**

1. **Regular Data Updates** - Update service tariffs and drug formulary
2. **Performance Monitoring** - Monitor query performance and optimize
3. **Security Audits** - Regular RLS and permission reviews
4. **Backup Strategy** - Ensure NHIF data is backed up regularly

## 📞 Support

If you encounter issues:

1. **Check the logs** - Look for error messages in Supabase logs
2. **Verify permissions** - Ensure your user has necessary permissions
3. **Test incrementally** - Run schema in smaller chunks if needed
4. **Contact support** - Reach out for assistance with complex issues

The NHIF database schema provides a robust foundation for comprehensive insurance integration in the Alfa Specialized Hospital Management System! 🎉
