-- Fix notifications table to support per-user read status
-- This script updates the is_read column to support JSON object for per-user tracking

-- First, let's check the current structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'notifications' AND column_name = 'is_read';

-- Step 1: Add a new temporary column for the JSON data
ALTER TABLE notifications ADD COLUMN is_read_new jsonb DEFAULT '{}'::jsonb;

-- Step 2: Copy existing boolean data to the new column
-- Since we can't track per-user with boolean, we'll start fresh with empty objects
UPDATE notifications SET is_read_new = '{}'::jsonb;

-- Step 3: Drop the old column
ALTER TABLE notifications DROP COLUMN is_read;

-- Step 4: Rename the new column to the original name
ALTER TABLE notifications RENAME COLUMN is_read_new TO is_read;

-- Step 5: Set NOT NULL constraint and default
ALTER TABLE notifications ALTER COLUMN is_read SET NOT NULL;
ALTER TABLE notifications ALTER COLUMN is_read SET DEFAULT '{}'::jsonb;

-- Add a comment to explain the structure
COMMENT ON COLUMN notifications.is_read IS 'JSON object tracking read status per user: {"user_id": true/false}';

-- Verify the change
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'notifications' AND column_name = 'is_read';

-- Test the new structure with a sample update
-- This is just for testing - you can remove this part
DO $$
BEGIN
  -- Update a sample notification to show the new structure
  UPDATE notifications 
  SET is_read = '{"sample-user-id": true}'::jsonb 
  WHERE id IN (SELECT id FROM notifications LIMIT 1);
  
  RAISE NOTICE 'Sample notification updated with new is_read structure';
END $$;
