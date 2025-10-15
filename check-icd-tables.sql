-- Check if ICD tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN 'EXISTS'
        ELSE 'MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'icd10_codes',
    'icd11_codes', 
    'cpt4_codes',
    'tanzania_service_codes',
    'medical_record_diagnoses',
    'prescription_diagnoses',
    'bill_item_diagnoses',
    'service_code_mappings'
)
ORDER BY table_name;

-- Check if tables have data
SELECT 'icd10_codes' as table_name, COUNT(*) as record_count FROM public.icd10_codes
UNION ALL
SELECT 'icd11_codes' as table_name, COUNT(*) as record_count FROM public.icd11_codes
UNION ALL
SELECT 'cpt4_codes' as table_name, COUNT(*) as record_count FROM public.cpt4_codes
UNION ALL
SELECT 'tanzania_service_codes' as table_name, COUNT(*) as record_count FROM public.tanzania_service_codes;
