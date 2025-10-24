-- Quick Fix for Specialty Tables Error
-- This script fixes the null constraint error by adding required users

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add sample ophthalmologist if not exists
INSERT INTO users (id, name, email, role, department)
SELECT 
    uuid_generate_v4(),
    'Dr. Sarah Johnson',
    'ophthalmologist@alfaspecialized.co.tz',
    'ophthalmologist',
    'Macho (Ophthalmology)'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE role = 'ophthalmologist'
);

-- Add sample physical therapist if not exists
INSERT INTO users (id, name, email, role, department)
SELECT 
    uuid_generate_v4(),
    'Dr. Michael Chen',
    'physical.therapist@alfaspecialized.co.tz',
    'physical-therapist',
    'Physical Therapy'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE role = 'physical-therapist'
);

-- Verify users were added
DO $$
DECLARE
    ophthalmologist_count integer;
    physical_therapist_count integer;
BEGIN
    SELECT COUNT(*) INTO ophthalmologist_count FROM users WHERE role = 'ophthalmologist';
    SELECT COUNT(*) INTO physical_therapist_count FROM users WHERE role = 'physical-therapist';
    
    RAISE NOTICE '✅ Users added successfully!';
    RAISE NOTICE '👁️  Ophthalmologists: %', ophthalmologist_count;
    RAISE NOTICE '🏥 Physical Therapists: %', physical_therapist_count;
    
    IF ophthalmologist_count > 0 AND physical_therapist_count > 0 THEN
        RAISE NOTICE '🎉 You can now run the specialty-medical-tables-schema.sql script successfully!';
    ELSE
        RAISE NOTICE '⚠️  Some users may not have been added. Please check manually.';
    END IF;
END $$;
