-- Check for receptionist users in the database
SELECT 
    id,
    name,
    email,
    role,
    created_at
FROM users 
WHERE role = 'receptionist'
ORDER BY created_at DESC;

-- Check all users to see what's available
SELECT 
    id,
    name,
    email,
    role,
    created_at
FROM users 
ORDER BY role, created_at DESC;

-- Check if the problematic user ID exists with a different role
SELECT 
    id,
    name,
    email,
    role,
    created_at
FROM users 
WHERE id = '3b8ee204-332d-43a1-b947-2d5ead3a7284';
