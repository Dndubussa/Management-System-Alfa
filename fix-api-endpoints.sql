-- Fix API Endpoint Issues by Adding Foreign Key Constraints
-- This will resolve the "Could not find a relationship" errors

-- Add foreign key constraint for service_code_mappings -> service_prices
ALTER TABLE public.service_code_mappings 
ADD CONSTRAINT fk_service_code_mappings_service_price_id 
FOREIGN KEY (service_price_id) REFERENCES public.service_prices(id) 
ON DELETE CASCADE;

-- Add foreign key constraint for service_code_mappings -> icd10_codes
ALTER TABLE public.service_code_mappings 
ADD CONSTRAINT fk_service_code_mappings_icd10_code 
FOREIGN KEY (icd10_code) REFERENCES public.icd10_codes(code) 
ON DELETE SET NULL;

-- Add foreign key constraint for service_code_mappings -> icd11_codes
ALTER TABLE public.service_code_mappings 
ADD CONSTRAINT fk_service_code_mappings_icd11_code 
FOREIGN KEY (icd11_code) REFERENCES public.icd11_codes(code) 
ON DELETE SET NULL;

-- Add foreign key constraint for service_code_mappings -> cpt4_codes
ALTER TABLE public.service_code_mappings 
ADD CONSTRAINT fk_service_code_mappings_cpt4_code 
FOREIGN KEY (cpt4_code) REFERENCES public.cpt4_codes(code) 
ON DELETE SET NULL;

-- Add foreign key constraint for service_code_mappings -> tanzania_service_codes
ALTER TABLE public.service_code_mappings 
ADD CONSTRAINT fk_service_code_mappings_sha_code 
FOREIGN KEY (sha_code) REFERENCES public.tanzania_service_codes(sha_code) 
ON DELETE SET NULL;

-- Add foreign key constraints for medical_record_diagnoses
ALTER TABLE public.medical_record_diagnoses 
ADD CONSTRAINT fk_medical_record_diagnoses_medical_record_id 
FOREIGN KEY (medical_record_id) REFERENCES public.medical_records(id) 
ON DELETE CASCADE;

ALTER TABLE public.medical_record_diagnoses 
ADD CONSTRAINT fk_medical_record_diagnoses_icd10_code 
FOREIGN KEY (icd10_code) REFERENCES public.icd10_codes(code) 
ON DELETE SET NULL;

ALTER TABLE public.medical_record_diagnoses 
ADD CONSTRAINT fk_medical_record_diagnoses_icd11_code 
FOREIGN KEY (icd11_code) REFERENCES public.icd11_codes(code) 
ON DELETE SET NULL;

-- Add foreign key constraints for prescription_diagnoses
ALTER TABLE public.prescription_diagnoses 
ADD CONSTRAINT fk_prescription_diagnoses_prescription_id 
FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id) 
ON DELETE CASCADE;

ALTER TABLE public.prescription_diagnoses 
ADD CONSTRAINT fk_prescription_diagnoses_icd10_code 
FOREIGN KEY (icd10_code) REFERENCES public.icd10_codes(code) 
ON DELETE SET NULL;

ALTER TABLE public.prescription_diagnoses 
ADD CONSTRAINT fk_prescription_diagnoses_icd11_code 
FOREIGN KEY (icd11_code) REFERENCES public.icd11_codes(code) 
ON DELETE SET NULL;

-- Add foreign key constraints for bill_item_diagnoses
ALTER TABLE public.bill_item_diagnoses 
ADD CONSTRAINT fk_bill_item_diagnoses_bill_item_id 
FOREIGN KEY (bill_item_id) REFERENCES public.bill_items(id) 
ON DELETE CASCADE;

ALTER TABLE public.bill_item_diagnoses 
ADD CONSTRAINT fk_bill_item_diagnoses_icd10_code 
FOREIGN KEY (icd10_code) REFERENCES public.icd10_codes(code) 
ON DELETE SET NULL;

ALTER TABLE public.bill_item_diagnoses 
ADD CONSTRAINT fk_bill_item_diagnoses_icd11_code 
FOREIGN KEY (icd11_code) REFERENCES public.icd11_codes(code) 
ON DELETE SET NULL;

-- Verify all foreign key constraints were added
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
  AND tc.table_name IN (
    'service_code_mappings', 
    'medical_record_diagnoses', 
    'prescription_diagnoses', 
    'bill_item_diagnoses'
  )
ORDER BY tc.table_name, tc.constraint_name;
