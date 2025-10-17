-- Add cash_amount field to patients table if it doesn't exist
DO $$
BEGIN
    -- Check if cash_amount column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'patients' 
        AND column_name = 'cash_amount'
    ) THEN
        -- Add the cash_amount column
        ALTER TABLE patients ADD COLUMN cash_amount TEXT;
        RAISE NOTICE 'Added cash_amount column to patients table';
    ELSE
        RAISE NOTICE 'cash_amount column already exists in patients table';
    END IF;
END $$;
