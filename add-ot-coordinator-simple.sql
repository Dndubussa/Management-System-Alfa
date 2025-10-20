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
    department,
    phone,
    address,
    specialization,
    license_number,
    hire_date,
    salary,
    status,
    created_at,
    updated_at
) VALUES (
    'YOUR_USER_ID_HERE', -- Replace with the actual user ID from step 1
    'Rogers Aluli',
    'alulirogers@gmail.com',
    'ot-coordinator',
    'Operating Theatre',
    '+255123456789',
    'Dar es Salaam, Tanzania',
    'OT Coordination and Management',
    'OT-001-2024',
    CURRENT_DATE,
    1500000,
    'active',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    specialization = EXCLUDED.specialization,
    license_number = EXCLUDED.license_number,
    hire_date = EXCLUDED.hire_date,
    salary = EXCLUDED.salary,
    status = EXCLUDED.status,
    updated_at = NOW();

-- STEP 3: Verify the user was added
SELECT 
    id,
    name,
    email,
    role,
    department,
    specialization,
    status
FROM users 
WHERE email = 'alulirogers@gmail.com';
