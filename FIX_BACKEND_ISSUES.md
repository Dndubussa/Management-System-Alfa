# Fix Backend Issues

## 🚨 Problem

The application is experiencing 400 and 401 errors when creating appointments and notifications. This is likely due to:

1. **Row Level Security (RLS) policies** not properly configured
2. **Environment variables** not properly set
3. **Database connection issues**

## 🔧 Solution

This guide provides multiple approaches to fix these issues:

## 📋 Approach 1: Run the Automated Fix Script

### Step 1: Run the fix script

```bash
npm run fix:backend
```

This script will:
- Check if all required environment variables are set
- Test Supabase connection
- Test access to appointments and notifications tables
- Provide specific error messages if issues are found

### Step 2: Review the output

The script will tell you exactly what's wrong and how to fix it.

## 📋 Approach 2: Fix RLS Policies Manually

### Step 1: Run the RLS fix SQL script

1. Open your Supabase Dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `fix-rls-policies-complete.sql`
4. Run the script

### Step 2: Verify the fix

Run the test script to verify the fix worked:

```bash
npm run test:connection
```

## 📋 Approach 3: Check Environment Variables

### Step 1: Verify your .env.local file

Make sure your `.env.local` file contains all required variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
```

### Step 2: Restart the server

```bash
npm run dev:full
```

## 🎯 Expected Results

After applying the fixes, you should see:

1. ✅ No 400 errors when creating appointments
2. ✅ No 401 errors when creating notifications
3. ✅ Appointments are created successfully with proper data
4. ✅ Notifications are created successfully

## 🔍 Debugging Tips

### Check Browser Console

Look for these good signs:
```javascript
// Good signs:
✅ "Appointment created successfully"
✅ "Notification created successfully"
✅ No "Cannot read properties of null" errors

// Bad signs:
❌ "400 Bad Request"
❌ "401 Unauthorized"
❌ "Cannot read properties of null"
```

### Test Direct Database Access

Run this in your browser console to test:

```javascript
// Test direct access
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

// Test appointments
const { data: appointments, error } = await supabase
  .from('appointments')
  .select('*')
  .limit(5);

console.log('Appointments:', appointments?.length || 0);
console.log('Error:', error);
```

## 🛡️ Security Note

These fixes ensure that:
- Only authenticated users can access data
- Anonymous users cannot access any data
- All authenticated users can view and modify data as needed for their roles

## 📊 Tables Covered

The RLS fix covers all tables in the system:
- appointments
- notifications
- patients
- medical_records
- prescriptions
- lab_orders
- bills
- service_prices
- departments
- referrals
- insurance_claims
- surgery_requests
- ot_slots
- ot_resources
- ot_checklists
- surgery_progress
- ot_reports
- users

## 🔄 Verification

After applying the fixes, run the verification script:

```bash
npm run test:connection
```

This will confirm that all connections and access permissions are working properly.