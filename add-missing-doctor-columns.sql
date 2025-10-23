-- Add the missing doctor assignment columns to patients table
-- This script specifically adds the columns that are still missing

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add the missing doctor assignment columns
DO $$
BEGIN
    -- Add assigned_doctor_id column
    ALTER TABLE patients ADD COLUMN assigned_doctor_id uuid REFERENCES users(id);
    RAISE NOTICE 'Added assigned_doctor_id column to patients table';
EXCEPTION
    WHEN duplicate_column THEN
        RAISE NOTICE 'assigned_doctor_id column already exists';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding assigned_doctor_id: %', SQLERRM;
END $$;

DO $$
BEGIN
    -- Add assigned_doctor_name column
    ALTER TABLE patients ADD COLUMN assigned_doctor_name text;
    RAISE NOTICE 'Added assigned_doctor_name column to patients table';
EXCEPTION
    WHEN duplicate_column THEN
        RAISE NOTICE 'assigned_doctor_name column already exists';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding assigned_doctor_name: %', SQLERRM;
END $$;

DO $$
BEGIN
    -- Add assignment_date column
    ALTER TABLE patients ADD COLUMN assignment_date timestamp with time zone;
    RAISE NOTICE 'Added assignment_date column to patients table';
EXCEPTION
    WHEN duplicate_column THEN
        RAISE NOTICE 'assignment_date column already exists';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding assignment_date: %', SQLERRM;
END $$;

DO $$
BEGIN
    -- Add assignment_reason column
    ALTER TABLE patients ADD COLUMN assignment_reason text;
    RAISE NOTICE 'Added assignment_reason column to patients table';
EXCEPTION
    WHEN duplicate_column THEN
        RAISE NOTICE 'assignment_reason column already exists';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding assignment_reason: %', SQLERRM;
END $$;

-- Verify the columns were added
SELECT 'Updated patients table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Doctor assignment columns have been added to patients table!';
    RAISE NOTICE 'The following columns should now be available:';
    RAISE NOTICE '- assigned_doctor_id (uuid, references users(id))';
    RAISE NOTICE '- assigned_doctor_name (text)';
    RAISE NOTICE '- assignment_date (timestamp with time zone)';
    RAISE NOTICE '- assignment_reason (text)';
END $$;
