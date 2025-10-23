-- Delete fake/test users from the users table
-- This removes generic test users while keeping real users

-- Delete fake users one by one with verification

-- 1. Delete "OT Coordinator" (generic name)
DELETE FROM users 
WHERE id = '343b0695-66ca-45ac-a94e-2ba2b8e6c115'
AND name = 'OT Coordinator'
AND email = 'ot-coordinator@alfaspecialized.co.tz'
AND role = 'ot-coordinator';

-- 2. Delete "System Administrator" (generic name)
DELETE FROM users 
WHERE id = '052e1196-ad5a-420c-a859-a9c95a961b03'
AND name = 'System Administrator'
AND email = 'admin@alfaspecialized.co.tz'
AND role = 'admin';

-- 3. Delete "Dr. Michael Chen" (generic name)
DELETE FROM users 
WHERE id = '87daa1f4-2bef-452f-9c6f-617d4f4c268a'
AND name = 'Dr. Michael Chen'
AND email = 'michael@alfaspecialized.co.tz'
AND role = 'radiologist';

-- 4. Delete "Dr. Sarah Johnson" (generic name)
DELETE FROM users 
WHERE id = '2dfe3310-996a-44ca-99e5-f998d3d6c6f5'
AND name = 'Dr. Sarah Johnson'
AND email = 'sarah@alfaspecialized.co.tz'
AND role = 'radiologist';

-- 5. Delete "Mohamed Ally" (fake user)
DELETE FROM users 
WHERE id = 'fdf99f36-4824-4a8e-b54f-49b47f180361'
AND name = 'Mohamed Ally'
AND email = 'mohamed@alfaspecialized.co.tz'
AND role = 'pharmacy';

-- 6. Delete "Grace Kimaro" (fake user)
DELETE FROM users 
WHERE id = 'befe8656-cce3-4d69-a1e6-2be74d2e3f91'
AND name = 'Grace Kimaro'
AND email = 'grace@alfaspecialized.co.tz'
AND role = 'lab';

-- Verify deletions
SELECT 
    'DELETION VERIFICATION' as status,
    COUNT(*) as remaining_fake_users
FROM users 
WHERE name IN ('OT Coordinator', 'System Administrator', 'Dr. Michael Chen', 'Dr. Sarah Johnson', 'Mohamed Ally', 'Grace Kimaro');

-- Show remaining users after cleanup
SELECT 
    'REMAINING USERS' as status,
    id,
    name,
    email,
    role,
    department
FROM users 
ORDER BY name;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Fake users have been deleted from the users table.';
    RAISE NOTICE 'Deleted users:';
    RAISE NOTICE '- OT Coordinator (343b0695-66ca-45ac-a94e-2ba2b8e6c115)';
    RAISE NOTICE '- System Administrator (052e1196-ad5a-420c-a859-a9c95a961b03)';
    RAISE NOTICE '- Dr. Michael Chen (87daa1f4-2bef-452f-9c6f-617d4f4c268a)';
    RAISE NOTICE '- Dr. Sarah Johnson (2dfe3310-996a-44ca-99e5-f998d3d6c6f5)';
    RAISE NOTICE '- Mohamed Ally (fdf99f36-4824-4a8e-b54f-49b47f180361)';
    RAISE NOTICE '- Grace Kimaro (befe8656-cce3-4d69-a1e6-2be74d2e3f91)';
    RAISE NOTICE 'Real users have been preserved.';
END $$;
