-- Fix RLS policy for audit_logs table to allow insertions
-- The current policy is too restrictive and prevents audit log insertions

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admin can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admin can insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admin can view all audit logs" ON audit_logs;

-- Create more permissive policies for audit logs
-- Audit logs need to be writable by the system, not just admins

-- Allow authenticated users to insert audit logs (for system operations)
CREATE POLICY "Authenticated users can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' OR 
    auth.jwt() ->> 'role' IN ('admin', 'audit', 'compliance', 'service_role')
  );

-- Allow authenticated users to view their own audit logs
CREATE POLICY "Users can view relevant audit logs" ON audit_logs
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      -- Users can see logs related to their own actions
      user_id = auth.uid() OR
      -- Admins and audit roles can see all logs
      auth.jwt() ->> 'role' IN ('admin', 'audit', 'compliance') OR
      -- Service role can see all logs
      auth.role() = 'service_role'
    )
  );

-- Allow system to update audit logs (for corrections)
CREATE POLICY "System can update audit logs" ON audit_logs
  FOR UPDATE USING (
    auth.role() = 'service_role' OR
    auth.jwt() ->> 'role' IN ('admin', 'audit', 'compliance')
  );

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
WHERE tablename = 'audit_logs'
ORDER BY policyname;
