-- ICD-10/ICD-11 Standardized Health Terminologies Schema (Safe Version)
-- For Tanzania Ministry of Health Compliance
-- This version handles existing objects gracefully

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing triggers first to avoid conflicts
DROP TRIGGER IF EXISTS update_icd10_codes_updated_at ON public.icd10_codes;
DROP TRIGGER IF EXISTS update_icd11_codes_updated_at ON public.icd11_codes;
DROP TRIGGER IF EXISTS update_cpt4_codes_updated_at ON public.cpt4_codes;
DROP TRIGGER IF EXISTS update_tanzania_service_codes_updated_at ON public.tanzania_service_codes;
DROP TRIGGER IF EXISTS update_medical_record_diagnoses_updated_at ON public.medical_record_diagnoses;
DROP TRIGGER IF EXISTS update_service_code_mappings_updated_at ON public.service_code_mappings;

-- ICD-10 Diagnostic Codes Table
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

-- ICD-11 Diagnostic Codes Table
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

-- CPT-4 Procedure Codes Table (for medical procedures)
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

-- Tanzania-specific Service Codes (SHA codes for NHIF)
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

-- Medical Record Diagnoses (linking medical records to ICD codes)
CREATE TABLE IF NOT EXISTS public.medical_record_diagnoses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    medical_record_id UUID NOT NULL,
    icd10_code VARCHAR(10),
    icd11_code VARCHAR(20),
    diagnosis_type VARCHAR(50) DEFAULT 'primary', -- primary, secondary, differential
    diagnosis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescription Diagnoses (linking prescriptions to ICD codes)
CREATE TABLE IF NOT EXISTS public.prescription_diagnoses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prescription_id UUID NOT NULL,
    icd10_code VARCHAR(10),
    icd11_code VARCHAR(20),
    diagnosis_type VARCHAR(50) DEFAULT 'primary',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bill Item Diagnoses (linking bill items to ICD codes for insurance)
CREATE TABLE IF NOT EXISTS public.bill_item_diagnoses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bill_item_id UUID NOT NULL,
    icd10_code VARCHAR(10),
    icd11_code VARCHAR(20),
    diagnosis_type VARCHAR(50) DEFAULT 'primary',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Code Mappings (mapping hospital services to standardized codes)
CREATE TABLE IF NOT EXISTS public.service_code_mappings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_price_id UUID NOT NULL,
    icd10_code VARCHAR(10),
    icd11_code VARCHAR(20),
    cpt4_code VARCHAR(10),
    sha_code VARCHAR(20),
    mapping_type VARCHAR(50) DEFAULT 'diagnosis', -- diagnosis, procedure, service
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_icd10_codes_code ON public.icd10_codes(code);
CREATE INDEX IF NOT EXISTS idx_icd10_codes_description ON public.icd10_codes(description);
CREATE INDEX IF NOT EXISTS idx_icd10_codes_category ON public.icd10_codes(category);

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

-- Row Level Security (RLS) policies
ALTER TABLE public.icd10_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icd11_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpt4_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tanzania_service_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_record_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_item_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_code_mappings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "ICD codes are viewable by all authenticated users" ON public.icd10_codes;
DROP POLICY IF EXISTS "ICD-11 codes are viewable by all authenticated users" ON public.icd11_codes;
DROP POLICY IF EXISTS "CPT-4 codes are viewable by all authenticated users" ON public.cpt4_codes;
DROP POLICY IF EXISTS "Tanzania service codes are viewable by all authenticated users" ON public.tanzania_service_codes;
DROP POLICY IF EXISTS "Medical record diagnoses are viewable by authenticated users" ON public.medical_record_diagnoses;
DROP POLICY IF EXISTS "Medical record diagnoses are insertable by authenticated users" ON public.medical_record_diagnoses;
DROP POLICY IF EXISTS "Medical record diagnoses are updatable by authenticated users" ON public.medical_record_diagnoses;
DROP POLICY IF EXISTS "Medical record diagnoses are deletable by authenticated users" ON public.medical_record_diagnoses;
DROP POLICY IF EXISTS "Prescription diagnoses are viewable by authenticated users" ON public.prescription_diagnoses;
DROP POLICY IF EXISTS "Prescription diagnoses are insertable by authenticated users" ON public.prescription_diagnoses;
DROP POLICY IF EXISTS "Prescription diagnoses are updatable by authenticated users" ON public.prescription_diagnoses;
DROP POLICY IF EXISTS "Prescription diagnoses are deletable by authenticated users" ON public.prescription_diagnoses;
DROP POLICY IF EXISTS "Bill item diagnoses are viewable by authenticated users" ON public.bill_item_diagnoses;
DROP POLICY IF EXISTS "Bill item diagnoses are insertable by authenticated users" ON public.bill_item_diagnoses;
DROP POLICY IF EXISTS "Bill item diagnoses are updatable by authenticated users" ON public.bill_item_diagnoses;
DROP POLICY IF EXISTS "Bill item diagnoses are deletable by authenticated users" ON public.bill_item_diagnoses;
DROP POLICY IF EXISTS "Service code mappings are viewable by authenticated users" ON public.service_code_mappings;
DROP POLICY IF EXISTS "Service code mappings are insertable by authenticated users" ON public.service_code_mappings;
DROP POLICY IF EXISTS "Service code mappings are updatable by authenticated users" ON public.service_code_mappings;
DROP POLICY IF EXISTS "Service code mappings are deletable by authenticated users" ON public.service_code_mappings;

-- RLS Policies for ICD codes (read-only for all authenticated users)
CREATE POLICY "ICD codes are viewable by all authenticated users" ON public.icd10_codes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "ICD-11 codes are viewable by all authenticated users" ON public.icd11_codes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "CPT-4 codes are viewable by all authenticated users" ON public.cpt4_codes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Tanzania service codes are viewable by all authenticated users" ON public.tanzania_service_codes
    FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for medical record diagnoses
CREATE POLICY "Medical record diagnoses are viewable by authenticated users" ON public.medical_record_diagnoses
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Medical record diagnoses are insertable by authenticated users" ON public.medical_record_diagnoses
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Medical record diagnoses are updatable by authenticated users" ON public.medical_record_diagnoses
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Medical record diagnoses are deletable by authenticated users" ON public.medical_record_diagnoses
    FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for prescription diagnoses
CREATE POLICY "Prescription diagnoses are viewable by authenticated users" ON public.prescription_diagnoses
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Prescription diagnoses are insertable by authenticated users" ON public.prescription_diagnoses
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Prescription diagnoses are updatable by authenticated users" ON public.prescription_diagnoses
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Prescription diagnoses are deletable by authenticated users" ON public.prescription_diagnoses
    FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for bill item diagnoses
CREATE POLICY "Bill item diagnoses are viewable by authenticated users" ON public.bill_item_diagnoses
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Bill item diagnoses are insertable by authenticated users" ON public.bill_item_diagnoses
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Bill item diagnoses are updatable by authenticated users" ON public.bill_item_diagnoses
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Bill item diagnoses are deletable by authenticated users" ON public.bill_item_diagnoses
    FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for service code mappings
