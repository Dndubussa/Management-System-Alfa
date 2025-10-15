-- Fix Missing ICD Tables - Minimal Approach
-- This only creates the missing tables without touching existing triggers

-- Create ICD-11 Codes Table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.icd11_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    foundation_uri TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create CPT-4 Codes Table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.cpt4_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Tanzania Service Codes Table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.tanzania_service_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sha_code VARCHAR(20) NOT NULL UNIQUE,
    service_name TEXT NOT NULL,
    category VARCHAR(100),
    nhif_tariff DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Medical Record Diagnoses Table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.medical_record_diagnoses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    medical_record_id UUID NOT NULL,
    icd10_code VARCHAR(10),
    icd11_code VARCHAR(20),
    diagnosis_type VARCHAR(50) DEFAULT 'primary',
    diagnosis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Prescription Diagnoses Table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.prescription_diagnoses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prescription_id UUID NOT NULL,
    icd10_code VARCHAR(10),
    icd11_code VARCHAR(20),
    diagnosis_type VARCHAR(50) DEFAULT 'primary',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Bill Item Diagnoses Table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.bill_item_diagnoses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bill_item_id UUID NOT NULL,
    icd10_code VARCHAR(10),
    icd11_code VARCHAR(20),
    diagnosis_type VARCHAR(50) DEFAULT 'primary',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Service Code Mappings Table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.service_code_mappings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_price_id UUID NOT NULL,
    icd10_code VARCHAR(10),
    icd11_code VARCHAR(20),
    cpt4_code VARCHAR(10),
    sha_code VARCHAR(20),
    mapping_type VARCHAR(50) DEFAULT 'diagnosis',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (only if not already enabled)
