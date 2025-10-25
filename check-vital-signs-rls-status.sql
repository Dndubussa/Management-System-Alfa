-- Check the current RLS status of vital_signs table
-- This will help us verify if RLS is actually disabled

-- Check if the table exists and its RLS status
SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE tablename = 'vital_signs';

-- Check if there are any active policies
SELECT 
    schemaname, 
    tablename, 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'vital_signs';

-- Check table permissions for the anon role
SELECT 
    table_name,
    privilege_type,
    is_grantable,
    grantee
FROM information_schema.table_privileges 
WHERE table_name = 'vital_signs';

-- Check if RLS is actually disabled
SELECT 
    'vital_signs' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_class 
            WHERE relname = 'vital_signs' 
            AND relrowsecurity = false
        ) THEN 'RLS DISABLED' 
        ELSE 'RLS ENABLED' 
    END as rls_status;
