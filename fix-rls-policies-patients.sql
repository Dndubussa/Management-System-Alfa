-- Fix RLS policies for patients table to allow authenticated users to update
-- First, let's see what policies exist
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
WHERE tablename = 'patients'
ORDER BY policyname;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "patients_select_policy" ON patients;
DROP POLICY IF EXISTS "patients_insert_policy" ON patients;
DROP POLICY IF EXISTS "patients_update_policy" ON patients;
DROP POLICY IF EXISTS "patients_delete_policy" ON patients;

-- Create new policies that allow authenticated users to perform operations
CREATE POLICY "patients_select_policy" ON patients
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "patients_insert_policy" ON patients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "patients_update_policy" ON patients
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "patients_delete_policy" ON patients
  FOR DELETE
  TO authenticated
  USING (true);

-- Verify the policies were created
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
WHERE tablename = 'patients'
ORDER BY policyname;
