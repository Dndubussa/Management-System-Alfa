-- Fix invalid ICD codes in service_code_mappings
-- Replace codes that don't exist with valid ones

-- Update J18.9 to J18 (Pneumonia, organism unspecified)
UPDATE public.service_code_mappings 
SET icd10_code = 'J18'
WHERE icd10_code = 'J18.9';

-- Update K35.9 to K35 (Acute appendicitis)
UPDATE public.service_code_mappings 
SET icd10_code = 'K35'
WHERE icd10_code = 'K35.9';

-- Verify the updates
SELECT 
    id,
    service_price_id,
    icd10_code,
    icd11_code,
    cpt4_code,
    sha_code,
    mapping_type
FROM public.service_code_mappings
ORDER BY created_at;

-- Check if all ICD-10 codes now exist in the icd10_codes table
SELECT 
    scm.icd10_code,
    CASE 
        WHEN icd.code IS NOT NULL THEN 'EXISTS'
        ELSE 'MISSING'
    END as status
FROM public.service_code_mappings scm
LEFT JOIN public.icd10_codes icd ON scm.icd10_code = icd.code
WHERE scm.icd10_code IS NOT NULL
ORDER BY scm.icd10_code;