CREATE POLICY "Service code mappings are viewable by authenticated users" ON public.service_code_mappings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service code mappings are insertable by authenticated users" ON public.service_code_mappings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Service code mappings are updatable by authenticated users" ON public.service_code_mappings
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Service code mappings are deletable by authenticated users" ON public.service_code_mappings
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create or replace the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_icd10_codes_updated_at BEFORE UPDATE ON public.icd10_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_icd11_codes_updated_at BEFORE UPDATE ON public.icd11_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cpt4_codes_updated_at BEFORE UPDATE ON public.cpt4_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tanzania_service_codes_updated_at BEFORE UPDATE ON public.tanzania_service_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_record_diagnoses_updated_at BEFORE UPDATE ON public.medical_record_diagnoses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_code_mappings_updated_at BEFORE UPDATE ON public.service_code_mappings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample ICD-10 codes (only if they don't exist)
INSERT INTO public.icd10_codes (code, description, category, subcategory) VALUES
-- Infectious and parasitic diseases
('A00', 'Cholera', 'Infectious and parasitic diseases', 'Intestinal infectious diseases'),
('A01', 'Typhoid and paratyphoid fevers', 'Infectious and parasitic diseases', 'Intestinal infectious diseases'),
('A02', 'Other salmonella infections', 'Infectious and parasitic diseases', 'Intestinal infectious diseases'),
('A03', 'Shigellosis', 'Infectious and parasitic diseases', 'Intestinal infectious diseases'),
('A04', 'Other bacterial intestinal infections', 'Infectious and parasitic diseases', 'Intestinal infectious diseases'),
('A05', 'Other bacterial foodborne intoxications', 'Infectious and parasitic diseases', 'Intestinal infectious diseases'),
('A06', 'Amoebiasis', 'Infectious and parasitic diseases', 'Intestinal infectious diseases'),
('A07', 'Other protozoal intestinal diseases', 'Infectious and parasitic diseases', 'Intestinal infectious diseases'),
('A08', 'Viral and other specified intestinal infections', 'Infectious and parasitic diseases', 'Intestinal infectious diseases'),
('A09', 'Diarrhoea and gastroenteritis of presumed infectious origin', 'Infectious and parasitic diseases', 'Intestinal infectious diseases'),

-- Malaria
('B50', 'Plasmodium falciparum malaria', 'Infectious and parasitic diseases', 'Protozoal diseases'),
('B51', 'Plasmodium vivax malaria', 'Infectious and parasitic diseases', 'Protozoal diseases'),
('B52', 'Plasmodium malariae malaria', 'Infectious and parasitic diseases', 'Protozoal diseases'),
('B53', 'Other specified malaria', 'Infectious and parasitic diseases', 'Protozoal diseases'),
('B54', 'Unspecified malaria', 'Infectious and parasitic diseases', 'Protozoal diseases'),

-- HIV/AIDS
('B20', 'Human immunodeficiency virus [HIV] disease', 'Infectious and parasitic diseases', 'Viral diseases'),
('B21', 'Human immunodeficiency virus [HIV] disease resulting in malignant neoplasms', 'Infectious and parasitic diseases', 'Viral diseases'),
('B22', 'Human immunodeficiency virus [HIV] disease resulting in other specified diseases', 'Infectious and parasitic diseases', 'Viral diseases'),
('B23', 'Human immunodeficiency virus [HIV] disease resulting in other conditions', 'Infectious and parasitic diseases', 'Viral diseases'),
('B24', 'Unspecified human immunodeficiency virus [HIV] disease', 'Infectious and parasitic diseases', 'Viral diseases'),

-- Tuberculosis
('A15', 'Respiratory tuberculosis, bacteriologically and histologically confirmed', 'Infectious and parasitic diseases', 'Tuberculosis'),
('A16', 'Respiratory tuberculosis, not confirmed bacteriologically or histologically', 'Infectious and parasitic diseases', 'Tuberculosis'),
('A17', 'Tuberculosis of nervous system', 'Infectious and parasitic diseases', 'Tuberculosis'),
('A18', 'Tuberculosis of other organs', 'Infectious and parasitic diseases', 'Tuberculosis'),
('A19', 'Miliary tuberculosis', 'Infectious and parasitic diseases', 'Tuberculosis'),

-- Neoplasms
('C50', 'Malignant neoplasm of breast', 'Neoplasms', 'Malignant neoplasms'),
('C78', 'Secondary malignant neoplasm of respiratory and digestive organs', 'Neoplasms', 'Malignant neoplasms'),
('C79', 'Secondary malignant neoplasm of other and unspecified sites', 'Neoplasms', 'Malignant neoplasms'),

-- Endocrine, nutritional and metabolic diseases
('E10', 'Type 1 diabetes mellitus', 'Endocrine, nutritional and metabolic diseases', 'Diabetes mellitus'),
('E11', 'Type 2 diabetes mellitus', 'Endocrine, nutritional and metabolic diseases', 'Diabetes mellitus'),
('E14', 'Unspecified diabetes mellitus', 'Endocrine, nutritional and metabolic diseases', 'Diabetes mellitus'),

-- Mental and behavioural disorders
('F10', 'Mental and behavioural disorders due to use of alcohol', 'Mental and behavioural disorders', 'Mental and behavioural disorders due to psychoactive substance use'),
('F20', 'Schizophrenia', 'Mental and behavioural disorders', 'Schizophrenia, schizotypal and delusional disorders'),
('F32', 'Major depressive disorder, single episode', 'Mental and behavioural disorders', 'Mood [affective] disorders'),
('F33', 'Major depressive disorder, recurrent', 'Mental and behavioural disorders', 'Mood [affective] disorders'),

-- Diseases of the nervous system
('G40', 'Epilepsy', 'Diseases of the nervous system', 'Episodic and paroxysmal disorders'),
('G43', 'Migraine', 'Diseases of the nervous system', 'Episodic and paroxysmal disorders'),

-- Diseases of the circulatory system
('I10', 'Essential hypertension', 'Diseases of the circulatory system', 'Diseases of arteries, arterioles and capillaries'),
('I11', 'Hypertensive heart disease', 'Diseases of the circulatory system', 'Diseases of arteries, arterioles and capillaries'),
('I12', 'Hypertensive chronic kidney disease', 'Diseases of the circulatory system', 'Diseases of arteries, arterioles and capillaries'),
('I13', 'Hypertensive heart and chronic kidney disease', 'Diseases of the circulatory system', 'Diseases of arteries, arterioles and capillaries'),
('I20', 'Angina pectoris', 'Diseases of the circulatory system', 'Ischaemic heart diseases'),
('I21', 'ST elevation and non-ST elevation myocardial infarction', 'Diseases of the circulatory system', 'Ischaemic heart diseases'),
('I25', 'Chronic ischaemic heart disease', 'Diseases of the circulatory system', 'Ischaemic heart diseases'),

-- Diseases of the respiratory system
('J12', 'Viral pneumonia, not elsewhere classified', 'Diseases of the respiratory system', 'Influenza and pneumonia'),
('J13', 'Pneumonia due to Streptococcus pneumoniae', 'Diseases of the respiratory system', 'Influenza and pneumonia'),
('J14', 'Pneumonia due to Haemophilus influenzae', 'Diseases of the respiratory system', 'Influenza and pneumonia'),
('J15', 'Bacterial pneumonia, not elsewhere classified', 'Diseases of the respiratory system', 'Influenza and pneumonia'),
('J16', 'Pneumonia due to other infectious organisms, not elsewhere classified', 'Diseases of the respiratory system', 'Influenza and pneumonia'),
('J18', 'Pneumonia, organism unspecified', 'Diseases of the respiratory system', 'Influenza and pneumonia'),
('J44', 'Other chronic obstructive pulmonary disease', 'Diseases of the respiratory system', 'Other diseases of the respiratory system'),
('J45', 'Asthma', 'Diseases of the respiratory system', 'Other diseases of the respiratory system'),

-- Diseases of the digestive system
('K25', 'Gastric ulcer', 'Diseases of the digestive system', 'Diseases of oesophagus, stomach and duodenum'),
('K26', 'Duodenal ulcer', 'Diseases of the digestive system', 'Diseases of oesophagus, stomach and duodenum'),
('K27', 'Peptic ulcer, site unspecified', 'Diseases of the digestive system', 'Diseases of oesophagus, stomach and duodenum'),
('K29', 'Gastritis and duodenitis', 'Diseases of the digestive system', 'Diseases of oesophagus, stomach and duodenum'),
('K35', 'Acute appendicitis', 'Diseases of the digestive system', 'Diseases of appendix'),
('K36', 'Other appendicitis', 'Diseases of the digestive system', 'Diseases of appendix'),
('K37', 'Unspecified appendicitis', 'Diseases of the digestive system', 'Diseases of appendix'),

-- Diseases of the genitourinary system
('N18', 'Chronic kidney disease', 'Diseases of the genitourinary system', 'Renal failure'),
('N19', 'Unspecified kidney failure', 'Diseases of the genitourinary system', 'Renal failure'),
('N20', 'Calculus of kidney and ureter', 'Diseases of the genitourinary system', 'Urolithiasis'),
('N21', 'Calculus of lower urinary tract', 'Diseases of the genitourinary system', 'Urolithiasis'),
('N25', 'Disorders resulting from impaired renal tubular function', 'Diseases of the genitourinary system', 'Other disorders of kidney and ureter'),

-- Pregnancy, childbirth and the puerperium
('O80', 'Single spontaneous delivery', 'Pregnancy, childbirth and the puerperium', 'Normal delivery'),
('O81', 'Single delivery by forceps and vacuum extractor', 'Pregnancy, childbirth and the puerperium', 'Single delivery by forceps and vacuum extractor'),
('O82', 'Single delivery by caesarean section', 'Pregnancy, childbirth and the puerperium', 'Single delivery by caesarean section'),
('O83', 'Other single delivery', 'Pregnancy, childbirth and the puerperium', 'Other single delivery'),
('O84', 'Multiple delivery', 'Pregnancy, childbirth and the puerperium', 'Multiple delivery'),

-- Certain conditions originating in the perinatal period
('P05', 'Slow fetal growth and fetal malnutrition', 'Certain conditions originating in the perinatal period', 'Disorders related to length of gestation and fetal growth'),
('P07', 'Disorders related to short gestation and low birth weight, not elsewhere classified', 'Certain conditions originating in the perinatal period', 'Disorders related to length of gestation and fetal growth'),
('P08', 'Disorders related to long gestation and high birth weight', 'Certain conditions originating in the perinatal period', 'Disorders related to length of gestation and fetal growth'),

-- Congenital malformations, deformations and chromosomal abnormalities
('Q00', 'Anencephaly and similar malformations', 'Congenital malformations, deformations and chromosomal abnormalities', 'Congenital malformations of the nervous system'),
('Q01', 'Encephalocele', 'Congenital malformations, deformations and chromosomal abnormalities', 'Congenital malformations of the nervous system'),
('Q02', 'Microcephaly', 'Congenital malformations, deformations and chromosomal abnormalities', 'Congenital malformations of the nervous system'),
('Q03', 'Congenital hydrocephalus', 'Congenital malformations, deformations and chromosomal abnormalities', 'Congenital malformations of the nervous system'),

-- Injury, poisoning and certain other consequences of external causes
('S72', 'Fracture of femur', 'Injury, poisoning and certain other consequences of external causes', 'Injuries to the hip and thigh'),
('S82', 'Fracture of lower leg, including ankle', 'Injury, poisoning and certain other consequences of external causes', 'Injuries to the knee and lower leg'),
('T78', 'Adverse effects, not elsewhere classified', 'Injury, poisoning and certain other consequences of external causes', 'Other and unspecified effects of external causes'),

-- External causes of morbidity and mortality
('V01', 'Pedestrian injured in collision with pedal cycle', 'External causes of morbidity and mortality', 'Pedestrian injured in transport accident'),
('V02', 'Pedestrian injured in collision with two- or three-wheeled motor vehicle', 'External causes of morbidity and mortality', 'Pedestrian injured in transport accident'),
('V03', 'Pedestrian injured in collision with car, pick-up truck or van', 'External causes of morbidity and mortality', 'Pedestrian injured in transport accident'),
('V04', 'Pedestrian injured in collision with heavy transport vehicle or bus', 'External causes of morbidity and mortality', 'Pedestrian injured in transport accident'),
('V05', 'Pedestrian injured in collision with railway train or railway vehicle', 'External causes of morbidity and mortality', 'Pedestrian injured in transport accident'),
('V06', 'Pedestrian injured in collision with other nonmotor vehicle', 'External causes of morbidity and mortality', 'Pedestrian injured in transport accident'),
('V09', 'Pedestrian injured in other and unspecified transport accidents', 'External causes of morbidity and mortality', 'Pedestrian injured in transport accident')
ON CONFLICT (code) DO NOTHING;

-- Insert sample ICD-11 codes (only if they don't exist)
INSERT INTO public.icd11_codes (code, description, category, subcategory) VALUES
-- Infectious diseases
('1A00', 'Cholera', 'Certain infectious or parasitic diseases', 'Intestinal infectious diseases'),
('1A01', 'Typhoid fever', 'Certain infectious or parasitic diseases', 'Intestinal infectious diseases'),
('1A02', 'Paratyphoid fever', 'Certain infectious or parasitic diseases', 'Intestinal infectious diseases'),
('1A03', 'Salmonella infection', 'Certain infectious or parasitic diseases', 'Intestinal infectious diseases'),
('1A04', 'Shigellosis', 'Certain infectious or parasitic diseases', 'Intestinal infectious diseases'),
('1A05', 'Amoebiasis', 'Certain infectious or parasitic diseases', 'Intestinal infectious diseases'),
('1A06', 'Giardiasis', 'Certain infectious or parasitic diseases', 'Intestinal infectious diseases'),
('1A07', 'Cryptosporidiosis', 'Certain infectious or parasitic diseases', 'Intestinal infectious diseases'),
('1A08', 'Cyclosporiasis', 'Certain infectious or parasitic diseases', 'Intestinal infectious diseases'),
('1A09', 'Isosporiasis', 'Certain infectious or parasitic diseases', 'Intestinal infectious diseases'),
('1A0A', 'Microsporidiosis', 'Certain infectious or parasitic diseases', 'Intestinal infectious diseases'),
('1A0B', 'Balantidiasis', 'Certain infectious or parasitic diseases', 'Intestinal infectious diseases'),
('1A0C', 'Blastocystis infection', 'Certain infectious or parasitic diseases', 'Intestinal infectious diseases'),
('1A0D', 'Dientamoebiasis', 'Certain infectious or parasitic diseases', 'Intestinal infectious diseases'),
('1A0E', 'Sarcocystosis', 'Certain infectious or parasitic diseases', 'Intestinal infectious diseases'),
('1A0F', 'Toxoplasmosis', 'Certain infectious or parasitic diseases', 'Intestinal infectious diseases'),
('1A0G', 'Malaria', 'Certain infectious or parasitic diseases', 'Protozoal diseases'),
('1A0H', 'Leishmaniasis', 'Certain infectious or parasitic diseases', 'Protozoal diseases'),
('1A0J', 'Trypanosomiasis', 'Certain infectious or parasitic diseases', 'Protozoal diseases'),
('1A0K', 'Chagas disease', 'Certain infectious or parasitic diseases', 'Protozoal diseases'),
('1A0L', 'African trypanosomiasis', 'Certain infectious or parasitic diseases', 'Protozoal diseases'),
('1A0M', 'Tuberculosis', 'Certain infectious or parasitic diseases', 'Tuberculosis'),
('1A0N', 'Leprosy', 'Certain infectious or parasitic diseases', 'Tuberculosis'),
('1A0P', 'HIV disease', 'Certain infectious or parasitic diseases', 'Viral diseases'),
('1A0Q', 'Hepatitis A', 'Certain infectious or parasitic diseases', 'Viral diseases'),
('1A0R', 'Hepatitis B', 'Certain infectious or parasitic diseases', 'Viral diseases'),
('1A0S', 'Hepatitis C', 'Certain infectious or parasitic diseases', 'Viral diseases'),
('1A0T', 'Hepatitis D', 'Certain infectious or parasitic diseases', 'Viral diseases'),
('1A0U', 'Hepatitis E', 'Certain infectious or parasitic diseases', 'Viral diseases'),
('1A0V', 'Dengue', 'Certain infectious or parasitic diseases', 'Viral diseases'),
('1A0W', 'Yellow fever', 'Certain infectious or parasitic diseases', 'Viral diseases'),
('1A0X', 'Zika virus disease', 'Certain infectious or parasitic diseases', 'Viral diseases'),
('1A0Y', 'Chikungunya', 'Certain infectious or parasitic diseases', 'Viral diseases'),
('1A0Z', 'West Nile virus disease', 'Certain infectious or parasitic diseases', 'Viral diseases'),

-- Neoplasms
('2A00', 'Malignant neoplasm of breast', 'Neoplasms', 'Malignant neoplasms'),
('2A01', 'Malignant neoplasm of lung', 'Neoplasms', 'Malignant neoplasms'),
('2A02', 'Malignant neoplasm of colon', 'Neoplasms', 'Malignant neoplasms'),
('2A03', 'Malignant neoplasm of rectum', 'Neoplasms', 'Malignant neoplasms'),
('2A04', 'Malignant neoplasm of liver', 'Neoplasms', 'Malignant neoplasms'),
('2A05', 'Malignant neoplasm of pancreas', 'Neoplasms', 'Malignant neoplasms'),
('2A06', 'Malignant neoplasm of stomach', 'Neoplasms', 'Malignant neoplasms'),
('2A07', 'Malignant neoplasm of oesophagus', 'Neoplasms', 'Malignant neoplasms'),
('2A08', 'Malignant neoplasm of cervix uteri', 'Neoplasms', 'Malignant neoplasms'),
('2A09', 'Malignant neoplasm of corpus uteri', 'Neoplasms', 'Malignant neoplasms'),
('2A0A', 'Malignant neoplasm of ovary', 'Neoplasms', 'Malignant neoplasms'),
('2A0B', 'Malignant neoplasm of prostate', 'Neoplasms', 'Malignant neoplasms'),
('2A0C', 'Malignant neoplasm of kidney', 'Neoplasms', 'Malignant neoplasms'),
('2A0D', 'Malignant neoplasm of bladder', 'Neoplasms', 'Malignant neoplasms'),
('2A0E', 'Malignant neoplasm of brain', 'Neoplasms', 'Malignant neoplasms'),
('2A0F', 'Malignant neoplasm of spinal cord', 'Neoplasms', 'Malignant neoplasms'),
('2A0G', 'Malignant neoplasm of bone', 'Neoplasms', 'Malignant neoplasms'),
('2A0H', 'Malignant neoplasm of skin', 'Neoplasms', 'Malignant neoplasms'),
('2A0J', 'Malignant neoplasm of blood', 'Neoplasms', 'Malignant neoplasms'),
('2A0K', 'Malignant neoplasm of lymph nodes', 'Neoplasms', 'Malignant neoplasms'),

-- Endocrine, nutritional and metabolic diseases
('5A10', 'Type 1 diabetes mellitus', 'Endocrine, nutritional or metabolic diseases', 'Diabetes mellitus'),
('5A11', 'Type 2 diabetes mellitus', 'Endocrine, nutritional or metabolic diseases', 'Diabetes mellitus'),
('5A12', 'Other specified diabetes mellitus', 'Endocrine, nutritional or metabolic diseases', 'Diabetes mellitus'),
('5A13', 'Unspecified diabetes mellitus', 'Endocrine, nutritional or metabolic diseases', 'Diabetes mellitus'),
('5A14', 'Impaired glucose tolerance', 'Endocrine, nutritional or metabolic diseases', 'Diabetes mellitus'),
('5A15', 'Impaired fasting glucose', 'Endocrine, nutritional or metabolic diseases', 'Diabetes mellitus'),
('5A16', 'Gestational diabetes mellitus', 'Endocrine, nutritional or metabolic diseases', 'Diabetes mellitus'),
('5A17', 'Diabetes mellitus in pregnancy', 'Endocrine, nutritional or metabolic diseases', 'Diabetes mellitus'),
('5A18', 'Diabetes mellitus in children', 'Endocrine, nutritional or metabolic diseases', 'Diabetes mellitus'),
('5A19', 'Diabetes mellitus in elderly', 'Endocrine, nutritional or metabolic diseases', 'Diabetes mellitus'),
('5A1A', 'Diabetes mellitus with complications', 'Endocrine, nutritional or metabolic diseases', 'Diabetes mellitus'),
('5A1B', 'Diabetes mellitus without complications', 'Endocrine, nutritional or metabolic diseases', 'Diabetes mellitus'),

-- Mental and behavioural disorders
('6A00', 'Schizophrenia', 'Mental, behavioural or neurodevelopmental disorders', 'Schizophrenia or other primary psychotic disorders'),
('6A01', 'Schizoaffective disorder', 'Mental, behavioural or neurodevelopmental disorders', 'Schizophrenia or other primary psychotic disorders'),
('6A02', 'Schizotypal disorder', 'Mental, behavioural or neurodevelopmental disorders', 'Schizophrenia or other primary psychotic disorders'),
('6A03', 'Delusional disorder', 'Mental, behavioural or neurodevelopmental disorders', 'Schizophrenia or other primary psychotic disorders'),
('6A04', 'Brief psychotic disorder', 'Mental, behavioural or neurodevelopmental disorders', 'Schizophrenia or other primary psychotic disorders'),
('6A05', 'Schizophreniform disorder', 'Mental, behavioural or neurodevelopmental disorders', 'Schizophrenia or other primary psychotic disorders'),
('6A06', 'Substance-induced psychotic disorder', 'Mental, behavioural or neurodevelopmental disorders', 'Schizophrenia or other primary psychotic disorders'),
('6A07', 'Psychotic disorder due to another medical condition', 'Mental, behavioural or neurodevelopmental disorders', 'Schizophrenia or other primary psychotic disorders'),
('6A08', 'Catatonia', 'Mental, behavioural or neurodevelopmental disorders', 'Schizophrenia or other primary psychotic disorders'),
('6A09', 'Other specified schizophrenia or other primary psychotic disorders', 'Mental, behavioural or neurodevelopmental disorders', 'Schizophrenia or other primary psychotic disorders'),
('6A0A', 'Unspecified schizophrenia or other primary psychotic disorders', 'Mental, behavioural or neurodevelopmental disorders', 'Schizophrenia or other primary psychotic disorders'),
('6A0B', 'Bipolar type I disorder', 'Mental, behavioural or neurodevelopmental disorders', 'Mood disorders'),
('6A0C', 'Bipolar type II disorder', 'Mental, behavioural or neurodevelopmental disorders', 'Mood disorders'),
('6A0D', 'Cyclothymic disorder', 'Mental, behavioural or neurodevelopmental disorders', 'Mood disorders'),
('6A0E', 'Bipolar disorder due to another medical condition', 'Mental, behavioural or neurodevelopmental disorders', 'Mood disorders'),
('6A0F', 'Substance-induced bipolar disorder', 'Mental, behavioural or neurodevelopmental disorders', 'Mood disorders'),
('6A0G', 'Other specified bipolar disorder', 'Mental, behavioural or neurodevelopmental disorders', 'Mood disorders'),
('6A0H', 'Unspecified bipolar disorder', 'Mental, behavioural or neurodevelopmental disorders', 'Mood disorders'),
('6A0J', 'Single episode depressive disorder', 'Mental, behavioural or neurodevelopmental disorders', 'Mood disorders'),
('6A0K', 'Recurrent depressive disorder', 'Mental, behavioural or neurodevelopmental disorders', 'Mood disorders'),
('6A0L', 'Dysthymic disorder', 'Mental, behavioural or neurodevelopmental disorders', 'Mood disorders'),
('6A0M', 'Mixed depressive and anxiety disorder', 'Mental, behavioural or neurodevelopmental disorders', 'Mood disorders'),
('6A0N', 'Depressive disorder due to another medical condition', 'Mental, behavioural or neurodevelopmental disorders', 'Mood disorders'),
('6A0P', 'Substance-induced depressive disorder', 'Mental, behavioural or neurodevelopmental disorders', 'Mood disorders'),
('6A0Q', 'Other specified depressive disorder', 'Mental, behavioural or neurodevelopmental disorders', 'Mood disorders'),
('6A0R', 'Unspecified depressive disorder', 'Mental, behavioural or neurodevelopmental disorders', 'Mood disorders'),

-- Diseases of the nervous system
('8A00', 'Epilepsy', 'Diseases of the nervous system', 'Episodic and paroxysmal disorders'),
('8A01', 'Migraine', 'Diseases of the nervous system', 'Episodic and paroxysmal disorders'),
('8A02', 'Tension-type headache', 'Diseases of the nervous system', 'Episodic and paroxysmal disorders'),
('8A03', 'Cluster headache', 'Diseases of the nervous system', 'Episodic and paroxysmal disorders'),
('8A04', 'Trigeminal neuralgia', 'Diseases of the nervous system', 'Episodic and paroxysmal disorders'),
('8A05', 'Bell palsy', 'Diseases of the nervous system', 'Diseases of cranial nerves'),
('8A06', 'Parkinson disease', 'Diseases of the nervous system', 'Extrapyramidal and movement disorders'),
('8A07', 'Huntington disease', 'Diseases of the nervous system', 'Extrapyramidal and movement disorders'),
('8A08', 'Dystonia', 'Diseases of the nervous system', 'Extrapyramidal and movement disorders'),
('8A09', 'Tourette syndrome', 'Diseases of the nervous system', 'Extrapyramidal and movement disorders'),
('8A0A', 'Tic disorders', 'Diseases of the nervous system', 'Extrapyramidal and movement disorders'),
('8A0B', 'Stereotyped movement disorders', 'Diseases of the nervous system', 'Extrapyramidal and movement disorders'),
('8A0C', 'Restless legs syndrome', 'Diseases of the nervous system', 'Extrapyramidal and movement disorders'),
('8A0D', 'Periodic limb movement disorder', 'Diseases of the nervous system', 'Extrapyramidal and movement disorders'),
('8A0E', 'Sleep-related movement disorders', 'Diseases of the nervous system', 'Extrapyramidal and movement disorders'),

-- Diseases of the circulatory system
('BA00', 'Essential hypertension', 'Diseases of the circulatory system', 'Hypertensive diseases'),
('BA01', 'Hypertensive heart disease', 'Diseases of the circulatory system', 'Hypertensive diseases'),
('BA02', 'Hypertensive chronic kidney disease', 'Diseases of the circulatory system', 'Hypertensive diseases'),
('BA03', 'Hypertensive heart and chronic kidney disease', 'Diseases of the circulatory system', 'Hypertensive diseases'),
('BA04', 'Secondary hypertension', 'Diseases of the circulatory system', 'Hypertensive diseases'),
('BA05', 'Hypertensive crisis', 'Diseases of the circulatory system', 'Hypertensive diseases'),
('BA06', 'Hypertensive emergency', 'Diseases of the circulatory system', 'Hypertensive diseases'),
('BA07', 'Hypertensive urgency', 'Diseases of the circulatory system', 'Hypertensive diseases'),
('BA08', 'Other specified hypertensive diseases', 'Diseases of the circulatory system', 'Hypertensive diseases'),
('BA09', 'Unspecified hypertensive diseases', 'Diseases of the circulatory system', 'Hypertensive diseases'),
('BA0A', 'Angina pectoris', 'Diseases of the circulatory system', 'Ischaemic heart diseases'),
('BA0B', 'Acute myocardial infarction', 'Diseases of the circulatory system', 'Ischaemic heart diseases'),
('BA0C', 'Chronic ischaemic heart disease', 'Diseases of the circulatory system', 'Ischaemic heart diseases'),
('BA0D', 'Other specified ischaemic heart diseases', 'Diseases of the circulatory system', 'Ischaemic heart diseases'),
('BA0E', 'Unspecified ischaemic heart diseases', 'Diseases of the circulatory system', 'Ischaemic heart diseases'),
('BA0F', 'Rheumatic fever', 'Diseases of the circulatory system', 'Rheumatic heart diseases'),
('BA0G', 'Rheumatic heart disease', 'Diseases of the circulatory system', 'Rheumatic heart diseases'),
('BA0H', 'Other specified rheumatic heart diseases', 'Diseases of the circulatory system', 'Rheumatic heart diseases'),
('BA0J', 'Unspecified rheumatic heart diseases', 'Diseases of the circulatory system', 'Rheumatic heart diseases'),
('BA0K', 'Cardiomyopathy', 'Diseases of the circulatory system', 'Cardiomyopathy'),
('BA0L', 'Myocarditis', 'Diseases of the circulatory system', 'Myocarditis'),
('BA0M', 'Endocarditis', 'Diseases of the circulatory system', 'Endocarditis'),
('BA0N', 'Pericarditis', 'Diseases of the circulatory system', 'Pericarditis'),
('BA0P', 'Heart failure', 'Diseases of the circulatory system', 'Heart failure'),
('BA0Q', 'Cardiac arrhythmias', 'Diseases of the circulatory system', 'Cardiac arrhythmias'),
('BA0R', 'Conduction disorders', 'Diseases of the circulatory system', 'Conduction disorders'),
('BA0S', 'Cardiac arrest', 'Diseases of the circulatory system', 'Cardiac arrest'),
('BA0T', 'Sudden cardiac death', 'Diseases of the circulatory system', 'Sudden cardiac death'),
('BA0U', 'Other specified diseases of the circulatory system', 'Diseases of the circulatory system', 'Other specified diseases of the circulatory system'),
('BA0V', 'Unspecified diseases of the circulatory system', 'Diseases of the circulatory system', 'Unspecified diseases of the circulatory system')
ON CONFLICT (code) DO NOTHING;

-- Insert sample CPT-4 procedure codes (only if they don't exist)
INSERT INTO public.cpt4_codes (code, description, category, subcategory) VALUES
-- Evaluation and Management
('99201', 'Office or other outpatient visit for the evaluation and management of a new patient', 'Evaluation and Management', 'Office and Other Outpatient Services'),
('99202', 'Office or other outpatient visit for the evaluation and management of a new patient', 'Evaluation and Management', 'Office and Other Outpatient Services'),
('99203', 'Office or other outpatient visit for the evaluation and management of a new patient', 'Evaluation and Management', 'Office and Other Outpatient Services'),
('99204', 'Office or other outpatient visit for the evaluation and management of a new patient', 'Evaluation and Management', 'Office and Other Outpatient Services'),
('99205', 'Office or other outpatient visit for the evaluation and management of a new patient', 'Evaluation and Management', 'Office and Other Outpatient Services'),
('99211', 'Office or other outpatient visit for the evaluation and management of an established patient', 'Evaluation and Management', 'Office and Other Outpatient Services'),
('99212', 'Office or other outpatient visit for the evaluation and management of an established patient', 'Evaluation and Management', 'Office and Other Outpatient Services'),
('99213', 'Office or other outpatient visit for the evaluation and management of an established patient', 'Evaluation and Management', 'Office and Other Outpatient Services'),
('99214', 'Office or other outpatient visit for the evaluation and management of an established patient', 'Evaluation and Management', 'Office and Other Outpatient Services'),
('99215', 'Office or other outpatient visit for the evaluation and management of an established patient', 'Evaluation and Management', 'Office and Other Outpatient Services'),

-- Anesthesia
('00100', 'Anesthesia for procedures on the integumentary system on the extremities, anterior trunk and perineum', 'Anesthesia', 'Anesthesia'),
('00102', 'Anesthesia for procedures on the integumentary system on the extremities, anterior trunk and perineum', 'Anesthesia', 'Anesthesia'),
('00103', 'Anesthesia for procedures on the integumentary system on the extremities, anterior trunk and perineum', 'Anesthesia', 'Anesthesia'),
('00104', 'Anesthesia for procedures on the integumentary system on the extremities, anterior trunk and perineum', 'Anesthesia', 'Anesthesia'),
('00106', 'Anesthesia for procedures on the integumentary system on the extremities, anterior trunk and perineum', 'Anesthesia', 'Anesthesia'),
('00108', 'Anesthesia for procedures on the integumentary system on the extremities, anterior trunk and perineum', 'Anesthesia', 'Anesthesia'),
('00110', 'Anesthesia for procedures on the integumentary system on the extremities, anterior trunk and perineum', 'Anesthesia', 'Anesthesia'),
('00112', 'Anesthesia for procedures on the integumentary system on the extremities, anterior trunk and perineum', 'Anesthesia', 'Anesthesia'),
('00114', 'Anesthesia for procedures on the integumentary system on the extremities, anterior trunk and perineum', 'Anesthesia', 'Anesthesia'),
('00116', 'Anesthesia for procedures on the integumentary system on the extremities, anterior trunk and perineum', 'Anesthesia', 'Anesthesia'),

-- Surgery
('10021', 'Fine needle aspiration biopsy, without imaging guidance', 'Surgery', 'Surgery'),
('10022', 'Fine needle aspiration biopsy, with imaging guidance', 'Surgery', 'Surgery'),
('10040', 'Acne surgery', 'Surgery', 'Surgery'),
('10060', 'Incision and drainage of abscess', 'Surgery', 'Surgery'),
('10061', 'Incision and drainage of abscess', 'Surgery', 'Surgery'),
('10080', 'Incision and drainage of pilonidal cyst', 'Surgery', 'Surgery'),
('10081', 'Incision and drainage of pilonidal cyst', 'Surgery', 'Surgery'),
('10120', 'Incision and removal of foreign body', 'Surgery', 'Surgery'),
('10121', 'Incision and removal of foreign body', 'Surgery', 'Surgery'),
('10140', 'Incision and drainage of hematoma', 'Surgery', 'Surgery'),

-- Radiology
('70010', 'Radiologic examination, skull', 'Radiology', 'Radiology'),
('70015', 'Radiologic examination, skull', 'Radiology', 'Radiology'),
('70020', 'Radiologic examination, skull', 'Radiology', 'Radiology'),
('70030', 'Radiologic examination, skull', 'Radiology', 'Radiology'),
('70050', 'Radiologic examination, skull', 'Radiology', 'Radiology'),
('70052', 'Radiologic examination, skull', 'Radiology', 'Radiology'),
('70053', 'Radiologic examination, skull', 'Radiology', 'Radiology'),
('70054', 'Radiologic examination, skull', 'Radiology', 'Radiology'),
('70055', 'Radiologic examination, skull', 'Radiology', 'Radiology'),
('70056', 'Radiologic examination, skull', 'Radiology', 'Radiology'),

-- Pathology and Laboratory
('80047', 'Basic metabolic panel', 'Pathology and Laboratory', 'Pathology and Laboratory'),
('80048', 'Basic metabolic panel', 'Pathology and Laboratory', 'Pathology and Laboratory'),
('80050', 'General health panel', 'Pathology and Laboratory', 'Pathology and Laboratory'),
('80051', 'Electrolyte panel', 'Pathology and Laboratory', 'Pathology and Laboratory'),
('80053', 'Comprehensive metabolic panel', 'Pathology and Laboratory', 'Pathology and Laboratory'),
('80054', 'Comprehensive metabolic panel', 'Pathology and Laboratory', 'Pathology and Laboratory'),
('80055', 'Obstetric panel', 'Pathology and Laboratory', 'Pathology and Laboratory'),
('80056', 'Obstetric panel', 'Pathology and Laboratory', 'Pathology and Laboratory'),
('80057', 'Obstetric panel', 'Pathology and Laboratory', 'Pathology and Laboratory'),
('80058', 'Obstetric panel', 'Pathology and Laboratory', 'Pathology and Laboratory'),

-- Medicine
('90281', 'Immune globulin (Ig), human, for intramuscular use', 'Medicine', 'Medicine'),
('90283', 'Immune globulin (Ig), human, for intramuscular use', 'Medicine', 'Medicine'),
('90284', 'Immune globulin (Ig), human, for intramuscular use', 'Medicine', 'Medicine'),
('90285', 'Immune globulin (Ig), human, for intramuscular use', 'Medicine', 'Medicine'),
('90286', 'Immune globulin (Ig), human, for intramuscular use', 'Medicine', 'Medicine'),
('90287', 'Immune globulin (Ig), human, for intramuscular use', 'Medicine', 'Medicine'),
('90288', 'Immune globulin (Ig), human, for intramuscular use', 'Medicine', 'Medicine'),
('90289', 'Immune globulin (Ig), human, for intramuscular use', 'Medicine', 'Medicine'),
('90290', 'Immune globulin (Ig), human, for intramuscular use', 'Medicine', 'Medicine'),
('90291', 'Immune globulin (Ig), human, for intramuscular use', 'Medicine', 'Medicine')
ON CONFLICT (code) DO NOTHING;

-- Insert sample Tanzania service codes (SHA codes for NHIF) (only if they don't exist)
INSERT INTO public.tanzania_service_codes (sha_code, service_name, category, nhif_tariff) VALUES
-- General consultations
('SHA001', 'General Consultation', 'Consultation', 50000.00),
('SHA002', 'Specialist Consultation', 'Consultation', 100000.00),
('SHA003', 'Super Specialist Consultation', 'Consultation', 150000.00),
('SHA004', 'Emergency Consultation', 'Consultation', 75000.00),
('SHA005', 'Follow-up Consultation', 'Consultation', 30000.00),

-- Laboratory services
('SHA006', 'Full Blood Count', 'Laboratory', 15000.00),
('SHA007', 'Blood Sugar Test', 'Laboratory', 5000.00),
('SHA008', 'Malaria Test', 'Laboratory', 5000.00),
('SHA009', 'HIV Test', 'Laboratory', 10000.00),
('SHA010', 'Hepatitis B Test', 'Laboratory', 15000.00),
('SHA011', 'Hepatitis C Test', 'Laboratory', 15000.00),
('SHA012', 'Urine Analysis', 'Laboratory', 5000.00),
('SHA013', 'Stool Analysis', 'Laboratory', 5000.00),
('SHA014', 'Blood Grouping', 'Laboratory', 10000.00),
('SHA015', 'Cross Matching', 'Laboratory', 15000.00),

-- Radiology services
('SHA016', 'Chest X-ray', 'Radiology', 25000.00),
('SHA017', 'Abdominal X-ray', 'Radiology', 25000.00),
('SHA018', 'Skull X-ray', 'Radiology', 30000.00),
('SHA019', 'Limb X-ray', 'Radiology', 20000.00),
('SHA020', 'Spine X-ray', 'Radiology', 30000.00),
('SHA021', 'Pelvis X-ray', 'Radiology', 25000.00),
('SHA022', 'Ultrasound Abdomen', 'Radiology', 50000.00),
('SHA023', 'Ultrasound Pelvis', 'Radiology', 50000.00),
('SHA024', 'Ultrasound Obstetric', 'Radiology', 50000.00),
('SHA025', 'CT Scan Head', 'Radiology', 150000.00),
('SHA026', 'CT Scan Chest', 'Radiology', 150000.00),
('SHA027', 'CT Scan Abdomen', 'Radiology', 150000.00),
('SHA028', 'MRI Head', 'Radiology', 200000.00),
('SHA029', 'MRI Spine', 'Radiology', 200000.00),
('SHA030', 'MRI Joint', 'Radiology', 200000.00),

-- Surgical procedures
('SHA031', 'Appendectomy', 'Surgery', 500000.00),
('SHA032', 'Cholecystectomy', 'Surgery', 800000.00),
('SHA033', 'Hernia Repair', 'Surgery', 400000.00),
('SHA034', 'Caesarean Section', 'Surgery', 600000.00),
('SHA035', 'Hysterectomy', 'Surgery', 800000.00),
('SHA036', 'Prostatectomy', 'Surgery', 1000000.00),
('SHA037', 'Nephrectomy', 'Surgery', 1200000.00),
('SHA038', 'Mastectomy', 'Surgery', 800000.00),
('SHA039', 'Thyroidectomy', 'Surgery', 600000.00),
('SHA040', 'Gastrectomy', 'Surgery', 1000000.00),

-- Medical procedures
('SHA041', 'Endoscopy Upper GI', 'Procedure', 200000.00),
('SHA042', 'Colonoscopy', 'Procedure', 250000.00),
('SHA043', 'Bronchoscopy', 'Procedure', 200000.00),
('SHA044', 'Cystoscopy', 'Procedure', 150000.00),
('SHA045', 'Laparoscopy', 'Procedure', 300000.00),
('SHA046', 'Biopsy', 'Procedure', 100000.00),
('SHA047', 'Fine Needle Aspiration', 'Procedure', 50000.00),
('SHA048', 'Bone Marrow Biopsy', 'Procedure', 150000.00),
('SHA049', 'Liver Biopsy', 'Procedure', 200000.00),
('SHA050', 'Kidney Biopsy', 'Procedure', 200000.00),

-- Emergency services
('SHA051', 'Emergency Room Visit', 'Emergency', 100000.00),
('SHA052', 'Trauma Management', 'Emergency', 200000.00),
('SHA053', 'Cardiac Emergency', 'Emergency', 300000.00),
('SHA054', 'Respiratory Emergency', 'Emergency', 200000.00),
('SHA055', 'Neurological Emergency', 'Emergency', 250000.00),
('SHA056', 'Obstetric Emergency', 'Emergency', 300000.00),
('SHA057', 'Pediatric Emergency', 'Emergency', 150000.00),
('SHA058', 'Psychiatric Emergency', 'Emergency', 100000.00),
('SHA059', 'Toxicological Emergency', 'Emergency', 200000.00),
('SHA060', 'Environmental Emergency', 'Emergency', 150000.00),

-- Maternity services
('SHA061', 'Antenatal Care', 'Maternity', 50000.00),
('SHA062', 'Delivery Normal', 'Maternity', 200000.00),
('SHA063', 'Delivery Assisted', 'Maternity', 300000.00),
('SHA064', 'Postnatal Care', 'Maternity', 30000.00),
('SHA065', 'Family Planning', 'Maternity', 25000.00),
('SHA066', 'Cervical Cancer Screening', 'Maternity', 25000.00),
('SHA067', 'Breast Cancer Screening', 'Maternity', 30000.00),
('SHA068', 'Pregnancy Ultrasound', 'Maternity', 50000.00),
('SHA069', 'Pregnancy Monitoring', 'Maternity', 40000.00),
('SHA070', 'High Risk Pregnancy Care', 'Maternity', 100000.00),

-- Pediatric services
('SHA071', 'Pediatric Consultation', 'Pediatrics', 40000.00),
('SHA072', 'Neonatal Care', 'Pediatrics', 100000.00),
('SHA073', 'Vaccination', 'Pediatrics', 15000.00),
('SHA074', 'Growth Monitoring', 'Pediatrics', 20000.00),
('SHA075', 'Developmental Assessment', 'Pediatrics', 50000.00),
('SHA076', 'Nutritional Counseling', 'Pediatrics', 25000.00),
('SHA077', 'Breastfeeding Support', 'Pediatrics', 20000.00),
('SHA078', 'Child Health Education', 'Pediatrics', 15000.00),
('SHA079', 'Adolescent Health', 'Pediatrics', 30000.00),
('SHA080', 'Child Protection Services', 'Pediatrics', 40000.00),

-- Mental health services
('SHA081', 'Psychiatric Consultation', 'Mental Health', 75000.00),
('SHA082', 'Psychological Assessment', 'Mental Health', 100000.00),
('SHA083', 'Psychotherapy', 'Mental Health', 50000.00),
('SHA084', 'Counseling', 'Mental Health', 30000.00),
('SHA085', 'Group Therapy', 'Mental Health', 25000.00),
('SHA086', 'Family Therapy', 'Mental Health', 40000.00),
('SHA087', 'Cognitive Behavioral Therapy', 'Mental Health', 60000.00),
('SHA088', 'Substance Abuse Treatment', 'Mental Health', 80000.00),
('SHA089', 'Crisis Intervention', 'Mental Health', 100000.00),
('SHA090', 'Mental Health Education', 'Mental Health', 20000.00),

-- Rehabilitation services
('SHA091', 'Physiotherapy', 'Rehabilitation', 30000.00),
('SHA092', 'Occupational Therapy', 'Rehabilitation', 35000.00),
('SHA093', 'Speech Therapy', 'Rehabilitation', 40000.00),
('SHA094', 'Cardiac Rehabilitation', 'Rehabilitation', 50000.00),
('SHA095', 'Pulmonary Rehabilitation', 'Rehabilitation', 45000.00),
('SHA096', 'Neurological Rehabilitation', 'Rehabilitation', 60000.00),
('SHA097', 'Orthopedic Rehabilitation', 'Rehabilitation', 40000.00),
('SHA098', 'Sports Rehabilitation', 'Rehabilitation', 35000.00),
('SHA099', 'Geriatric Rehabilitation', 'Rehabilitation', 45000.00),
('SHA100', 'Pediatric Rehabilitation', 'Rehabilitation', 40000.00)
ON CONFLICT (sha_code) DO NOTHING;

-- Create views for easier querying (drop first to avoid conflicts)
DROP VIEW IF EXISTS public.icd_codes_view;
DROP VIEW IF EXISTS public.service_mappings_view;

CREATE OR REPLACE VIEW public.icd_codes_view AS
SELECT 
    'ICD-10' as code_type,
    code,
    description,
    category,
    subcategory,
    is_active,
    created_at,
    updated_at
FROM public.icd10_codes
WHERE is_active = true
UNION ALL
SELECT 
    'ICD-11' as code_type,
    code,
    description,
    category,
    subcategory,
    is_active,
    created_at,
    updated_at
FROM public.icd11_codes
WHERE is_active = true;

-- Create view for service code mappings
CREATE OR REPLACE VIEW public.service_mappings_view AS
SELECT 
    scm.id,
    sp.service_name,
    sp.category as service_category,
    sp.price as service_price,
    icd10.code as icd10_code,
    icd10.description as icd10_description,
    icd11.code as icd11_code,
    icd11.description as icd11_description,
    cpt4.code as cpt4_code,
    cpt4.description as cpt4_description,
    tsc.sha_code,
    tsc.service_name as sha_service_name,
    tsc.nhif_tariff,
    scm.mapping_type,
    scm.is_primary,
    scm.created_at,
    scm.updated_at
FROM public.service_code_mappings scm
LEFT JOIN public.service_prices sp ON scm.service_price_id = sp.id
LEFT JOIN public.icd10_codes icd10 ON scm.icd10_code = icd10.code
LEFT JOIN public.icd11_codes icd11 ON scm.icd11_code = icd11.code
LEFT JOIN public.cpt4_codes cpt4 ON scm.cpt4_code = cpt4.code
LEFT JOIN public.tanzania_service_codes tsc ON scm.sha_code = tsc.sha_code;

-- Add comments for documentation
COMMENT ON TABLE public.icd10_codes IS 'ICD-10 diagnostic codes for standardized health terminologies';
COMMENT ON TABLE public.icd11_codes IS 'ICD-11 diagnostic codes for standardized health terminologies';
COMMENT ON TABLE public.cpt4_codes IS 'CPT-4 procedure codes for medical procedures';
COMMENT ON TABLE public.tanzania_service_codes IS 'Tanzania-specific service codes (SHA codes) for NHIF';
COMMENT ON TABLE public.medical_record_diagnoses IS 'Links medical records to ICD diagnostic codes';
COMMENT ON TABLE public.prescription_diagnoses IS 'Links prescriptions to ICD diagnostic codes';
COMMENT ON TABLE public.bill_item_diagnoses IS 'Links bill items to ICD diagnostic codes for insurance claims';
COMMENT ON TABLE public.service_code_mappings IS 'Maps hospital services to standardized codes';

COMMENT ON VIEW public.icd_codes_view IS 'Unified view of ICD-10 and ICD-11 codes';
COMMENT ON VIEW public.service_mappings_view IS 'Comprehensive view of service code mappings with all related information';
