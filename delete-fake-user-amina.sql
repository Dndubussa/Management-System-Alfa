-- Delete fake user Amina Mwalimu from the users table
-- This removes the test/fake user that was created

-- Delete the user
DELETE FROM users 
WHERE id = '9f199df2-4d38-442d-b22e-02c9bb8cbb3f'
AND name = 'Amina Mwalimu'
AND email = 'amina@alfaspecialized.co.tz'
AND role = 'receptionist';

-- Verify the user was deleted
SELECT 
    'DELETION VERIFICATION' as status,
    COUNT(*) as remaining_users_with_same_id
FROM users 
WHERE id = '9f199df2-4d38-442d-b22e-02c9bb8cbb3f';

-- Show remaining users to confirm deletion
SELECT 
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
    RAISE NOTICE 'Fake user Amina Mwalimu has been deleted from the users table.';
    RAISE NOTICE 'User ID: 9f199df2-4d38-442d-b22e-02c9bb8cbb3f';
    RAISE NOTICE 'Email: amina@alfaspecialized.co.tz';
    RAISE NOTICE 'Role: receptionist';
END $$;
