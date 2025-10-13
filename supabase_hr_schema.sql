-- HR Database Schema for Alfa Specialized Hospital Management System
-- This schema includes all tables needed for Human Resources management

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  staff_id text UNIQUE NOT NULL, -- ASH-STF-###
  first_name text NOT NULL,
  last_name text NOT NULL,
  full_name text NOT NULL,
  id_number text NOT NULL,
  passport_number text,
  phone text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  role text NOT NULL,
  department text NOT NULL,
  employment_type text CHECK (employment_type IN ('permanent', 'contract', 'locum')) NOT NULL,
  hire_date date NOT NULL,
  status text CHECK (status IN ('active', 'inactive', 'terminated', 'on-leave')) DEFAULT 'active',
  supervisor_id uuid REFERENCES staff(id),
  salary numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Staff documents table
CREATE TABLE IF NOT EXISTS staff_documents (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  staff_id uuid REFERENCES staff(id) NOT NULL,
  document_type text CHECK (document_type IN ('cv', 'certificate', 'license', 'contract', 'id_copy', 'other')) NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now(),
  expiry_date date
);

-- Recruitment table
CREATE TABLE IF NOT EXISTS recruitment (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  position text NOT NULL,
  department text NOT NULL,
  employment_type text CHECK (employment_type IN ('permanent', 'contract', 'locum')) NOT NULL,
  requirements text NOT NULL,
  description text NOT NULL,
  status text CHECK (status IN ('open', 'closed', 'cancelled')) DEFAULT 'open',
  posted_date date DEFAULT CURRENT_DATE,
  closing_date date NOT NULL,
  created_by uuid REFERENCES users(id) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Job applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  recruitment_id uuid REFERENCES recruitment(id) NOT NULL,
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  applicant_phone text NOT NULL,
  cv_url text NOT NULL,
  cover_letter text,
  status text CHECK (status IN ('submitted', 'shortlisted', 'interviewed', 'rejected', 'hired')) DEFAULT 'submitted',
  applied_date timestamp with time zone DEFAULT now(),
  interview_date timestamp with time zone,
  notes text
);

-- Staff licenses table
CREATE TABLE IF NOT EXISTS staff_licenses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  staff_id uuid REFERENCES staff(id) NOT NULL,
  license_type text NOT NULL,
  license_number text NOT NULL,
  issuing_authority text NOT NULL,
  issue_date date NOT NULL,
  expiry_date date NOT NULL,
  status text CHECK (status IN ('active', 'expired', 'renewed')) DEFAULT 'active',
  document_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  staff_id uuid REFERENCES staff(id) NOT NULL,
  date date NOT NULL,
  check_in time,
  check_out time,
  status text CHECK (status IN ('present', 'absent', 'late', 'half-day', 'on-leave')) NOT NULL,
  hours_worked numeric,
  overtime numeric,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(staff_id, date)
);

-- Leave requests table
CREATE TABLE IF NOT EXISTS leave_requests (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  staff_id uuid REFERENCES staff(id) NOT NULL,
  leave_type text CHECK (leave_type IN ('annual', 'sick', 'emergency', 'maternity', 'paternity', 'study')) NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  days integer NOT NULL,
  reason text NOT NULL,
  status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  requested_date timestamp with time zone DEFAULT now(),
  approved_by uuid REFERENCES staff(id),
  approved_date timestamp with time zone,
  rejection_reason text
);

-- Training table
CREATE TABLE IF NOT EXISTS training (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  type text CHECK (type IN ('internal', 'external', 'online')) NOT NULL,
  provider text NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  duration numeric NOT NULL, -- in hours
  max_participants integer NOT NULL,
  status text CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')) DEFAULT 'scheduled',
  created_by uuid REFERENCES users(id) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Training attendance table
CREATE TABLE IF NOT EXISTS training_attendance (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  training_id uuid REFERENCES training(id) NOT NULL,
  staff_id uuid REFERENCES staff(id) NOT NULL,
  status text CHECK (status IN ('registered', 'attended', 'absent', 'completed')) DEFAULT 'registered',
  certificate_url text,
  score numeric,
  feedback text,
  registered_at timestamp with time zone DEFAULT now(),
  UNIQUE(training_id, staff_id)
);

-- Performance appraisals table
CREATE TABLE IF NOT EXISTS performance_appraisals (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  staff_id uuid REFERENCES staff(id) NOT NULL,
  period text NOT NULL, -- e.g., "2024-Q1"
  appraisal_type text CHECK (appraisal_type IN ('annual', 'quarterly', 'probation')) NOT NULL,
  supervisor_id uuid REFERENCES staff(id) NOT NULL,
  self_rating numeric CHECK (self_rating >= 1 AND self_rating <= 5),
  supervisor_rating numeric CHECK (supervisor_rating >= 1 AND supervisor_rating <= 5),
  peer_rating numeric CHECK (peer_rating >= 1 AND peer_rating <= 5),
  overall_rating numeric CHECK (overall_rating >= 1 AND overall_rating <= 5),
  strengths text,
  areas_for_improvement text,
  goals text,
  status text CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved')) DEFAULT 'draft',
  submitted_date timestamp with time zone,
  reviewed_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_department ON staff(department);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);
CREATE INDEX IF NOT EXISTS idx_staff_employment_type ON staff(employment_type);
CREATE INDEX IF NOT EXISTS idx_staff_licenses_expiry ON staff_licenses(expiry_date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_training_status ON training(status);
CREATE INDEX IF NOT EXISTS idx_recruitment_status ON recruitment(status);

-- Enable Row Level Security
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE training ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_appraisals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for HR tables
-- Allow read access for authenticated users
CREATE POLICY "Allow read access for authenticated users" ON staff
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow read access for authenticated users" ON staff_documents
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow read access for authenticated users" ON recruitment
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow read access for authenticated users" ON job_applications
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow read access for authenticated users" ON staff_licenses
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow read access for authenticated users" ON attendance
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow read access for authenticated users" ON leave_requests
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow read access for authenticated users" ON training
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow read access for authenticated users" ON training_attendance
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow read access for authenticated users" ON performance_appraisals
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Allow insert/update/delete for authenticated users (HR operations)
CREATE POLICY "Allow insert for authenticated users" ON staff
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow update for authenticated users" ON staff
    FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow delete for authenticated users" ON staff
    FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Similar policies for other tables
CREATE POLICY "Allow insert for authenticated users" ON staff_documents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow update for authenticated users" ON staff_documents
    FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow delete for authenticated users" ON staff_documents
    FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
