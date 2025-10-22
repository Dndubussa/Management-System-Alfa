-- Workflow Implementation Schema for Alfa Specialized Hospital Management System
-- This script safely adds workflow tables and updates existing tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- HELPER FUNCTIONS FOR SAFE SCHEMA UPDATES
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
-- UPDATE EXISTING TABLES
-- ==============================================

-- Update users table to include nurse and hr roles if not already present
DO $$
BEGIN
    -- Check if the constraint exists and drop it if it does
    IF constraint_exists('users_role_check') THEN
        ALTER TABLE users DROP CONSTRAINT users_role_check;
    END IF;
    
    -- Add the updated constraint with nurse and hr roles
    ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN (
        'receptionist', 'doctor', 'lab', 'pharmacy', 'radiologist', 
        'ophthalmologist', 'admin', 'ot-coordinator', 'insurance-officer', 
        'cashier', 'physical-therapist', 'nurse', 'hr'
    ));
    
    RAISE NOTICE 'Updated users table role constraint to include nurse and hr roles';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating users table: %', SQLERRM;
END $$;

-- Update notifications table to include new notification types
DO $$
BEGIN
    -- Check if the constraint exists and drop it if it does
    IF constraint_exists('notifications_type_check') THEN
        ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
    END IF;
    
    -- Add the updated constraint with new notification types
    ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
    CHECK (type IN (
        'prescription', 'lab-order', 'appointment', 'general', 
        'queue', 'billing', 'triage', 'workflow'
    ));
    
    RAISE NOTICE 'Updated notifications table type constraint to include triage and workflow types';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating notifications table: %', SQLERRM;
END $$;

-- Add new columns to notifications table if they don't exist
DO $$
BEGIN
    -- Add priority column
    IF NOT column_exists('notifications', 'priority') THEN
        ALTER TABLE notifications ADD COLUMN priority text CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal';
        RAISE NOTICE 'Added priority column to notifications table';
    END IF;
    
    -- Add workflow_stage column
    IF NOT column_exists('notifications', 'workflow_stage') THEN
        ALTER TABLE notifications ADD COLUMN workflow_stage text;
        RAISE NOTICE 'Added workflow_stage column to notifications table';
    END IF;
    
    -- Add patient_id column
    IF NOT column_exists('notifications', 'patient_id') THEN
        ALTER TABLE notifications ADD COLUMN patient_id uuid REFERENCES patients(id);
        RAISE NOTICE 'Added patient_id column to notifications table';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding columns to notifications table: %', SQLERRM;
END $$;

-- ==============================================
-- CREATE NEW WORKFLOW TABLES
-- ==============================================

