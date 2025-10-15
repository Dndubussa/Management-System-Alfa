-- Step 1: Create ICD-10 Codes Table
CREATE TABLE IF NOT EXISTS public.icd10_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create ICD-11 Codes Table
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

-- Step 3: Create CPT-4 Codes Table
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

-- Step 4: Create Tanzania Service Codes Table
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

-- Step 5: Create Medical Record Diagnoses Table
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

-- Step 6: Create Prescription Diagnoses Table
CREATE TABLE IF NOT EXISTS public.prescription_diagnoses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prescription_id UUID NOT NULL,
    icd10_code VARCHAR(10),
    icd11_code VARCHAR(20),
    diagnosis_type VARCHAR(50) DEFAULT 'primary',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Create Bill Item Diagnoses Table
CREATE TABLE IF NOT EXISTS public.bill_item_diagnoses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bill_item_id UUID NOT NULL,
    icd10_code VARCHAR(10),
    icd11_code VARCHAR(20),
    diagnosis_type VARCHAR(50) DEFAULT 'primary',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 8: Create Service Code Mappings Table
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

-- Step 9: Enable Row Level Security
ALTER TABLE public.icd10_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icd11_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpt4_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tanzania_service_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_record_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_item_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_code_mappings ENABLE ROW LEVEL SECURITY;

-- Step 10: Create Basic RLS Policies
CREATE POLICY "ICD codes are viewable by all authenticated users" ON public.icd10_codes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "ICD-11 codes are viewable by all authenticated users" ON public.icd11_codes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "CPT-4 codes are viewable by all authenticated users" ON public.cpt4_codes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Tanzania service codes are viewable by all authenticated users" ON public.tanzania_service_codes
    FOR SELECT USING (auth.role() = 'authenticated');

-- Step 11: Insert Sample ICD-10 Data
INSERT INTO public.icd10_codes (code, description, category, subcategory) VALUES
('A00', 'Cholera', 'Infectious and parasitic diseases', 'Intestinal infectious diseases'),
('A01', 'Typhoid and paratyphoid fevers', 'Infectious and parasitic diseases', 'Intestinal infectious diseases'),
('B50', 'Plasmodium falciparum malaria', 'Infectious and parasitic diseases', 'Protozoal diseases'),
('B20', 'Human immunodeficiency virus [HIV] disease', 'Infectious and parasitic diseases', 'Viral diseases'),
('A15', 'Respiratory tuberculosis', 'Infectious and parasitic diseases', 'Tuberculosis'),
('E10', 'Type 1 diabetes mellitus', 'Endocrine, nutritional and metabolic diseases', 'Diabetes mellitus'),
('I10', 'Essential hypertension', 'Diseases of the circulatory system', 'Diseases of arteries, arterioles and capillaries'),
('J12', 'Viral pneumonia', 'Diseases of the respiratory system', 'Influenza and pneumonia'),
('K25', 'Gastric ulcer', 'Diseases of the digestive system', 'Diseases of oesophagus, stomach and duodenum')
ON CONFLICT (code) DO NOTHING;

-- Step 12: Insert Sample ICD-11 Data
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

-- Step 13: Insert Sample Tanzania Service Codes
INSERT INTO public.tanzania_service_codes (sha_code, service_name, category, nhif_tariff) VALUES
('SHA001', 'General Consultation', 'Consultation', 50000.00),
('SHA002', 'Specialist Consultation', 'Consultation', 100000.00),
('SHA006', 'Full Blood Count', 'Laboratory', 15000.00),
('SHA016', 'Chest X-ray', 'Radiology', 25000.00),
('SHA031', 'Appendectomy', 'Surgery', 500000.00)
ON CONFLICT (sha_code) DO NOTHING;

-- Step 14: Create Indexes
CREATE INDEX IF NOT EXISTS idx_icd10_codes_code ON public.icd10_codes(code);
CREATE INDEX IF NOT EXISTS idx_icd11_codes_code ON public.icd11_codes(code);
CREATE INDEX IF NOT EXISTS idx_cpt4_codes_code ON public.cpt4_codes(code);
CREATE INDEX IF NOT EXISTS idx_tanzania_service_codes_sha ON public.tanzania_service_codes(sha_code);

-- Step 15: Create Update Function and Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_icd10_codes_updated_at BEFORE UPDATE ON public.icd10_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_icd11_codes_updated_at BEFORE UPDATE ON public.icd11_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tanzania_service_codes_updated_at BEFORE UPDATE ON public.tanzania_service_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
