-- Fix Foreign Key Relationships for Ministry Compliance
-- Add missing foreign key constraints

-- Add foreign key constraint for service_code_mappings to service_prices
DO $$
BEGIN
    -- Check if the foreign key constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_service_code_mappings_service_price_id'
        AND table_name = 'service_code_mappings'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE public.service_code_mappings 
        ADD CONSTRAINT fk_service_code_mappings_service_price_id 
        FOREIGN KEY (service_price_id) 
        REFERENCES public.service_prices(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key constraint for medical_record_diagnoses to medical_records
DO $$
BEGIN
    -- Check if the foreign key constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_medical_record_diagnoses_medical_record_id'
        AND table_name = 'medical_record_diagnoses'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE public.medical_record_diagnoses 
        ADD CONSTRAINT fk_medical_record_diagnoses_medical_record_id 
        FOREIGN KEY (medical_record_id) 
        REFERENCES public.medical_records(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key constraint for prescription_diagnoses to prescriptions
DO $$
BEGIN
    -- Check if the foreign key constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_prescription_diagnoses_prescription_id'
        AND table_name = 'prescription_diagnoses'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE public.prescription_diagnoses 
        ADD CONSTRAINT fk_prescription_diagnoses_prescription_id 
        FOREIGN KEY (prescription_id) 
        REFERENCES public.prescriptions(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key constraint for bill_item_diagnoses to bill_items
DO $$
BEGIN
    -- Check if the foreign key constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_bill_item_diagnoses_bill_item_id'
        AND table_name = 'bill_item_diagnoses'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE public.bill_item_diagnoses 
        ADD CONSTRAINT fk_bill_item_diagnoses_bill_item_id 
        FOREIGN KEY (bill_item_id) 
        REFERENCES public.bill_items(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key constraints for ICD code references
DO $$
BEGIN
    -- ICD-10 foreign keys
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_medical_record_diagnoses_icd10_code'
        AND table_name = 'medical_record_diagnoses'
    ) THEN
        ALTER TABLE public.medical_record_diagnoses 
        ADD CONSTRAINT fk_medical_record_diagnoses_icd10_code 
        FOREIGN KEY (icd10_code) 
        REFERENCES public.icd10_codes(code) 
        ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_prescription_diagnoses_icd10_code'
        AND table_name = 'prescription_diagnoses'
    ) THEN
        ALTER TABLE public.prescription_diagnoses 
        ADD CONSTRAINT fk_prescription_diagnoses_icd10_code 
        FOREIGN KEY (icd10_code) 
        REFERENCES public.icd10_codes(code) 
        ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_bill_item_diagnoses_icd10_code'
        AND table_name = 'bill_item_diagnoses'
    ) THEN
        ALTER TABLE public.bill_item_diagnoses 
        ADD CONSTRAINT fk_bill_item_diagnoses_icd10_code 
        FOREIGN KEY (icd10_code) 
        REFERENCES public.icd10_codes(code) 
        ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_service_code_mappings_icd10_code'
        AND table_name = 'service_code_mappings'
    ) THEN
        ALTER TABLE public.service_code_mappings 
        ADD CONSTRAINT fk_service_code_mappings_icd10_code 
        FOREIGN KEY (icd10_code) 
        REFERENCES public.icd10_codes(code) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Add foreign key constraints for ICD-11 code references
DO $$
BEGIN
    -- ICD-11 foreign keys
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_medical_record_diagnoses_icd11_code'
        AND table_name = 'medical_record_diagnoses'
    ) THEN
        ALTER TABLE public.medical_record_diagnoses 
        ADD CONSTRAINT fk_medical_record_diagnoses_icd11_code 
        FOREIGN KEY (icd11_code) 
        REFERENCES public.icd11_codes(code) 
        ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_prescription_diagnoses_icd11_code'
        AND table_name = 'prescription_diagnoses'
    ) THEN
        ALTER TABLE public.prescription_diagnoses 
        ADD CONSTRAINT fk_prescription_diagnoses_icd11_code 
        FOREIGN KEY (icd11_code) 
        REFERENCES public.icd11_codes(code) 
        ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_bill_item_diagnoses_icd11_code'
        AND table_name = 'bill_item_diagnoses'
    ) THEN
        ALTER TABLE public.bill_item_diagnoses 
        ADD CONSTRAINT fk_bill_item_diagnoses_icd11_code 
        FOREIGN KEY (icd11_code) 
        REFERENCES public.icd11_codes(code) 
        ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_service_code_mappings_icd11_code'
        AND table_name = 'service_code_mappings'
    ) THEN
        ALTER TABLE public.service_code_mappings 
        ADD CONSTRAINT fk_service_code_mappings_icd11_code 
        FOREIGN KEY (icd11_code) 
        REFERENCES public.icd11_codes(code) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Add foreign key constraints for CPT-4 code references
DO $$
BEGIN
    -- CPT-4 foreign keys
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_service_code_mappings_cpt4_code'
        AND table_name = 'service_code_mappings'
    ) THEN
        ALTER TABLE public.service_code_mappings 
        ADD CONSTRAINT fk_service_code_mappings_cpt4_code 
        FOREIGN KEY (cpt4_code) 
        REFERENCES public.cpt4_codes(code) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Add foreign key constraints for Tanzania Service Code references
DO $$
BEGIN
    -- Tanzania Service Code foreign keys
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_service_code_mappings_sha_code'
        AND table_name = 'service_code_mappings'
    ) THEN
        ALTER TABLE public.service_code_mappings 
        ADD CONSTRAINT fk_service_code_mappings_sha_code 
        FOREIGN KEY (sha_code) 
        REFERENCES public.tanzania_service_codes(sha_code) 
        ON DELETE SET NULL;
    END IF;
END $$;
