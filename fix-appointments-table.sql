-- Fix appointments table structure and permissions
-- This addresses the 400 error when trying to access appointments

-- Check if appointments table exists
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'appointments';

-- Create appointments table if it doesn't exist
CREATE TABLE IF NOT EXISTS appointments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id uuid REFERENCES patients(id) NOT NULL,
    doctor_id uuid NOT NULL,
    date_time timestamp with time zone NOT NULL,
    duration integer NOT NULL DEFAULT 30,
    type text CHECK (type IN ('consultation', 'follow-up', 'emergency')) NOT NULL,
    status text CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')) NOT NULL DEFAULT 'scheduled',
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on appointments table
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can insert appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can update appointments" ON appointments;

-- Create RLS policies for appointments
CREATE POLICY "Authenticated users can view appointments" ON appointments
  FOR SELECT USING (
    auth.role() = 'authenticated' OR
    auth.role() = 'service_role'
  );

CREATE POLICY "Authenticated users can insert appointments" ON appointments
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' OR
    auth.role() = 'service_role'
  );

CREATE POLICY "Authenticated users can update appointments" ON appointments
  FOR UPDATE USING (
    auth.role() = 'authenticated' OR
    auth.role() = 'service_role'
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(date_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position;

-- Test inserting a sample appointment (this will be rolled back)
BEGIN;
INSERT INTO appointments (
    patient_id,
    doctor_id,
    date_time,
    duration,
    type,
    status,
    notes
) VALUES (
    (SELECT id FROM patients LIMIT 1),
    uuid_generate_v4(),
    now() + interval '1 day',
    30,
    'consultation',
    'scheduled',
    'Test appointment'
);
ROLLBACK;

SELECT 'Appointments table setup completed successfully' as status;