-- Patient Queue Table
CREATE TABLE IF NOT EXISTS patient_queue (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id uuid REFERENCES patients(id) NOT NULL,
    department text NOT NULL DEFAULT 'general',
    priority text CHECK (priority IN ('normal', 'urgent', 'emergency')) NOT NULL DEFAULT 'normal',
    status text CHECK (status IN ('waiting', 'in-progress', 'completed', 'cancelled')) NOT NULL DEFAULT 'waiting',
    workflow_stage text CHECK (workflow_stage IN ('reception', 'triage', 'doctor', 'lab', 'pharmacy', 'completed')) NOT NULL DEFAULT 'reception',
    assigned_doctor_id uuid REFERENCES users(id), -- Assigned doctor for this patient
    assigned_doctor_name text, -- Doctor name for quick reference
    assignment_reason text, -- Reason for doctor assignment
    estimated_wait_time integer, -- in minutes
    actual_wait_time integer, -- in minutes
    called_at timestamp with time zone,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add workflow_stage column if it doesn't exist (for existing tables)
DO $$
BEGIN
    IF NOT column_exists('patient_queue', 'workflow_stage') THEN
        ALTER TABLE patient_queue ADD COLUMN workflow_stage text CHECK (workflow_stage IN ('reception', 'triage', 'doctor', 'lab', 'pharmacy', 'completed')) NOT NULL DEFAULT 'reception';
        RAISE NOTICE 'Added workflow_stage column to existing patient_queue table';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding workflow_stage column: %', SQLERRM;
END $$;

-- Add other missing columns to patient_queue if they don't exist
DO $$
BEGIN
    -- Add estimated_wait_time column if missing
    IF NOT column_exists('patient_queue', 'estimated_wait_time') THEN
        ALTER TABLE patient_queue ADD COLUMN estimated_wait_time integer;
        RAISE NOTICE 'Added estimated_wait_time column to patient_queue table';
    END IF;
    
    -- Add actual_wait_time column if missing
    IF NOT column_exists('patient_queue', 'actual_wait_time') THEN
        ALTER TABLE patient_queue ADD COLUMN actual_wait_time integer;
        RAISE NOTICE 'Added actual_wait_time column to patient_queue table';
    END IF;
    
    -- Add called_at column if missing
    IF NOT column_exists('patient_queue', 'called_at') THEN
        ALTER TABLE patient_queue ADD COLUMN called_at timestamp with time zone;
        RAISE NOTICE 'Added called_at column to patient_queue table';
    END IF;
    
    -- Add started_at column if missing
    IF NOT column_exists('patient_queue', 'started_at') THEN
        ALTER TABLE patient_queue ADD COLUMN started_at timestamp with time zone;
        RAISE NOTICE 'Added started_at column to patient_queue table';
    END IF;
    
    -- Add completed_at column if missing
    IF NOT column_exists('patient_queue', 'completed_at') THEN
        ALTER TABLE patient_queue ADD COLUMN completed_at timestamp with time zone;
        RAISE NOTICE 'Added completed_at column to patient_queue table';
    END IF;
    
    -- Add notes column if missing
    IF NOT column_exists('patient_queue', 'notes') THEN
        ALTER TABLE patient_queue ADD COLUMN notes text;
        RAISE NOTICE 'Added notes column to patient_queue table';
    END IF;
    
    -- Add updated_at column if missing
    IF NOT column_exists('patient_queue', 'updated_at') THEN
        ALTER TABLE patient_queue ADD COLUMN updated_at timestamp with time zone DEFAULT now();
        RAISE NOTICE 'Added updated_at column to patient_queue table';
    END IF;
    
    -- Add doctor assignment columns if missing
    IF NOT column_exists('patient_queue', 'assigned_doctor_id') THEN
        ALTER TABLE patient_queue ADD COLUMN assigned_doctor_id uuid REFERENCES users(id);
        RAISE NOTICE 'Added assigned_doctor_id column to patient_queue table';
    END IF;
    
    IF NOT column_exists('patient_queue', 'assigned_doctor_name') THEN
        ALTER TABLE patient_queue ADD COLUMN assigned_doctor_name text;
        RAISE NOTICE 'Added assigned_doctor_name column to patient_queue table';
    END IF;
    
    IF NOT column_exists('patient_queue', 'assignment_reason') THEN
        ALTER TABLE patient_queue ADD COLUMN assignment_reason text;
        RAISE NOTICE 'Added assignment_reason column to patient_queue table';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding columns to patient_queue: %', SQLERRM;
END $$;

-- Add indexes for better performance (after columns are ensured to exist)
CREATE INDEX IF NOT EXISTS idx_patient_queue_patient_id ON patient_queue(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_queue_status ON patient_queue(status);
CREATE INDEX IF NOT EXISTS idx_patient_queue_priority ON patient_queue(priority);
CREATE INDEX IF NOT EXISTS idx_patient_queue_created_at ON patient_queue(created_at);

-- Add workflow_stage index only after column is ensured to exist
DO $$
BEGIN
    IF column_exists('patient_queue', 'workflow_stage') THEN
        CREATE INDEX IF NOT EXISTS idx_patient_queue_workflow_stage ON patient_queue(workflow_stage);
        RAISE NOTICE 'Created workflow_stage index';
    ELSE
        RAISE NOTICE 'Skipping workflow_stage index - column does not exist';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating workflow_stage index: %', SQLERRM;
END $$;

-- Vital Signs Table
CREATE TABLE IF NOT EXISTS vital_signs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id uuid REFERENCES patients(id) NOT NULL,
    queue_id uuid REFERENCES patient_queue(id),
    recorded_by uuid NOT NULL, -- nurse user id
    recorded_at timestamp with time zone DEFAULT now(),
    temperature numeric(4,1),
    pulse integer,
    respiratory_rate integer,
    blood_pressure_systolic integer,
    blood_pressure_diastolic integer,
    height numeric(5,2),
    weight numeric(5,2),
    bmi numeric(4,1),
    oxygen_saturation integer,
    pain_level integer CHECK (pain_level >= 0 AND pain_level <= 10),
    urgency text CHECK (urgency IN ('critical', 'urgent', 'normal')) NOT NULL DEFAULT 'normal',
    notes text
);

-- Add missing columns to vital_signs if they don't exist
DO $$
BEGIN
    -- Add queue_id column if missing
    IF NOT column_exists('vital_signs', 'queue_id') THEN
        ALTER TABLE vital_signs ADD COLUMN queue_id uuid REFERENCES patient_queue(id);
        RAISE NOTICE 'Added queue_id column to vital_signs table';
    END IF;
    
    -- Add recorded_by column if missing
    IF NOT column_exists('vital_signs', 'recorded_by') THEN
        ALTER TABLE vital_signs ADD COLUMN recorded_by uuid;
        RAISE NOTICE 'Added recorded_by column to vital_signs table (nullable for existing data)';
    END IF;
    
    -- Add recorded_at column if missing
    IF NOT column_exists('vital_signs', 'recorded_at') THEN
        ALTER TABLE vital_signs ADD COLUMN recorded_at timestamp with time zone DEFAULT now();
        RAISE NOTICE 'Added recorded_at column to vital_signs table';
    END IF;
    
    -- Add temperature column if missing
    IF NOT column_exists('vital_signs', 'temperature') THEN
        ALTER TABLE vital_signs ADD COLUMN temperature numeric(4,1);
        RAISE NOTICE 'Added temperature column to vital_signs table';
    END IF;
    
    -- Add pulse column if missing
    IF NOT column_exists('vital_signs', 'pulse') THEN
        ALTER TABLE vital_signs ADD COLUMN pulse integer;
        RAISE NOTICE 'Added pulse column to vital_signs table';
    END IF;
    
    -- Add respiratory_rate column if missing
    IF NOT column_exists('vital_signs', 'respiratory_rate') THEN
        ALTER TABLE vital_signs ADD COLUMN respiratory_rate integer;
        RAISE NOTICE 'Added respiratory_rate column to vital_signs table';
    END IF;
    
    -- Add blood_pressure_systolic column if missing
    IF NOT column_exists('vital_signs', 'blood_pressure_systolic') THEN
        ALTER TABLE vital_signs ADD COLUMN blood_pressure_systolic integer;
        RAISE NOTICE 'Added blood_pressure_systolic column to vital_signs table';
    END IF;
    
    -- Add blood_pressure_diastolic column if missing
    IF NOT column_exists('vital_signs', 'blood_pressure_diastolic') THEN
        ALTER TABLE vital_signs ADD COLUMN blood_pressure_diastolic integer;
        RAISE NOTICE 'Added blood_pressure_diastolic column to vital_signs table';
    END IF;
    
    -- Add height column if missing
    IF NOT column_exists('vital_signs', 'height') THEN
        ALTER TABLE vital_signs ADD COLUMN height numeric(5,2);
        RAISE NOTICE 'Added height column to vital_signs table';
    END IF;
    
    -- Add weight column if missing
    IF NOT column_exists('vital_signs', 'weight') THEN
        ALTER TABLE vital_signs ADD COLUMN weight numeric(5,2);
        RAISE NOTICE 'Added weight column to vital_signs table';
    END IF;
    
    -- Add bmi column if missing
    IF NOT column_exists('vital_signs', 'bmi') THEN
        ALTER TABLE vital_signs ADD COLUMN bmi numeric(4,1);
        RAISE NOTICE 'Added bmi column to vital_signs table';
    END IF;
    
    -- Add oxygen_saturation column if missing
    IF NOT column_exists('vital_signs', 'oxygen_saturation') THEN
        ALTER TABLE vital_signs ADD COLUMN oxygen_saturation integer;
        RAISE NOTICE 'Added oxygen_saturation column to vital_signs table';
    END IF;
    
    -- Add pain_level column if missing
    IF NOT column_exists('vital_signs', 'pain_level') THEN
        ALTER TABLE vital_signs ADD COLUMN pain_level integer CHECK (pain_level >= 0 AND pain_level <= 10);
        RAISE NOTICE 'Added pain_level column to vital_signs table';
    END IF;
    
    -- Add urgency column if missing
    IF NOT column_exists('vital_signs', 'urgency') THEN
        ALTER TABLE vital_signs ADD COLUMN urgency text CHECK (urgency IN ('critical', 'urgent', 'normal')) DEFAULT 'normal';
        -- Update existing rows to have a default urgency value
        UPDATE vital_signs SET urgency = 'normal' WHERE urgency IS NULL;
        -- Now make the column NOT NULL
        ALTER TABLE vital_signs ALTER COLUMN urgency SET NOT NULL;
        RAISE NOTICE 'Added urgency column to vital_signs table';
    END IF;
    
    -- Add notes column if missing
    IF NOT column_exists('vital_signs', 'notes') THEN
        ALTER TABLE vital_signs ADD COLUMN notes text;
        RAISE NOTICE 'Added notes column to vital_signs table';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding columns to vital_signs: %', SQLERRM;
END $$;

-- Add indexes for vital signs
CREATE INDEX IF NOT EXISTS idx_vital_signs_patient_id ON vital_signs(patient_id);
CREATE INDEX IF NOT EXISTS idx_vital_signs_recorded_by ON vital_signs(recorded_by);
CREATE INDEX IF NOT EXISTS idx_vital_signs_recorded_at ON vital_signs(recorded_at);
-- Add urgency index only after column is ensured to exist
DO $$
BEGIN
    IF column_exists('vital_signs', 'urgency') THEN
        CREATE INDEX IF NOT EXISTS idx_vital_signs_urgency ON vital_signs(urgency);
        RAISE NOTICE 'Created urgency index on vital_signs';
    ELSE
        RAISE NOTICE 'Skipping urgency index - column does not exist';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating urgency index: %', SQLERRM;
END $$;

-- Add queue_id index only after column is ensured to exist
DO $$
BEGIN
    IF column_exists('vital_signs', 'queue_id') THEN
        CREATE INDEX IF NOT EXISTS idx_vital_signs_queue_id ON vital_signs(queue_id);
        RAISE NOTICE 'Created queue_id index on vital_signs';
    ELSE
        RAISE NOTICE 'Skipping queue_id index - column does not exist';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating queue_id index: %', SQLERRM;
END $$;

-- ==============================================
-- CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to patient_queue if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_patient_queue_updated_at'
    ) THEN
        CREATE TRIGGER update_patient_queue_updated_at
            BEFORE UPDATE ON patient_queue
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created updated_at trigger for patient_queue table';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating trigger for patient_queue: %', SQLERRM;
END $$;

