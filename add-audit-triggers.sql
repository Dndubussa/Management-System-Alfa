-- Add audit triggers to main tables
-- This script adds audit triggers to track changes on important tables

-- ==============================================
-- ADD AUDIT TRIGGERS TO MAIN TABLES
-- ==============================================

-- Function to safely add audit triggers
CREATE OR REPLACE FUNCTION add_audit_trigger_if_exists(tbl_name text)
RETURNS void AS $$
BEGIN
  -- Check if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl_name) THEN
    -- Drop existing trigger if it exists
    EXECUTE format('DROP TRIGGER IF EXISTS audit_trigger_%s ON %I', tbl_name, tbl_name);
    
    -- Create new audit trigger
    EXECUTE format('CREATE TRIGGER audit_trigger_%s
      AFTER INSERT OR UPDATE OR DELETE ON %I
      FOR EACH ROW EXECUTE FUNCTION audit_trigger_function()', tbl_name, tbl_name);
    
    RAISE NOTICE 'Added audit trigger to table: %', tbl_name;
  ELSE
    RAISE NOTICE 'Table does not exist, skipping: %', tbl_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add audit triggers to main tables
SELECT add_audit_trigger_if_exists('patients');
SELECT add_audit_trigger_if_exists('medical_records');
SELECT add_audit_trigger_if_exists('prescriptions');
SELECT add_audit_trigger_if_exists('appointments');
SELECT add_audit_trigger_if_exists('bills');
SELECT add_audit_trigger_if_exists('users');
SELECT add_audit_trigger_if_exists('inventory_items');
SELECT add_audit_trigger_if_exists('medication_inventory');
SELECT add_audit_trigger_if_exists('insurance_claims');
SELECT add_audit_trigger_if_exists('lab_orders');
SELECT add_audit_trigger_if_exists('referrals');
SELECT add_audit_trigger_if_exists('surgery_requests');

-- ==============================================
-- VERIFY TRIGGERS WERE ADDED
-- ==============================================

SELECT 'Audit triggers verification:' as status;
SELECT 
  n.nspname as schema_name,
  c.relname as table_name,
  t.tgname as trigger_name,
  CASE 
    WHEN t.tgtype & 2 = 2 THEN 'BEFORE'
    WHEN t.tgtype & 4 = 4 THEN 'AFTER'
    ELSE 'UNKNOWN'
  END as trigger_timing,
  CASE 
    WHEN t.tgtype & 8 = 8 THEN 'INSERT'
    WHEN t.tgtype & 16 = 16 THEN 'UPDATE' 
    WHEN t.tgtype & 32 = 32 THEN 'DELETE'
    ELSE 'OTHER'
  END as trigger_events
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE t.tgname LIKE '%audit%'
  AND n.nspname = 'public'
ORDER BY c.relname, t.tgname;

-- Clean up the helper function
DROP FUNCTION add_audit_trigger_if_exists(text);

SELECT 'Audit triggers setup completed!' as status;
