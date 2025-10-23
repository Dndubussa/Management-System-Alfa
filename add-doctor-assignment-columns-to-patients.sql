-- Add doctor assignment columns to patients table
-- This script adds the missing columns that are needed for the new workflow

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function to check if column exists
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1 
        AND column_name = $2
    );
END;
$$ LANGUAGE plpgsql;

-- Add doctor assignment columns to patients table
DO $$
BEGIN
    -- Add assigned_doctor_id column if it doesn't exist
    IF NOT column_exists('patients', 'assigned_doctor_id') THEN
        ALTER TABLE patients ADD COLUMN assigned_doctor_id uuid REFERENCES users(id);
        RAISE NOTICE 'Added assigned_doctor_id column to patients table';
    ELSE
        RAISE NOTICE 'assigned_doctor_id column already exists in patients table';
    END IF;

    -- Add assigned_doctor_name column if it doesn't exist
    IF NOT column_exists('patients', 'assigned_doctor_name') THEN
        ALTER TABLE patients ADD COLUMN assigned_doctor_name text;
        RAISE NOTICE 'Added assigned_doctor_name column to patients table';
    ELSE
        RAISE NOTICE 'assigned_doctor_name column already exists in patients table';
    END IF;

    -- Add assignment_date column if it doesn't exist
    IF NOT column_exists('patients', 'assignment_date') THEN
        ALTER TABLE patients ADD COLUMN assignment_date timestamp with time zone;
        RAISE NOTICE 'Added assignment_date column to patients table';
    ELSE
        RAISE NOTICE 'assignment_date column already exists in patients table';
    END IF;

    -- Add assignment_reason column if it doesn't exist
    IF NOT column_exists('patients', 'assignment_reason') THEN
        ALTER TABLE patients ADD COLUMN assignment_reason text;
        RAISE NOTICE 'Added assignment_reason column to patients table';
    ELSE
        RAISE NOTICE 'assignment_reason column already exists in patients table';
    END IF;

    -- Add cash_amount column if it doesn't exist (for insurance info)
    IF NOT column_exists('patients', 'cash_amount') THEN
        ALTER TABLE patients ADD COLUMN cash_amount text;
        RAISE NOTICE 'Added cash_amount column to patients table';
    ELSE
        RAISE NOTICE 'cash_amount column already exists in patients table';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding columns to patients table: %', SQLERRM;
END $$;

-- Verify the columns were added
SELECT 'Current patients table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position;

-- Clean up helper function
DROP FUNCTION IF EXISTS column_exists(text, text);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Doctor assignment columns have been added to patients table successfully!';
    RAISE NOTICE 'The following columns are now available:';
    RAISE NOTICE '- assigned_doctor_id (uuid, references users(id))';
    RAISE NOTICE '- assigned_doctor_name (text)';
    RAISE NOTICE '- assignment_date (timestamp with time zone)';
    RAISE NOTICE '- assignment_reason (text)';
    RAISE NOTICE '- cash_amount (text)';
END $$;
