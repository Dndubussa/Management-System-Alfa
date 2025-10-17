-- Simple SQL to Check Registered Patients
-- This version first checks the table structure, then shows patients

-- 1. First, check what columns exist in the patients table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position;

-- 2. Check total count of patients
SELECT 'Total Patients' as info, COUNT(*) as count FROM patients;

-- 3. Show all patients (using only basic columns that should exist)
SELECT 
    id,
    first_name,
    last_name,
    phone,
    created_at
FROM patients 
ORDER BY created_at DESC;

-- 4. If no patients exist, show this message
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM patients) = 0 
        THEN 'NO PATIENTS FOUND - Database is empty'
        ELSE 'Patients found - see results above'
    END as status;
