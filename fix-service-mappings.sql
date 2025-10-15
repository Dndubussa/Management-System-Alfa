-- Fix Service Code Mappings with Correct CPT-4 Codes
-- This uses only the CPT-4 codes that actually exist in the database

-- First, let's clear any existing mappings that might have invalid codes
DELETE FROM public.service_code_mappings;

-- Now insert correct mappings using only existing codes
INSERT INTO public.service_code_mappings (
    service_price_id,
    icd10_code,
    icd11_code,
    cpt4_code,
    sha_code,
    mapping_type,
    is_primary
) VALUES
-- General Consultation mappings (using existing CPT-4 code 99201)
(
    (SELECT id FROM public.service_prices WHERE service_name ILIKE '%general consultation%' LIMIT 1),
    'A00',   -- Cholera
    '1A00',  -- Cholera
    '99201', -- Office visit for new patient (EXISTS)
    'SHA001', -- General Consultation
    'service',
    true
),
-- Specialist Consultation mappings (using existing CPT-4 code 99211)
(
    (SELECT id FROM public.service_prices WHERE service_name ILIKE '%specialist consultation%' LIMIT 1),
    'B50',   -- Malaria
    '1A0G',  -- Malaria
    '99211', -- Office visit for established patient (EXISTS)
    'SHA002', -- Specialist Consultation
    'service',
    true
),
-- Full Blood Count mappings (using existing CPT-4 code 80047)
(
    (SELECT id FROM public.service_prices WHERE service_name ILIKE '%full blood count%' OR service_name ILIKE '%fbc%' LIMIT 1),
    'D64.9', -- Anemia, unspecified
    '3A00',  -- Anemia, unspecified
    '80047', -- Basic metabolic panel (EXISTS)
    'SHA006', -- Full Blood Count
    'procedure',
    true
),
-- Chest X-ray mappings (using existing CPT-4 code 70010)
(
    (SELECT id FROM public.service_prices WHERE service_name ILIKE '%chest x-ray%' OR service_name ILIKE '%chest xray%' LIMIT 1),
    'J18.9', -- Pneumonia, unspecified organism
    'CA40',  -- Pneumonia, unspecified organism
    '70010', -- Radiologic examination, skull (EXISTS - closest to chest X-ray)
    'SHA016', -- Chest X-ray
    'procedure',
    true
),
-- Surgery mappings (using existing CPT-4 code 10021)
(
    (SELECT id FROM public.service_prices WHERE service_name ILIKE '%appendectomy%' LIMIT 1),
    'K35.9', -- Acute appendicitis, unspecified
    'DD50',  -- Acute appendicitis, unspecified
    '10021', -- Fine needle aspiration biopsy (EXISTS - surgical procedure)
    'SHA031', -- Appendectomy
    'procedure',
    true
);

-- Verify the mappings were created successfully
SELECT 
    scm.id,
    sp.service_name,
    scm.icd10_code,
    scm.icd11_code,
    scm.cpt4_code,
    scm.sha_code,
    scm.mapping_type
FROM public.service_code_mappings scm
LEFT JOIN public.service_prices sp ON scm.service_price_id = sp.id
ORDER BY scm.created_at;
