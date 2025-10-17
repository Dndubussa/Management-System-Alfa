-- Debug Data Access Issues
-- This will help identify why data isn't showing in the frontend

-- 1. Check if RLS is enabled on patients table
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'patients';

-- 2. Check RLS policies on patients table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'patients';

-- 3. Check if RLS is enabled on service_prices table
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'service_prices';

-- 4. Check RLS policies on service_prices table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'service_prices';

-- 5. Test direct data access (should work in SQL editor)
SELECT COUNT(*) as patient_count FROM patients;
SELECT COUNT(*) as service_count FROM service_prices;

-- 6. Check current user context
SELECT 
    current_user as current_user,
    session_user as session_user,
    current_setting('role') as current_role;

-- 7. Check if there are any authentication issues
SELECT 
    'Auth check' as info,
    auth.uid() as current_user_id,
    auth.role() as current_role;
