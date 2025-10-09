// This script creates policies to allow service role access to all tables
// For development purposes only - do not use in production

const policies = `
-- Enable read access for all users on all tables
CREATE POLICY "Enable read access for all users" ON "public"."patients"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."medical_records"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."prescriptions"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."lab_orders"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."appointments"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."users"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."notifications"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."service_prices"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."bills"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."bill_items"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."departments"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."referrals"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."insurance_claims"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- Enable insert for all users on all tables
CREATE POLICY "Enable insert for all users" ON "public"."patients"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON "public"."medical_records"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON "public"."prescriptions"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON "public"."lab_orders"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON "public"."appointments"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON "public"."users"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON "public"."notifications"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON "public"."service_prices"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON "public"."bills"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON "public"."bill_items"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON "public"."departments"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON "public"."referrals"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON "public"."insurance_claims"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

-- Enable update for all users on all tables
CREATE POLICY "Enable update for all users" ON "public"."patients"
AS PERMISSIVE FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON "public"."medical_records"
AS PERMISSIVE FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON "public"."prescriptions"
AS PERMISSIVE FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON "public"."lab_orders"
AS PERMISSIVE FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON "public"."appointments"
AS PERMISSIVE FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON "public"."users"
AS PERMISSIVE FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON "public"."notifications"
AS PERMISSIVE FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON "public"."service_prices"
AS PERMISSIVE FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON "public"."bills"
AS PERMISSIVE FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON "public"."bill_items"
AS PERMISSIVE FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON "public"."departments"
AS PERMISSIVE FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON "public"."referrals"
AS PERMISSIVE FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON "public"."insurance_claims"
AS PERMISSIVE FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Enable delete for all users on all tables
CREATE POLICY "Enable delete for all users" ON "public"."patients"
AS PERMISSIVE FOR DELETE
TO public
USING (true);

CREATE POLICY "Enable delete for all users" ON "public"."medical_records"
AS PERMISSIVE FOR DELETE
TO public
USING (true);

CREATE POLICY "Enable delete for all users" ON "public"."prescriptions"
AS PERMISSIVE FOR DELETE
TO public
USING (true);

CREATE POLICY "Enable delete for all users" ON "public"."lab_orders"
AS PERMISSIVE FOR DELETE
TO public
USING (true);

CREATE POLICY "Enable delete for all users" ON "public"."appointments"
AS PERMISSIVE FOR DELETE
TO public
USING (true);

CREATE POLICY "Enable delete for all users" ON "public"."users"
AS PERMISSIVE FOR DELETE
TO public
USING (true);

CREATE POLICY "Enable delete for all users" ON "public"."notifications"
AS PERMISSIVE FOR DELETE
TO public
USING (true);

CREATE POLICY "Enable delete for all users" ON "public"."service_prices"
AS PERMISSIVE FOR DELETE
TO public
USING (true);

CREATE POLICY "Enable delete for all users" ON "public"."bills"
AS PERMISSIVE FOR DELETE
TO public
USING (true);

CREATE POLICY "Enable delete for all users" ON "public"."bill_items"
AS PERMISSIVE FOR DELETE
TO public
USING (true);

CREATE POLICY "Enable delete for all users" ON "public"."departments"
AS PERMISSIVE FOR DELETE
TO public
USING (true);

CREATE POLICY "Enable delete for all users" ON "public"."referrals"
AS PERMISSIVE FOR DELETE
TO public
USING (true);

CREATE POLICY "Enable delete for all users" ON "public"."insurance_claims"
AS PERMISSIVE FOR DELETE
TO public
USING (true);
`;

console.log("RLS policies to run in Supabase SQL editor:");
console.log(policies);