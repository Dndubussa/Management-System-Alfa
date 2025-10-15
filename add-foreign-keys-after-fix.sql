-- Add foreign key constraints after fixing invalid codes
-- This script will only add constraints that don't already exist

-- First, fix any invalid codes
UPDATE public.service_code_mappings 
SET icd10_code = 'J18'
WHERE icd10_code = 'J18.9';

UPDATE public.service_code_mappings 
SET icd10_code = 'K35'
WHERE icd10_code = 'K35.9';

-- Now add foreign key constraints (only if they don't exist)

-- Add foreign key constraint for service_code_mappings -> icd10_codes (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_service_code_mappings_icd10_code'
        AND table_name = 'service_code_mappings'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.service_code_mappings 
        ADD CONSTRAINT fk_service_code_mappings_icd10_code 
        FOREIGN KEY (icd10_code) REFERENCES public.icd10_codes(code) 
        ON DELETE SET NULL;
        RAISE NOTICE 'Added fk_service_code_mappings_icd10_code constraint';
    ELSE
        RAISE NOTICE 'fk_service_code_mappings_icd10_code constraint already exists';
    END IF;
END $$;

-- Add foreign key constraint for service_code_mappings -> icd11_codes (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_service_code_mappings_icd11_code'
        AND table_name = 'service_code_mappings'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.service_code_mappings 
        ADD CONSTRAINT fk_service_code_mappings_icd11_code 
        FOREIGN KEY (icd11_code) REFERENCES public.icd11_codes(code) 
        ON DELETE SET NULL;
        RAISE NOTICE 'Added fk_service_code_mappings_icd11_code constraint';
    ELSE
        RAISE NOTICE 'fk_service_code_mappings_icd11_code constraint already exists';
    END IF;
END $$;

-- Add foreign key constraint for service_code_mappings -> cpt4_codes (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_service_code_mappings_cpt4_code'
        AND table_name = 'service_code_mappings'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.service_code_mappings 
        ADD CONSTRAINT fk_service_code_mappings_cpt4_code 
        FOREIGN KEY (cpt4_code) REFERENCES public.cpt4_codes(code) 
        ON DELETE SET NULL;
        RAISE NOTICE 'Added fk_service_code_mappings_cpt4_code constraint';
    ELSE
        RAISE NOTICE 'fk_service_code_mappings_cpt4_code constraint already exists';
    END IF;
END $$;

-- Add foreign key constraint for service_code_mappings -> tanzania_service_codes (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_service_code_mappings_sha_code'
        AND table_name = 'service_code_mappings'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.service_code_mappings 
        ADD CONSTRAINT fk_service_code_mappings_sha_code 
        FOREIGN KEY (sha_code) REFERENCES public.tanzania_service_codes(sha_code) 
        ON DELETE SET NULL;
        RAISE NOTICE 'Added fk_service_code_mappings_sha_code constraint';
    ELSE
        RAISE NOTICE 'fk_service_code_mappings_sha_code constraint already exists';
    END IF;
END $$;

-- Verify all foreign key constraints
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name = 'service_code_mappings'
ORDER BY tc.constraint_name;
