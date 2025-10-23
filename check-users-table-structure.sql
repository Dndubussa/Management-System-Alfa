-- Check the structure of the users table
-- This will show us what columns actually exist

-- Method 1: Check table structure using information_schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Method 2: Check table structure using pg_describe
-- \d users

-- Method 3: Check if table exists and get basic info
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- Method 4: Get sample data to see structure
SELECT * FROM users LIMIT 1;