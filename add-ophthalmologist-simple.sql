-- =====================================================
-- SIMPLE OPHTHALMOLOGIST USER ADDITION
-- Namangi Fadhili Msangi
-- =====================================================

-- Add the ophthalmologist user
INSERT INTO users (
    id,
    email,
    name,
    role,
    department,
    specialization,
    is_active,
    created_at,
    updated_at
) VALUES (
    'd83f7fa7-c4b8-46cf-9369-e02a5ecb909b',
    'namangimsangi@icloud.com',
    'Namangi Fadhili Msangi',
    'ophthalmologist',
    'Ophthalmology',
    'Ophthalmology',
    true,
    NOW(),
    NOW()
);

-- Verify insertion
SELECT 
    id,
    name,
    email,
    role,
    department,
    is_active
FROM users 
WHERE id = 'd83f7fa7-c4b8-46cf-9369-e02a5ecb909b';
