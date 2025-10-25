-- Test if we can insert into vital_signs table directly
-- This will help us verify if the table is accessible

-- First, let's see the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'vital_signs'
ORDER BY ordinal_position;

-- Test a simple insert (this should work if RLS is properly disabled)
INSERT INTO vital_signs (
    patient_id,
    recorded_by,
    temperature,
    pulse,
    respiratory_rate,
    blood_pressure_systolic,
    blood_pressure_diastolic,
    height,
    weight,
    oxygen_saturation,
    notes,
    recorded_at
) VALUES (
    '4a0b7d4a-c55a-4818-8cd8-4cd6fdb7c186',  -- Use the patient ID from your logs
    '187ae30e-dc66-49a9-a785-eb8e022cf55b',  -- Use the user ID from your logs
    36.5,
    80,
    16,
    120,
    80,
    170,
    70,
    98,
    'Test insert from SQL',
    NOW()
);

-- Check if the insert worked
SELECT 'Test insert completed successfully' as status;
