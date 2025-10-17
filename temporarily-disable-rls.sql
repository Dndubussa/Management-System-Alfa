-- Temporarily Disable RLS for Testing
-- This will help identify if RLS is blocking frontend access

-- 1. Disable RLS on main tables temporarily
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_prices DISABLE ROW LEVEL SECURITY;
ALTER TABLE bills DISABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claims DISABLE ROW LEVEL SECURITY;

-- 2. Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('patients', 'service_prices', 'bills', 'insurance_claims')
ORDER BY tablename;

-- 3. Test data access without RLS
SELECT 'RLS DISABLED - PATIENTS' as test, COUNT(*) as count FROM patients;
SELECT 'RLS DISABLED - SERVICES' as test, COUNT(*) as count FROM service_prices;

-- IMPORTANT: After testing, you should re-enable RLS for security!
-- Run the re-enable script after confirming the issue
