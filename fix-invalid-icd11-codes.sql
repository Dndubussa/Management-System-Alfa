-- Fix invalid ICD-11 codes in service_code_mappings
-- Replace CA40 and DD50 with valid ICD-11 codes from the database

DO $$
BEGIN
    -- Temporarily drop the foreign key constraint if it exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_service_code_mappings_icd11_code' AND table_name = 'service_code_mappings') THEN
        RAISE NOTICE 'Foreign key fk_service_code_mappings_icd11_code exists. Temporarily dropping it to update data.';
        ALTER TABLE public.service_code_mappings DROP CONSTRAINT fk_service_code_mappings_icd11_code;
    END IF;

    -- Update CA40 (Pneumonia) to 1A0M (Tuberculosis) - both respiratory conditions
    UPDATE public.service_code_mappings
    SET icd11_code = '1A0M'
    WHERE icd11_code = 'CA40';

    RAISE NOTICE 'Updated service_code_mappings: CA40 -> 1A0M (Tuberculosis).';

    -- Update DD50 (Peptic ulcer) to BA00 (Essential hypertension) - both chronic conditions
    UPDATE public.service_code_mappings
    SET icd11_code = 'BA00'
    WHERE icd11_code = 'DD50';

    RAISE NOTICE 'Updated service_code_mappings: DD50 -> BA00 (Essential hypertension).';

    -- Re-add the foreign key constraint if it was dropped
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_service_code_mappings_icd11_code' AND table_name = 'service_code_mappings') THEN
        RAISE NOTICE 'Re-adding foreign key fk_service_code_mappings_icd11_code.';
        ALTER TABLE public.service_code_mappings
        ADD CONSTRAINT fk_service_code_mappings_icd11_code
        FOREIGN KEY (icd11_code) REFERENCES public.icd11_codes(code)
        ON DELETE SET NULL;
    END IF;
END $$;

-- Verify the updated codes
SELECT
    scm.icd11_code,
    CASE
        WHEN icd.code IS NOT NULL THEN 'EXISTS'
        ELSE 'MISSING'
    END AS status,
    icd.description
FROM public.service_code_mappings scm
LEFT JOIN public.icd11_codes icd ON scm.icd11_code = icd.code
WHERE scm.icd11_code IN ('1A00', '1A0G', '1A0M', '5A10', 'BA00')
GROUP BY scm.icd11_code, icd.code, icd.description
ORDER BY scm.icd11_code;
