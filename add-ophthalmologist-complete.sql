-- =====================================================
-- COMPLETE OPHTHALMOLOGIST USER SETUP
-- Namangi Fadhili Msangi - Ophthalmologist
-- =====================================================

-- Step 1: Insert the new ophthalmologist user
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
    NULL, -- Phone number can be added later
    'Ophthalmology',
    NULL, -- License number can be added later
    true,
    NOW(),
    NOW()
);

-- Step 2: Ensure Ophthalmology department exists
INSERT INTO departments (
    id,
    name,
    description,
    head_doctor_id,
    is_active,
    created_at,
    updated_at
) VALUES (
    'dept-ophthalmology-001',
    'Ophthalmology',
    'Eye care and vision services department',
    'd83f7fa7-c4b8-46cf-9369-e02a5ecb909b', -- Namangi as head
    true,
    NOW(),
    NOW()
) ON CONFLICT (name) DO UPDATE SET
    head_doctor_id = 'd83f7fa7-c4b8-46cf-9369-e02a5ecb909b',
    updated_at = NOW();

-- Step 3: Create user permissions (if permissions table exists)
-- Note: This assumes you have a user_permissions or similar table
-- Adjust based on your actual permission system

-- Step 4: Verify the setup
SELECT 
    'User Created' as status,
    u.id,
    u.name,
    u.email,
    u.role,
    u.department,
    u.specialization,
    u.is_active,
    u.created_at
FROM users u
WHERE u.id = 'd83f7fa7-c4b8-46cf-9369-e02a5ecb909b'

UNION ALL

SELECT 
    'Department Setup' as status,
    d.id,
    d.name,
    d.description,
    d.head_doctor_id,
    d.is_active::text,
    NULL,
    d.created_at
FROM departments d
WHERE d.name = 'Ophthalmology';

-- Step 5: Show user capabilities
SELECT 
    'User Capabilities' as info,
    'Namangi Fadhili Msangi' as name,
    'ophthalmologist' as role,
    'Can access ophthalmology EMR, patient queue, imaging, and specialized forms' as permissions,
    'Ophthalmology department head' as department_role;
