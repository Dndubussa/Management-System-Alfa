-- Completely disable RLS for vital_signs table
-- This is a comprehensive approach to ensure RLS is fully disabled

-- Step 1: Check current status
SELECT 'Step 1: Checking current RLS status' as step;

SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE tablename = 'vital_signs';

-- Step 2: Drop ALL policies
SELECT 'Step 2: Dropping all policies' as step;

DROP POLICY IF EXISTS "Users can view vital signs" ON vital_signs;
DROP POLICY IF EXISTS "Nurses can insert vital signs" ON vital_signs;
DROP POLICY IF EXISTS "Users can update vital signs" ON vital_signs;
DROP POLICY IF EXISTS "vital_signs_insert_policy" ON vital_signs;
DROP POLICY IF EXISTS "vital_signs_select_policy" ON vital_signs;
DROP POLICY IF EXISTS "vital_signs_update_policy" ON vital_signs;
DROP POLICY IF EXISTS "vital_signs_allow_all" ON vital_signs;
DROP POLICY IF EXISTS "Allow all operations on vital_signs" ON vital_signs;
DROP POLICY IF EXISTS "vital_signs_allow_all_authenticated" ON vital_signs;

-- Step 3: Force disable RLS
SELECT 'Step 3: Force disabling RLS' as step;
ALTER TABLE vital_signs DISABLE ROW LEVEL SECURITY;

-- Step 4: Verify RLS is disabled
SELECT 'Step 4: Verifying RLS is disabled' as step;
SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE tablename = 'vital_signs';

-- Step 5: Check no policies exist
SELECT 'Step 5: Checking no policies exist' as step;
SELECT 
    schemaname, 
    tablename, 
    policyname
FROM pg_policies 
WHERE tablename = 'vital_signs';

-- Step 6: Grant explicit permissions to anon role
SELECT 'Step 6: Granting explicit permissions' as step;
GRANT ALL ON vital_signs TO anon;
GRANT ALL ON vital_signs TO authenticated;
GRANT ALL ON vital_signs TO service_role;

-- Step 7: Test insert
SELECT 'Step 7: Testing insert' as step;
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
    'Test insert after RLS disable',
    NOW()
);

-- Step 8: Final confirmation
SELECT 'RLS completely disabled and permissions granted' as status;
