-- Vercel Deployment: Row Level Security Setup
-- This script sets up RLS policies for secure access without service role key

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE surgery_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ot_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ot_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ot_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE surgery_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ot_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_prices ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Patients table policies
CREATE POLICY "Authenticated users can view patients" ON patients
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert patients" ON patients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update patients" ON patients
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Medical records policies
CREATE POLICY "Authenticated users can view medical records" ON medical_records
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert medical records" ON medical_records
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update medical records" ON medical_records
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Appointments policies
CREATE POLICY "Authenticated users can view appointments" ON appointments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert appointments" ON appointments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update appointments" ON appointments
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Prescriptions policies
CREATE POLICY "Authenticated users can view prescriptions" ON prescriptions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert prescriptions" ON prescriptions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update prescriptions" ON prescriptions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Lab orders policies
CREATE POLICY "Authenticated users can view lab orders" ON lab_orders
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert lab orders" ON lab_orders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update lab orders" ON lab_orders
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Bills policies
CREATE POLICY "Authenticated users can view bills" ON bills
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert bills" ON bills
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update bills" ON bills
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Notifications policies
CREATE POLICY "Authenticated users can view notifications" ON notifications
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert notifications" ON notifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update notifications" ON notifications
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Departments policies
CREATE POLICY "Authenticated users can view departments" ON departments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert departments" ON departments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update departments" ON departments
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Service prices policies
CREATE POLICY "Authenticated users can view service prices" ON service_prices
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert service prices" ON service_prices
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update service prices" ON service_prices
    FOR UPDATE USING (auth.role() = 'authenticated');

-- ICD codes policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view ICD10 codes" ON icd10_codes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view ICD11 codes" ON icd11_codes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view CPT4 codes" ON cpt4_codes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view Tanzania service codes" ON tanzania_service_codes
    FOR SELECT USING (auth.role() = 'authenticated');

-- Service code mappings policies
CREATE POLICY "Authenticated users can view service code mappings" ON service_code_mappings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert service code mappings" ON service_code_mappings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update service code mappings" ON service_code_mappings
    FOR UPDATE USING (auth.role() = 'authenticated');
