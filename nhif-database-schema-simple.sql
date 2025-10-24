-- NHIF Database Schema - Simplified Version
-- This creates the essential NHIF tables for basic integration

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE NHIF TABLES
-- =============================================

-- NHIF Member Verifications
CREATE TABLE IF NOT EXISTS nhif_verifications (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id uuid REFERENCES patients(id) NOT NULL,
    nhif_number text NOT NULL,
    verification_status text CHECK (verification_status IN ('verified', 'invalid', 'expired', 'suspended')) NOT NULL,
    member_details jsonb,
    verified_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- NHIF Claims
CREATE TABLE IF NOT EXISTS nhif_claims (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    claim_id text UNIQUE NOT NULL,
    patient_id uuid REFERENCES patients(id) NOT NULL,
    nhif_number text NOT NULL,
    claim_data jsonb NOT NULL,
    submission_status text CHECK (submission_status IN ('draft', 'submitted', 'pending', 'approved', 'rejected')) DEFAULT 'draft',
    nhif_reference text,
    submitted_at timestamp with time zone,
    approved_amount decimal(12,2) DEFAULT 0.00,
    patient_amount decimal(12,2) DEFAULT 0.00,
    total_amount decimal(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- NHIF Service Tariffs
CREATE TABLE IF NOT EXISTS nhif_service_tariffs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_code text UNIQUE NOT NULL,
    service_name text NOT NULL,
    category text NOT NULL,
    nhif_tariff decimal(10,2) NOT NULL,
    is_covered boolean DEFAULT true,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- NHIF Drug Formulary
CREATE TABLE IF NOT EXISTS nhif_drug_formulary (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    drug_code text UNIQUE NOT NULL,
    drug_name text NOT NULL,
    nhif_price decimal(10,2) NOT NULL,
    is_covered boolean DEFAULT true,
    copay_amount decimal(10,2) DEFAULT 0.00,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- BASIC INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_nhif_verifications_patient_id ON nhif_verifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_nhif_verifications_nhif_number ON nhif_verifications(nhif_number);
CREATE INDEX IF NOT EXISTS idx_nhif_claims_patient_id ON nhif_claims(patient_id);
CREATE INDEX IF NOT EXISTS idx_nhif_claims_status ON nhif_claims(submission_status);
CREATE INDEX IF NOT EXISTS idx_nhif_service_tariffs_code ON nhif_service_tariffs(service_code);
CREATE INDEX IF NOT EXISTS idx_nhif_drug_formulary_code ON nhif_drug_formulary(drug_code);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE nhif_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE nhif_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE nhif_service_tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nhif_drug_formulary ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert sample service tariffs
INSERT INTO nhif_service_tariffs (service_code, service_name, category, nhif_tariff, is_covered) VALUES
('SHA001', 'General Consultation', 'Consultation', 50000.00, true),
('SHA002', 'Specialist Consultation', 'Consultation', 100000.00, true),
('SHA003', 'Emergency Consultation', 'Emergency', 75000.00, true),
('SHA004', 'X-ray Chest', 'Radiology', 25000.00, true),
('SHA005', 'Full Blood Count', 'Laboratory', 15000.00, true),
('SHA006', 'Urine Analysis', 'Laboratory', 10000.00, true),
('SHA007', 'Blood Sugar Test', 'Laboratory', 8000.00, true),
('SHA008', 'Blood Pressure Monitoring', 'Vital Signs', 5000.00, true),
('SHA009', 'Temperature Check', 'Vital Signs', 3000.00, true),
('SHA010', 'Follow-up Consultation', 'Consultation', 30000.00, true)
ON CONFLICT (service_code) DO NOTHING;

-- Insert sample drug formulary
INSERT INTO nhif_drug_formulary (drug_code, drug_name, nhif_price, is_covered, copay_amount) VALUES
('DRG001', 'Paracetamol 500mg', 200.00, true, 0.00),
('DRG002', 'Amoxicillin 250mg', 500.00, true, 0.00),
('DRG003', 'Ibuprofen 400mg', 300.00, true, 0.00),
('DRG004', 'Metformin 500mg', 150.00, true, 0.00),
('DRG005', 'Lisinopril 5mg', 800.00, true, 0.00),
('DRG006', 'Amlodipine 5mg', 600.00, true, 0.00),
('DRG007', 'Omeprazole 20mg', 400.00, true, 0.00),
('DRG008', 'Salbutamol Inhaler', 2500.00, true, 0.00),
('DRG009', 'Insulin Regular', 5000.00, true, 0.00),
('DRG010', 'Furosemide 40mg', 250.00, true, 0.00)
ON CONFLICT (drug_code) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ NHIF Database Schema (Simplified) Created Successfully!';
    RAISE NOTICE '📊 Created Tables: nhif_verifications, nhif_claims, nhif_service_tariffs, nhif_drug_formulary';
    RAISE NOTICE '🔒 Row Level Security enabled';
    RAISE NOTICE '📈 Performance indexes created';
    RAISE NOTICE '🎯 Sample data inserted';
    RAISE NOTICE '🚀 Ready for NHIF integration!';
END $$;
