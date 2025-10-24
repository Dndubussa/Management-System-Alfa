-- NHIF Database Schema for Alfa Specialized Hospital Management System
-- This schema creates all necessary tables for NHIF integration

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function to check if table exists
CREATE OR REPLACE FUNCTION table_exists(tbl_name text) RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = tbl_name
    );
END;
$$ LANGUAGE plpgsql;

-- Helper function to check if column exists
CREATE OR REPLACE FUNCTION column_exists(tbl_name text, col_name text) RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = tbl_name 
        AND column_name = col_name
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- NHIF MEMBER VERIFICATION TABLES
-- =============================================

-- NHIF Member Verifications
CREATE TABLE IF NOT EXISTS nhif_verifications (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id uuid REFERENCES patients(id) NOT NULL,
    nhif_number text NOT NULL,
    verification_status text CHECK (verification_status IN ('verified', 'invalid', 'expired', 'suspended', 'pending')) NOT NULL,
    member_details jsonb,
    facility_eligibility boolean DEFAULT false,
    benefit_plan text,
    coverage_limit decimal(12,2),
    remaining_balance decimal(12,2),
    valid_until date,
    verified_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- NHIF Member History (for tracking verification attempts)
CREATE TABLE IF NOT EXISTS nhif_verification_history (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id uuid REFERENCES patients(id) NOT NULL,
    nhif_number text NOT NULL,
    verification_status text NOT NULL,
    verification_attempts integer DEFAULT 1,
    last_attempt_at timestamp with time zone DEFAULT now(),
    success_rate decimal(5,2) DEFAULT 0.00,
    created_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- NHIF CLAIMS TABLES
-- =============================================

-- NHIF Claims
CREATE TABLE IF NOT EXISTS nhif_claims (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    claim_id text UNIQUE NOT NULL,
    patient_id uuid REFERENCES patients(id) NOT NULL,
    nhif_number text NOT NULL,
    facility_id text NOT NULL,
    claim_data jsonb NOT NULL,
    submission_status text CHECK (submission_status IN ('draft', 'submitted', 'pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'draft',
    nhif_reference text,
    nhif_claim_number text,
    submitted_at timestamp with time zone,
    processed_at timestamp with time zone,
    approved_amount decimal(12,2) DEFAULT 0.00,
    patient_amount decimal(12,2) DEFAULT 0.00,
    total_amount decimal(12,2) NOT NULL,
    rejection_reason text,
    resubmission_count integer DEFAULT 0,
    last_resubmission_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- NHIF Claim Items (services, drugs, procedures)
CREATE TABLE IF NOT EXISTS nhif_claim_items (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    claim_id uuid REFERENCES nhif_claims(id) NOT NULL,
    item_type text CHECK (item_type IN ('service', 'drug', 'procedure', 'diagnostic')) NOT NULL,
    item_code text NOT NULL,
    item_name text NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    unit_price decimal(10,2) NOT NULL,
    total_amount decimal(10,2) NOT NULL,
    nhif_tariff decimal(10,2) NOT NULL,
    nhif_coverage decimal(10,2) NOT NULL,
    patient_copay decimal(10,2) NOT NULL,
    diagnosis_code text,
    practitioner_id uuid,
    requires_prior_auth boolean DEFAULT false,
    prior_auth_number text,
    created_at timestamp with time zone DEFAULT now()
);

-- NHIF Claim Attachments
CREATE TABLE IF NOT EXISTS nhif_claim_attachments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    claim_id uuid REFERENCES nhif_claims(id) NOT NULL,
    attachment_type text CHECK (attachment_type IN ('prescription', 'lab_result', 'radiology', 'medical_report', 'other')) NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size integer,
    mime_type text,
    uploaded_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- NHIF SERVICE AND DRUG TABLES
-- =============================================

-- NHIF Service Tariffs
CREATE TABLE IF NOT EXISTS nhif_service_tariffs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_code text UNIQUE NOT NULL,
    service_name text NOT NULL,
    category text NOT NULL,
    subcategory text,
    nhif_tariff decimal(10,2) NOT NULL,
    is_covered boolean DEFAULT true,
    requires_prior_auth boolean DEFAULT false,
    coverage_percentage decimal(5,2) DEFAULT 100.00,
    max_quantity_per_visit integer,
    max_quantity_per_year integer,
    age_restrictions jsonb,
    gender_restrictions text CHECK (gender_restrictions IN ('male', 'female', 'both')),
    effective_date date NOT NULL,
    expiry_date date,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- NHIF Drug Formulary
CREATE TABLE IF NOT EXISTS nhif_drug_formulary (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    drug_code text UNIQUE NOT NULL,
    drug_name text NOT NULL,
    generic_name text,
    manufacturer text,
    dosage_form text,
    strength text,
    nhif_price decimal(10,2) NOT NULL,
    is_covered boolean DEFAULT true,
    copay_amount decimal(10,2) DEFAULT 0.00,
    coverage_percentage decimal(5,2) DEFAULT 100.00,
    requires_prior_auth boolean DEFAULT false,
    max_quantity_per_prescription integer,
    max_quantity_per_month integer,
    therapeutic_class text,
    age_restrictions jsonb,
    gender_restrictions text CHECK (gender_restrictions IN ('male', 'female', 'both')),
    effective_date date NOT NULL,
    expiry_date date,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- NHIF Diagnosis Codes
CREATE TABLE IF NOT EXISTS nhif_diagnosis_codes (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    icd11_code text NOT NULL,
    diagnosis_name text NOT NULL,
    category text NOT NULL,
    is_covered boolean DEFAULT true,
    requires_prior_auth boolean DEFAULT false,
    coverage_limitations text,
    effective_date date NOT NULL,
    expiry_date date,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- NHIF PRIOR AUTHORIZATION TABLES
-- =============================================

-- NHIF Prior Authorization Requests
CREATE TABLE IF NOT EXISTS nhif_prior_auth_requests (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_id text UNIQUE NOT NULL,
    patient_id uuid REFERENCES patients(id) NOT NULL,
    nhif_number text NOT NULL,
    service_code text NOT NULL,
    service_name text NOT NULL,
    diagnosis_code text NOT NULL,
    diagnosis_name text NOT NULL,
    requested_amount decimal(10,2) NOT NULL,
    justification text NOT NULL,
    supporting_documents jsonb,
    request_status text CHECK (request_status IN ('pending', 'approved', 'rejected', 'expired')) DEFAULT 'pending',
    nhif_reference text,
    approved_amount decimal(10,2),
    approval_date date,
    expiry_date date,
    rejection_reason text,
    submitted_at timestamp with time zone DEFAULT now(),
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- NHIF PAYMENT AND SETTLEMENT TABLES
-- =============================================

-- NHIF Payments
CREATE TABLE IF NOT EXISTS nhif_payments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    payment_id text UNIQUE NOT NULL,
    claim_id uuid REFERENCES nhif_claims(id) NOT NULL,
    patient_id uuid REFERENCES patients(id) NOT NULL,
    payment_amount decimal(12,2) NOT NULL,
    payment_date date NOT NULL,
    payment_method text CHECK (payment_method IN ('bank_transfer', 'cheque', 'cash', 'mobile_money')) NOT NULL,
    payment_reference text,
    bank_reference text,
    payment_status text CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- NHIF Payment Items
CREATE TABLE IF NOT EXISTS nhif_payment_items (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    payment_id uuid REFERENCES nhif_payments(id) NOT NULL,
    claim_item_id uuid REFERENCES nhif_claim_items(id) NOT NULL,
    item_amount decimal(10,2) NOT NULL,
    payment_status text CHECK (payment_status IN ('paid', 'partial', 'pending', 'rejected')) DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- NHIF AUDIT AND LOGGING TABLES
-- =============================================

-- NHIF API Logs
CREATE TABLE IF NOT EXISTS nhif_api_logs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    api_endpoint text NOT NULL,
    request_method text NOT NULL,
    request_data jsonb,
    response_data jsonb,
    response_status integer,
    response_time_ms integer,
    error_message text,
    user_id uuid,
    patient_id uuid REFERENCES patients(id),
    created_at timestamp with time zone DEFAULT now()
);

-- NHIF System Events
CREATE TABLE IF NOT EXISTS nhif_system_events (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type text NOT NULL,
    event_description text NOT NULL,
    event_data jsonb,
    user_id uuid,
    patient_id uuid REFERENCES patients(id),
    claim_id uuid REFERENCES nhif_claims(id),
    severity text CHECK (severity IN ('info', 'warning', 'error', 'critical')) DEFAULT 'info',
    created_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- NHIF Verifications indexes
CREATE INDEX IF NOT EXISTS idx_nhif_verifications_patient_id ON nhif_verifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_nhif_verifications_nhif_number ON nhif_verifications(nhif_number);
CREATE INDEX IF NOT EXISTS idx_nhif_verifications_status ON nhif_verifications(verification_status);
CREATE INDEX IF NOT EXISTS idx_nhif_verifications_verified_at ON nhif_verifications(verified_at);

-- NHIF Claims indexes
CREATE INDEX IF NOT EXISTS idx_nhif_claims_patient_id ON nhif_claims(patient_id);
CREATE INDEX IF NOT EXISTS idx_nhif_claims_nhif_number ON nhif_claims(nhif_number);
CREATE INDEX IF NOT EXISTS idx_nhif_claims_status ON nhif_claims(submission_status);
CREATE INDEX IF NOT EXISTS idx_nhif_claims_submitted_at ON nhif_claims(submitted_at);
CREATE INDEX IF NOT EXISTS idx_nhif_claims_nhif_reference ON nhif_claims(nhif_reference);

-- NHIF Claim Items indexes
CREATE INDEX IF NOT EXISTS idx_nhif_claim_items_claim_id ON nhif_claim_items(claim_id);
CREATE INDEX IF NOT EXISTS idx_nhif_claim_items_item_code ON nhif_claim_items(item_code);
CREATE INDEX IF NOT EXISTS idx_nhif_claim_items_item_type ON nhif_claim_items(item_type);

-- NHIF Service Tariffs indexes
CREATE INDEX IF NOT EXISTS idx_nhif_service_tariffs_code ON nhif_service_tariffs(service_code);
CREATE INDEX IF NOT EXISTS idx_nhif_service_tariffs_category ON nhif_service_tariffs(category);
CREATE INDEX IF NOT EXISTS idx_nhif_service_tariffs_active ON nhif_service_tariffs(is_active);

-- NHIF Drug Formulary indexes
CREATE INDEX IF NOT EXISTS idx_nhif_drug_formulary_code ON nhif_drug_formulary(drug_code);
CREATE INDEX IF NOT EXISTS idx_nhif_drug_formulary_name ON nhif_drug_formulary(drug_name);
CREATE INDEX IF NOT EXISTS idx_nhif_drug_formulary_active ON nhif_drug_formulary(is_active);

-- NHIF Prior Auth indexes
CREATE INDEX IF NOT EXISTS idx_nhif_prior_auth_patient_id ON nhif_prior_auth_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_nhif_prior_auth_status ON nhif_prior_auth_requests(request_status);
CREATE INDEX IF NOT EXISTS idx_nhif_prior_auth_submitted_at ON nhif_prior_auth_requests(submitted_at);

-- NHIF Payments indexes
CREATE INDEX IF NOT EXISTS idx_nhif_payments_claim_id ON nhif_payments(claim_id);
CREATE INDEX IF NOT EXISTS idx_nhif_payments_patient_id ON nhif_payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_nhif_payments_status ON nhif_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_nhif_payments_date ON nhif_payments(payment_date);

-- NHIF API Logs indexes
CREATE INDEX IF NOT EXISTS idx_nhif_api_logs_endpoint ON nhif_api_logs(api_endpoint);
CREATE INDEX IF NOT EXISTS idx_nhif_api_logs_created_at ON nhif_api_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_nhif_api_logs_patient_id ON nhif_api_logs(patient_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all NHIF tables
ALTER TABLE nhif_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE nhif_verification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE nhif_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE nhif_claim_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE nhif_claim_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nhif_service_tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nhif_drug_formulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE nhif_diagnosis_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE nhif_prior_auth_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE nhif_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nhif_payment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE nhif_api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nhif_system_events ENABLE ROW LEVEL SECURITY;

-- =============================================
-- UPDATE TRIGGERS
-- =============================================

-- Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers to tables with updated_at columns
DO $$
BEGIN
    IF table_exists('nhif_verifications') AND column_exists('nhif_verifications', 'updated_at') THEN
        DROP TRIGGER IF EXISTS update_nhif_verifications_updated_at ON nhif_verifications;
        CREATE TRIGGER update_nhif_verifications_updated_at
            BEFORE UPDATE ON nhif_verifications
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF table_exists('nhif_claims') AND column_exists('nhif_claims', 'updated_at') THEN
        DROP TRIGGER IF EXISTS update_nhif_claims_updated_at ON nhif_claims;
        CREATE TRIGGER update_nhif_claims_updated_at
            BEFORE UPDATE ON nhif_claims
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF table_exists('nhif_service_tariffs') AND column_exists('nhif_service_tariffs', 'updated_at') THEN
        DROP TRIGGER IF EXISTS update_nhif_service_tariffs_updated_at ON nhif_service_tariffs;
        CREATE TRIGGER update_nhif_service_tariffs_updated_at
            BEFORE UPDATE ON nhif_service_tariffs
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF table_exists('nhif_drug_formulary') AND column_exists('nhif_drug_formulary', 'updated_at') THEN
        DROP TRIGGER IF EXISTS update_nhif_drug_formulary_updated_at ON nhif_drug_formulary;
        CREATE TRIGGER update_nhif_drug_formulary_updated_at
            BEFORE UPDATE ON nhif_drug_formulary
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF table_exists('nhif_diagnosis_codes') AND column_exists('nhif_diagnosis_codes', 'updated_at') THEN
        DROP TRIGGER IF EXISTS update_nhif_diagnosis_codes_updated_at ON nhif_diagnosis_codes;
        CREATE TRIGGER update_nhif_diagnosis_codes_updated_at
            BEFORE UPDATE ON nhif_diagnosis_codes
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF table_exists('nhif_prior_auth_requests') AND column_exists('nhif_prior_auth_requests', 'updated_at') THEN
        DROP TRIGGER IF EXISTS update_nhif_prior_auth_requests_updated_at ON nhif_prior_auth_requests;
        CREATE TRIGGER update_nhif_prior_auth_requests_updated_at
            BEFORE UPDATE ON nhif_prior_auth_requests
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =============================================
-- SAMPLE DATA (OPTIONAL)
-- =============================================

-- Insert sample NHIF service tariffs
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM nhif_service_tariffs LIMIT 1) THEN
        INSERT INTO nhif_service_tariffs (service_code, service_name, category, nhif_tariff, is_covered, effective_date) VALUES
        ('SHA001', 'General Consultation', 'Consultation', 50000.00, true, CURRENT_DATE),
        ('SHA002', 'Specialist Consultation', 'Consultation', 100000.00, true, CURRENT_DATE),
        ('SHA003', 'Emergency Consultation', 'Emergency', 75000.00, true, CURRENT_DATE),
        ('SHA004', 'Follow-up Consultation', 'Consultation', 30000.00, true, CURRENT_DATE),
        ('SHA005', 'X-ray Chest', 'Radiology', 25000.00, true, CURRENT_DATE),
        ('SHA006', 'Full Blood Count', 'Laboratory', 15000.00, true, CURRENT_DATE),
        ('SHA007', 'Urine Analysis', 'Laboratory', 10000.00, true, CURRENT_DATE),
        ('SHA008', 'Blood Sugar Test', 'Laboratory', 8000.00, true, CURRENT_DATE),
        ('SHA009', 'Blood Pressure Monitoring', 'Vital Signs', 5000.00, true, CURRENT_DATE),
        ('SHA010', 'Temperature Check', 'Vital Signs', 3000.00, true, CURRENT_DATE);
        
        RAISE NOTICE '✅ Sample NHIF service tariffs inserted';
    END IF;
END $$;

-- Insert sample NHIF drug formulary
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM nhif_drug_formulary LIMIT 1) THEN
        INSERT INTO nhif_drug_formulary (drug_code, drug_name, generic_name, dosage_form, strength, nhif_price, is_covered, effective_date) VALUES
        ('DRG001', 'Paracetamol 500mg', 'Paracetamol', 'Tablet', '500mg', 200.00, true, CURRENT_DATE),
        ('DRG002', 'Amoxicillin 250mg', 'Amoxicillin', 'Capsule', '250mg', 500.00, true, CURRENT_DATE),
        ('DRG003', 'Ibuprofen 400mg', 'Ibuprofen', 'Tablet', '400mg', 300.00, true, CURRENT_DATE),
        ('DRG004', 'Metformin 500mg', 'Metformin', 'Tablet', '500mg', 150.00, true, CURRENT_DATE),
        ('DRG005', 'Lisinopril 5mg', 'Lisinopril', 'Tablet', '5mg', 800.00, true, CURRENT_DATE),
        ('DRG006', 'Amlodipine 5mg', 'Amlodipine', 'Tablet', '5mg', 600.00, true, CURRENT_DATE),
        ('DRG007', 'Omeprazole 20mg', 'Omeprazole', 'Capsule', '20mg', 400.00, true, CURRENT_DATE),
        ('DRG008', 'Salbutamol Inhaler', 'Salbutamol', 'Inhaler', '100mcg', 2500.00, true, CURRENT_DATE),
        ('DRG009', 'Insulin Regular', 'Insulin', 'Vial', '100 units/ml', 5000.00, true, CURRENT_DATE),
        ('DRG010', 'Furosemide 40mg', 'Furosemide', 'Tablet', '40mg', 250.00, true, CURRENT_DATE);
        
        RAISE NOTICE '✅ Sample NHIF drug formulary inserted';
    END IF;
END $$;

-- Insert sample NHIF diagnosis codes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM nhif_diagnosis_codes LIMIT 1) THEN
        INSERT INTO nhif_diagnosis_codes (icd11_code, diagnosis_name, category, is_covered, effective_date) VALUES
        ('BA00', 'Essential Hypertension', 'Cardiovascular', true, CURRENT_DATE),
        ('5A10', 'Type 2 Diabetes Mellitus', 'Endocrine', true, CURRENT_DATE),
        ('CA40', 'Pneumonia', 'Respiratory', true, CURRENT_DATE),
        ('DD90', 'Gastritis', 'Gastrointestinal', true, CURRENT_DATE),
        ('AB30', 'Headache', 'Neurological', true, CURRENT_DATE),
        ('CA20', 'Bronchitis', 'Respiratory', true, CURRENT_DATE),
        ('DD50', 'Diarrhea', 'Gastrointestinal', true, CURRENT_DATE),
        ('AB70', 'Fever', 'General', true, CURRENT_DATE),
        ('BA20', 'Chest Pain', 'Cardiovascular', true, CURRENT_DATE),
        ('5A20', 'Hyperthyroidism', 'Endocrine', true, CURRENT_DATE);
        
        RAISE NOTICE '✅ Sample NHIF diagnosis codes inserted';
    END IF;
END $$;

-- Clean up helper functions
DROP FUNCTION IF EXISTS table_exists(text);
DROP FUNCTION IF EXISTS column_exists(text, text);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 NHIF Database Schema Created Successfully!';
    RAISE NOTICE '📊 Created Tables:';
    RAISE NOTICE '   🔍 Member Verification: nhif_verifications, nhif_verification_history';
    RAISE NOTICE '   📋 Claims Processing: nhif_claims, nhif_claim_items, nhif_claim_attachments';
    RAISE NOTICE '   💊 Service & Drugs: nhif_service_tariffs, nhif_drug_formulary, nhif_diagnosis_codes';
    RAISE NOTICE '   🔐 Prior Authorization: nhif_prior_auth_requests';
    RAISE NOTICE '   💰 Payments: nhif_payments, nhif_payment_items';
    RAISE NOTICE '   📝 Audit & Logs: nhif_api_logs, nhif_system_events';
    RAISE NOTICE '🔒 Row Level Security enabled on all tables';
    RAISE NOTICE '📈 Performance indexes created';
    RAISE NOTICE '🎯 Sample data inserted';
    RAISE NOTICE '🚀 NHIF integration ready for implementation!';
END $$;
