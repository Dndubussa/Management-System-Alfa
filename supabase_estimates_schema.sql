-- Service Estimates Schema for Alfa Specialized Hospital Management System

-- Service estimates table
CREATE TABLE IF NOT EXISTS public.service_estimates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  estimate_number TEXT UNIQUE NOT NULL,
  patient_name TEXT,
  patient_phone TEXT,
  patient_email TEXT,
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  discount_reason TEXT,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('draft', 'sent', 'accepted', 'expired', 'converted')) NOT NULL DEFAULT 'draft',
  created_by UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_estimates_estimate_number ON public.service_estimates(estimate_number);
CREATE INDEX IF NOT EXISTS idx_service_estimates_patient_phone ON public.service_estimates(patient_phone);
CREATE INDEX IF NOT EXISTS idx_service_estimates_status ON public.service_estimates(status);
CREATE INDEX IF NOT EXISTS idx_service_estimates_created_by ON public.service_estimates(created_by);
CREATE INDEX IF NOT EXISTS idx_service_estimates_created_at ON public.service_estimates(created_at);
CREATE INDEX IF NOT EXISTS idx_service_estimates_valid_until ON public.service_estimates(valid_until);

-- Enable Row Level Security
ALTER TABLE public.service_estimates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow read access for authenticated users" ON public.service_estimates
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow insert for authenticated users" ON public.service_estimates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow update for authenticated users" ON public.service_estimates
  FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow delete for authenticated users" ON public.service_estimates
  FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON public.service_estimates TO authenticated;
GRANT ALL ON public.service_estimates TO service_role;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_service_estimates_updated_at
  BEFORE UPDATE ON public.service_estimates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically expire estimates
CREATE OR REPLACE FUNCTION expire_old_estimates()
RETURNS void AS $$
BEGIN
  UPDATE public.service_estimates
  SET status = 'expired'
  WHERE status IN ('draft', 'sent')
    AND valid_until < NOW()
    AND updated_at < NOW() - INTERVAL '1 day'; -- Only update if not updated recently
END;
$$ language 'plpgsql';

-- Create a view for active estimates (non-expired)
CREATE OR REPLACE VIEW public.active_estimates AS
SELECT 
  se.*,
  u.name as created_by_name,
  u.email as created_by_email
FROM public.service_estimates se
LEFT JOIN public.users u ON se.created_by = u.id
WHERE se.status NOT IN ('expired', 'converted')
  AND se.valid_until > NOW();

-- Grant access to the view
GRANT SELECT ON public.active_estimates TO authenticated;
GRANT SELECT ON public.active_estimates TO service_role;

-- Add comments for documentation
COMMENT ON TABLE public.service_estimates IS 'Stores service cost estimates and quotations for patients';
COMMENT ON COLUMN public.service_estimates.estimate_number IS 'Unique estimate number in format EST-YYYY-NNNN';
COMMENT ON COLUMN public.service_estimates.services IS 'JSON array of selected services with quantities and prices';
COMMENT ON COLUMN public.service_estimates.status IS 'Estimate status: draft, sent, accepted, expired, converted';
COMMENT ON COLUMN public.service_estimates.valid_until IS 'Date until which the estimate is valid';
COMMENT ON COLUMN public.service_estimates.created_by IS 'ID of the receptionist who created the estimate';
