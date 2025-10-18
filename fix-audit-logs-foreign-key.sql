-- Fix foreign key constraint violation in audit_logs table
-- The issue is that audit_logs.user_id references users.id but the user doesn't exist

-- ==============================================
-- STEP 1: CHECK CURRENT CONSTRAINT
-- ==============================================

-- Check the current foreign key constraint
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.is_deferrable,
    tc.initially_deferred
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'audit_logs'
    AND kcu.column_name = 'user_id';

-- ==============================================
-- STEP 2: CHECK IF USER EXISTS
-- ==============================================

-- Check if the problematic user exists
SELECT 
    id,
    name,
    email,
    role,
    created_at
FROM users 
WHERE id = '3b8ee204-332d-43a1-b947-2d5ead3a7284';

-- ==============================================
-- STEP 3: FIX THE CONSTRAINT
-- ==============================================

-- Option 1: Make user_id nullable (recommended)
-- This allows audit logs to be created even if user doesn't exist
ALTER TABLE audit_logs 
ALTER COLUMN user_id DROP NOT NULL;

-- Option 2: Drop and recreate the foreign key constraint with ON DELETE SET NULL
-- This handles cases where users are deleted
ALTER TABLE audit_logs 
DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

ALTER TABLE audit_logs 
ADD CONSTRAINT audit_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- ==============================================
-- STEP 4: UPDATE AUDIT TRIGGER FUNCTION
-- ==============================================

-- Update the audit trigger function to handle missing users gracefully
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
  -- Get current user ID (handle missing users gracefully)
  BEGIN
    v_user_id := auth.uid();
  EXCEPTION
    WHEN OTHERS THEN
      v_user_id := NULL;
  END;

  -- Get user details if user exists
  IF v_user_id IS NOT NULL THEN
    BEGIN
      SELECT name, role INTO v_user_name, v_user_role
      FROM users 
      WHERE id = v_user_id;
    EXCEPTION
      WHEN OTHERS THEN
        v_user_name := 'Unknown User';
        v_user_role := 'unknown';
    END;
  ELSE
    v_user_name := 'System';
    v_user_role := 'system';
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

  -- Insert audit log (user_id can now be NULL)
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
-- STEP 5: VERIFY THE FIX
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
    'System',
    'system',
    now(),
    'Test audit log with NULL user_id'
);

SELECT 'Foreign key constraint fix completed successfully' as status;
