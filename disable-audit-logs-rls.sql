-- Alternative solution: Temporarily disable RLS on audit_logs table
-- This allows audit logs to be inserted without authentication issues
-- Use this if the policy-based approach doesn't work

-- Disable RLS on audit_logs table
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'audit_logs';

-- Note: This makes audit logs accessible to all authenticated users
-- Consider re-enabling RLS with proper policies once the system is stable
