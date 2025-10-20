-- Find the actual user ID for Rogers Aluli
-- Run this in Supabase SQL editor first

SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'alulirogers@gmail.com';
