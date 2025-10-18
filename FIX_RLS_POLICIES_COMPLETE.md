# Fix RLS Policies for All Tables

## 🚨 Problem

The application is experiencing 400 and 401 errors when creating appointments and notifications. This is likely due to Row Level Security (RLS) policies that are not properly configured for authenticated users.

## 🔧 Solution

This script fixes RLS policies for all tables in the hospital management system by:

1. **Dropping existing restrictive policies** that use `auth.role() = 'authenticated'`
2. **Creating new permissive policies** that use `auth.uid() IS NOT NULL`
3. **Ensuring all tables** have proper access for authenticated users

## 📋 How to Apply the Fix

### Step 1: Execute the SQL Script

Run the `fix-rls-policies-complete.sql` script in your Supabase SQL Editor:

1. Open your Supabase Dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `fix-rls-policies-complete.sql`
4. Run the script

### Step 2: Test the Fix

After running the script:

1. **Refresh your application**
2. **Login as any user (receptionist, doctor, etc.)**
3. **Try creating an appointment** - it should now work without errors
4. **Check browser console** - you should see successful data operations

## 🎯 Why This Fix Works

The original RLS policies used `auth.role() = 'authenticated'`, which doesn't work reliably with Supabase's authentication system. The new policies use `auth.uid() IS NOT NULL`, which properly checks if a user is authenticated and allows them to access the data.

## 🔒 Security Note

These policies are designed for a hospital management system where authenticated users (staff) need access to all data. The policies ensure that:
- ✅ Only authenticated users can access data
- ✅ Anonymous users cannot access any data
- ✅ All authenticated users can view and modify data as needed for their roles

## 📊 Tables Covered

This script fixes RLS policies for all tables in the system:
- patients
- medical_records
- appointments
- prescriptions
- lab_orders
- bills
- notifications
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

The script includes a verification query at the end that shows all policies that were created. You can run this query separately to verify the policies are in place.