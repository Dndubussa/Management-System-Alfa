-- Complete Ministry of Health Compliance Setup
-- This script addresses all remaining compliance requirements

-- Step 1: Add ICD-10 Sample Data
INSERT INTO public.icd10_codes (code, description, category, subcategory) VALUES
('A00', 'Cholera', 'Infectious and parasitic diseases', 'Intestinal infectious diseases'),
('A01', 'Typhoid and paratyphoid fevers', 'Infectious and parasitic diseases', 'Intestinal infectious diseases'),
('A02', 'Other salmonella infections', 'Infectious and parasitic diseases', 'Intestinal infectious diseases'),
('A03', 'Shigellosis', 'Infectious and parasitic diseases', 'Intestinal infectious diseases'),
('A04', 'Other bacterial intestinal infections', 'Infectious and parasitic diseases', 'Intestinal infectious diseases'),
('A05', 'Other bacterial foodborne intoxications', 'Infectious and parasitic diseases', 'Intestinal infectious diseases'),
('A06', 'Amebiasis', 'Infectious and parasitic diseases', 'Intestinal infectious diseases'),
('A07', 'Other protozoal intestinal diseases', 'Infectious and parasitic diseases', 'Intestinal infectious diseases'),
('A08', 'Viral and other specified intestinal infections', 'Infectious and parasitic diseases', 'Intestinal infectious diseases'),
('A09', 'Diarrhea and gastroenteritis of presumed infectious origin', 'Infectious and parasitic diseases', 'Intestinal infectious diseases'),
('B50', 'Plasmodium falciparum malaria', 'Infectious and parasitic diseases', 'Protozoal diseases'),
('B51', 'Plasmodium vivax malaria', 'Infectious and parasitic diseases', 'Protozoal diseases'),
('B52', 'Plasmodium malariae malaria', 'Infectious and parasitic diseases', 'Protozoal diseases'),
('B53', 'Other specified malaria', 'Infectious and parasitic diseases', 'Protozoal diseases'),
('B54', 'Unspecified malaria', 'Infectious and parasitic diseases', 'Protozoal diseases'),
('B20', 'Human immunodeficiency virus [HIV] disease', 'Infectious and parasitic diseases', 'Viral diseases'),
('A15', 'Respiratory tuberculosis', 'Infectious and parasitic diseases', 'Tuberculosis'),
('A16', 'Respiratory tuberculosis, not confirmed bacteriologically or histologically', 'Infectious and parasitic diseases', 'Tuberculosis'),
('A17', 'Tuberculosis of nervous system', 'Infectious and parasitic diseases', 'Tuberculosis'),
('A18', 'Tuberculosis of other organs', 'Infectious and parasitic diseases', 'Tuberculosis'),
('A19', 'Miliary tuberculosis', 'Infectious and parasitic diseases', 'Tuberculosis'),
('E10', 'Type 1 diabetes mellitus', 'Endocrine, nutritional and metabolic diseases', 'Diabetes mellitus'),
('E11', 'Type 2 diabetes mellitus', 'Endocrine, nutritional and metabolic diseases', 'Diabetes mellitus'),
('E12', 'Malnutrition-related diabetes mellitus', 'Endocrine, nutritional and metabolic diseases', 'Diabetes mellitus'),
('E13', 'Other specified diabetes mellitus', 'Endocrine, nutritional and metabolic diseases', 'Diabetes mellitus'),
('E14', 'Unspecified diabetes mellitus', 'Endocrine, nutritional and metabolic diseases', 'Diabetes mellitus'),
('I10', 'Essential hypertension', 'Diseases of the circulatory system', 'Diseases of arteries, arterioles and capillaries'),
('I11', 'Hypertensive heart disease', 'Diseases of the circulatory system', 'Diseases of arteries, arterioles and capillaries'),
('I12', 'Hypertensive chronic kidney disease', 'Diseases of the circulatory system', 'Diseases of arteries, arterioles and capillaries'),
('I13', 'Hypertensive heart and chronic kidney disease', 'Diseases of the circulatory system', 'Diseases of arteries, arterioles and capillaries'),
('I15', 'Secondary hypertension', 'Diseases of the circulatory system', 'Diseases of arteries, arterioles and capillaries'),
('J12', 'Viral pneumonia', 'Diseases of the respiratory system', 'Influenza and pneumonia'),
('J13', 'Pneumonia due to Streptococcus pneumoniae', 'Diseases of the respiratory system', 'Influenza and pneumonia'),
('J14', 'Pneumonia due to Hemophilus influenzae', 'Diseases of the respiratory system', 'Influenza and pneumonia'),
('J15', 'Bacterial pneumonia, not elsewhere classified', 'Diseases of the respiratory system', 'Influenza and pneumonia'),
('J16', 'Pneumonia due to other infectious organisms, not elsewhere classified', 'Diseases of the respiratory system', 'Influenza and pneumonia'),
('J18', 'Pneumonia, organism unspecified', 'Diseases of the respiratory system', 'Influenza and pneumonia'),
('K25', 'Gastric ulcer', 'Diseases of the digestive system', 'Diseases of oesophagus, stomach and duodenum'),
('K26', 'Duodenal ulcer', 'Diseases of the digestive system', 'Diseases of oesophagus, stomach and duodenum'),
('K27', 'Peptic ulcer, site unspecified', 'Diseases of the digestive system', 'Diseases of oesophagus, stomach and duodenum'),
('K28', 'Gastrojejunal ulcer', 'Diseases of the digestive system', 'Diseases of oesophagus, stomach and duodenum'),
('K29', 'Gastritis and duodenitis', 'Diseases of the digestive system', 'Diseases of oesophagus, stomach and duodenum'),
('C50', 'Malignant neoplasm of breast', 'Neoplasms', 'Malignant neoplasms'),
('C78', 'Secondary malignant neoplasm of respiratory and digestive organs', 'Neoplasms', 'Malignant neoplasms'),
('C79', 'Secondary malignant neoplasm of other and unspecified sites', 'Neoplasms', 'Malignant neoplasms'),
('C80', 'Malignant neoplasm without specification of site', 'Neoplasms', 'Malignant neoplasms'),
('C81', 'Hodgkin lymphoma', 'Neoplasms', 'Malignant neoplasms'),
('C82', 'Follicular lymphoma', 'Neoplasms', 'Malignant neoplasms'),
('C83', 'Non-follicular lymphoma', 'Neoplasms', 'Malignant neoplasms'),
('C84', 'Mature T/NK-cell lymphomas', 'Neoplasms', 'Malignant neoplasms'),
('C85', 'Other and unspecified types of non-Hodgkin lymphoma', 'Neoplasms', 'Malignant neoplasms'),
('C88', 'Malignant immunoproliferative diseases and certain other B-cell lymphomas', 'Neoplasms', 'Malignant neoplasms'),
('C90', 'Multiple myeloma and malignant plasma cell neoplasms', 'Neoplasms', 'Malignant neoplasms'),
('C91', 'Lymphoid leukemia', 'Neoplasms', 'Malignant neoplasms'),
('C92', 'Myeloid leukemia', 'Neoplasms', 'Malignant neoplasms'),
('C93', 'Monocytic leukemia', 'Neoplasms', 'Malignant neoplasms'),
('C94', 'Other leukemias of specified cell type', 'Neoplasms', 'Malignant neoplasms'),
('C95', 'Leukemia of unspecified cell type', 'Neoplasms', 'Malignant neoplasms'),
('C96', 'Other and unspecified malignant neoplasms of lymphoid, hematopoietic and related tissue', 'Neoplasms', 'Malignant neoplasms'),
('C97', 'Malignant neoplasms of independent (primary) multiple sites', 'Neoplasms', 'Malignant neoplasms')
ON CONFLICT (code) DO NOTHING;

