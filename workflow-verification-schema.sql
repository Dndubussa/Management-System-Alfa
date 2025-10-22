-- Verification Script for Workflow Implementation
-- This script checks the current state of the database and reports what exists

-- ==============================================
-- HELPER FUNCTIONS
-- ==============================================

-- Function to check if a table exists
DO $$
BEGIN
    -- Drop existing function if it exists with different signature
    DROP FUNCTION IF EXISTS table_exists(text);
    DROP FUNCTION IF EXISTS table_exists(tbl_name text);
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors if function doesn't exist
        NULL;
END $$;

CREATE OR REPLACE FUNCTION table_exists(table_name text) RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if a column exists in a table
DO $$
BEGIN
    -- Drop existing function if it exists with different signature
    DROP FUNCTION IF EXISTS column_exists(text, text);
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors if function doesn't exist
        NULL;
END $$;

CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text) RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1 
        AND column_name = $2
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if a constraint exists
DO $$
BEGIN
    -- Drop existing function if it exists with different signature
    DROP FUNCTION IF EXISTS constraint_exists(text);
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors if function doesn't exist
        NULL;
END $$;

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
-- CHECK EXISTING TABLES
-- ==============================================

DO $$
DECLARE
    table_name text;
    table_count integer := 0;
BEGIN
    RAISE NOTICE '=== EXISTING TABLES CHECK ===';
    
    -- Check core tables
    FOR table_name IN SELECT unnest(ARRAY[
        'patients', 'medical_records', 'prescriptions', 'lab_orders', 
        'appointments', 'users', 'notifications', 'service_prices', 
        'bills', 'bill_items', 'departments', 'referrals'
    ]) LOOP
        IF table_exists(table_name) THEN
            RAISE NOTICE '✅ Table % exists', table_name;
            table_count := table_count + 1;
        ELSE
            RAISE NOTICE '❌ Table % does NOT exist', table_name;
        END IF;
    END LOOP;
    
    -- Check workflow tables
    RAISE NOTICE '--- Workflow Tables ---';
    IF table_exists('patient_queue') THEN
        RAISE NOTICE '✅ Table patient_queue exists';
        table_count := table_count + 1;
    ELSE
        RAISE NOTICE '❌ Table patient_queue does NOT exist';
    END IF;
    
    IF table_exists('vital_signs') THEN
        RAISE NOTICE '✅ Table vital_signs exists';
        table_count := table_count + 1;
    ELSE
        RAISE NOTICE '❌ Table vital_signs does NOT exist';
    END IF;
    
    RAISE NOTICE 'Total tables found: %', table_count;
END $$;

-- ==============================================
-- CHECK USERS TABLE CONSTRAINTS
-- ==============================================

DO $$
DECLARE
    constraint_def text;
BEGIN
    RAISE NOTICE '=== USERS TABLE CONSTRAINTS ===';
    
    IF constraint_exists('users_role_check') THEN
        SELECT pg_get_constraintdef(oid) INTO constraint_def
        FROM pg_constraint 
        WHERE conname = 'users_role_check';
        
        RAISE NOTICE '✅ users_role_check constraint exists: %', constraint_def;
        
        -- Check if nurse and hr roles are included
        IF constraint_def LIKE '%nurse%' AND constraint_def LIKE '%hr%' THEN
            RAISE NOTICE '✅ Constraint includes nurse and hr roles';
        ELSE
            RAISE NOTICE '⚠️ Constraint does NOT include nurse and hr roles';
        END IF;
    ELSE
        RAISE NOTICE '❌ users_role_check constraint does NOT exist';
    END IF;
END $$;

-- ==============================================
-- CHECK NOTIFICATIONS TABLE
-- ==============================================

DO $$
DECLARE
    constraint_def text;
    has_priority boolean := false;
    has_workflow_stage boolean := false;
    has_patient_id boolean := false;
