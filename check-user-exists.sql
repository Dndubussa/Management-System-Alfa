-- Check if the user_id exists in the users table
SELECT 
    id,
    name,
    email,
    role,
    created_at
FROM users 
WHERE id = '3b8ee204-332d-43a1-b947-2d5ead3a7284';

-- Check all users in the table
SELECT 
    id,
    name,
    email,
    role,
    created_at
FROM users 
ORDER BY created_at DESC
LIMIT 10;
