-- Add patient workflow status tracking
-- This will help track patients through the workflow: registration → triage → doctor

-- Add workflow_status column to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS workflow_status text DEFAULT 'registered' 
CHECK (workflow_status IN ('registered', 'ready_for_triage', 'triaged', 'with_doctor', 'completed'));

-- Add triage_completed_at timestamp
ALTER TABLE patients ADD COLUMN IF NOT EXISTS triage_completed_at timestamp with time zone;

-- Add assigned_doctor_id if not exists (for tracking which doctor the patient is assigned to)
ALTER TABLE patients ADD COLUMN IF NOT EXISTS assigned_doctor_id uuid REFERENCES users(id);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_patients_workflow_status ON patients(workflow_status);
CREATE INDEX IF NOT EXISTS idx_patients_assigned_doctor ON patients(assigned_doctor_id);

-- Update existing patients to have proper status
UPDATE patients SET workflow_status = 'registered' WHERE workflow_status IS NULL;

-- Create a function to update patient workflow status
CREATE OR REPLACE FUNCTION update_patient_workflow_status(
    patient_uuid uuid,
    new_status text,
    doctor_id uuid DEFAULT NULL
) RETURNS void AS $$
BEGIN
    UPDATE patients 
    SET 
        workflow_status = new_status,
        assigned_doctor_id = COALESCE(doctor_id, assigned_doctor_id),
        triage_completed_at = CASE 
            WHEN new_status = 'triaged' THEN NOW()
            ELSE triage_completed_at
        END,
        updated_at = NOW()
    WHERE id = patient_uuid;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_patient_workflow_status TO anon;
GRANT EXECUTE ON FUNCTION update_patient_workflow_status TO authenticated;
GRANT EXECUTE ON FUNCTION update_patient_workflow_status TO service_role;

SELECT 'Patient workflow status tracking added successfully' as status;
