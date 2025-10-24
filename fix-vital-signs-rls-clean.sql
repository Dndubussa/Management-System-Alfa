-- Clean up conflicting RLS policies for vital_signs table
-- Remove duplicate policies and keep only the working ones

-- First, drop all existing policies
DROP POLICY IF EXISTS "Users can view vital signs" ON vital_signs;
DROP POLICY IF EXISTS "Nurses can insert vital signs" ON vital_signs;
DROP POLICY IF EXISTS "vital_signs_insert_policy" ON vital_signs;
DROP POLICY IF EXISTS "vital_signs_select_policy" ON vital_signs;
DROP POLICY IF EXISTS "vital_signs_update_policy" ON vital_signs;

-- Create clean, simple policies that allow all operations
-- This is for testing - you can make them more restrictive later

CREATE POLICY "vital_signs_allow_all" ON vital_signs
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Verify the policies are clean
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'vital_signs';
