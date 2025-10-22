-- Insurance Providers Table Schema
-- This script creates the insurance_providers table and related functionality

-- ==============================================
-- HELPER FUNCTIONS
-- ==============================================

-- Function to check if table exists
CREATE OR REPLACE FUNCTION table_exists(table_name text) RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if column exists
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text) RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1 
        AND column_name = $2
    );
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- CREATE INSURANCE PROVIDERS TABLE
-- ==============================================

-- Create insurance_providers table if it doesn't exist
CREATE TABLE IF NOT EXISTS insurance_providers (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    code text UNIQUE NOT NULL,
    contact_person text,
    phone text,
    email text,
    address text,
    tariff_codes text[], -- Array of tariff codes
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ==============================================
-- CREATE INDEXES
-- ==============================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_insurance_providers_name ON insurance_providers(name);
CREATE INDEX IF NOT EXISTS idx_insurance_providers_code ON insurance_providers(code);
CREATE INDEX IF NOT EXISTS idx_insurance_providers_is_active ON insurance_providers(is_active);

-- ==============================================
-- ENABLE ROW LEVEL SECURITY
-- ==============================================

-- Enable RLS
ALTER TABLE insurance_providers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Allow all authenticated users to view insurance providers" ON insurance_providers;
CREATE POLICY "Allow all authenticated users to view insurance providers" ON insurance_providers
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all authenticated users to insert insurance providers" ON insurance_providers;
CREATE POLICY "Allow all authenticated users to insert insurance providers" ON insurance_providers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all authenticated users to update insurance providers" ON insurance_providers;
CREATE POLICY "Allow all authenticated users to update insurance providers" ON insurance_providers
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all authenticated users to delete insurance providers" ON insurance_providers;
CREATE POLICY "Allow all authenticated users to delete insurance providers" ON insurance_providers
  FOR DELETE USING (auth.role() = 'authenticated');

-- ==============================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ==============================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_insurance_providers_updated_at ON insurance_providers;
CREATE TRIGGER update_insurance_providers_updated_at
    BEFORE UPDATE ON insurance_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- INSERT SAMPLE DATA
-- ==============================================

-- Insert sample insurance providers
INSERT INTO insurance_providers (name, code, contact_person, phone, email, address, tariff_codes) VALUES
('National Health Insurance Fund', 'NHIF', 'John Mwalimu', '+255 22 123 4567', 'info@nhif.or.tz', 'Dar es Salaam, Tanzania', ARRAY['SHA001', 'SHA002', 'SHA003']),
('AAR Insurance Tanzania', 'AAR', 'Sarah Kimaro', '+255 22 234 5678', 'info@aar.co.tz', 'Dar es Salaam, Tanzania', ARRAY['AAR001', 'AAR002', 'AAR003']),
('Jubilee Insurance Tanzania', 'JUBILEE', 'Michael Mwamba', '+255 22 345 6789', 'info@jubilee.co.tz', 'Dar es Salaam, Tanzania', ARRAY['JUB001', 'JUB002', 'JUB003']),
('Alliance Insurance', 'ALLIANCE', 'Grace Mwangi', '+255 22 456 7890', 'info@alliance.co.tz', 'Dar es Salaam, Tanzania', ARRAY['ALL001', 'ALL002', 'ALL003']),
('Sanlam Insurance Tanzania', 'SANLAM', 'David Mwangi', '+255 22 567 8901', 'info@sanlam.co.tz', 'Dar es Salaam, Tanzania', ARRAY['SAN001', 'SAN002', 'SAN003'])
ON CONFLICT (code) DO NOTHING;

-- ==============================================
-- CLEANUP HELPER FUNCTIONS
-- ==============================================

-- Drop helper functions after use
DROP FUNCTION IF EXISTS table_exists(text);
DROP FUNCTION IF EXISTS column_exists(text, text);

-- ==============================================
-- SUCCESS MESSAGE
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE 'Insurance providers table created successfully!';
    RAISE NOTICE 'Sample data inserted: 5 insurance providers';
    RAISE NOTICE 'Table includes: NHIF, AAR, Jubilee, Alliance, Sanlam';
END $$;
