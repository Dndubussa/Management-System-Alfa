-- =====================================================
-- CHECK USERS TABLE SCHEMA
-- =====================================================

-- Check the structure of the users table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if the table exists
SELECT 
    table_name,
    table_schema,
    table_type
FROM information_schema.tables 
WHERE table_name = 'users' 
  AND table_schema = 'public';

-- Show sample data from users table (if any exists)
SELECT * FROM users LIMIT 5;