BEGIN
    RAISE NOTICE '=== NOTIFICATIONS TABLE CHECK ===';
    
    -- Check constraint
    IF constraint_exists('notifications_type_check') THEN
        SELECT pg_get_constraintdef(oid) INTO constraint_def
        FROM pg_constraint 
        WHERE conname = 'notifications_type_check';
        
        RAISE NOTICE '✅ notifications_type_check constraint exists: %', constraint_def;
        
        -- Check if new types are included
        IF constraint_def LIKE '%triage%' AND constraint_def LIKE '%workflow%' THEN
            RAISE NOTICE '✅ Constraint includes triage and workflow types';
        ELSE
            RAISE NOTICE '⚠️ Constraint does NOT include triage and workflow types';
        END IF;
    ELSE
        RAISE NOTICE '❌ notifications_type_check constraint does NOT exist';
    END IF;
    
    -- Check new columns
    has_priority := column_exists('notifications', 'priority');
    has_workflow_stage := column_exists('notifications', 'workflow_stage');
    has_patient_id := column_exists('notifications', 'patient_id');
    
    IF has_priority THEN
        RAISE NOTICE '✅ Column priority exists';
    ELSE
        RAISE NOTICE '❌ Column priority does NOT exist';
    END IF;
    
    IF has_workflow_stage THEN
        RAISE NOTICE '✅ Column workflow_stage exists';
    ELSE
        RAISE NOTICE '❌ Column workflow_stage does NOT exist';
    END IF;
    
    IF has_patient_id THEN
        RAISE NOTICE '✅ Column patient_id exists';
    ELSE
        RAISE NOTICE '❌ Column patient_id does NOT exist';
    END IF;
END $$;

-- ==============================================
-- CHECK WORKFLOW TABLES STRUCTURE
-- ==============================================

DO $$
DECLARE
    column_name text;
    column_count integer;
BEGIN
    RAISE NOTICE '=== WORKFLOW TABLES STRUCTURE ===';
    
    -- Check patient_queue table structure
    IF table_exists('patient_queue') THEN
        RAISE NOTICE '--- patient_queue table columns ---';
        column_count := 0;
        
        FOR column_name IN 
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'patient_queue'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  - %', column_name;
            column_count := column_count + 1;
        END LOOP;
        
        RAISE NOTICE 'Total columns in patient_queue: %', column_count;
    END IF;
    
    -- Check vital_signs table structure
    IF table_exists('vital_signs') THEN
        RAISE NOTICE '--- vital_signs table columns ---';
        column_count := 0;
        
        FOR column_name IN 
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'vital_signs'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  - %', column_name;
            column_count := column_count + 1;
        END LOOP;
        
        RAISE NOTICE 'Total columns in vital_signs: %', column_count;
    END IF;
END $$;

-- ==============================================
-- CHECK INDEXES
-- ==============================================

DO $$
DECLARE
    index_name text;
    index_count integer := 0;
BEGIN
    RAISE NOTICE '=== WORKFLOW TABLE INDEXES ===';
    
    -- Check patient_queue indexes
    FOR index_name IN 
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'patient_queue'
        AND schemaname = 'public'
    LOOP
        RAISE NOTICE '✅ Index % exists on patient_queue', index_name;
        index_count := index_count + 1;
    END LOOP;
    
    -- Check vital_signs indexes
    FOR index_name IN 
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'vital_signs'
        AND schemaname = 'public'
    LOOP
        RAISE NOTICE '✅ Index % exists on vital_signs', index_name;
        index_count := index_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Total workflow indexes found: %', index_count;
END $$;

-- ==============================================
-- CHECK VIEWS
-- ==============================================

DO $$
DECLARE
    view_name text;
    view_count integer := 0;
BEGIN
    RAISE NOTICE '=== WORKFLOW VIEWS ===';
    
    FOR view_name IN 
        SELECT table_name 
        FROM information_schema.views 
        WHERE table_schema = 'public'
        AND table_name IN ('active_queue_with_patients', 'triage_ready_patients')
    LOOP
        RAISE NOTICE '✅ View % exists', view_name;
        view_count := view_count + 1;
    END LOOP;
    
    IF view_count = 0 THEN
        RAISE NOTICE '❌ No workflow views found';
    END IF;
END $$;

-- ==============================================
-- CHECK ROW LEVEL SECURITY
-- ==============================================

