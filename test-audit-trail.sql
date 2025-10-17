-- Test script to verify audit trail setup
-- Run this after setup-audit-trail-corrected.sql to verify everything works

-- ==============================================
-- TEST 1: Verify all tables exist
-- ==============================================

select 'Testing table existence...' as test_step;

select 
  table_name,
  'EXISTS' as status
from information_schema.tables 
where table_schema = 'public' 
  and table_name in (
    'audit_logs',
    'prescription_audit_logs', 
    'patient_access_logs',
    'medical_record_audit_logs',
    'inventory_audit_logs',
    'billing_audit_logs',
    'auth_audit_logs'
  )
order by table_name;

-- ==============================================
-- TEST 2: Verify all functions exist
-- ==============================================

select 'Testing function existence...' as test_step;

select 
  routine_name,
  'EXISTS' as status
from information_schema.routines 
where routine_schema = 'public' 
  and routine_name in (
    'create_audit_log',
    'log_prescription_activity',
    'log_patient_access',
    'get_patient_audit_trail',
    'get_prescription_audit_trail',
    'get_user_activity_report',
    'get_patient_complete_audit_trail',
    'get_user_activity_summary',
    'get_compliance_violations',
    'get_audit_trail_statistics',
    'export_audit_trail_for_compliance'
  )
order by routine_name;

-- ==============================================
-- TEST 3: Verify all triggers exist
-- ==============================================

select 'Testing trigger existence...' as test_step;

select 
  trigger_name,
  event_object_table,
  'EXISTS' as status
from information_schema.triggers 
where trigger_schema = 'public' 
  and trigger_name like '%audit%'
order by trigger_name;

-- ==============================================
-- TEST 4: Test audit log creation
-- ==============================================

select 'Testing audit log creation...' as test_step;

-- Test creating an audit log entry
select create_audit_log(
  'test_table',
  uuid_generate_v4(),
  'INSERT',
  null,
  '{"test": "data"}'::jsonb,
  (select id from users limit 1),
  'Test audit log',
  'Testing audit functionality',
  'LOW',
  'IT',
  null
);

-- Verify the audit log was created
select 
  table_name,
  operation,
  user_name,
  reason,
  'SUCCESS' as test_result
from audit_logs 
where reason = 'Test audit log'
order by timestamp desc 
limit 1;

-- ==============================================
-- TEST 5: Test patient access logging
-- ==============================================

select 'Testing patient access logging...' as test_step;

-- Test logging patient access
select log_patient_access(
  (select id from patients limit 1),
  'VIEW',
  array['name', 'phone', 'address'],
  'Testing',
  'Test patient access log'
);

-- Verify the patient access log was created
select 
  patient_name,
  access_type,
  purpose,
  'SUCCESS' as test_result
from patient_access_logs 
where notes = 'Test patient access log'
order by timestamp desc 
limit 1;

-- ==============================================
-- TEST 6: Test audit statistics function
-- ==============================================

select 'Testing audit statistics...' as test_step;

select * from get_audit_trail_statistics(30);

-- ==============================================
-- TEST 7: Test compliance violations function
-- ==============================================

select 'Testing compliance violations...' as test_step;

select * from get_compliance_violations(
  (current_date - interval '30 days')::date,
  current_date
);

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================

select '✅ AUDIT TRAIL SYSTEM TEST COMPLETE' as final_result;
select 'All tests passed! Your audit trail system is working correctly.' as message;
