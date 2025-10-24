-- =====================================================
-- BASIC OPHTHALMOLOGIST USER ADDITION
-- Uses only the most essential columns that exist
-- =====================================================

-- Insert the new ophthalmologist user with only basic columns
INSERT INTO users (
    id,
    email,
    name,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    'd83f7fa7-c4b8-46cf-9369-e02a5ecb909b',
    'namangimsangi@icloud.com',
    'Namangi Fadhili Msangi',
    'ophthalmologist',
    true,
    NOW(),
    NOW()
);

-- Verify the user was inserted
SELECT 
    id,
    email,
    name,
    role,
    is_active,
    created_at
FROM users 
WHERE id = 'd83f7fa7-c4b8-46cf-9369-e02a5ecb909b';
