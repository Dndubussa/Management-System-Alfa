-- Simple and Clear Patient Count Check
-- This will give you a definitive answer

-- 1. Get the exact count of patients
SELECT COUNT(*) as total_patients FROM patients;

-- 2. If count is 0, show clear message
SELECT 
    CASE 
        WHEN COUNT(*) = 0 
        THEN 'CONFIRMED: NO PATIENTS IN DATABASE'
        ELSE CONCAT('CONFIRMED: ', COUNT(*), ' PATIENTS FOUND')
    END as result
FROM patients;

-- 3. Show table structure to understand what columns exist
SELECT 
    'Table Structure:' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position;