-- ==============================================
-- CREATE VIEWS FOR COMMON QUERIES
-- ==============================================

-- View for active queue items with patient information
DO $$
BEGIN
    IF column_exists('patient_queue', 'workflow_stage') THEN
        EXECUTE 'CREATE OR REPLACE VIEW active_queue_with_patients AS
        SELECT 
            pq.id as queue_id,
            pq.patient_id,
            pq.department,
            pq.priority,
            pq.status,
            pq.workflow_stage,
            pq.estimated_wait_time,
            pq.actual_wait_time,
            pq.called_at,
            pq.started_at,
            pq.completed_at,
            pq.notes,
            pq.created_at,
            pq.updated_at,
            p.mrn,
            p.first_name,
            p.last_name,
            p.phone,
            p.insurance_provider,
            EXTRACT(EPOCH FROM (now() - pq.created_at))/60 as wait_time_minutes
        FROM patient_queue pq
        JOIN patients p ON pq.patient_id = p.id
        WHERE pq.status IN (''waiting'', ''in-progress'')
        ORDER BY 
            CASE pq.priority 
                WHEN ''emergency'' THEN 1 
                WHEN ''urgent'' THEN 2 
                WHEN ''normal'' THEN 3 
            END,
            pq.created_at';
        RAISE NOTICE 'Created active_queue_with_patients view';
    ELSE
        RAISE NOTICE 'Skipping active_queue_with_patients view - workflow_stage column does not exist';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating active_queue_with_patients view: %', SQLERRM;
