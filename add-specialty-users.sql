-- Add Specialty Users for Ophthalmology and Physical Therapy
-- This script adds sample users for the specialized medical tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function to check if user exists
CREATE OR REPLACE FUNCTION user_exists(user_email text) RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM users 
        WHERE users.email = user_email
    );
END;
$$ LANGUAGE plpgsql;

-- Add sample ophthalmologist if not exists
DO $$
BEGIN
    IF NOT user_exists('ophthalmologist@alfaspecialized.co.tz') THEN
        INSERT INTO users (id, name, email, role, department)
        VALUES (
            uuid_generate_v4(),
            'Dr. Sarah Johnson',
            'ophthalmologist@alfaspecialized.co.tz',
            'ophthalmologist',
            'Macho (Ophthalmology)'
        );
        RAISE NOTICE '✅ Added sample ophthalmologist: Dr. Sarah Johnson';
    ELSE
        RAISE NOTICE 'ℹ️  Ophthalmologist already exists';
    END IF;
END $$;

-- Add sample physical therapist if not exists
DO $$
BEGIN
    IF NOT user_exists('physical.therapist@alfaspecialized.co.tz') THEN
        INSERT INTO users (id, name, email, role, department)
        VALUES (
            uuid_generate_v4(),
            'Dr. Michael Chen',
            'physical.therapist@alfaspecialized.co.tz',
            'physical-therapist',
            'Physical Therapy'
        );
        RAISE NOTICE '✅ Added sample physical therapist: Dr. Michael Chen';
    ELSE
        RAISE NOTICE 'ℹ️  Physical therapist already exists';
    END IF;
END $$;

-- Verify users were added
DO $$
DECLARE
    ophthalmologist_count integer;
    physical_therapist_count integer;
BEGIN
    SELECT COUNT(*) INTO ophthalmologist_count FROM users WHERE role = 'ophthalmologist';
    SELECT COUNT(*) INTO physical_therapist_count FROM users WHERE role = 'physical-therapist';
    
    RAISE NOTICE '📊 User counts:';
    RAISE NOTICE '   👁️  Ophthalmologists: %', ophthalmologist_count;
    RAISE NOTICE '   🏥 Physical Therapists: %', physical_therapist_count;
    
    IF ophthalmologist_count = 0 THEN
        RAISE NOTICE '⚠️  No ophthalmologists found - sample data will be skipped';
    END IF;
    
    IF physical_therapist_count = 0 THEN
        RAISE NOTICE '⚠️  No physical therapists found - sample data will be skipped';
    END IF;
END $$;

-- Clean up helper function
DROP FUNCTION IF EXISTS user_exists(text);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 Specialty users setup completed!';
    RAISE NOTICE '💡 You can now run the specialty-medical-tables-schema.sql script';
END $$;
