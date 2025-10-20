-- Add Rogers Aluli as OT Coordinator with REAL user ID
-- 
-- STEP 1: First run this query to get the user ID:
-- SELECT id, email FROM auth.users WHERE email = 'alulirogers@gmail.com';
--
-- STEP 2: Copy the user ID from step 1 and replace 'REPLACE_WITH_ACTUAL_USER_ID' below
-- STEP 3: Run the INSERT query below

-- Example: If the user ID is '123e4567-e89b-12d3-a456-426614174000'
-- Replace 'REPLACE_WITH_ACTUAL_USER_ID' with '123e4567-e89b-12d3-a456-426614174000'

INSERT INTO users (
    id,
    name,
    email,
    role,
    department
) VALUES (
    'REPLACE_WITH_ACTUAL_USER_ID', -- Replace this with the actual user ID from auth.users
    'Rogers Aluli',
    'alulirogers@gmail.com',
    'ot-coordinator',
    'Operating Theatre'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    department = EXCLUDED.department;

-- Verify the user was added
SELECT 
    id,
    name,
    email,
    role,
    department,
    created_at
FROM users 
WHERE email = 'alulirogers@gmail.com';