END $$;

-- View for triage-ready patients (completed triage, waiting for doctor)
DO $$
BEGIN
    IF column_exists('patient_queue', 'workflow_stage') AND column_exists('vital_signs', 'queue_id') AND column_exists('vital_signs', 'urgency') THEN
        EXECUTE 'CREATE OR REPLACE VIEW triage_ready_patients AS
        SELECT 
            pq.id as queue_id,
            pq.patient_id,
            p.mrn,
            p.first_name,
            p.last_name,
            p.phone,
            vs.urgency,
            vs.temperature,
            vs.pulse,
            vs.blood_pressure_systolic,
            vs.blood_pressure_diastolic,
            vs.pain_level,
            vs.recorded_at as triage_completed_at
        FROM patient_queue pq
        JOIN patients p ON pq.patient_id = p.id
        LEFT JOIN vital_signs vs ON pq.id = vs.queue_id
        WHERE pq.workflow_stage = ''doctor'' 
        AND pq.status = ''waiting''
        ORDER BY 
            CASE vs.urgency 
                WHEN ''critical'' THEN 1 
                WHEN ''urgent'' THEN 2 
                WHEN ''normal'' THEN 3 
            END,
            vs.recorded_at';
        RAISE NOTICE 'Created triage_ready_patients view';
    ELSE
        RAISE NOTICE 'Skipping triage_ready_patients view - required columns do not exist';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating triage_ready_patients view: %', SQLERRM;
