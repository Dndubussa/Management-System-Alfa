-- Add Teresia Kibasu as a Nurse for Triage
-- This SQL adds the user to the users table with nurse role
-- Based on the actual users table structure: id, name, email, role, department

-- First, ensure the users table allows 'nurse' role
DO $$
BEGIN
    -- Check if the constraint exists and drop it if it does
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_role_check' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE users DROP CONSTRAINT users_role_check;
    END IF;
    
    -- Add the updated constraint with nurse and hr roles
    ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN (
        'receptionist', 'doctor', 'lab', 'pharmacy', 'radiologist', 
        'ophthalmologist', 'admin', 'ot-coordinator', 
        'cashier', 'physical-therapist', 'nurse', 'hr'
    ));
    
    RAISE NOTICE 'Updated users table role constraint to include nurse and hr roles';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating users table constraint: %', SQLERRM;
END $$;

-- Now add Teresia Kibasu as a nurse
INSERT INTO users (
    id,
    name,
    email,
    role,
    department
) VALUES (
    '187ae30e-dc66-49a9-a785-eb8e022cf55b',
    'Teresia Kibasu',
    'teresiakibasu@gmail.com',
    'nurse',
    'Nursing'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    department = EXCLUDED.department;

-- Verify the user was added/updated
SELECT 
    id,
    name,
    email,
    role,
    department
FROM users 
WHERE id = '187ae30e-dc66-49a9-a785-eb8e022cf55b';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Teresia Kibasu has been added/updated as a nurse for triage duties.';
    RAISE NOTICE 'User ID: 187ae30e-dc66-49a9-a785-eb8e022cf55b';
    RAISE NOTICE 'Email: teresiakibasu@gmail.com';
    RAISE NOTICE 'Role: nurse';
    RAISE NOTICE 'Department: Nursing';
END $$;
