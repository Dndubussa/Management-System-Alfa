-- Check the current structure of the patients table for emergency contact columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'patients' 
  AND column_name LIKE '%emergency%'
ORDER BY ordinal_position;
