-- Complete Fix for Audit System
-- This script fixes the audit_logs table and trigger function issues

-- ==============================================
-- STEP 1: FIX AUDIT_LOGS TABLE STRUCTURE
-- ==============================================

-- Check current audit_logs table structure
SELECT 'Current audit_logs table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'audit_logs' 
ORDER BY ordinal_position;

-- Drop existing audit_logs table if it exists (this will also drop dependent objects)
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Create the audit_logs table with correct structure
CREATE TABLE audit_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_name text NOT NULL, -- Which table was affected
  record_id uuid NOT NULL, -- ID of the affected record
  operation text CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT', 'LOGIN', 'LOGOUT', 'EXPORT', 'PRINT')) NOT NULL,
  old_values jsonb, -- Previous values (for updates/deletes)
  new_values jsonb, -- New values (for inserts/updates)
  user_id uuid REFERENCES users(id), -- Who performed the action
  user_name text, -- User name for quick reference
  user_role text, -- User role for context
  ip_address inet, -- IP address of the user
  user_agent text, -- Browser/client information
  session_id text, -- Session identifier
  timestamp timestamp with time zone DEFAULT now(),
  reason text, -- Reason for the action (if applicable)
  notes text, -- Additional notes
  severity text CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'LOW',
  department text, -- Department context
  patient_id uuid REFERENCES patients(id), -- If action relates to a patient
  created_at timestamp with time zone DEFAULT now()
);

-- ==============================================
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_operation ON audit_logs(operation);
CREATE INDEX IF NOT EXISTS idx_audit_logs_patient ON audit_logs(patient_id);

-- ==============================================
-- STEP 3: ENABLE ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for audit_logs
CREATE POLICY "Admin can view audit logs" ON audit_logs
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('admin', 'audit', 'compliance')
  );

CREATE POLICY "Admin can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'audit', 'compliance')
  );

-- ==============================================
-- STEP 4: RECREATE AUDIT TRIGGER FUNCTION
-- ==============================================

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

-- ==============================================
-- STEP 5: VERIFY THE FIX
-- ==============================================

-- Check the corrected table structure
SELECT 'Corrected audit_logs table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'audit_logs' 
ORDER BY ordinal_position;

-- Test the function exists
SELECT 'Audit trigger function status:' as info;
SELECT proname, prosrc IS NOT NULL as function_exists
FROM pg_proc 
WHERE proname = 'audit_trigger_function';

-- Show success message
SELECT 'Audit system fix completed successfully!' as status;
