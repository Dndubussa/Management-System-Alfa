-- Fix RLS Policies for All Tables to Allow Authenticated Users Access
-- This will ensure authenticated users can access all data for the hospital management system

-- 1. Drop existing policies if they exist for all tables
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON patients;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON medical_records;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON appointments;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON prescriptions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON lab_orders;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON bills;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON notifications;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON service_prices;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON departments;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON referrals;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON insurance_claims;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON surgery_requests;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON ot_slots;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON ot_resources;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON ot_checklists;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON surgery_progress;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON ot_reports;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;

-- Drop insert policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON patients;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON medical_records;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON appointments;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON prescriptions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON lab_orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON bills;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON notifications;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON service_prices;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON departments;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON referrals;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON insurance_claims;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON surgery_requests;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON ot_slots;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON ot_resources;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON ot_checklists;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON surgery_progress;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON ot_reports;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;

-- Drop update policies
DROP POLICY IF EXISTS "Enable update for authenticated users" ON patients;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON medical_records;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON appointments;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON prescriptions;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON lab_orders;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON bills;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON notifications;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON service_prices;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON departments;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON referrals;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON insurance_claims;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON surgery_requests;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON ot_slots;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON ot_resources;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON ot_checklists;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON surgery_progress;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON ot_reports;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON users;

-- 2. Create new policies that allow authenticated users to read data (SELECT)
CREATE POLICY "Enable read access for authenticated users" ON patients
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for authenticated users" ON medical_records
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for authenticated users" ON appointments
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for authenticated users" ON prescriptions
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for authenticated users" ON lab_orders
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for authenticated users" ON bills
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for authenticated users" ON notifications
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for authenticated users" ON service_prices
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for authenticated users" ON departments
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for authenticated users" ON referrals
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for authenticated users" ON insurance_claims
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for authenticated users" ON surgery_requests
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for authenticated users" ON ot_slots
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for authenticated users" ON ot_resources
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for authenticated users" ON ot_checklists
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for authenticated users" ON surgery_progress
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for authenticated users" ON ot_reports
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for authenticated users" ON users
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- 3. Create new policies that allow authenticated users to insert data (INSERT)
CREATE POLICY "Enable insert for authenticated users" ON patients
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON medical_records
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON appointments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON prescriptions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON lab_orders
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON bills
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON notifications
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON service_prices
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON departments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON referrals
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON insurance_claims
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON surgery_requests
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON ot_slots
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON ot_resources
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON ot_checklists
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON surgery_progress
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON ot_reports
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON users
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Create new policies that allow authenticated users to update data (UPDATE)
CREATE POLICY "Enable update for authenticated users" ON patients
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON medical_records
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON appointments
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON prescriptions
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON lab_orders
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON bills
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON notifications
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON service_prices
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON departments
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON referrals
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON insurance_claims
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON surgery_requests
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON ot_slots
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON ot_resources
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON ot_checklists
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON surgery_progress
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON ot_reports
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON users
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Verify the policies were created
SELECT 
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename IN ('patients', 'medical_records', 'appointments', 'prescriptions', 'lab_orders', 'bills', 'notifications', 'service_prices', 'departments', 'referrals', 'insurance_claims', 'surgery_requests', 'ot_slots', 'ot_resources', 'ot_checklists', 'surgery_progress', 'ot_reports', 'users')
ORDER BY tablename, policyname;