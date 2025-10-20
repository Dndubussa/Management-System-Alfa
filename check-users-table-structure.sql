-- Check the actual structure of the users table
-- Run this in Supabase SQL editor to see the correct column names

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
