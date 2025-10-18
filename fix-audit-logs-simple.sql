-- Simple fix for audit_logs foreign key constraint violation
-- This makes user_id nullable so audit logs can be created even if user doesn't exist

-- Make user_id nullable
ALTER TABLE audit_logs 
ALTER COLUMN user_id DROP NOT NULL;

-- Update the foreign key constraint to handle NULL values
ALTER TABLE audit_logs 
DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

ALTER TABLE audit_logs 
ADD CONSTRAINT audit_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Verify the change
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'audit_logs' 
  AND column_name = 'user_id';

SELECT 'Simple foreign key fix completed' as status;
