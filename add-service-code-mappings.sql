-- Add Service Code Mappings for Ministry Compliance
-- This creates relationships between service_prices and ICD/CPT/SHA codes

-- First, let's add some service code mappings for common services
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
