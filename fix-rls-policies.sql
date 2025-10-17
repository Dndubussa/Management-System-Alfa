-- Fix RLS Policies for Data Access
-- This will ensure authenticated users can access the data

-- 1. Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON patients;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON service_prices;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON bills;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON insurance_claims;

-- 2. Create new policies that allow authenticated users to read data
CREATE POLICY "Enable read access for authenticated users" ON patients
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for authenticated users" ON service_prices
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for authenticated users" ON bills
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for authenticated users" ON insurance_claims
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- 3. Also allow authenticated users to insert/update data
CREATE POLICY "Enable insert for authenticated users" ON patients
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON patients
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON service_prices
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON service_prices
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 4. Verify the policies were created
SELECT 
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename IN ('patients', 'service_prices', 'bills', 'insurance_claims')
ORDER BY tablename, policyname;