-- =====================================================
-- CHECK VITAL SIGNS TABLE STRUCTURE
-- =====================================================

-- Show all columns in vital_signs table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'vital_signs' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if specific columns exist
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vital_signs' 
        AND column_name = 'pulse'
        AND table_schema = 'public'
    ) THEN 'pulse column EXISTS' ELSE 'pulse column MISSING' END as pulse_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vital_signs' 
        AND column_name = 'temperature'
        AND table_schema = 'public'
    ) THEN 'temperature column EXISTS' ELSE 'temperature column MISSING' END as temperature_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vital_signs' 
        AND column_name = 'respiratory_rate'
        AND table_schema = 'public'
    ) THEN 'respiratory_rate column EXISTS' ELSE 'respiratory_rate column MISSING' END as respiratory_rate_status;

-- Show table constraints
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'vital_signs' 
  AND table_schema = 'public';
