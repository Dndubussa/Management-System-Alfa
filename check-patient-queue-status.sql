-- Check patient queue table status and permissions
-- This will help us understand why patients aren't appearing in the queue

-- Check if patient_queue table exists
SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE tablename = 'patient_queue';

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'patient_queue'
ORDER BY ordinal_position;

-- Check current queue data
SELECT 
    id,
    patient_id,
    department,
    priority,
    status,
    workflow_stage,
    created_at,
    assigned_doctor_id,
    assigned_doctor_name
FROM patient_queue
ORDER BY created_at DESC
LIMIT 10;

-- Check RLS policies for patient_queue
SELECT 
    schemaname, 
    tablename, 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'patient_queue';

-- Check permissions for anon role
SELECT 
    table_name,
    privilege_type,
    is_grantable,
    grantee
FROM information_schema.table_privileges 
WHERE table_name = 'patient_queue'
AND grantee IN ('anon', 'authenticated', 'service_role');
