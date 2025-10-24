-- =====================================================
-- SAFE OPHTHALMOLOGIST USER ADDITION
-- Handles missing columns gracefully
-- =====================================================

DO $$
DECLARE
    column_exists boolean;
BEGIN
    -- Check what columns exist and insert accordingly
    RAISE NOTICE 'Checking users table schema...';
    
    -- Check if phone column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
          AND column_name = 'phone'
          AND table_schema = 'public'
    ) INTO column_exists;
    
    IF column_exists THEN
        RAISE NOTICE 'Phone column exists, including in insert';
        -- Insert with phone column
        INSERT INTO users (
            id,
            email,
            name,
            role,
            department,
            specialization,
            phone,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            'd83f7fa7-c4b8-46cf-9369-e02a5ecb909b',
            'namangimsangi@icloud.com',
            'Namangi Fadhili Msangi',
            'ophthalmologist',
            'Ophthalmology',
            'Ophthalmology',
            NULL, -- Phone not provided
            true,
            NOW(),
            NOW()
        );
    ELSE
        RAISE NOTICE 'Phone column does not exist, inserting without it';
        -- Insert without phone column
        INSERT INTO users (
            id,
            email,
            name,
            role,
            department,
            specialization,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            'd83f7fa7-c4b8-46cf-9369-e02a5ecb909b',
            'namangimsangi@icloud.com',
            'Namangi Fadhili Msangi',
            'ophthalmologist',
            'Ophthalmology',
            'Ophthalmology',
            true,
            NOW(),
            NOW()
        );
    END IF;
    
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
    department,
    specialization,
    is_active,
    created_at
FROM users 
WHERE id = 'd83f7fa7-c4b8-46cf-9369-e02a5ecb909b';
