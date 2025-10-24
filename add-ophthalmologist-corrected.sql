-- =====================================================
-- ADD OPHTHALMOLOGIST USER (CORRECTED SCHEMA)
-- Namangi Fadhili Msangi
-- =====================================================

-- First, let's check what columns actually exist in the users table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Insert the new ophthalmologist user with only existing columns
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

-- Verify the user was inserted
SELECT 
    id,
    email,
    name,
    role,
    department,
    specialization,
    is_active,
    created_at
FROM users 
WHERE id = 'd83f7fa7-c4b8-46cf-9369-e02a5ecb909b';
