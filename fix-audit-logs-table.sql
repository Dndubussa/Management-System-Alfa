-- Fix audit_logs table structure
-- This script ensures the audit_logs table has all required columns

-- First, check if audit_logs table exists and what columns it has
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'audit_logs' 
ORDER BY ordinal_position;

-- Drop and recreate the audit_logs table with correct structure
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Create the audit_logs table with all required columns
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_operation ON audit_logs(operation);
CREATE INDEX IF NOT EXISTS idx_audit_logs_patient ON audit_logs(patient_id);

-- Enable RLS on audit_logs table
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

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'audit_logs' 
ORDER BY ordinal_position;
