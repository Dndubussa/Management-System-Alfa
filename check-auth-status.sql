-- Check current authentication status
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role,
  auth.email() as current_email;

-- Check if the user exists in the users table
SELECT 
  id,
  name,
  email,
  role,
  created_at
FROM users 
WHERE id = auth.uid();
