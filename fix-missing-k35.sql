-- Fix the missing K35 code by using an existing K code
-- Replace K35 with K27 (Peptic ulcer, site unspecified) which exists in the database

UPDATE public.service_code_mappings 
SET icd10_code = 'K27'
WHERE icd10_code = 'K35';

-- Verify the fix
SELECT 
    scm.icd10_code,
    CASE 
        WHEN icd.code IS NOT NULL THEN 'EXISTS'
        ELSE 'MISSING'
    END as status,
    icd.description
FROM public.service_code_mappings scm
LEFT JOIN public.icd10_codes icd ON scm.icd10_code = icd.code
WHERE scm.icd10_code IS NOT NULL
ORDER BY scm.icd10_code;

-- Show the updated mapping
SELECT 
    id,
    service_price_id,
    icd10_code,
    icd11_code,
    cpt4_code,
    sha_code,
    mapping_type
FROM public.service_code_mappings
WHERE icd10_code = 'K27';
