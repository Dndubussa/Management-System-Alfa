-- Test Data Access After Policy Cleanup
-- This will verify that data can be accessed properly

-- 1. Test patient count
SELECT 'Patient Count Test' as test, COUNT(*) as count FROM patients;

-- 2. Test service prices count
SELECT 'Service Prices Count Test' as test, COUNT(*) as count FROM service_prices;

-- 3. Test specific patient data
SELECT 'Patient Data Test' as test, first_name, last_name, mrn FROM patients LIMIT 1;

-- 4. Test specific service data
SELECT 'Service Data Test' as test, service_name, category, price FROM service_prices LIMIT 3;

-- 5. Check current authentication context
SELECT 
    'Auth Context' as test,
    auth.uid() as user_id,
    auth.role() as user_role,
    current_user as current_user;
