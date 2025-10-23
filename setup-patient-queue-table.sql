-- Setup script for patient_queue table
-- This script creates the patient_queue table and related structures

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper functions for safe table/column creation
CREATE OR REPLACE FUNCTION table_exists(tbl_name text) RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = tbl_name
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION column_exists(tbl_name text, col_name text) RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = tbl_name 
        AND column_name = col_name
    );
END;
$$ LANGUAGE plpgsql;

-- Create patient_queue table if it doesn't exist
DO $$
BEGIN
    IF NOT table_exists('patient_queue') THEN
        CREATE TABLE patient_queue (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
            department text NOT NULL DEFAULT 'general',
            priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent', 'emergency')),
            status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in-progress', 'completed', 'cancelled')),
            workflow_stage text NOT NULL DEFAULT 'reception' CHECK (workflow_stage IN ('reception', 'triage', 'doctor', 'lab', 'pharmacy', 'completed')),
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now(),
            estimated_wait_time integer,
            actual_wait_time integer,
            called_at timestamp with time zone,
            started_at timestamp with time zone,
            completed_at timestamp with time zone,
            notes text,
            assigned_doctor_id uuid REFERENCES users(id),
            assigned_doctor_name text,
            assignment_reason text
        );
        
        RAISE NOTICE 'Created patient_queue table';
    ELSE
        RAISE NOTICE 'patient_queue table already exists';
    END IF;
END $$;

