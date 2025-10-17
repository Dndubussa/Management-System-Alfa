-- Check for Registered Patients in Database Tables
-- Run this in your Supabase SQL Editor

-- 1. Check total count of patients
SELECT 'Total Patients' as info, COUNT(*) as count FROM patients;

-- 2. Show all patients with their details
SELECT 
    id,
    first_name,
    last_name,
    phone,
    date_of_birth,
    gender,
    insurance_provider,
    insurance_number,
    created_at
FROM patients 
ORDER BY created_at DESC;

-- 3. Check if patients have any related data
SELECT 
    'Patients with Bills' as info,
    COUNT(DISTINCT p.id) as count
FROM patients p
INNER JOIN bills b ON p.id = b.patient_id;

SELECT 
    'Patients with Appointments' as info,
    COUNT(DISTINCT p.id) as count
FROM patients p
INNER JOIN appointments a ON p.id = a.patient_id;

SELECT 
    'Patients with Medical Records' as info,
    COUNT(DISTINCT p.id) as count
FROM patients p
INNER JOIN medical_records mr ON p.id = mr.patient_id;

-- 4. Check recent patients (last 30 days)
SELECT 
    'Recent Patients (30 days)' as info,
    COUNT(*) as count
FROM patients 
WHERE created_at >= NOW() - INTERVAL '30 days';

-- 5. Check patients by insurance provider
SELECT 
    insurance_provider,
    COUNT(*) as patient_count
FROM patients 
WHERE insurance_provider IS NOT NULL
GROUP BY insurance_provider
ORDER BY patient_count DESC;

-- 6. If no patients exist, show this message
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM patients) = 0 
        THEN 'NO PATIENTS FOUND - Database is empty'
        ELSE 'Patients found - see results above'
    END as status;
