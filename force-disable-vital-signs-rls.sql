-- Force disable RLS for vital_signs table
-- This is a more aggressive approach to ensure RLS is completely disabled

-- First, let's see the current status
SELECT 'Current RLS status check:' as step;

SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE tablename = 'vital_signs';

-- Drop ALL policies first
SELECT 'Dropping all policies...' as step;

DROP POLICY IF EXISTS "Users can view vital signs" ON vital_signs;
DROP POLICY IF EXISTS "Nurses can insert vital signs" ON vital_signs;
DROP POLICY IF EXISTS "Users can update vital signs" ON vital_signs;
DROP POLICY IF EXISTS "vital_signs_insert_policy" ON vital_signs;
DROP POLICY IF EXISTS "vital_signs_select_policy" ON vital_signs;
DROP POLICY IF EXISTS "vital_signs_update_policy" ON vital_signs;
DROP POLICY IF EXISTS "vital_signs_allow_all" ON vital_signs;
DROP POLICY IF EXISTS "Allow all operations on vital_signs" ON vital_signs;

-- Force disable RLS
SELECT 'Disabling RLS...' as step;
ALTER TABLE vital_signs DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 'Verifying RLS is disabled...' as step;
SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE tablename = 'vital_signs';

-- Check that no policies exist
SELECT 'Checking no policies exist...' as step;
SELECT 
    schemaname, 
    tablename, 
    policyname
FROM pg_policies 
WHERE tablename = 'vital_signs';

-- Final confirmation
SELECT 'RLS should now be completely disabled for vital_signs table' as status;
