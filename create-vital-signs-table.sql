-- =====================================================
-- CREATE VITAL SIGNS TABLE
-- =====================================================

-- Create vital_signs table if it doesn't exist
CREATE TABLE IF NOT EXISTS vital_signs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    queue_id UUID REFERENCES patient_queue(id) ON DELETE SET NULL,
    recorded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    temperature DECIMAL(4,1),
    pulse INTEGER,
    respiratory_rate INTEGER,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    bmi DECIMAL(4,1),
    muac DECIMAL(4,1), -- Mid-upper arm circumference
    oxygen_saturation INTEGER,
    pain_level INTEGER,
    urgency VARCHAR(20) DEFAULT 'normal',
    notes TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vital_signs_patient_id ON vital_signs(patient_id);
CREATE INDEX IF NOT EXISTS idx_vital_signs_recorded_by ON vital_signs(recorded_by);
CREATE INDEX IF NOT EXISTS idx_vital_signs_recorded_at ON vital_signs(recorded_at);
CREATE INDEX IF NOT EXISTS idx_vital_signs_queue_id ON vital_signs(queue_id);

-- Enable Row Level Security
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view vital signs" ON vital_signs
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role IN ('doctor', 'nurse', 'admin', 'ophthalmologist', 'physical-therapist')
        )
    );

CREATE POLICY "Nurses can insert vital signs" ON vital_signs
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM users WHERE role IN ('nurse', 'admin')
        )
    );

CREATE POLICY "Users can update vital signs" ON vital_signs
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role IN ('doctor', 'nurse', 'admin', 'ophthalmologist', 'physical-therapist')
        )
    );

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_vital_signs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vital_signs_updated_at
    BEFORE UPDATE ON vital_signs
    FOR EACH ROW
    EXECUTE FUNCTION update_vital_signs_updated_at();

-- Verify table creation
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'vital_signs' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
