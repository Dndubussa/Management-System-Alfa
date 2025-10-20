-- Simple script to add Rogers Aluli as OT Coordinator
-- Run these queries one by one in Supabase SQL editor

-- STEP 1: Find the user in auth.users
SELECT 
    id,
    email,
    created_at
FROM auth.users 
WHERE email = 'alulirogers@gmail.com';

-- STEP 2: Copy the user ID from step 1 and replace 'YOUR_USER_ID_HERE' below
-- Then run this query:

INSERT INTO users (
    id,
    name,
    email,
    role,
    department
) VALUES (
    'YOUR_USER_ID_HERE', -- Replace with the actual user ID from step 1
    'Rogers Aluli',
    'alulirogers@gmail.com',
    'ot-coordinator',
    'Operating Theatre'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    department = EXCLUDED.department;

-- STEP 3: Verify the user was added
SELECT 
    id,
    name,
    email,
    role,
    department
FROM users 
WHERE email = 'alulirogers@gmail.com';
