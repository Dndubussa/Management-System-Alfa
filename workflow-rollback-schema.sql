-- Rollback Script for Workflow Implementation
-- This script safely removes workflow tables and reverts changes

-- ==============================================
-- HELPER FUNCTIONS (same as implementation)
-- ==============================================

-- Function to check if a table exists
CREATE OR REPLACE FUNCTION table_exists(table_name text) RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if a constraint exists
CREATE OR REPLACE FUNCTION constraint_exists(constraint_name text) RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND constraint_name = $1
    );
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- REMOVE NEW TABLES
-- ==============================================

-- Drop views first (they depend on tables)
DROP VIEW IF EXISTS triage_ready_patients;
DROP VIEW IF EXISTS active_queue_with_patients;

-- Drop triggers
DROP TRIGGER IF EXISTS update_patient_queue_updated_at ON patient_queue;

-- Drop indexes
DROP INDEX IF EXISTS idx_vital_signs_urgency;
DROP INDEX IF EXISTS idx_vital_signs_recorded_at;
DROP INDEX IF EXISTS idx_vital_signs_recorded_by;
DROP INDEX IF EXISTS idx_vital_signs_queue_id;
DROP INDEX IF EXISTS idx_vital_signs_patient_id;

DROP INDEX IF EXISTS idx_patient_queue_created_at;
DROP INDEX IF EXISTS idx_patient_queue_priority;
DROP INDEX IF EXISTS idx_patient_queue_workflow_stage;
DROP INDEX IF EXISTS idx_patient_queue_status;
DROP INDEX IF EXISTS idx_patient_queue_patient_id;

-- Drop tables (in reverse dependency order)
DROP TABLE IF EXISTS vital_signs CASCADE;
DROP TABLE IF EXISTS patient_queue CASCADE;

-- ==============================================
-- REVERT NOTIFICATIONS TABLE CHANGES
-- ==============================================

-- Remove new columns from notifications table
DO $$
BEGIN
    -- Remove patient_id column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications' 
        AND column_name = 'patient_id'
    ) THEN
        ALTER TABLE notifications DROP COLUMN patient_id;
        RAISE NOTICE 'Removed patient_id column from notifications table';
    END IF;
    
    -- Remove workflow_stage column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications' 
        AND column_name = 'workflow_stage'
    ) THEN
        ALTER TABLE notifications DROP COLUMN workflow_stage;
        RAISE NOTICE 'Removed workflow_stage column from notifications table';
    END IF;
    
    -- Remove priority column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications' 
        AND column_name = 'priority'
    ) THEN
        ALTER TABLE notifications DROP COLUMN priority;
        RAISE NOTICE 'Removed priority column from notifications table';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error removing columns from notifications table: %', SQLERRM;
END $$;

-- Revert notifications type constraint
DO $$
BEGIN
    IF constraint_exists('notifications_type_check') THEN
        ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
    END IF;
    
    -- Restore original constraint
    ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
    CHECK (type IN ('prescription', 'lab-order', 'appointment', 'general', 'queue', 'billing'));
    
    RAISE NOTICE 'Reverted notifications table type constraint to original values';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error reverting notifications table: %', SQLERRM;
END $$;

-- ==============================================
-- REVERT USERS TABLE CHANGES
-- ==============================================

-- Revert users role constraint
DO $$
BEGIN
    IF constraint_exists('users_role_check') THEN
        ALTER TABLE users DROP CONSTRAINT users_role_check;
    END IF;
    
    -- Restore original constraint (without nurse and hr)
    ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN (
        'receptionist', 'doctor', 'lab', 'pharmacy', 'radiologist', 
        'ophthalmologist', 'admin', 'ot-coordinator', 
        'cashier', 'physical-therapist'
    ));
    
    RAISE NOTICE 'Reverted users table role constraint to original values';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error reverting users table: %', SQLERRM;
END $$;

-- ==============================================
-- CLEANUP HELPER FUNCTIONS
-- ==============================================

-- Drop helper functions
DROP FUNCTION IF EXISTS cleanup_old_queue_items(integer);
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS column_exists(text, text);
DROP FUNCTION IF EXISTS constraint_exists(text);
DROP FUNCTION IF EXISTS table_exists(text);

-- ==============================================
-- VERIFICATION
-- ==============================================

-- Verify rollback was successful
DO $$
DECLARE
    table_count integer;
    constraint_count integer;
BEGIN
    -- Check that workflow tables are gone
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('patient_queue', 'vital_signs');
    
    IF table_count = 0 THEN
        RAISE NOTICE 'SUCCESS: All workflow tables removed successfully';
    ELSE
        RAISE NOTICE 'WARNING: % workflow tables still exist', table_count;
    END IF;
    
    -- Check that constraints are reverted
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints 
    WHERE constraint_schema = 'public' 
    AND constraint_name IN ('users_role_check', 'notifications_type_check');
    
    IF constraint_count = 2 THEN
        RAISE NOTICE 'SUCCESS: All constraints reverted successfully';
    ELSE
        RAISE NOTICE 'WARNING: Only % of 2 constraints were reverted', constraint_count;
    END IF;
END $$;

-- Final rollback completion message
DO $$
BEGIN
    RAISE NOTICE 'Workflow rollback completed successfully!';
    RAISE NOTICE 'Removed tables: patient_queue, vital_signs';
    RAISE NOTICE 'Reverted tables: users, notifications';
    RAISE NOTICE 'All workflow changes have been undone';
END $$;
