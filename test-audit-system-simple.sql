-- Simple test for audit system
-- This script tests the audit logging functionality with correct PostgreSQL syntax

-- ==============================================
-- STEP 1: VERIFY AUDIT_TRIGGER_FUNCTION EXISTS
-- ==============================================

SELECT 'Checking if audit_trigger_function exists...' as status;
SELECT 
  proname as function_name,
  prosrc IS NOT NULL as function_defined
FROM pg_proc 
WHERE proname = 'audit_trigger_function';

-- ==============================================
-- STEP 2: CHECK AUDIT_LOGS TABLE STRUCTURE
-- ==============================================

SELECT 'Checking audit_logs table structure...' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'audit_logs' 
  AND column_name = 'operation'
ORDER BY ordinal_position;

-- ==============================================
-- STEP 3: CHECK FOR AUDIT TRIGGERS
-- ==============================================

SELECT 'Checking for audit triggers...' as status;
SELECT 
  c.relname as table_name,
  t.tgname as trigger_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE t.tgname LIKE '%audit%'
  AND n.nspname = 'public'
ORDER BY c.relname;

-- ==============================================
-- STEP 4: TEST AUDIT LOGGING (if patients table exists)
-- ==============================================

-- Check if patients table exists
SELECT 'Checking if patients table exists...' as status;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') 
    THEN 'Patients table exists - can test audit logging'
    ELSE 'Patients table does not exist - cannot test audit logging'
  END as test_status;

-- ==============================================
-- STEP 5: SHOW RECENT AUDIT LOGS
-- ==============================================

SELECT 'Recent audit logs (last 5):' as status;
SELECT 
  id,
  table_name,
  operation,
  user_name,
  timestamp
FROM audit_logs 
ORDER BY timestamp DESC 
LIMIT 5;

-- ==============================================
-- STEP 6: SUMMARY
-- ==============================================

SELECT 'Audit system test completed!' as status;
