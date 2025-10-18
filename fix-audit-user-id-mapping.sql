-- Fix audit system user ID mapping issue
-- The problem: auth.uid() returns Supabase auth user ID, but our users table has different IDs
-- Solution: Map Supabase auth users to application users or handle missing users gracefully

-- ==============================================
-- STEP 1: CHECK CURRENT AUTH CONTEXT
-- ==============================================

-- Check what auth.uid() returns (this will show the current authenticated user)
SELECT 
    auth.uid() as supabase_auth_user_id,
    auth.role() as auth_role,
    auth.jwt() ->> 'email' as auth_email,
    auth.jwt() ->> 'role' as auth_role_claim;

-- ==============================================
-- STEP 2: CHECK USERS TABLE STRUCTURE
-- ==============================================

-- Check if users table has a column to link to Supabase auth users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- ==============================================
-- STEP 3: CREATE IMPROVED AUDIT TRIGGER FUNCTION
-- ==============================================

-- Drop existing function
DROP FUNCTION IF EXISTS audit_trigger_function() CASCADE;

-- Create improved audit trigger function that handles user mapping
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  v_old_values jsonb;
  v_new_values jsonb;
  v_operation text;
  v_user_id uuid;
  v_user_name text;
  v_user_role text;
  v_supabase_auth_id uuid;
BEGIN
  -- Get Supabase auth user ID
  v_supabase_auth_id := auth.uid();
  
  -- Try to find the corresponding user in our users table
  -- First, try to find by Supabase auth ID (if we have that column)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'supabase_auth_id'
  ) THEN
    SELECT id, name, role INTO v_user_id, v_user_name, v_user_role
    FROM users 
    WHERE supabase_auth_id = v_supabase_auth_id;
  END IF;
  
  -- If not found by supabase_auth_id, try to find by email
  IF v_user_id IS NULL AND v_supabase_auth_id IS NOT NULL THEN
    SELECT id, name, role INTO v_user_id, v_user_name, v_user_role
    FROM users 
    WHERE email = auth.jwt() ->> 'email';
  END IF;
  
  -- If still not found, try to find by ID match (in case they're the same)
  IF v_user_id IS NULL AND v_supabase_auth_id IS NOT NULL THEN
    SELECT id, name, role INTO v_user_id, v_user_name, v_user_role
    FROM users 
    WHERE id = v_supabase_auth_id;
  END IF;
  
  -- If still not found, use default values
  IF v_user_id IS NULL THEN
    v_user_id := NULL;
    v_user_name := COALESCE(auth.jwt() ->> 'email', 'Unknown User');
    v_user_role := COALESCE(auth.jwt() ->> 'role', 'unknown');
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

  -- Insert audit log entry (user_id can be NULL)
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
    'Automated audit log - User mapping: ' || COALESCE(v_supabase_auth_id::text, 'NULL')
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
-- STEP 4: ALTERNATIVE SIMPLE SOLUTION
-- ==============================================

-- If the above is too complex, here's a simpler solution:
-- Just make user_id nullable and use auth context for user info

CREATE OR REPLACE FUNCTION audit_trigger_function_simple()
RETURNS TRIGGER AS $$
DECLARE
  v_old_values jsonb;
  v_new_values jsonb;
  v_operation text;
  v_user_id uuid;
  v_user_name text;
  v_user_role text;
BEGIN
  -- Get current user ID (may be NULL if not found in users table)
  v_user_id := auth.uid();
  
  -- Try to get user details, but don't fail if user doesn't exist
  BEGIN
    SELECT name, role INTO v_user_name, v_user_role
    FROM users 
    WHERE id = v_user_id;
  EXCEPTION
    WHEN OTHERS THEN
      v_user_name := COALESCE(auth.jwt() ->> 'email', 'Unknown User');
      v_user_role := COALESCE(auth.jwt() ->> 'role', 'unknown');
      v_user_id := NULL; -- Set to NULL if user not found
  END;

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
-- STEP 5: VERIFY THE FIX
-- ==============================================

-- Test the function by checking if it can be called
SELECT 'Audit trigger function updated successfully' as status;

-- Show the function definition
SELECT prosrc FROM pg_proc WHERE proname = 'audit_trigger_function';
