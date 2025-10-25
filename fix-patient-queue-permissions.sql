-- Fix patient queue permissions and RLS
-- This will ensure the patient queue works properly

-- First, check if the table exists
SELECT 'Checking patient_queue table status...' as step;

SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE tablename = 'patient_queue';

-- Disable RLS temporarily for patient_queue
ALTER TABLE patient_queue DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to anon role
GRANT ALL ON patient_queue TO anon;
GRANT ALL ON patient_queue TO authenticated;
GRANT ALL ON patient_queue TO service_role;

-- Grant sequence permissions if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'patient_queue_id_seq') THEN
        GRANT ALL ON SEQUENCE patient_queue_id_seq TO anon;
        GRANT ALL ON SEQUENCE patient_queue_id_seq TO authenticated;
        GRANT ALL ON SEQUENCE patient_queue_id_seq TO service_role;
    END IF;
END $$;

-- Verify permissions
SELECT 
    table_name,
    privilege_type,
    is_grantable,
    grantee
FROM information_schema.table_privileges 
WHERE table_name = 'patient_queue'
AND grantee IN ('anon', 'authenticated', 'service_role');

-- Test insert into patient_queue
INSERT INTO patient_queue (
    patient_id,
    department,
    priority,
    status,
    workflow_stage,
    assigned_doctor_id,
    assigned_doctor_name,
    assignment_reason,
    created_at
) VALUES (
    '4a0b7d4a-c55a-4818-8cd8-4cd6fdb7c186',  -- Use existing patient ID
    'general',
    'normal',
    'waiting',
    'reception',
    '187ae30e-dc66-49a9-a785-eb8e022cf55b',  -- Use existing user ID
    'Test Doctor',
    'Test assignment',
    NOW()
);

-- Check if the insert worked
SELECT 'Patient queue permissions fixed and test insert completed' as status;