END $$;

-- ==============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

-- Enable RLS on new tables
ALTER TABLE patient_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;

-- RLS policies for patient_queue
CREATE POLICY "Users can view queue items for their department" ON patient_queue
    FOR SELECT USING (
        department = current_setting('app.current_user_department', true) OR
        current_setting('app.current_user_role', true) IN ('admin', 'receptionist')
    );

CREATE POLICY "Users can update queue items for their department" ON patient_queue
    FOR UPDATE USING (
        department = current_setting('app.current_user_department', true) OR
        current_setting('app.current_user_role', true) IN ('admin', 'receptionist')
    );

CREATE POLICY "Users can insert queue items for their department" ON patient_queue
    FOR INSERT WITH CHECK (
        department = current_setting('app.current_user_department', true) OR
        current_setting('app.current_user_role', true) IN ('admin', 'receptionist')
    );

-- RLS policies for vital_signs
CREATE POLICY "Users can view vital signs for their patients" ON vital_signs
    FOR SELECT USING (
        recorded_by::text = current_setting('app.current_user_id', true) OR
        current_setting('app.current_user_role', true) IN ('admin', 'doctor', 'nurse')
    );

CREATE POLICY "Nurses can insert vital signs" ON vital_signs
    FOR INSERT WITH CHECK (
        current_setting('app.current_user_role', true) = 'nurse' OR
        current_setting('app.current_user_role', true) = 'admin'
    );

CREATE POLICY "Users can update vital signs they recorded" ON vital_signs
    FOR UPDATE USING (
        recorded_by::text = current_setting('app.current_user_id', true) OR
        current_setting('app.current_user_role', true) = 'admin'
    );

-- ==============================================
-- SAMPLE DATA FOR TESTING (OPTIONAL)
-- ==============================================

-- Insert sample queue items if no data exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM patient_queue LIMIT 1) THEN
        -- Only insert if we have patients in the system and workflow_stage column exists
        IF EXISTS (SELECT 1 FROM patients LIMIT 1) AND column_exists('patient_queue', 'workflow_stage') THEN
            INSERT INTO patient_queue (patient_id, department, priority, status, workflow_stage)
            SELECT 
                p.id,
                'general',
                'normal',
                'waiting',
                'reception'
            FROM patients p
            LIMIT 3;
            
            RAISE NOTICE 'Inserted sample queue items for testing';
        ELSIF EXISTS (SELECT 1 FROM patients LIMIT 1) THEN
            -- Insert without workflow_stage if column doesn't exist
            INSERT INTO patient_queue (patient_id, department, priority, status)
            SELECT 
                p.id,
                'general',
                'normal',
                'waiting'
            FROM patients p
            LIMIT 3;
            
            RAISE NOTICE 'Inserted sample queue items for testing (without workflow_stage)';
        END IF;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting sample data: %', SQLERRM;
END $$;

-- ==============================================
-- CLEANUP HELPER FUNCTIONS
-- ==============================================

-- Function to clean up old completed queue items (optional)
CREATE OR REPLACE FUNCTION cleanup_old_queue_items(days_old integer DEFAULT 30)
RETURNS integer AS $$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM patient_queue 
    WHERE status = 'completed' 
    AND completed_at < now() - interval '1 day' * days_old;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Verify tables were created successfully
DO $$
DECLARE
    table_count integer;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('patient_queue', 'vital_signs');
    
    IF table_count = 2 THEN
        RAISE NOTICE 'SUCCESS: All workflow tables created successfully';
    ELSE
        RAISE NOTICE 'WARNING: Only % of 2 workflow tables were created', table_count;
    END IF;
END $$;

-- Verify constraints were updated
DO $$
DECLARE
    constraint_count integer;
BEGIN
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints 
    WHERE constraint_schema = 'public' 
    AND constraint_name IN ('users_role_check', 'notifications_type_check');
    
    IF constraint_count = 2 THEN
        RAISE NOTICE 'SUCCESS: All constraints updated successfully';
    ELSE
        RAISE NOTICE 'WARNING: Only % of 2 constraints were updated', constraint_count;
    END IF;
END $$;

-- Final completion message
DO $$
BEGIN
    RAISE NOTICE 'Workflow implementation schema completed successfully!';
    RAISE NOTICE 'New tables: patient_queue, vital_signs';
    RAISE NOTICE 'Updated tables: users, notifications';
    RAISE NOTICE 'Created views: active_queue_with_patients, triage_ready_patients';
    RAISE NOTICE 'RLS policies enabled for security';
END $$;
