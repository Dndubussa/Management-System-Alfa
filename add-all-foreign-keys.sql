-- Add All Foreign Key Constraints for Complete Ministry Compliance
-- Execute this in your Supabase SQL Editor

-- 1. Service Code Mappings to ICD-10 Codes
ALTER TABLE public.service_code_mappings 
ADD CONSTRAINT fk_service_code_mappings_icd10_code 
FOREIGN KEY (icd10_code) 
REFERENCES public.icd10_codes(code) 
ON DELETE SET NULL;

-- 2. Service Code Mappings to ICD-11 Codes
ALTER TABLE public.service_code_mappings 
ADD CONSTRAINT fk_service_code_mappings_icd11_code 
FOREIGN KEY (icd11_code) 
REFERENCES public.icd11_codes(code) 
ON DELETE SET NULL;

-- 3. Service Code Mappings to CPT-4 Codes
ALTER TABLE public.service_code_mappings 
ADD CONSTRAINT fk_service_code_mappings_cpt4_code 
FOREIGN KEY (cpt4_code) 
REFERENCES public.cpt4_codes(code) 
ON DELETE SET NULL;

-- 4. Service Code Mappings to Tanzania Service Codes
ALTER TABLE public.service_code_mappings 
ADD CONSTRAINT fk_service_code_mappings_sha_code 
FOREIGN KEY (sha_code) 
REFERENCES public.tanzania_service_codes(sha_code) 
ON DELETE SET NULL;

-- 5. Medical Record Diagnoses to ICD-10 Codes
ALTER TABLE public.medical_record_diagnoses 
ADD CONSTRAINT fk_medical_record_diagnoses_icd10_code 
FOREIGN KEY (icd10_code) 
REFERENCES public.icd10_codes(code) 
ON DELETE SET NULL;

-- 6. Medical Record Diagnoses to ICD-11 Codes
ALTER TABLE public.medical_record_diagnoses 
ADD CONSTRAINT fk_medical_record_diagnoses_icd11_code 
FOREIGN KEY (icd11_code) 
REFERENCES public.icd11_codes(code) 
ON DELETE SET NULL;

-- 7. Prescription Diagnoses to ICD-10 Codes
ALTER TABLE public.prescription_diagnoses 
ADD CONSTRAINT fk_prescription_diagnoses_icd10_code 
FOREIGN KEY (icd10_code) 
REFERENCES public.icd10_codes(code) 
ON DELETE SET NULL;

-- 8. Prescription Diagnoses to ICD-11 Codes
ALTER TABLE public.prescription_diagnoses 
ADD CONSTRAINT fk_prescription_diagnoses_icd11_code 
FOREIGN KEY (icd11_code) 
REFERENCES public.icd11_codes(code) 
ON DELETE SET NULL;

-- 9. Bill Item Diagnoses to ICD-10 Codes
ALTER TABLE public.bill_item_diagnoses 
ADD CONSTRAINT fk_bill_item_diagnoses_icd10_code 
FOREIGN KEY (icd10_code) 
REFERENCES public.icd10_codes(code) 
ON DELETE SET NULL;

-- 10. Bill Item Diagnoses to ICD-11 Codes
ALTER TABLE public.bill_item_diagnoses 
ADD CONSTRAINT fk_bill_item_diagnoses_icd11_code 
FOREIGN KEY (icd11_code) 
REFERENCES public.icd11_codes(code) 
ON DELETE SET NULL;

-- Verify all constraints were added
SELECT 
    tc.constraint_name, 
    tc.table_name, 
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
AND tc.table_name IN ('service_code_mappings', 'medical_record_diagnoses', 'prescription_diagnoses', 'bill_item_diagnoses')
ORDER BY tc.table_name, tc.constraint_name;
