-- Re-enable RLS After Testing
-- IMPORTANT: Run this after testing to restore security

-- 1. Re-enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;

-- 2. Verify RLS is re-enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('patients', 'service_prices', 'bills', 'insurance_claims')
ORDER BY tablename;

-- 3. Verify policies are still in place
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('patients', 'service_prices', 'bills', 'insurance_claims')
ORDER BY tablename, cmd;
