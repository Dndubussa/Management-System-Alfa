-- Test the audit system to verify it's working correctly
-- This script tests the audit logging functionality

-- ==============================================
-- STEP 1: VERIFY AUDIT_TRIGGER_FUNCTION EXISTS
-- ==============================================

SELECT 'Checking if audit_trigger_function exists...' as status;
SELECT 
  proname as function_name,
  prosrc IS NOT NULL as function_defined,
  prokind as function_type
FROM pg_proc 
WHERE proname = 'audit_trigger_function';

-- ==============================================
-- STEP 2: CHECK IF TRIGGERS ARE ATTACHED TO TABLES
-- ==============================================

SELECT 'Checking audit triggers on tables...' as status;
SELECT 
  n.nspname as schema_name,
  c.relname as table_name,
  t.tgname as trigger_name,
  t.tgtype
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE t.tgname LIKE '%audit%'
ORDER BY c.relname, t.tgname;

-- ==============================================
-- STEP 3: TEST AUDIT LOGGING (if patients table exists)
-- ==============================================

-- Check if patients table exists
SELECT 'Checking if patients table exists...' as status;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') 
    THEN 'Patients table exists - can test audit logging'
    ELSE 'Patients table does not exist - cannot test audit logging'
  END as test_status;

-- If patients table exists, we can test the audit system
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
    -- Test by inserting a temporary record (we'll delete it after)
    RAISE NOTICE 'Testing audit system with patients table...';
    
    -- Insert a test patient record
    INSERT INTO patients (
      mrn, first_name, last_name, date_of_birth, gender, 
      phone, address, emergency_contact_name, emergency_contact_phone, 
      emergency_contact_relationship, insurance_provider, insurance_membership_number
    ) VALUES (
      'TEST001', 'Test', 'Patient', '1990-01-01', 'male',
      '1234567890', 'Test Address', 'Test Contact', '0987654321',
      'Parent', 'NHIF', 'TEST123'
    );
    
    -- Check if audit log was created
    IF EXISTS (SELECT 1 FROM audit_logs WHERE table_name = 'patients' AND operation = 'INSERT') THEN
      RAISE NOTICE 'SUCCESS: Audit log was created for patient INSERT';
    ELSE
      RAISE NOTICE 'WARNING: No audit log found for patient INSERT';
    END IF;
    
    -- Clean up test record
    DELETE FROM patients WHERE mrn = 'TEST001';
    
    -- Check if audit log was created for DELETE
    IF EXISTS (SELECT 1 FROM audit_logs WHERE table_name = 'patients' AND operation = 'DELETE') THEN
      RAISE NOTICE 'SUCCESS: Audit log was created for patient DELETE';
    ELSE
      RAISE NOTICE 'WARNING: No audit log found for patient DELETE';
    END IF;
    
  ELSE
    RAISE NOTICE 'Cannot test audit system - patients table does not exist';
  END IF;
END $$;

-- ==============================================
-- STEP 4: SHOW RECENT AUDIT LOGS
-- ==============================================

SELECT 'Recent audit logs (last 10):' as status;
SELECT 
  id,
  table_name,
  operation,
  user_name,
  timestamp,
  CASE 
    WHEN old_values IS NOT NULL THEN 'Has old values'
    ELSE 'No old values'
  END as has_old_values,
  CASE 
    WHEN new_values IS NOT NULL THEN 'Has new values'
    ELSE 'No new values'
  END as has_new_values
FROM audit_logs 
ORDER BY timestamp DESC 
LIMIT 10;

-- ==============================================
-- STEP 5: SUMMARY
-- ==============================================

SELECT 'Audit system test completed!' as status;