-- Step 2: Add Foreign Key Constraints
DO $$
BEGIN
    -- Add foreign key constraint for service_code_mappings to service_prices
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_service_code_mappings_service_price_id'
        AND table_name = 'service_code_mappings'
    ) THEN
        ALTER TABLE public.service_code_mappings 
        ADD CONSTRAINT fk_service_code_mappings_service_price_id 
        FOREIGN KEY (service_price_id) 
        REFERENCES public.service_prices(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Step 3: Add Service Code Mappings
INSERT INTO public.service_code_mappings (
    service_price_id,
    icd10_code,
    icd11_code,
    cpt4_code,
    sha_code,
    mapping_type,
    is_primary
) VALUES
-- General Consultation mappings
(
    (SELECT id FROM public.service_prices WHERE service_name ILIKE '%general consultation%' LIMIT 1),
    'Z00.0', -- General adult medical examination
    'QA00',  -- General adult medical examination
    '99201', -- Office visit for new patient
    'SHA001', -- General Consultation
    'service',
    true
),
-- Specialist Consultation mappings
(
    (SELECT id FROM public.service_prices WHERE service_name ILIKE '%specialist consultation%' LIMIT 1),
    'Z00.1', -- General child medical examination
    'QA01',  -- General child medical examination
    '99211', -- Office visit for established patient
    'SHA002', -- Specialist Consultation
    'service',
    true
),
-- Full Blood Count mappings
(
    (SELECT id FROM public.service_prices WHERE service_name ILIKE '%full blood count%' OR service_name ILIKE '%fbc%' LIMIT 1),
    'D64.9', -- Anemia, unspecified
    '3A00',  -- Anemia, unspecified
    '85025', -- Blood count; complete (CBC), automated
    'SHA006', -- Full Blood Count
    'procedure',
    true
),
-- Chest X-ray mappings
(
    (SELECT id FROM public.service_prices WHERE service_name ILIKE '%chest x-ray%' OR service_name ILIKE '%chest xray%' LIMIT 1),
    'J18.9', -- Pneumonia, unspecified organism
    'CA40',  -- Pneumonia, unspecified organism
    '71020', -- Radiologic examination, chest, 2 views
    'SHA016', -- Chest X-ray
    'procedure',
    true
),
-- Appendectomy mappings
(
    (SELECT id FROM public.service_prices WHERE service_name ILIKE '%appendectomy%' LIMIT 1),
    'K35.9', -- Acute appendicitis, unspecified
    'DD50',  -- Acute appendicitis, unspecified
    '44970', -- Laparoscopy, surgical, appendectomy
    'SHA031', -- Appendectomy
    'procedure',
    true
),
-- Malaria diagnosis mappings
(
    (SELECT id FROM public.service_prices WHERE service_name ILIKE '%malaria%' LIMIT 1),
    'B54',   -- Unspecified malaria
    '1A0G',  -- Malaria
    '87804', -- Infectious agent antigen detection by immunoassay technique
    NULL,    -- No specific SHA code for malaria test
    'diagnosis',
    true
),
-- HIV testing mappings
(
    (SELECT id FROM public.service_prices WHERE service_name ILIKE '%hiv%' OR service_name ILIKE '%aids%' LIMIT 1),
    'B20',   -- Human immunodeficiency virus [HIV] disease
    '1A0P',  -- HIV disease
    '86703', -- HIV-1 and HIV-2, single assay
    NULL,    -- No specific SHA code for HIV test
    'diagnosis',
    true
),
-- Diabetes consultation mappings
(
    (SELECT id FROM public.service_prices WHERE service_name ILIKE '%diabetes%' LIMIT 1),
    'E11.9', -- Type 2 diabetes mellitus without complications
    '5A10',  -- Type 1 diabetes mellitus
    '99213', -- Office visit, established patient, expanded problem focused
    'SHA002', -- Specialist Consultation
    'diagnosis',
    true
),
-- Hypertension consultation mappings
(
    (SELECT id FROM public.service_prices WHERE service_name ILIKE '%hypertension%' OR service_name ILIKE '%blood pressure%' LIMIT 1),
    'I10',   -- Essential hypertension
    'BA00',  -- Essential hypertension
    '99213', -- Office visit, established patient, expanded problem focused
    'SHA002', -- Specialist Consultation
    'diagnosis',
    true
),
-- Tuberculosis diagnosis mappings
(
    (SELECT id FROM public.service_prices WHERE service_name ILIKE '%tuberculosis%' OR service_name ILIKE '%tb%' LIMIT 1),
    'A15.9', -- Respiratory tuberculosis unspecified
    '1A0M',  -- Tuberculosis
    '87806', -- Infectious agent antigen detection by immunoassay technique
    NULL,    -- No specific SHA code for TB test
    'diagnosis',
    true
)
ON CONFLICT DO NOTHING;

-- Step 4: Create additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_icd10_codes_description ON public.icd10_codes(description);
CREATE INDEX IF NOT EXISTS idx_icd10_codes_category ON public.icd10_codes(category);
CREATE INDEX IF NOT EXISTS idx_service_code_mappings_service_price_id ON public.service_code_mappings(service_price_id);
CREATE INDEX IF NOT EXISTS idx_service_code_mappings_mapping_type ON public.service_code_mappings(mapping_type);

-- Step 5: Verify the setup
SELECT 
    'ICD-10 Codes' as table_name, 
    COUNT(*) as record_count 
FROM public.icd10_codes
UNION ALL
SELECT 
    'ICD-11 Codes' as table_name, 
    COUNT(*) as record_count 
FROM public.icd11_codes
UNION ALL
SELECT 
    'CPT-4 Codes' as table_name, 
    COUNT(*) as record_count 
FROM public.cpt4_codes
UNION ALL
SELECT 
    'Tanzania Service Codes' as table_name, 
    COUNT(*) as record_count 
FROM public.tanzania_service_codes
UNION ALL
SELECT 
    'Service Code Mappings' as table_name, 
    COUNT(*) as record_count 
FROM public.service_code_mappings
ORDER BY table_name;
