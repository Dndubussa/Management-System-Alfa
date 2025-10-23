# Patient Queue Table Setup Guide

## 🚨 Issue
The application is showing 400 errors when trying to access the `patient_queue` table because it doesn't exist in the database yet.

## 🔧 Solution
You need to run the SQL script to create the `patient_queue` and `vital_signs` tables in your Supabase database.

## 📋 Steps to Fix

### 1. Open Supabase SQL Editor
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**

### 2. Run the Setup Script
Copy and paste the entire contents of `setup-patient-queue-table.sql` into the SQL editor and click **Run**.

### 3. Verify the Setup
After running the script, you should see messages like:
```
NOTICE: Created patient_queue table
NOTICE: Added workflow_stage column to patient_queue table
NOTICE: Created vital_signs table
NOTICE: ✅ Patient queue and vital signs tables setup completed successfully!
```

### 4. Test the Application
1. Refresh your application
2. Try clicking on "Triage Queue" from the receptionist dashboard
3. The 400 errors should be resolved

## 🗂️ What the Script Creates

### Tables Created:
- **`patient_queue`** - Manages patient workflow through the hospital
- **`vital_signs`** - Stores patient vital signs from triage

### Key Features:
- ✅ **Workflow stages**: reception → triage → doctor → lab → pharmacy → completed
- ✅ **Doctor assignment**: Tracks which doctor is assigned to each patient
- ✅ **Priority levels**: low, normal, high, urgent, emergency
- ✅ **Status tracking**: waiting, in-progress, completed, cancelled
- ✅ **Row Level Security**: Proper access controls
- ✅ **Indexes**: Optimized for performance
- ✅ **Triggers**: Automatic timestamp updates

## 🔍 Verification Commands

After running the script, you can verify the setup by running these queries in the SQL editor:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('patient_queue', 'vital_signs');

-- Check patient_queue structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'patient_queue' 
ORDER BY ordinal_position;

-- Check vital_signs structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'vital_signs' 
ORDER BY ordinal_position;
```

## 🚀 Expected Results

After running the setup script:

1. **No more 400 errors** when accessing patient queue
2. **Triage Queue page loads** without crashes
3. **Patient workflow works** properly:
   - New patients → Triage Queue → Doctor Queue
   - Returning patients → Triage Queue → Doctor Queue
4. **Nurses can process** patients in triage
5. **Doctors can see** assigned patients in their queue

## 🆘 Troubleshooting

### If you still get 400 errors:
1. Check that the script ran without errors
2. Verify tables exist: `SELECT * FROM patient_queue LIMIT 1;`
3. Check RLS policies are enabled
4. Ensure you have proper permissions

### If tables already exist:
The script is idempotent and will only add missing columns/features without breaking existing data.

## 📞 Support
If you continue to have issues after running the setup script, please share:
1. Any error messages from the SQL editor
2. The output from the verification queries
3. Any remaining 400 errors in the browser console
