-- Script to add Rogers Aluli as OT Coordinator
-- Run this in Supabase SQL editor

-- 1. First, let's check if the user exists in auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'alulirogers@gmail.com';

-- 2. Get the user ID from auth.users (replace with actual ID from step 1)
-- For this script, we'll use a placeholder that you need to replace
-- with the actual user ID from the query above

-- 3. Insert the user into the users table with OT coordinator role
-- Replace 'USER_ID_FROM_AUTH' with the actual user ID from step 1
INSERT INTO users (
    id,
    name,
    email,
    role,
    department,
    phone,
    address,
    specialization,
    license_number,
    hire_date,
    salary,
    status,
    created_at,
    updated_at
) VALUES (
    'USER_ID_FROM_AUTH', -- Replace with actual user ID from auth.users
    'Rogers Aluli',
    'alulirogers@gmail.com',
    'ot-coordinator',
    'Operating Theatre',
    '+255123456789', -- Update with actual phone number
    'Dar es Salaam, Tanzania', -- Update with actual address
    'OT Coordination and Management',
    'OT-001-2024', -- Update with actual license number
    CURRENT_DATE,
    1500000, -- Update with actual salary (in TZS)
    'active',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    specialization = EXCLUDED.specialization,
    license_number = EXCLUDED.license_number,
    hire_date = EXCLUDED.hire_date,
    salary = EXCLUDED.salary,
    status = EXCLUDED.status,
    updated_at = NOW();

-- 4. Verify the user was added/updated
SELECT 
    id,
    name,
    email,
    role,
    department,
    specialization,
    status,
    created_at
FROM users 
WHERE email = 'alulirogers@gmail.com';

-- 5. Check if OT coordinator role exists in the system
SELECT DISTINCT role, department 
FROM users 
WHERE role LIKE '%ot%' OR department LIKE '%Operating%' OR department LIKE '%Theatre%';

-- 6. Create some sample OT resources if they don't exist
INSERT INTO ot_resources (
    id,
    name,
    type,
    status,
    location,
    description,
    created_at,
    updated_at
) VALUES 
    (gen_random_uuid(), 'Operating Room 1', 'room', 'available', 'Ground Floor', 'Main operating room with full equipment', NOW(), NOW()),
    (gen_random_uuid(), 'Operating Room 2', 'room', 'available', 'Ground Floor', 'Secondary operating room', NOW(), NOW()),
    (gen_random_uuid(), 'Anesthesia Machine 1', 'equipment', 'available', 'OR 1', 'Modern anesthesia delivery system', NOW(), NOW()),
    (gen_random_uuid(), 'Surgical Table 1', 'equipment', 'available', 'OR 1', 'Adjustable surgical table', NOW(), NOW()),
    (gen_random_uuid(), 'C-Arm X-Ray', 'equipment', 'available', 'OR 1', 'Mobile C-arm for intraoperative imaging', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 7. Create some sample OT slots for the coordinator to manage
INSERT INTO ot_slots (
    id,
    date,
    start_time,
    end_time,
    room_id,
    status,
    notes,
    created_at,
    updated_at
) VALUES 
    (gen_random_uuid(), CURRENT_DATE + INTERVAL '1 day', '08:00:00', '12:00:00', 
     (SELECT id FROM ot_resources WHERE name = 'Operating Room 1' LIMIT 1), 
     'available', 'Morning slot available', NOW(), NOW()),
    (gen_random_uuid(), CURRENT_DATE + INTERVAL '1 day', '14:00:00', '18:00:00', 
     (SELECT id FROM ot_resources WHERE name = 'Operating Room 1' LIMIT 1), 
     'available', 'Afternoon slot available', NOW(), NOW()),
    (gen_random_uuid(), CURRENT_DATE + INTERVAL '2 days', '08:00:00', '16:00:00', 
     (SELECT id FROM ot_resources WHERE name = 'Operating Room 2' LIMIT 1), 
     'available', 'Full day slot available', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 8. Verify OT resources and slots were created
SELECT 
    r.name as resource_name,
    r.type,
    r.status,
    r.location,
    COUNT(s.id) as available_slots
FROM ot_resources r
LEFT JOIN ot_slots s ON r.id = s.room_id AND s.status = 'available'
GROUP BY r.id, r.name, r.type, r.status, r.location
ORDER BY r.name;

-- 9. Check all users with OT-related roles
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.department,
    u.specialization,
    u.status,
    u.created_at
FROM users u
WHERE u.role LIKE '%ot%' 
   OR u.department LIKE '%Operating%' 
   OR u.department LIKE '%Theatre%'
   OR u.specialization LIKE '%OT%'
ORDER BY u.created_at DESC;

-- 10. Create a notification for the new OT coordinator
INSERT INTO notifications (
    id,
    user_id,
    title,
    message,
    type,
    is_read,
    created_at
) VALUES (
    gen_random_uuid(),
    'USER_ID_FROM_AUTH', -- Replace with actual user ID
    'Welcome to OT Coordination',
    'Welcome Rogers Aluli! You have been assigned as an OT Coordinator. You can now manage operating theatre resources, schedules, and surgical procedures.',
    'system',
    '{}',
    NOW()
);

-- 11. Final verification - show the complete user profile
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.department,
    u.specialization,
    u.phone,
    u.address,
    u.license_number,
    u.hire_date,
    u.salary,
    u.status,
    u.created_at,
    u.updated_at
FROM users u
WHERE u.email = 'alulirogers@gmail.com';
