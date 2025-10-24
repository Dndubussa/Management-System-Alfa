-- =====================================================
-- FINAL OPHTHALMOLOGIST USER ADDITION
-- Based on actual database schema
-- =====================================================

-- Insert the new ophthalmologist user with only existing columns
INSERT INTO users (
    id,
    name,
    email,
    role,
    department
) VALUES (
    'd83f7fa7-c4b8-46cf-9369-e02a5ecb909b',
    'Namangi Fadhili Msangi',
    'namangimsangi@icloud.com',
    'ophthalmologist',
    'Ophthalmology'
);

-- Verify the user was inserted
SELECT 
    id,
    name,
    email,
    role,
    department
FROM users 
WHERE id = 'd83f7fa7-c4b8-46cf-9369-e02a5ecb909b';
