-- Final Data Access Test
-- This will confirm that data is accessible after policy cleanup

-- 1. Test patient access
SELECT 
    'PATIENTS TEST' as test_type,
    COUNT(*) as total_patients,
    STRING_AGG(first_name || ' ' || last_name, ', ') as patient_names
FROM patients;

-- 2. Test service prices access
SELECT 
    'SERVICE PRICES TEST' as test_type,
    COUNT(*) as total_services,
    COUNT(DISTINCT category) as categories
FROM service_prices;

-- 3. Test specific patient data (Esther Leonard Mviombo)
SELECT 
    'SPECIFIC PATIENT TEST' as test_type,
    mrn,
    first_name,
    last_name,
    phone,
    insurance_provider,
    insurance_membership_number
FROM patients 
WHERE first_name ILIKE '%esther%' OR last_name ILIKE '%mviombo%';

-- 4. Test service categories
SELECT 
    'SERVICE CATEGORIES TEST' as test_type,
    category,
    COUNT(*) as service_count
FROM service_prices 
GROUP BY category 
ORDER BY service_count DESC 
LIMIT 5;

-- 5. Authentication context check
SELECT 
    'AUTH CONTEXT TEST' as test_type,
    auth.uid() as user_id,
    auth.role() as user_role,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN 'AUTHENTICATED'
        ELSE 'NOT AUTHENTICATED'
    END as auth_status;
