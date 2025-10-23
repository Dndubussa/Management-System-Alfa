-- Simple script to create patient_queue table
-- Run this in Supabase SQL Editor if the main setup script has issues

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create patient_queue table
CREATE TABLE IF NOT EXISTS patient_queue (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    department text NOT NULL DEFAULT 'general',
    priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent', 'emergency')),
    status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in-progress', 'completed', 'cancelled')),
    workflow_stage text NOT NULL DEFAULT 'reception' CHECK (workflow_stage IN ('reception', 'triage', 'doctor', 'lab', 'pharmacy', 'completed')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    assigned_doctor_id uuid REFERENCES users(id),
    assigned_doctor_name text,
    assignment_reason text
);

-- Create vital_signs table
CREATE TABLE IF NOT EXISTS vital_signs (
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
    oxygen_saturation integer,
    pain_score integer CHECK (pain_score >= 0 AND pain_score <= 10),
    urgency text NOT NULL DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
    recorded_by uuid REFERENCES users(id),
    recorded_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_patient_queue_patient_id ON patient_queue(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_queue_status ON patient_queue(status);
CREATE INDEX IF NOT EXISTS idx_patient_queue_workflow_stage ON patient_queue(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_vital_signs_patient_id ON vital_signs(patient_id);
CREATE INDEX IF NOT EXISTS idx_vital_signs_queue_id ON vital_signs(queue_id);

-- Enable Row Level Security
ALTER TABLE patient_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (allow all for now)
CREATE POLICY "Allow all operations on patient_queue" ON patient_queue FOR ALL USING (true);
CREATE POLICY "Allow all operations on vital_signs" ON vital_signs FOR ALL USING (true);

-- Success message
SELECT 'Patient queue and vital signs tables created successfully!' as message;
