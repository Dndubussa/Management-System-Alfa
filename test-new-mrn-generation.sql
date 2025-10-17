-- Test new MRN generation logic
-- This script verifies that new patients will get P001 format

-- ==============================================
-- STEP 1: CHECK CURRENT MRN GENERATION LOGIC
-- ==============================================

-- Test the MRN generation logic that should be used for new patients
WITH last_patient AS (
  SELECT mrn
  FROM patients
  ORDER BY created_at DESC
  LIMIT 1
),
next_number AS (
  SELECT 
    CASE 
      WHEN last_patient.mrn IS NULL THEN 1
      WHEN last_patient.mrn ~ '^P(\d+)$' THEN 
        (SELECT (regexp_match(last_patient.mrn, '^P(\d+)$'))[1]::int + 1)
      WHEN last_patient.mrn ~ '^ALFA-\d{4}-(\d+)$' THEN 
        (SELECT (regexp_match(last_patient.mrn, '^ALFA-\d{4}-(\d+)$'))[1]::int + 1)
      ELSE 1
    END as next_num
  FROM last_patient
)
SELECT 
  'Next MRN that would be generated:' as info,
  'P' || LPAD(next_number.next_num::text, 3, '0') as next_mrn,
  next_number.next_num as next_number
FROM next_number;

-- ==============================================
-- STEP 2: SHOW CURRENT PATIENTS
-- ==============================================

SELECT 'Current patients and their MRNs:' as info;
SELECT 
  mrn,
  first_name,
  last_name,
  created_at,
  CASE 
    WHEN mrn ~ '^P\d{3}$' THEN 'New Format (P001)'
    WHEN mrn ~ '^ALFA-\d{4}-\d{5}$' THEN 'Old Format (ALFA-YYYY-XXXXX)'
    ELSE 'Other Format'
  END as format_type
FROM patients 
ORDER BY created_at ASC;

-- ==============================================
-- STEP 3: COUNT BY FORMAT
-- ==============================================

SELECT 'MRN format distribution:' as info;
SELECT 
  CASE 
    WHEN mrn ~ '^P\d{3}$' THEN 'New Format (P001)'
    WHEN mrn ~ '^ALFA-\d{4}-\d{5}$' THEN 'Old Format (ALFA-YYYY-XXXXX)'
    ELSE 'Other Format'
  END as format_type,
  COUNT(*) as patient_count
FROM patients 
GROUP BY 
  CASE 
    WHEN mrn ~ '^P\d{3}$' THEN 'New Format (P001)'
    WHEN mrn ~ '^ALFA-\d{4}-\d{5}$' THEN 'Old Format (ALFA-YYYY-XXXXX)'
    ELSE 'Other Format'
  END
ORDER BY format_type;
