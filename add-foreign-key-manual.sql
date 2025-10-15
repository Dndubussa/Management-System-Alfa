-- Add Foreign Key Constraint for Service Code Mappings
-- Execute this in your Supabase SQL Editor

-- Step 1: Add the foreign key constraint
ALTER TABLE public.service_code_mappings 
ADD CONSTRAINT fk_service_code_mappings_service_price_id 
FOREIGN KEY (service_price_id) 
REFERENCES public.service_prices(id) 
ON DELETE CASCADE;

-- Step 2: Verify the constraint was added
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='service_code_mappings';

-- Step 3: Test the service code mappings endpoint
SELECT COUNT(*) as mapping_count FROM public.service_code_mappings;
