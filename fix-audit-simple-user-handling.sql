-- Simple fix for audit system user ID issue
-- This makes user_id nullable and handles missing users gracefully

-- ==============================================
-- STEP 1: MAKE USER_ID NULLABLE
-- ==============================================

-- Make user_id nullable in audit_logs table
ALTER TABLE audit_logs 
ALTER COLUMN user_id DROP NOT NULL;

-- Update foreign key constraint to handle NULL values
ALTER TABLE audit_logs 
DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

ALTER TABLE audit_logs 
ADD CONSTRAINT audit_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- ==============================================
-- STEP 2: CREATE SIMPLE AUDIT TRIGGER FUNCTION
-- ==============================================

-- Drop existing function
DROP FUNCTION IF EXISTS audit_trigger_function() CASCADE;

-- Create simple audit trigger function that handles missing users
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  v_old_values jsonb;
  v_new_values jsonb;
  v_operation text;
  v_user_id uuid;
  v_user_name text;
  v_user_role text;
BEGIN
  -- Get current user ID (may be NULL)
  v_user_id := auth.uid();
  
  -- Try to get user details, but don't fail if user doesn't exist
  BEGIN
    IF v_user_id IS NOT NULL THEN
      SELECT name, role INTO v_user_name, v_user_role
      FROM users 
      WHERE id = v_user_id;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- User not found, use auth context
      v_user_name := COALESCE(auth.jwt() ->> 'email', 'System');
      v_user_role := COALESCE(auth.jwt() ->> 'role', 'system');
      v_user_id := NULL;
  END;

  -- If user not found in users table, use auth context
  IF v_user_name IS NULL THEN
    v_user_name := COALESCE(auth.jwt() ->> 'email', 'System');
    v_user_role := COALESCE(auth.jwt() ->> 'role', 'system');
    v_user_id := NULL;
  END IF;

  -- Determine operation type
  v_operation := TG_OP;

  -- Get old and new values
  IF TG_OP = 'DELETE' THEN
    v_old_values := to_jsonb(OLD);
    v_new_values := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    v_old_values := NULL;
    v_new_values := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_old_values := to_jsonb(OLD);
    v_new_values := to_jsonb(NEW);
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
    timestamp,
    notes
  ) VALUES (
    TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    v_operation,
    v_old_values,
    v_new_values,
    v_user_id,
    v_user_name,
    v_user_role,
    inet_client_addr(),
    now(),
    'Automated audit log entry'
  );

  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- STEP 3: VERIFY THE FIX
-- ==============================================

-- Check that user_id is now nullable
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'audit_logs' 
  AND column_name = 'user_id';

-- Test inserting an audit log with NULL user_id
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
    NULL,
    'Test User',
    'receptionist',
    now(),
    'Test audit log with NULL user_id'
);

SELECT 'Simple audit user handling fix completed successfully' as status;