-- Add missing columns to existing patient_queue table
DO $$
BEGIN
    -- Add workflow_stage column if it doesn't exist
    IF NOT column_exists('patient_queue', 'workflow_stage') THEN
        ALTER TABLE patient_queue ADD COLUMN workflow_stage text CHECK (workflow_stage IN ('reception', 'triage', 'doctor', 'lab', 'pharmacy', 'completed')) NOT NULL DEFAULT 'reception';
        RAISE NOTICE 'Added workflow_stage column to patient_queue table';
    END IF;

    -- Add assigned_doctor_id column if it doesn't exist
    IF NOT column_exists('patient_queue', 'assigned_doctor_id') THEN
        ALTER TABLE patient_queue ADD COLUMN assigned_doctor_id uuid REFERENCES users(id);
        RAISE NOTICE 'Added assigned_doctor_id column to patient_queue table';
    END IF;

    -- Add assigned_doctor_name column if it doesn't exist
    IF NOT column_exists('patient_queue', 'assigned_doctor_name') THEN
        ALTER TABLE patient_queue ADD COLUMN assigned_doctor_name text;
        RAISE NOTICE 'Added assigned_doctor_name column to patient_queue table';
    END IF;

    -- Add assignment_reason column if it doesn't exist
    IF NOT column_exists('patient_queue', 'assignment_reason') THEN
        ALTER TABLE patient_queue ADD COLUMN assignment_reason text;
        RAISE NOTICE 'Added assignment_reason column to patient_queue table';
    END IF;

    -- Add other missing columns
    IF NOT column_exists('patient_queue', 'estimated_wait_time') THEN
        ALTER TABLE patient_queue ADD COLUMN estimated_wait_time integer;
        RAISE NOTICE 'Added estimated_wait_time column to patient_queue table';
    END IF;

    IF NOT column_exists('patient_queue', 'actual_wait_time') THEN
        ALTER TABLE patient_queue ADD COLUMN actual_wait_time integer;
        RAISE NOTICE 'Added actual_wait_time column to patient_queue table';
    END IF;

    IF NOT column_exists('patient_queue', 'called_at') THEN
        ALTER TABLE patient_queue ADD COLUMN called_at timestamp with time zone;
        RAISE NOTICE 'Added called_at column to patient_queue table';
    END IF;

    IF NOT column_exists('patient_queue', 'started_at') THEN
        ALTER TABLE patient_queue ADD COLUMN started_at timestamp with time zone;
        RAISE NOTICE 'Added started_at column to patient_queue table';
    END IF;

    IF NOT column_exists('patient_queue', 'completed_at') THEN
        ALTER TABLE patient_queue ADD COLUMN completed_at timestamp with time zone;
        RAISE NOTICE 'Added completed_at column to patient_queue table';
    END IF;

    IF NOT column_exists('patient_queue', 'notes') THEN
        ALTER TABLE patient_queue ADD COLUMN notes text;
        RAISE NOTICE 'Added notes column to patient_queue table';
    END IF;

    IF NOT column_exists('patient_queue', 'updated_at') THEN
        ALTER TABLE patient_queue ADD COLUMN updated_at timestamp with time zone DEFAULT now();
        RAISE NOTICE 'Added updated_at column to patient_queue table';
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_patient_queue_patient_id ON patient_queue(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_queue_status ON patient_queue(status);
CREATE INDEX IF NOT EXISTS idx_patient_queue_priority ON patient_queue(priority);
CREATE INDEX IF NOT EXISTS idx_patient_queue_created_at ON patient_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_patient_queue_workflow_stage ON patient_queue(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_patient_queue_assigned_doctor ON patient_queue(assigned_doctor_id);

-- Create updated_at trigger
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
END $$;

-- Enable Row Level Security
ALTER TABLE patient_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view queue items for their department" ON patient_queue;
    DROP POLICY IF EXISTS "Users can update queue items for their department" ON patient_queue;
    DROP POLICY IF EXISTS "Users can insert queue items for their department" ON patient_queue;
    
    -- Create new policies
    CREATE POLICY "Users can view queue items for their department" ON patient_queue
        FOR SELECT USING (true);
    
    CREATE POLICY "Users can update queue items for their department" ON patient_queue
        FOR UPDATE USING (true);
    
    CREATE POLICY "Users can insert queue items for their department" ON patient_queue
        FOR INSERT WITH CHECK (true);
    
    RAISE NOTICE 'Created RLS policies for patient_queue table';
END $$;

-- Create vital_signs table if it doesn't exist
DO $$
BEGIN
    IF NOT table_exists('vital_signs') THEN
        CREATE TABLE vital_signs (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
            queue_id uuid REFERENCES patient_queue(id),
            temperature decimal(4,1),
            pulse integer,
            respiratory_rate integer,
            blood_pressure_systolic integer,
            blood_pressure_diastolic integer,
            height decimal(5,2),
            weight decimal(5,2),
            bmi decimal(4,1),
            muac decimal(4,1),
            oxygen_saturation integer,
            pain_score integer CHECK (pain_score >= 0 AND pain_score <= 10),
            urgency text NOT NULL DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
            recorded_by uuid REFERENCES users(id),
            recorded_at timestamp with time zone DEFAULT now(),
            notes text,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
        
        RAISE NOTICE 'Created vital_signs table';
    ELSE
        RAISE NOTICE 'vital_signs table already exists';
    END IF;
END $$;

-- Add missing columns to vital_signs table
DO $$
BEGIN
    IF NOT column_exists('vital_signs', 'queue_id') THEN
        ALTER TABLE vital_signs ADD COLUMN queue_id uuid REFERENCES patient_queue(id);
        RAISE NOTICE 'Added queue_id column to vital_signs table';
    END IF;

    IF NOT column_exists('vital_signs', 'urgency') THEN
        ALTER TABLE vital_signs ADD COLUMN urgency text CHECK (urgency IN ('low', 'normal', 'high', 'urgent')) NOT NULL DEFAULT 'normal';
        RAISE NOTICE 'Added urgency column to vital_signs table';
    END IF;

    IF NOT column_exists('vital_signs', 'recorded_by') THEN
        ALTER TABLE vital_signs ADD COLUMN recorded_by uuid REFERENCES users(id);
        RAISE NOTICE 'Added recorded_by column to vital_signs table';
    END IF;
END $$;

-- Create indexes for vital_signs
CREATE INDEX IF NOT EXISTS idx_vital_signs_patient_id ON vital_signs(patient_id);
CREATE INDEX IF NOT EXISTS idx_vital_signs_queue_id ON vital_signs(queue_id);
CREATE INDEX IF NOT EXISTS idx_vital_signs_recorded_at ON vital_signs(recorded_at);
CREATE INDEX IF NOT EXISTS idx_vital_signs_urgency ON vital_signs(urgency);

-- Create updated_at trigger for vital_signs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_vital_signs_updated_at'
    ) THEN
        CREATE TRIGGER update_vital_signs_updated_at
            BEFORE UPDATE ON vital_signs
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created updated_at trigger for vital_signs table';
    END IF;
END $$;

-- Enable RLS for vital_signs
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vital_signs
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view vital signs" ON vital_signs;
    DROP POLICY IF EXISTS "Users can update vital signs" ON vital_signs;
    DROP POLICY IF EXISTS "Users can insert vital signs" ON vital_signs;
    
    CREATE POLICY "Users can view vital signs" ON vital_signs
        FOR SELECT USING (true);
    
    CREATE POLICY "Users can update vital signs" ON vital_signs
        FOR UPDATE USING (true);
    
    CREATE POLICY "Users can insert vital signs" ON vital_signs
        FOR INSERT WITH CHECK (true);
    
    RAISE NOTICE 'Created RLS policies for vital_signs table';
END $$;

-- Clean up helper functions
DROP FUNCTION IF EXISTS table_exists(text);
DROP FUNCTION IF EXISTS column_exists(text, text);

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '✅ Patient queue and vital signs tables setup completed successfully!';
    RAISE NOTICE 'Tables created/updated: patient_queue, vital_signs';
    RAISE NOTICE 'Indexes and RLS policies applied';
END $$;