DO $$
DECLARE
    table_name text;
    rls_enabled boolean;
BEGIN
    RAISE NOTICE '=== ROW LEVEL SECURITY ===';
    
    FOR table_name IN SELECT unnest(ARRAY['patient_queue', 'vital_signs']) LOOP
        IF table_exists(table_name) THEN
            SELECT relrowsecurity INTO rls_enabled
            FROM pg_class 
            WHERE relname = table_name;
            
            IF rls_enabled THEN
                RAISE NOTICE '✅ RLS enabled on %', table_name;
            ELSE
                RAISE NOTICE '❌ RLS NOT enabled on %', table_name;
            END IF;
        END IF;
    END LOOP;
END $$;

-- ==============================================
-- CHECK DATA COUNTS
-- ==============================================

DO $$
DECLARE
    patient_count integer;
    queue_count integer;
    vital_count integer;
    user_count integer;
BEGIN
    RAISE NOTICE '=== DATA COUNTS ===';
    
    -- Count patients
    IF table_exists('patients') THEN
        SELECT COUNT(*) INTO patient_count FROM patients;
        RAISE NOTICE 'Patients: %', patient_count;
    END IF;
    
    -- Count users
    IF table_exists('users') THEN
        SELECT COUNT(*) INTO user_count FROM users;
        RAISE NOTICE 'Users: %', user_count;
        
        -- Count users by role
        RAISE NOTICE 'Users by role:';
        FOR role_name, role_count IN 
            SELECT role, COUNT(*) 
            FROM users 
            GROUP BY role 
            ORDER BY role
        LOOP
            RAISE NOTICE '  - %: %', role_name, role_count;
        END LOOP;
    END IF;
    
    -- Count queue items
    IF table_exists('patient_queue') THEN
        SELECT COUNT(*) INTO queue_count FROM patient_queue;
        RAISE NOTICE 'Queue items: %', queue_count;
    END IF;
    
    -- Count vital signs
    IF table_exists('vital_signs') THEN
        SELECT COUNT(*) INTO vital_count FROM vital_signs;
        RAISE NOTICE 'Vital signs records: %', vital_count;
    END IF;
END $$;

-- ==============================================
-- SUMMARY
-- ==============================================

DO $$
DECLARE
    workflow_ready boolean := true;
    missing_items text[] := ARRAY[]::text[];
BEGIN
    RAISE NOTICE '=== IMPLEMENTATION SUMMARY ===';
    
    -- Check if workflow is ready
    IF NOT table_exists('patient_queue') THEN
        workflow_ready := false;
        missing_items := array_append(missing_items, 'patient_queue table');
    END IF;
    
    IF NOT table_exists('vital_signs') THEN
        workflow_ready := false;
        missing_items := array_append(missing_items, 'vital_signs table');
    END IF;
    
    IF NOT column_exists('notifications', 'priority') THEN
        workflow_ready := false;
        missing_items := array_append(missing_items, 'notifications.priority column');
    END IF;
    
    IF NOT column_exists('notifications', 'workflow_stage') THEN
        workflow_ready := false;
        missing_items := array_append(missing_items, 'notifications.workflow_stage column');
    END IF;
    
    IF workflow_ready THEN
        RAISE NOTICE '🎉 WORKFLOW IMPLEMENTATION IS READY!';
        RAISE NOTICE 'All required tables and columns are in place.';
    ELSE
        RAISE NOTICE '⚠️ WORKFLOW IMPLEMENTATION IS INCOMPLETE';
        RAISE NOTICE 'Missing items:';
        FOR i IN 1..array_length(missing_items, 1) LOOP
            RAISE NOTICE '  - %', missing_items[i];
        END LOOP;
        RAISE NOTICE 'Run workflow-implementation-schema.sql to complete the setup.';
    END IF;
END $$;

-- Clean up helper functions
DROP FUNCTION IF EXISTS table_exists(text);
DROP FUNCTION IF EXISTS column_exists(text, text);
DROP FUNCTION IF EXISTS constraint_exists(text);

-- Final verification message
DO $$
BEGIN
    RAISE NOTICE 'Verification completed!';
END $$;
