-- Final Fix for Service Code Mappings
-- Using actual service IDs from the database to avoid null values

-- Clear existing mappings
DELETE FROM public.service_code_mappings;

-- Insert mappings using actual service IDs from the database
-- Based on the API response, we have these actual services:

-- 1. Consultation Service: "WOUND SUTURING" (ID: 0035b6cc-0e20-4581-a2f4-e4275586930a)
INSERT INTO public.service_code_mappings (
    service_price_id,
    icd10_code,
    icd11_code,
    cpt4_code,
    sha_code,
    mapping_type,
    is_primary
) VALUES (
    '0035b6cc-0e20-4581-a2f4-e4275586930a', -- WOUND SUTURING
    'A00',   -- Cholera
    '1A00',  -- Cholera
    '99201', -- Office visit for new patient
    'SHA001', -- General Consultation
    'service',
    true
);

-- 2. Lab Test Service: "UREA" (ID: d8c06a75-c934-4d52-9ad7-05e2eaa9a5f5)
INSERT INTO public.service_code_mappings (
    service_price_id,
    icd10_code,
    icd11_code,
    cpt4_code,
    sha_code,
    mapping_type,
    is_primary
) VALUES (
    'd8c06a75-c934-4d52-9ad7-05e2eaa9a5f5', -- UREA
    'B50',   -- Malaria
    '1A0G',  -- Malaria
    '80047', -- Basic metabolic panel
    'SHA006', -- Full Blood Count
    'procedure',
    true
);

-- 3. X-Ray Service: "X-RAY-CHEST" (ID: 165a4734-06c5-4fd3-83e5-552dc2ab5686)
INSERT INTO public.service_code_mappings (
    service_price_id,
    icd10_code,
    icd11_code,
    cpt4_code,
    sha_code,
    mapping_type,
    is_primary
) VALUES (
    '165a4734-06c5-4fd3-83e5-552dc2ab5686', -- X-RAY-CHEST
    'J18.9', -- Pneumonia, unspecified organism
    'CA40',  -- Pneumonia, unspecified organism
    '70010', -- Radiologic examination
    'SHA016', -- Chest X-ray
    'procedure',
    true
);

-- 4. Consultation Service: "Venous Puncture" (ID: f6af6483-9f1f-4215-8453-b5d305b8c1ca)
INSERT INTO public.service_code_mappings (
    service_price_id,
    icd10_code,
    icd11_code,
    cpt4_code,
    sha_code,
    mapping_type,
    is_primary
) VALUES (
    'f6af6483-9f1f-4215-8453-b5d305b8c1ca', -- Venous Puncture
    'E10',   -- Type 1 diabetes mellitus
    '5A10',  -- Type 1 diabetes mellitus
    '99211', -- Office visit for established patient
    'SHA002', -- Specialist Consultation
    'diagnosis',
    true
);

-- 5. Procedure Service: "Tracheostomy" (ID: 35a3c421-e40a-43d4-86e7-96759de7dd01)
INSERT INTO public.service_code_mappings (
    service_price_id,
    icd10_code,
    icd11_code,
    cpt4_code,
    sha_code,
    mapping_type,
    is_primary
) VALUES (
    '35a3c421-e40a-43d4-86e7-96759de7dd01', -- Tracheostomy
    'K35.9', -- Acute appendicitis, unspecified
    'DD50',  -- Acute appendicitis, unspecified
    '10021', -- Fine needle aspiration biopsy
    'SHA031', -- Appendectomy
    'procedure',
    true
);

-- Verify the mappings were created successfully
SELECT 
    scm.id,
    sp.service_name,
    sp.category,
    sp.price,
    scm.icd10_code,
    scm.icd11_code,
    scm.cpt4_code,
    scm.sha_code,
    scm.mapping_type,
    scm.is_primary
FROM public.service_code_mappings scm
LEFT JOIN public.service_prices sp ON scm.service_price_id = sp.id
ORDER BY scm.created_at;

-- Count total mappings
SELECT COUNT(*) as total_mappings FROM public.service_code_mappings;
