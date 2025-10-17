-- Clean up duplicate RLS policies
-- This will remove duplicate policies and keep only the working ones

-- 1. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Authenticated users can view patients" ON patients;
DROP POLICY IF EXISTS "Authenticated users can insert patients" ON patients;
DROP POLICY IF EXISTS "Authenticated users can update patients" ON patients;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON patients;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON patients;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON patients;

DROP POLICY IF EXISTS "Authenticated users can view service prices" ON service_prices;
DROP POLICY IF EXISTS "Authenticated users can insert service prices" ON service_prices;
DROP POLICY IF EXISTS "Authenticated users can update service prices" ON service_prices;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON service_prices;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON service_prices;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON service_prices;

DROP POLICY IF EXISTS "Authenticated users can view bills" ON bills;
DROP POLICY IF EXISTS "Authenticated users can insert bills" ON bills;
DROP POLICY IF EXISTS "Authenticated users can update bills" ON bills;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON bills;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON insurance_claims;

-- 2. Create clean, simple policies
CREATE POLICY "patients_select_policy" ON patients
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "patients_insert_policy" ON patients
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "patients_update_policy" ON patients
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "service_prices_select_policy" ON service_prices
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "service_prices_insert_policy" ON service_prices
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "service_prices_update_policy" ON service_prices
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "bills_select_policy" ON bills
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "bills_insert_policy" ON bills
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "bills_update_policy" ON bills
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "insurance_claims_select_policy" ON insurance_claims
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "insurance_claims_insert_policy" ON insurance_claims
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "insurance_claims_update_policy" ON insurance_claims
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 3. Verify the clean policies
SELECT 
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename IN ('patients', 'service_prices', 'bills', 'insurance_claims')
ORDER BY tablename, cmd, policyname;
