-- =====================================================
-- ADD OPHTHALMOLOGIST USER: Namangi Fadhili Msangi
-- =====================================================

-- Insert the new ophthalmologist user
INSERT INTO users (
    id,
    email,
    name,
    role,
    department,
    phone,
    specialization,
    license_number,
    is_active,
    created_at,
    updated_at
) VALUES (
    'd83f7fa7-c4b8-46cf-9369-e02a5ecb909b',
    'namangimsangi@icloud.com',
    'Namangi Fadhili Msangi',
    'ophthalmologist',
    'Ophthalmology',
    NULL, -- Phone number not provided
    'Ophthalmology',
    NULL, -- License number not provided
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

-- Optional: Update user profile with additional information if needed
-- UPDATE users 
-- SET 
--     phone = '+255-XXX-XXX-XXX',  -- Add phone number if available
--     license_number = 'OPH-XXXX', -- Add license number if available
--     updated_at = NOW()
-- WHERE id = 'd83f7fa7-c4b8-46cf-9369-e02a5ecb909b';

-- Check if the user has the correct role and permissions
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.department,
    u.is_active,
    CASE 
        WHEN u.role = 'ophthalmologist' THEN 'Can access ophthalmology EMR, patient queue, and specialized forms'
        ELSE 'Standard permissions'
    END as permissions
FROM users u
WHERE u.id = 'd83f7fa7-c4b8-46cf-9369-e02a5ecb909b';
