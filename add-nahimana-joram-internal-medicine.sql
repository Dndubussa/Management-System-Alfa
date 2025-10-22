-- Add Nahimana Joram William as Internal Medicine Doctor
-- Supabase UID: 13a7227c-9dde-4cfb-a92b-abdb5a992aaa
-- Email: nahijoram60@gmail.com

-- Insert the new Internal Medicine doctor into the users table
INSERT INTO users (
    id,
    name,
    email,
    role,
    department
) VALUES (
    '13a7227c-9dde-4cfb-a92b-abdb5a992aaa',
    'Nahimana Joram William',
    'nahijoram60@gmail.com',
    'doctor',
    'Internal Medicine'
);

-- Verify the insertion
SELECT 
    id,
    name,
    email,
    role,
    department
FROM users 
WHERE id = '13a7227c-9dde-4cfb-a92b-abdb5a992aaa';

-- Show all Internal Medicine doctors
SELECT 
    id,
    name,
    email,
    role,
    department
FROM users 
WHERE role = 'doctor' AND department = 'Internal Medicine'
ORDER BY name;
