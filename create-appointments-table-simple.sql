-- Simple fix for appointments table - create if missing
-- This addresses the 400 error when trying to access appointments

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

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies
DROP POLICY IF EXISTS "Allow all authenticated users" ON appointments;
CREATE POLICY "Allow all authenticated users" ON appointments
  FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(date_time);

SELECT 'Appointments table created successfully' as status;
