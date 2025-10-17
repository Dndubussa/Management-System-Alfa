-- Check Frontend Authentication Issue
-- This will help identify if the frontend auth is working

-- 1. Check if there are any users in the auth.users table
SELECT 
    'AUTH USERS CHECK' as test_type,
    COUNT(*) as total_users,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users
FROM auth.users;

-- 2. Check recent user activity
SELECT 
    'RECENT USERS' as test_type,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check if there are any auth sessions
SELECT 
    'AUTH SESSIONS' as test_type,
    COUNT(*) as active_sessions
FROM auth.sessions;

-- 4. Test if we can see the data without auth (as admin)
SELECT 
    'ADMIN DATA ACCESS' as test_type,
    COUNT(*) as patient_count
FROM patients;

SELECT 
    'ADMIN SERVICE ACCESS' as test_type,
    COUNT(*) as service_count
FROM service_prices;
