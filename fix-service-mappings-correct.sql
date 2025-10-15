-- Fix Service Code Mappings with Actual Service Names
-- This uses the actual service names that exist in the database

-- First, let's clear any existing mappings
DELETE FROM public.service_code_mappings;

-- Now insert correct mappings using actual service names and IDs
INSERT INTO public.service_code_mappings (
    service_price_id,
    icd10_code,
    icd11_code,
    cpt4_code,
    sha_code,
    mapping_type,
    is_primary
) VALUES
-- Use actual service IDs from the database
-- General Consultation mapping (using a consultation service)
(
    (SELECT id FROM public.service_prices WHERE service_name ILIKE '%consultation%' AND category = 'consultation' LIMIT 1),
    'A00',   -- Cholera
    '1A00',  -- Cholera
    '99201', -- Office visit for new patient
    'SHA001', -- General Consultation
    'service',
    true
),
-- Lab Test mapping (using a lab test service)
(
    (SELECT id FROM public.service_prices WHERE service_name ILIKE '%UREA%' LIMIT 1),
    'B50',   -- Malaria
    '1A0G',  -- Malaria
    '80047', -- Basic metabolic panel
    'SHA006', -- Full Blood Count
    'procedure',
    true
),
-- X-Ray mapping (using an X-ray service)
(
    (SELECT id FROM public.service_prices WHERE service_name ILIKE '%X-RAY-CHEST%' LIMIT 1),
    'J18.9', -- Pneumonia, unspecified organism
    'CA40',  -- Pneumonia, unspecified organism
    '70010', -- Radiologic examination
    'SHA016', -- Chest X-ray
    'procedure',
    true
),
-- Surgery mapping (using a surgical procedure)
(
    (SELECT id FROM public.service_prices WHERE service_name ILIKE '%Appendectomy%' OR service_name ILIKE '%APPENDECTOMY%' LIMIT 1),
    'K35.9', -- Acute appendicitis, unspecified
    'DD50',  -- Acute appendicitis, unspecified
    '10021', -- Fine needle aspiration biopsy
    'SHA031', -- Appendectomy
    'procedure',
    true
),
-- Another consultation mapping
(
    (SELECT id FROM public.service_prices WHERE service_name ILIKE '%WOUND SUTURING%' LIMIT 1),
    'E10',   -- Type 1 diabetes mellitus
    '5A10',  -- Type 1 diabetes mellitus
    '99211', -- Office visit for established patient
    'SHA002', -- Specialist Consultation
    'diagnosis',
    true
);

-- If no appendectomy found, use any surgical procedure
INSERT INTO public.service_code_mappings (
    service_price_id,
    icd10_code,
    icd11_code,
    cpt4_code,
    sha_code,
    mapping_type,
    is_primary
)
SELECT 
    (SELECT id FROM public.service_prices WHERE category = 'procedure' LIMIT 1),
    'K35.9', -- Acute appendicitis, unspecified
    'DD50',  -- Acute appendicitis, unspecified
    '10021', -- Fine needle aspiration biopsy
    'SHA031', -- Appendectomy
    'procedure',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.service_code_mappings 
    WHERE icd10_code = 'K35.9'
);

-- Verify the mappings were created successfully
SELECT 
    scm.id,
    sp.service_name,
    sp.category,
    scm.icd10_code,
    scm.icd11_code,
    scm.cpt4_code,
    scm.sha_code,
    scm.mapping_type
FROM public.service_code_mappings scm
LEFT JOIN public.service_prices sp ON scm.service_price_id = sp.id
ORDER BY scm.created_at;
