-- Update MRN format to P001, P002, P003, etc.
-- This script updates existing patients to use the new P001 format

-- First, let's see what MRN formats currently exist
SELECT mrn, COUNT(*) as count 
FROM patients 
GROUP BY mrn 
ORDER BY mrn;

-- Update existing patients to use P001 format
-- This will assign sequential P numbers based on creation date
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

-- Verify the update
SELECT mrn, COUNT(*) as count 
FROM patients 
GROUP BY mrn 
ORDER BY mrn;

-- Show all patients with their new MRN format
SELECT id, mrn, first_name, last_name, created_at 
FROM patients 
ORDER BY created_at ASC;
