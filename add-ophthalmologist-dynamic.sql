-- =====================================================
-- DYNAMIC OPHTHALMOLOGIST USER ADDITION
-- Checks schema and builds INSERT statement accordingly
-- =====================================================

DO $$
DECLARE
    sql_statement text;
    columns_list text;
    values_list text;
    has_department boolean;
    has_specialization boolean;
    has_phone boolean;
    has_license boolean;
BEGIN
    -- Check which columns exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'department' AND table_schema = 'public'
    ) INTO has_department;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'specialization' AND table_schema = 'public'
    ) INTO has_specialization;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'phone' AND table_schema = 'public'
    ) INTO has_phone;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'license_number' AND table_schema = 'public'
    ) INTO has_license;
    
    -- Build columns list
    columns_list := 'id, email, name, role, is_active, created_at, updated_at';
    values_list := '''d83f7fa7-c4b8-46cf-9369-e02a5ecb909b'', ''namangimsangi@icloud.com'', ''Namangi Fadhili Msangi'', ''ophthalmologist'', true, NOW(), NOW()';
    
    -- Add optional columns if they exist
    IF has_department THEN
        columns_list := columns_list || ', department';
        values_list := values_list || ', ''Ophthalmology''';
    END IF;
    
    IF has_specialization THEN
        columns_list := columns_list || ', specialization';
        values_list := values_list || ', ''Ophthalmology''';
    END IF;
    
    IF has_phone THEN
        columns_list := columns_list || ', phone';
        values_list := values_list || ', NULL';
    END IF;
    
    IF has_license THEN
        columns_list := columns_list || ', license_number';
        values_list := values_list || ', NULL';
    END IF;
    
    -- Build and execute the dynamic SQL
    sql_statement := 'INSERT INTO users (' || columns_list || ') VALUES (' || values_list || ')';
    
    RAISE NOTICE 'Executing: %', sql_statement;
    EXECUTE sql_statement;
    
    RAISE NOTICE 'User inserted successfully!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting user: %', SQLERRM;
        RAISE;
END $$;

-- Verify the user was inserted
SELECT 
    id,
    email,
    name,
    role,
    is_active,
    created_at
FROM users 
WHERE id = 'd83f7fa7-c4b8-46cf-9369-e02a5ecb909b';
