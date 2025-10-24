-- =====================================================
-- CHECK DATABASE TABLES
-- =====================================================

-- List all tables in the public schema
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if vital_signs table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'vital_signs' 
            AND table_schema = 'public'
        ) 
        THEN 'vital_signs table EXISTS' 
        ELSE 'vital_signs table does NOT exist' 
    END as vital_signs_status;

-- If vital_signs exists, show its columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'vital_signs' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check common tables
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('patients', 'users', 'appointments', 'medical_records', 'vital_signs')
        THEN '✅ ' || table_name || ' exists'
        ELSE '❌ ' || table_name || ' missing'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('patients', 'users', 'appointments', 'medical_records', 'vital_signs')
ORDER BY table_name;
