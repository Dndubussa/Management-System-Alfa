-- Grant explicit permissions to anon role for vital_signs table
-- This allows the frontend (using anon key) to insert vital signs

-- Grant all permissions to anon role
GRANT ALL ON vital_signs TO anon;
GRANT ALL ON vital_signs TO authenticated;
GRANT ALL ON vital_signs TO service_role;

-- Grant sequence permissions if there's an ID sequence (only if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'vital_signs_id_seq') THEN
        GRANT ALL ON SEQUENCE vital_signs_id_seq TO anon;
        GRANT ALL ON SEQUENCE vital_signs_id_seq TO authenticated;
        GRANT ALL ON SEQUENCE vital_signs_id_seq TO service_role;
    END IF;
END $$;

-- Verify permissions
SELECT 
    table_name,
    privilege_type,
    is_grantable,
    grantee
FROM information_schema.table_privileges 
WHERE table_name = 'vital_signs'
AND grantee IN ('anon', 'authenticated', 'service_role');

-- Test insert with anon role
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
    '4a0b7d4a-c55a-4818-8cd8-4cd6fdb7c186',
    '187ae30e-dc66-49a9-a785-eb8e022cf55b',
    36.5,
    80,
    16,
    120,
    80,
    170,
    70,
    98,
    'Test insert with anon permissions',
    NOW()
);

SELECT 'Anon permissions granted successfully' as status;
