-- Specialized Medical Tables Schema for Ophthalmology and Physical Therapy
-- This schema creates tables for storing specialized medical data

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function to check if table exists
CREATE OR REPLACE FUNCTION table_exists(tbl_name text) RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = tbl_name
    );
END;
$$ LANGUAGE plpgsql;

-- Helper function to check if column exists
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

-- =============================================
-- OPHTHALMOLOGY TABLES
-- =============================================

-- Ophthalmology records table
CREATE TABLE IF NOT EXISTS ophthalmology_records (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id uuid REFERENCES patients(id) NOT NULL,
    doctor_id uuid NOT NULL,
    visit_date date NOT NULL,
    chief_complaint text NOT NULL,
    diagnosis text NOT NULL,
    treatment text NOT NULL,
    notes text,
    status text CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Visual acuity tests table
CREATE TABLE IF NOT EXISTS visual_acuity_tests (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    ophthalmology_record_id uuid REFERENCES ophthalmology_records(id) NOT NULL,
    patient_id uuid REFERENCES patients(id) NOT NULL,
    test_date date NOT NULL,
    right_eye_near text,
    right_eye_distance text,
    left_eye_near text,
    left_eye_distance text,
    right_eye_corrected text,
    left_eye_corrected text,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

-- Refraction data table
CREATE TABLE IF NOT EXISTS refraction_data (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    ophthalmology_record_id uuid REFERENCES ophthalmology_records(id) NOT NULL,
    patient_id uuid REFERENCES patients(id) NOT NULL,
    test_date date NOT NULL,
    right_eye_sphere text,
    right_eye_cylinder text,
    right_eye_axis text,
    right_eye_add text,
    left_eye_sphere text,
    left_eye_cylinder text,
    left_eye_axis text,
    left_eye_add text,
    pupillary_distance text,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

-- Intraocular pressure table
CREATE TABLE IF NOT EXISTS intraocular_pressure (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    ophthalmology_record_id uuid REFERENCES ophthalmology_records(id) NOT NULL,
    patient_id uuid REFERENCES patients(id) NOT NULL,
    test_date date NOT NULL,
    right_eye_pressure text,
    left_eye_pressure text,
    method text CHECK (method IN ('tonometry', 'palpation')) DEFAULT 'tonometry',
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

-- Ophthalmology findings table
CREATE TABLE IF NOT EXISTS ophthalmology_findings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    ophthalmology_record_id uuid REFERENCES ophthalmology_records(id) NOT NULL,
    patient_id uuid REFERENCES patients(id) NOT NULL,
    finding_type text CHECK (finding_type IN ('external', 'slit_lamp', 'fundoscopy', 'other')) NOT NULL,
    description text NOT NULL,
    image_url text,
    severity text CHECK (severity IN ('mild', 'moderate', 'severe')) DEFAULT 'mild',
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

-- Ophthalmology imaging table
CREATE TABLE IF NOT EXISTS ophthalmology_images (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    ophthalmology_record_id uuid REFERENCES ophthalmology_records(id) NOT NULL,
    patient_id uuid REFERENCES patients(id) NOT NULL,
    image_type text CHECK (image_type IN ('fundus', 'anterior_segment', 'oct', 'visual_field', 'other')) NOT NULL,
    image_url text NOT NULL,
    description text,
    eye text CHECK (eye IN ('right', 'left', 'both')) DEFAULT 'both',
    created_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- PHYSICAL THERAPY TABLES
-- =============================================

-- Physical therapy records table
CREATE TABLE IF NOT EXISTS physical_therapy_records (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id uuid REFERENCES patients(id) NOT NULL,
    therapist_id uuid NOT NULL,
    visit_date date NOT NULL,
    chief_complaint text NOT NULL,
    assessment text NOT NULL,
    treatment_plan text NOT NULL,
    notes text,
    status text CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Therapy plans table
CREATE TABLE IF NOT EXISTS therapy_plans (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    physical_therapy_record_id uuid REFERENCES physical_therapy_records(id) NOT NULL,
    patient_id uuid REFERENCES patients(id) NOT NULL,
    plan_name text NOT NULL,
    description text NOT NULL,
    goals text NOT NULL,
    duration_weeks integer NOT NULL,
    frequency_per_week integer NOT NULL,
    status text CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
    start_date date NOT NULL,
    end_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Therapy sessions table
CREATE TABLE IF NOT EXISTS therapy_sessions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    therapy_plan_id uuid REFERENCES therapy_plans(id) NOT NULL,
    patient_id uuid REFERENCES patients(id) NOT NULL,
    therapist_id uuid NOT NULL,
    session_date date NOT NULL,
    session_duration_minutes integer NOT NULL,
    exercises_performed text NOT NULL,
    progress_notes text,
    pain_level_before integer CHECK (pain_level_before >= 0 AND pain_level_before <= 10),
    pain_level_after integer CHECK (pain_level_after >= 0 AND pain_level_after <= 10),
    status text CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
    created_at timestamp with time zone DEFAULT now()
);

-- Assessment data table
CREATE TABLE IF NOT EXISTS assessment_data (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    physical_therapy_record_id uuid REFERENCES physical_therapy_records(id) NOT NULL,
    patient_id uuid REFERENCES patients(id) NOT NULL,
    assessment_type text CHECK (assessment_type IN ('initial', 'progress', 'final', 'follow_up')) NOT NULL,
    assessment_date date NOT NULL,
    range_of_motion jsonb,
    muscle_strength jsonb,
    balance_tests jsonb,
    functional_tests jsonb,
    pain_assessment jsonb,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

-- Exercise prescriptions table
CREATE TABLE IF NOT EXISTS exercise_prescriptions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    therapy_plan_id uuid REFERENCES therapy_plans(id) NOT NULL,
    patient_id uuid REFERENCES patients(id) NOT NULL,
    exercise_name text NOT NULL,
    description text NOT NULL,
    sets integer NOT NULL,
    repetitions integer NOT NULL,
    duration_minutes integer,
    frequency_per_day integer NOT NULL,
    instructions text NOT NULL,
    precautions text,
    status text CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
    created_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Ophthalmology indexes
CREATE INDEX IF NOT EXISTS idx_ophthalmology_records_patient_id ON ophthalmology_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_ophthalmology_records_doctor_id ON ophthalmology_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_ophthalmology_records_visit_date ON ophthalmology_records(visit_date);
CREATE INDEX IF NOT EXISTS idx_visual_acuity_tests_patient_id ON visual_acuity_tests(patient_id);
CREATE INDEX IF NOT EXISTS idx_refraction_data_patient_id ON refraction_data(patient_id);
CREATE INDEX IF NOT EXISTS idx_intraocular_pressure_patient_id ON intraocular_pressure(patient_id);
CREATE INDEX IF NOT EXISTS idx_ophthalmology_findings_patient_id ON ophthalmology_findings(patient_id);
CREATE INDEX IF NOT EXISTS idx_ophthalmology_images_patient_id ON ophthalmology_images(patient_id);

-- Physical therapy indexes
CREATE INDEX IF NOT EXISTS idx_physical_therapy_records_patient_id ON physical_therapy_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_physical_therapy_records_therapist_id ON physical_therapy_records(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapy_plans_patient_id ON therapy_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_patient_id ON therapy_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_therapist_id ON therapy_sessions(therapist_id);
CREATE INDEX IF NOT EXISTS idx_assessment_data_patient_id ON assessment_data(patient_id);
CREATE INDEX IF NOT EXISTS idx_exercise_prescriptions_patient_id ON exercise_prescriptions(patient_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE ophthalmology_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE visual_acuity_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE refraction_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE intraocular_pressure ENABLE ROW LEVEL SECURITY;
ALTER TABLE ophthalmology_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ophthalmology_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_therapy_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_prescriptions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- UPDATE TRIGGERS
-- =============================================

-- Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers to tables with updated_at columns
DO $$
BEGIN
    IF table_exists('ophthalmology_records') AND column_exists('ophthalmology_records', 'updated_at') THEN
        DROP TRIGGER IF EXISTS update_ophthalmology_records_updated_at ON ophthalmology_records;
        CREATE TRIGGER update_ophthalmology_records_updated_at
            BEFORE UPDATE ON ophthalmology_records
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF table_exists('physical_therapy_records') AND column_exists('physical_therapy_records', 'updated_at') THEN
        DROP TRIGGER IF EXISTS update_physical_therapy_records_updated_at ON physical_therapy_records;
        CREATE TRIGGER update_physical_therapy_records_updated_at
            BEFORE UPDATE ON physical_therapy_records
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF table_exists('therapy_plans') AND column_exists('therapy_plans', 'updated_at') THEN
        DROP TRIGGER IF EXISTS update_therapy_plans_updated_at ON therapy_plans;
        CREATE TRIGGER update_therapy_plans_updated_at
            BEFORE UPDATE ON therapy_plans
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =============================================
-- SAMPLE DATA (OPTIONAL)
-- =============================================

-- Insert sample ophthalmology record
DO $$
DECLARE
    sample_patient_id uuid;
    sample_ophthalmologist_id uuid;
BEGIN
    -- Get a sample patient
    SELECT id INTO sample_patient_id FROM patients LIMIT 1;
    
    -- Get an ophthalmologist or create a sample one
    SELECT id INTO sample_ophthalmologist_id FROM users WHERE role = 'ophthalmologist' LIMIT 1;
    
    -- If no ophthalmologist exists, skip sample data insertion
    IF sample_patient_id IS NOT NULL AND sample_ophthalmologist_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM ophthalmology_records LIMIT 1) THEN
            INSERT INTO ophthalmology_records (patient_id, doctor_id, visit_date, chief_complaint, diagnosis, treatment, notes)
            VALUES (
                sample_patient_id,
                sample_ophthalmologist_id,
                CURRENT_DATE,
                'Blurred vision in right eye',
                'Cataract',
                'Cataract surgery recommended',
                'Patient needs cataract surgery in right eye'
            );
        END IF;
    END IF;
END $$;

-- Insert sample physical therapy record
DO $$
DECLARE
    sample_patient_id uuid;
    sample_therapist_id uuid;
BEGIN
    -- Get a sample patient
    SELECT id INTO sample_patient_id FROM patients LIMIT 1;
    
    -- Get a physical therapist or create a sample one
    SELECT id INTO sample_therapist_id FROM users WHERE role = 'physical-therapist' LIMIT 1;
    
    -- If no physical therapist exists, skip sample data insertion
    IF sample_patient_id IS NOT NULL AND sample_therapist_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM physical_therapy_records LIMIT 1) THEN
            INSERT INTO physical_therapy_records (patient_id, therapist_id, visit_date, chief_complaint, assessment, treatment_plan, notes)
            VALUES (
                sample_patient_id,
                sample_therapist_id,
                CURRENT_DATE,
                'Lower back pain',
                'Muscle strain in lumbar region',
                'Strengthening exercises and stretching',
                'Patient needs 6 weeks of physical therapy'
            );
        END IF;
    END IF;
END $$;

-- Clean up helper functions
DROP FUNCTION IF EXISTS table_exists(text);
DROP FUNCTION IF EXISTS column_exists(text, text);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Specialized medical tables created successfully!';
    RAISE NOTICE '📊 Created tables:';
    RAISE NOTICE '   👁️ Ophthalmology: ophthalmology_records, visual_acuity_tests, refraction_data, intraocular_pressure, ophthalmology_findings, ophthalmology_images';
    RAISE NOTICE '   🏥 Physical Therapy: physical_therapy_records, therapy_plans, therapy_sessions, assessment_data, exercise_prescriptions';
    RAISE NOTICE '🔒 Row Level Security enabled on all tables';
    RAISE NOTICE '📈 Performance indexes created';
    RAISE NOTICE '🎉 Schema ready for specialized medical data!';
END $$;
