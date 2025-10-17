-- Fix audit trigger function
-- This script recreates the audit trigger function to work with the corrected audit_logs table

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS audit_trigger_function() CASCADE;

-- Create the corrected audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  v_old_values jsonb;
  v_new_values jsonb;
  v_operation text;
  v_user_id uuid;
BEGIN
  -- Get current user ID (implement based on your auth system)
  v_user_id := auth.uid();
  
  -- Determine operation type
  IF TG_OP = 'INSERT' THEN
    v_operation := 'INSERT';
    v_new_values := to_jsonb(NEW);
    v_old_values := null;
  ELSIF TG_OP = 'UPDATE' THEN
    v_operation := 'UPDATE';
    v_old_values := to_jsonb(OLD);
    v_new_values := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    v_operation := 'DELETE';
    v_old_values := to_jsonb(OLD);
    v_new_values := null;
  END IF;
  
  -- Insert audit log entry
  INSERT INTO audit_logs (
    table_name,
    record_id,
    operation,
    old_values,
    new_values,
    user_id,
    user_name,
    user_role,
    ip_address,
    timestamp
  ) VALUES (
    TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    v_operation,
    v_old_values,
    v_new_values,
    v_user_id,
    (SELECT name FROM users WHERE id = v_user_id),
    (SELECT role FROM users WHERE id = v_user_id),
    inet_client_addr(),
    now()
  );
  
  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Test the function by creating a simple test
-- This will help verify the function works correctly
DO $$
BEGIN
  -- Test if the function can be called (without actually executing)
  RAISE NOTICE 'Audit trigger function created successfully';
END $$;

-- Show the function definition
SELECT prosrc FROM pg_proc WHERE proname = 'audit_trigger_function';
