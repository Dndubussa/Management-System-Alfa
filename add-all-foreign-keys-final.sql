-- Add all foreign key constraints for service_code_mappings and related tables
-- This script handles all constraints that might be missing

DO $$
BEGIN
    -- Add foreign key constraints for service_code_mappings table
    RAISE NOTICE 'Adding foreign key constraints for service_code_mappings...';
    
    -- Service Price ID constraint (if not exists)
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_service_code_mappings_service_price_id' AND table_name = 'service_code_mappings') THEN
        ALTER TABLE public.service_code_mappings
        ADD CONSTRAINT fk_service_code_mappings_service_price_id
        FOREIGN KEY (service_price_id) REFERENCES public.service_prices(id)
        ON DELETE CASCADE;
        RAISE NOTICE 'Added fk_service_code_mappings_service_price_id constraint';
    ELSE
        RAISE NOTICE 'fk_service_code_mappings_service_price_id constraint already exists';
    END IF;

    -- ICD-10 Code constraint (if not exists)
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_service_code_mappings_icd10_code' AND table_name = 'service_code_mappings') THEN
        ALTER TABLE public.service_code_mappings
        ADD CONSTRAINT fk_service_code_mappings_icd10_code
        FOREIGN KEY (icd10_code) REFERENCES public.icd10_codes(code)
        ON DELETE SET NULL;
        RAISE NOTICE 'Added fk_service_code_mappings_icd10_code constraint';
    ELSE
        RAISE NOTICE 'fk_service_code_mappings_icd10_code constraint already exists';
    END IF;

    -- ICD-11 Code constraint (if not exists)
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_service_code_mappings_icd11_code' AND table_name = 'service_code_mappings') THEN
        ALTER TABLE public.service_code_mappings
        ADD CONSTRAINT fk_service_code_mappings_icd11_code
        FOREIGN KEY (icd11_code) REFERENCES public.icd11_codes(code)
        ON DELETE SET NULL;
        RAISE NOTICE 'Added fk_service_code_mappings_icd11_code constraint';
    ELSE
        RAISE NOTICE 'fk_service_code_mappings_icd11_code constraint already exists';
    END IF;

    -- CPT-4 Code constraint (if not exists)
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_service_code_mappings_cpt4_code' AND table_name = 'service_code_mappings') THEN
        ALTER TABLE public.service_code_mappings
        ADD CONSTRAINT fk_service_code_mappings_cpt4_code
        FOREIGN KEY (cpt4_code) REFERENCES public.cpt4_codes(code)
        ON DELETE SET NULL;
        RAISE NOTICE 'Added fk_service_code_mappings_cpt4_code constraint';
    ELSE
        RAISE NOTICE 'fk_service_code_mappings_cpt4_code constraint already exists';
    END IF;

    -- Tanzania Service Code constraint (if not exists)
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_service_code_mappings_sha_code' AND table_name = 'service_code_mappings') THEN
        ALTER TABLE public.service_code_mappings
        ADD CONSTRAINT fk_service_code_mappings_sha_code
        FOREIGN KEY (sha_code) REFERENCES public.tanzania_service_codes(sha_code)
        ON DELETE SET NULL;
        RAISE NOTICE 'Added fk_service_code_mappings_sha_code constraint';
    ELSE
        RAISE NOTICE 'fk_service_code_mappings_sha_code constraint already exists';
    END IF;

    -- Add foreign key constraints for medical_record_diagnoses table
    RAISE NOTICE 'Adding foreign key constraints for medical_record_diagnoses...';
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_medical_record_diagnoses_medical_record_id' AND table_name = 'medical_record_diagnoses') THEN
        ALTER TABLE public.medical_record_diagnoses
        ADD CONSTRAINT fk_medical_record_diagnoses_medical_record_id
        FOREIGN KEY (medical_record_id) REFERENCES public.medical_records(id)
        ON DELETE CASCADE;
        RAISE NOTICE 'Added fk_medical_record_diagnoses_medical_record_id constraint';
    ELSE
        RAISE NOTICE 'fk_medical_record_diagnoses_medical_record_id constraint already exists';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_medical_record_diagnoses_icd10_code' AND table_name = 'medical_record_diagnoses') THEN
        ALTER TABLE public.medical_record_diagnoses
        ADD CONSTRAINT fk_medical_record_diagnoses_icd10_code
        FOREIGN KEY (icd10_code) REFERENCES public.icd10_codes(code)
        ON DELETE SET NULL;
        RAISE NOTICE 'Added fk_medical_record_diagnoses_icd10_code constraint';
    ELSE
        RAISE NOTICE 'fk_medical_record_diagnoses_icd10_code constraint already exists';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_medical_record_diagnoses_icd11_code' AND table_name = 'medical_record_diagnoses') THEN
        ALTER TABLE public.medical_record_diagnoses
        ADD CONSTRAINT fk_medical_record_diagnoses_icd11_code
        FOREIGN KEY (icd11_code) REFERENCES public.icd11_codes(code)
        ON DELETE SET NULL;
        RAISE NOTICE 'Added fk_medical_record_diagnoses_icd11_code constraint';
    ELSE
        RAISE NOTICE 'fk_medical_record_diagnoses_icd11_code constraint already exists';
    END IF;

    -- Add foreign key constraints for prescription_diagnoses table
    RAISE NOTICE 'Adding foreign key constraints for prescription_diagnoses...';
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_prescription_diagnoses_prescription_id' AND table_name = 'prescription_diagnoses') THEN
        ALTER TABLE public.prescription_diagnoses
        ADD CONSTRAINT fk_prescription_diagnoses_prescription_id
        FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id)
        ON DELETE CASCADE;
        RAISE NOTICE 'Added fk_prescription_diagnoses_prescription_id constraint';
    ELSE
        RAISE NOTICE 'fk_prescription_diagnoses_prescription_id constraint already exists';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_prescription_diagnoses_icd10_code' AND table_name = 'prescription_diagnoses') THEN
        ALTER TABLE public.prescription_diagnoses
        ADD CONSTRAINT fk_prescription_diagnoses_icd10_code
        FOREIGN KEY (icd10_code) REFERENCES public.icd10_codes(code)
        ON DELETE SET NULL;
        RAISE NOTICE 'Added fk_prescription_diagnoses_icd10_code constraint';
    ELSE
        RAISE NOTICE 'fk_prescription_diagnoses_icd10_code constraint already exists';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_prescription_diagnoses_icd11_code' AND table_name = 'prescription_diagnoses') THEN
        ALTER TABLE public.prescription_diagnoses
        ADD CONSTRAINT fk_prescription_diagnoses_icd11_code
        FOREIGN KEY (icd11_code) REFERENCES public.icd11_codes(code)
        ON DELETE SET NULL;
        RAISE NOTICE 'Added fk_prescription_diagnoses_icd11_code constraint';
    ELSE
        RAISE NOTICE 'fk_prescription_diagnoses_icd11_code constraint already exists';
    END IF;

    -- Add foreign key constraints for bill_item_diagnoses table
    RAISE NOTICE 'Adding foreign key constraints for bill_item_diagnoses...';
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_bill_item_diagnoses_bill_item_id' AND table_name = 'bill_item_diagnoses') THEN
        ALTER TABLE public.bill_item_diagnoses
        ADD CONSTRAINT fk_bill_item_diagnoses_bill_item_id
        FOREIGN KEY (bill_item_id) REFERENCES public.bill_items(id)
        ON DELETE CASCADE;
        RAISE NOTICE 'Added fk_bill_item_diagnoses_bill_item_id constraint';
    ELSE
        RAISE NOTICE 'fk_bill_item_diagnoses_bill_item_id constraint already exists';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_bill_item_diagnoses_icd10_code' AND table_name = 'bill_item_diagnoses') THEN
        ALTER TABLE public.bill_item_diagnoses
        ADD CONSTRAINT fk_bill_item_diagnoses_icd10_code
        FOREIGN KEY (icd10_code) REFERENCES public.icd10_codes(code)
        ON DELETE SET NULL;
        RAISE NOTICE 'Added fk_bill_item_diagnoses_icd10_code constraint';
    ELSE
        RAISE NOTICE 'fk_bill_item_diagnoses_icd10_code constraint already exists';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_bill_item_diagnoses_icd11_code' AND table_name = 'bill_item_diagnoses') THEN
        ALTER TABLE public.bill_item_diagnoses
        ADD CONSTRAINT fk_bill_item_diagnoses_icd11_code
        FOREIGN KEY (icd11_code) REFERENCES public.icd11_codes(code)
        ON DELETE SET NULL;
        RAISE NOTICE 'Added fk_bill_item_diagnoses_icd11_code constraint';
    ELSE
        RAISE NOTICE 'fk_bill_item_diagnoses_icd11_code constraint already exists';
    END IF;

    RAISE NOTICE 'All foreign key constraints have been processed.';
END $$;

-- Verify all foreign key constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('service_code_mappings', 'medical_record_diagnoses', 'prescription_diagnoses', 'bill_item_diagnoses')
ORDER BY tc.table_name, tc.constraint_name;
