-- Add Rogers Aluli as OT Coordinator with ACTUAL user ID
-- User ID: 12d8b35f-0905-4d45-8aea-f0e1448f55de

INSERT INTO users (
    id,
    name,
    email,
    role,
    department
) VALUES (
    '12d8b35f-0905-4d45-8aea-f0e1448f55de',
    'Rogers Aluli',
    'alulirogers@gmail.com',
    'ot-coordinator',
    'Operating Theatre'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    department = EXCLUDED.department;

-- Verify the user was added successfully
SELECT 
    id,
    name,
    email,
    role,
    department
FROM users 
WHERE email = 'alulirogers@gmail.com';

-- Check all OT coordinators in the system
SELECT 
    id,
    name,
    email,
    role,
    department
FROM users 
WHERE role = 'ot-coordinator';
