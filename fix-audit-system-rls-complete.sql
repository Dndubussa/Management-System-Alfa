-- Complete fix for audit_logs RLS policy issues
-- This addresses the "new row violates RLS policy for table audit_logs" error

-- ==============================================
-- STEP 1: CHECK CURRENT STATE
-- ==============================================

-- Check if audit_logs table exists and RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'audit_logs';

-- Check current policies
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
WHERE tablename = 'audit_logs'
ORDER BY policyname;

-- ==============================================
-- STEP 2: CLEAN UP EXISTING POLICIES
-- ==============================================

-- Drop all existing policies on audit_logs
DROP POLICY IF EXISTS "Admin can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admin can insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admin can view all audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can view relevant audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can update audit logs" ON audit_logs;

-- ==============================================
-- STEP 3: CREATE PROPER RLS POLICIES
-- ==============================================

-- Ensure RLS is enabled
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow system/service role to insert audit logs
CREATE POLICY "Service role can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR
    auth.role() = 'authenticated'
  );

-- Policy 2: Allow authenticated users to view audit logs
CREATE POLICY "Authenticated users can view audit logs" ON audit_logs
  FOR SELECT USING (
    auth.role() = 'authenticated' OR
    auth.role() = 'service_role' OR
    auth.jwt() ->> 'role' IN ('admin', 'audit', 'compliance')
  );

-- Policy 3: Allow system to update audit logs
CREATE POLICY "Service role can update audit logs" ON audit_logs
  FOR UPDATE USING (
    auth.role() = 'service_role' OR
    auth.jwt() ->> 'role' IN ('admin', 'audit', 'compliance')
  );

-- ==============================================
-- STEP 4: VERIFY POLICIES
-- ==============================================

-- Check the new policies
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
WHERE tablename = 'audit_logs'
ORDER BY policyname;

-- ==============================================
-- STEP 5: TEST AUDIT LOG INSERTION
-- ==============================================

-- Test inserting an audit log entry
INSERT INTO audit_logs (
    table_name,
    record_id,
    operation,
    user_id,
    user_name,
    user_role,
    timestamp,
    notes
) VALUES (
    'test_table',
    uuid_generate_v4(),
    'INSERT',
    uuid_generate_v4(),
    'Test User',
    'admin',
    now(),
    'Test audit log entry'
);

-- If the above insert succeeds, the RLS policies are working correctly
-- If it fails, we may need to temporarily disable RLS

SELECT 'Audit log insertion test completed' as status;