DO $$
BEGIN
    -- Enable RLS for ICD-11 codes
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'icd11_codes' 
        AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.icd11_codes ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Enable RLS for CPT-4 codes
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'cpt4_codes' 
        AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.cpt4_codes ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Enable RLS for Tanzania service codes
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'tanzania_service_codes' 
        AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.tanzania_service_codes ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Enable RLS for medical record diagnoses
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'medical_record_diagnoses' 
        AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.medical_record_diagnoses ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Enable RLS for prescription diagnoses
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'prescription_diagnoses' 
        AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.prescription_diagnoses ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Enable RLS for bill item diagnoses
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'bill_item_diagnoses' 
        AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.bill_item_diagnoses ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Enable RLS for service code mappings
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'service_code_mappings' 
        AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.service_code_mappings ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create RLS Policies (only if they don't exist)
DO $$
BEGIN
    -- ICD-11 codes policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'icd11_codes' 
        AND policyname = 'ICD-11 codes are viewable by all authenticated users'
    ) THEN
        CREATE POLICY "ICD-11 codes are viewable by all authenticated users" ON public.icd11_codes
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    
    -- CPT-4 codes policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'cpt4_codes' 
        AND policyname = 'CPT-4 codes are viewable by all authenticated users'
    ) THEN
        CREATE POLICY "CPT-4 codes are viewable by all authenticated users" ON public.cpt4_codes
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    
    -- Tanzania service codes policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tanzania_service_codes' 
        AND policyname = 'Tanzania service codes are viewable by all authenticated users'
    ) THEN
        CREATE POLICY "Tanzania service codes are viewable by all authenticated users" ON public.tanzania_service_codes
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    
    -- Medical record diagnoses policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'medical_record_diagnoses' 
        AND policyname = 'Medical record diagnoses are viewable by authenticated users'
    ) THEN
        CREATE POLICY "Medical record diagnoses are viewable by authenticated users" ON public.medical_record_diagnoses
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'medical_record_diagnoses' 
        AND policyname = 'Medical record diagnoses are insertable by authenticated users'
    ) THEN
        CREATE POLICY "Medical record diagnoses are insertable by authenticated users" ON public.medical_record_diagnoses
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'medical_record_diagnoses' 
        AND policyname = 'Medical record diagnoses are updatable by authenticated users'
    ) THEN
        CREATE POLICY "Medical record diagnoses are updatable by authenticated users" ON public.medical_record_diagnoses
            FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'medical_record_diagnoses' 
        AND policyname = 'Medical record diagnoses are deletable by authenticated users'
    ) THEN
        CREATE POLICY "Medical record diagnoses are deletable by authenticated users" ON public.medical_record_diagnoses
            FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
    
    -- Prescription diagnoses policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'prescription_diagnoses' 
        AND policyname = 'Prescription diagnoses are viewable by authenticated users'
    ) THEN
        CREATE POLICY "Prescription diagnoses are viewable by authenticated users" ON public.prescription_diagnoses
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'prescription_diagnoses' 
        AND policyname = 'Prescription diagnoses are insertable by authenticated users'
    ) THEN
        CREATE POLICY "Prescription diagnoses are insertable by authenticated users" ON public.prescription_diagnoses
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'prescription_diagnoses' 
        AND policyname = 'Prescription diagnoses are updatable by authenticated users'
    ) THEN
        CREATE POLICY "Prescription diagnoses are updatable by authenticated users" ON public.prescription_diagnoses
            FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'prescription_diagnoses' 
        AND policyname = 'Prescription diagnoses are deletable by authenticated users'
    ) THEN
        CREATE POLICY "Prescription diagnoses are deletable by authenticated users" ON public.prescription_diagnoses
            FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
    
    -- Bill item diagnoses policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'bill_item_diagnoses' 
        AND policyname = 'Bill item diagnoses are viewable by authenticated users'
    ) THEN
        CREATE POLICY "Bill item diagnoses are viewable by authenticated users" ON public.bill_item_diagnoses
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'bill_item_diagnoses' 
        AND policyname = 'Bill item diagnoses are insertable by authenticated users'
    ) THEN
        CREATE POLICY "Bill item diagnoses are insertable by authenticated users" ON public.bill_item_diagnoses
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'bill_item_diagnoses' 
        AND policyname = 'Bill item diagnoses are updatable by authenticated users'
    ) THEN
        CREATE POLICY "Bill item diagnoses are updatable by authenticated users" ON public.bill_item_diagnoses
            FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'bill_item_diagnoses' 
        AND policyname = 'Bill item diagnoses are deletable by authenticated users'
    ) THEN
        CREATE POLICY "Bill item diagnoses are deletable by authenticated users" ON public.bill_item_diagnoses
            FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
    
    -- Service code mappings policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'service_code_mappings' 
        AND policyname = 'Service code mappings are viewable by authenticated users'
    ) THEN
        CREATE POLICY "Service code mappings are viewable by authenticated users" ON public.service_code_mappings
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'service_code_mappings' 
        AND policyname = 'Service code mappings are insertable by authenticated users'
    ) THEN
        CREATE POLICY "Service code mappings are insertable by authenticated users" ON public.service_code_mappings
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'service_code_mappings' 
        AND policyname = 'Service code mappings are updatable by authenticated users'
    ) THEN
        CREATE POLICY "Service code mappings are updatable by authenticated users" ON public.service_code_mappings
            FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'service_code_mappings' 
        AND policyname = 'Service code mappings are deletable by authenticated users'
    ) THEN
        CREATE POLICY "Service code mappings are deletable by authenticated users" ON public.service_code_mappings
            FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Create indexes (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_icd11_codes_code ON public.icd11_codes(code);
CREATE INDEX IF NOT EXISTS idx_icd11_codes_description ON public.icd11_codes(description);
CREATE INDEX IF NOT EXISTS idx_icd11_codes_category ON public.icd11_codes(category);

CREATE INDEX IF NOT EXISTS idx_cpt4_codes_code ON public.cpt4_codes(code);
CREATE INDEX IF NOT EXISTS idx_cpt4_codes_description ON public.cpt4_codes(description);

CREATE INDEX IF NOT EXISTS idx_tanzania_service_codes_sha ON public.tanzania_service_codes(sha_code);
CREATE INDEX IF NOT EXISTS idx_tanzania_service_codes_name ON public.tanzania_service_codes(service_name);

CREATE INDEX IF NOT EXISTS idx_medical_record_diagnoses_record_id ON public.medical_record_diagnoses(medical_record_id);
CREATE INDEX IF NOT EXISTS idx_medical_record_diagnoses_icd10 ON public.medical_record_diagnoses(icd10_code);
CREATE INDEX IF NOT EXISTS idx_medical_record_diagnoses_icd11 ON public.medical_record_diagnoses(icd11_code);

CREATE INDEX IF NOT EXISTS idx_prescription_diagnoses_prescription_id ON public.prescription_diagnoses(prescription_id);
CREATE INDEX IF NOT EXISTS idx_bill_item_diagnoses_bill_item_id ON public.bill_item_diagnoses(bill_item_id);

-- Insert sample data (only if tables are empty)
INSERT INTO public.icd11_codes (code, description, category, subcategory) VALUES
('1A00', 'Cholera', 'Certain infectious or parasitic diseases', 'Intestinal infectious diseases'),
('1A0G', 'Malaria', 'Certain infectious or parasitic diseases', 'Protozoal diseases'),
('1A0P', 'HIV disease', 'Certain infectious or parasitic diseases', 'Viral diseases'),
('1A0M', 'Tuberculosis', 'Certain infectious or parasitic diseases', 'Tuberculosis'),
('5A10', 'Type 1 diabetes mellitus', 'Endocrine, nutritional or metabolic diseases', 'Diabetes mellitus'),
('BA00', 'Essential hypertension', 'Diseases of the circulatory system', 'Hypertensive diseases'),
('1A0S', 'Hepatitis C', 'Certain infectious or parasitic diseases', 'Viral diseases'),
('2A00', 'Malignant neoplasm of breast', 'Neoplasms', 'Malignant neoplasms')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.cpt4_codes (code, description, category, subcategory) VALUES
('99201', 'Office or other outpatient visit for the evaluation and management of a new patient', 'Evaluation and Management', 'Office and Other Outpatient Services'),
('99211', 'Office or other outpatient visit for the evaluation and management of an established patient', 'Evaluation and Management', 'Office and Other Outpatient Services'),
('10021', 'Fine needle aspiration biopsy, without imaging guidance', 'Surgery', 'Surgery'),
('70010', 'Radiologic examination, skull', 'Radiology', 'Radiology'),
('80047', 'Basic metabolic panel', 'Pathology and Laboratory', 'Pathology and Laboratory')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.tanzania_service_codes (sha_code, service_name, category, nhif_tariff) VALUES
('SHA001', 'General Consultation', 'Consultation', 50000.00),
('SHA002', 'Specialist Consultation', 'Consultation', 100000.00),
('SHA006', 'Full Blood Count', 'Laboratory', 15000.00),
('SHA016', 'Chest X-ray', 'Radiology', 25000.00),
('SHA031', 'Appendectomy', 'Surgery', 500000.00)
ON CONFLICT (sha_code) DO NOTHING;
