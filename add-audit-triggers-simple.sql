-- Simple script to add audit triggers to main tables
-- This script adds audit triggers without using a helper function

-- ==============================================
-- ADD AUDIT TRIGGERS TO MAIN TABLES
-- ==============================================

-- Drop existing triggers if they exist and create new ones
-- Only for tables that actually exist

-- Patients table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
    DROP TRIGGER IF EXISTS audit_trigger_patients ON patients;
    CREATE TRIGGER audit_trigger_patients
      AFTER INSERT OR UPDATE OR DELETE ON patients
      FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    RAISE NOTICE 'Added audit trigger to patients table';
  ELSE
    RAISE NOTICE 'Patients table does not exist, skipping';
  END IF;
END $$;

-- Medical records table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'medical_records') THEN
    DROP TRIGGER IF EXISTS audit_trigger_medical_records ON medical_records;
    CREATE TRIGGER audit_trigger_medical_records
      AFTER INSERT OR UPDATE OR DELETE ON medical_records
      FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    RAISE NOTICE 'Added audit trigger to medical_records table';
  ELSE
    RAISE NOTICE 'Medical records table does not exist, skipping';
  END IF;
END $$;

-- Prescriptions table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prescriptions') THEN
    DROP TRIGGER IF EXISTS audit_trigger_prescriptions ON prescriptions;
    CREATE TRIGGER audit_trigger_prescriptions
      AFTER INSERT OR UPDATE OR DELETE ON prescriptions
      FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    RAISE NOTICE 'Added audit trigger to prescriptions table';
  ELSE
    RAISE NOTICE 'Prescriptions table does not exist, skipping';
  END IF;
END $$;

-- Appointments table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
    DROP TRIGGER IF EXISTS audit_trigger_appointments ON appointments;
    CREATE TRIGGER audit_trigger_appointments
      AFTER INSERT OR UPDATE OR DELETE ON appointments
      FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    RAISE NOTICE 'Added audit trigger to appointments table';
  ELSE
    RAISE NOTICE 'Appointments table does not exist, skipping';
  END IF;
END $$;

-- Bills table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bills') THEN
    DROP TRIGGER IF EXISTS audit_trigger_bills ON bills;
    CREATE TRIGGER audit_trigger_bills
      AFTER INSERT OR UPDATE OR DELETE ON bills
      FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    RAISE NOTICE 'Added audit trigger to bills table';
  ELSE
    RAISE NOTICE 'Bills table does not exist, skipping';
  END IF;
END $$;

-- Users table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    DROP TRIGGER IF EXISTS audit_trigger_users ON users;
    CREATE TRIGGER audit_trigger_users
      AFTER INSERT OR UPDATE OR DELETE ON users
      FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    RAISE NOTICE 'Added audit trigger to users table';
  ELSE
    RAISE NOTICE 'Users table does not exist, skipping';
  END IF;
END $$;

-- Inventory items table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_items') THEN
    DROP TRIGGER IF EXISTS audit_trigger_inventory_items ON inventory_items;
    CREATE TRIGGER audit_trigger_inventory_items
      AFTER INSERT OR UPDATE OR DELETE ON inventory_items
      FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    RAISE NOTICE 'Added audit trigger to inventory_items table';
  ELSE
    RAISE NOTICE 'Inventory items table does not exist, skipping';
  END IF;
END $$;

-- Medication inventory table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'medication_inventory') THEN
    DROP TRIGGER IF EXISTS audit_trigger_medication_inventory ON medication_inventory;
    CREATE TRIGGER audit_trigger_medication_inventory
      AFTER INSERT OR UPDATE OR DELETE ON medication_inventory
      FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    RAISE NOTICE 'Added audit trigger to medication_inventory table';
  ELSE
    RAISE NOTICE 'Medication inventory table does not exist, skipping';
  END IF;
END $$;

-- ==============================================
-- VERIFY TRIGGERS WERE ADDED
-- ==============================================

SELECT 'Audit triggers verification:' as status;
SELECT 
  c.relname as table_name,
  t.tgname as trigger_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE t.tgname LIKE '%audit%'
  AND n.nspname = 'public'
ORDER BY c.relname;

SELECT 'Audit triggers setup completed!' as status;
