-- Convert existing MRNs from ALFA-YYYY-XXXXX format to P001 format
-- This script updates existing patients to use the new P001 format

-- ==============================================
-- STEP 1: CHECK CURRENT MRN FORMATS
-- ==============================================

SELECT 'Current MRN formats in database:' as info;
SELECT mrn, COUNT(*) as count 
FROM patients 
GROUP BY mrn 
ORDER BY mrn;

-- ==============================================
-- STEP 2: CONVERT EXISTING MRNs TO P001 FORMAT
-- ==============================================

-- Update existing patients to use P001 format based on creation date
WITH numbered_patients AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) as new_number
  FROM patients
  ORDER BY created_at ASC
)
UPDATE patients 
SET mrn = 'P' || LPAD(numbered_patients.new_number::text, 3, '0')
FROM numbered_patients
WHERE patients.id = numbered_patients.id;

-- ==============================================
-- STEP 3: VERIFY THE CONVERSION
-- ==============================================

SELECT 'MRN conversion completed!' as status;

SELECT 'Updated MRN formats:' as info;
SELECT mrn, COUNT(*) as count 
FROM patients 
GROUP BY mrn 
ORDER BY mrn;

-- Show all patients with their new MRN format
SELECT 
  id,
  mrn,
  first_name,
  last_name,
  created_at 
FROM patients 
ORDER BY created_at ASC;
