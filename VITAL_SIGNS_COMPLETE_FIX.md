# 🚨 Complete Fix for Vital Signs API Error

## The Problem
You're getting this error:
```
SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
```

This happens because:
1. ✅ **Backend server IS running** (we confirmed this)
2. ❌ **Database table is missing or has wrong structure**
3. ❌ **Environment variables might be missing**

## 🔧 Step-by-Step Fix

### Step 1: Fix the Database Table

**Run this SQL script in your Supabase SQL Editor:**

```sql
-- Create vital_signs table if it doesn't exist
CREATE TABLE IF NOT EXISTS vital_signs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    queue_id UUID REFERENCES patient_queue(id) ON DELETE SET NULL,
    recorded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    temperature DECIMAL(4,1),
    pulse INTEGER,
    respiratory_rate INTEGER,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    bmi DECIMAL(4,1),
    muac DECIMAL(4,1),
    oxygen_saturation INTEGER,
    pain_level INTEGER,
    urgency VARCHAR(20) DEFAULT 'normal',
    notes TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view vital signs" ON vital_signs
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role IN ('doctor', 'nurse', 'admin', 'ophthalmologist', 'physical-therapist')
        )
    );

CREATE POLICY "Nurses can insert vital signs" ON vital_signs
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM users WHERE role IN ('nurse', 'admin')
        )
    );
```

### Step 2: Verify Environment Variables

**Check your `.env.local` file has:**
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_KEY=your-anon-key-here
```

### Step 3: Test the Fix

**Run this command to test:**
```bash
node test-vital-signs-api.js
```

**Expected result:**
```
✅ Vital signs API is working correctly!
```

### Step 4: Test in Browser

1. **Go to** the Triage & Vitals page
2. **Fill out** the form with valid data
3. **Click Save** - should work without errors

## 🚨 If Still Not Working

### Check Database Connection
```bash
node test-database-connection.js
```

### Check Server Logs
Look at your terminal where `node server.js` is running for any error messages.

### Verify Table Exists
In Supabase SQL Editor, run:
```sql
SELECT * FROM vital_signs LIMIT 1;
```

## ✅ Success Indicators

When everything is working:
- ✅ No more "SyntaxError" in console
- ✅ Vital signs save successfully
- ✅ No error messages in the UI
- ✅ Server logs show successful API calls

## 🆘 Still Having Issues?

1. **Check Supabase project** is active
2. **Verify database credentials** are correct
3. **Ensure user has proper role** (nurse, doctor, admin)
4. **Check RLS policies** are not blocking access

The most likely issue is the missing `vital_signs` table in your database!
