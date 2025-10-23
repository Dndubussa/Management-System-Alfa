# Fresh Start Guide - Delete All Patient Data

## 🚨 WARNING
These scripts will **permanently delete ALL patient data** from your database. This action cannot be undone!

## 📋 What Gets Deleted

### Patient-Related Tables:
- ✅ **patients** - All patient records
- ✅ **patient_queue** - All queue items
- ✅ **vital_signs** - All vital signs records
- ✅ **medical_records** - All medical records
- ✅ **appointments** - All appointments
- ✅ **prescriptions** - All prescriptions
- ✅ **lab_orders** - All lab orders
- ✅ **bills** - All bills
- ✅ **insurance_claims** - All insurance claims
- ✅ **notifications** - Patient-related notifications

### What's Preserved:
- ✅ **users** - Staff/doctor accounts remain
- ✅ **departments** - Department structure
- ✅ **service_prices** - Service pricing
- ✅ **inventory_items** - Inventory data
- ✅ **medication_inventory** - Medication stock
- ✅ **system settings** - Configuration data

## 🔧 How to Use

### Option 1: Comprehensive Script (Recommended)
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Copy and paste the contents of `delete-all-patient-data.sql`
5. Click **Run**
6. Review the output messages

### Option 2: Simple Script (Quick)
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Copy and paste the contents of `delete-patients-simple.sql`
5. Click **Run**

## 📊 Expected Output

### Comprehensive Script Output:
```
NOTICE: Found X patients to delete
NOTICE: Found X patient queue items to delete
NOTICE: Found X vital signs records to delete
NOTICE: Found X medical records to delete
NOTICE: Found X appointments to delete
NOTICE: Found X prescriptions to delete
NOTICE: Found X lab orders to delete
NOTICE: Found X bills to delete
NOTICE: Found X insurance claims to delete
NOTICE: Found X notifications to delete
NOTICE: Starting deletion process...
NOTICE: Deleted patient-related notifications
NOTICE: Deleted all insurance claims
NOTICE: Deleted all bills
NOTICE: Deleted all lab orders
NOTICE: Deleted all prescriptions
NOTICE: Deleted all appointments
NOTICE: Deleted all medical records
NOTICE: Deleted all vital signs
NOTICE: Deleted all patient queue items
NOTICE: Deleted all patients
NOTICE: Reset patient MRN sequence
NOTICE: ✅ All patient data deleted successfully!
NOTICE: The system is now ready for fresh patient data.
NOTICE: ✅ All patients deleted successfully
NOTICE: ✅ All patient queue items deleted successfully
NOTICE: ✅ All vital signs records deleted successfully
NOTICE: 🎉 System is ready for fresh start!
```

### Simple Script Output:
```
NOTICE: Reset patient MRN sequence to start from P001
message: All patient data deleted successfully! System ready for fresh start.
```

## ✅ After Running the Script

### What You'll Have:
- ✅ **Clean database** with no patient data
- ✅ **Fresh MRN sequence** starting from P001
- ✅ **All system tables** intact and ready
- ✅ **Staff accounts** preserved
- ✅ **Service prices** and inventory preserved

### What You Can Do Next:
1. **Register new patients** - They'll get fresh MRNs starting from P001
2. **Test the workflow** - Registration → Triage → Doctor
3. **Verify functionality** - All features should work with clean data
4. **Start fresh** - No old data to interfere with testing

## 🔍 Verification Commands

After running the script, verify the deletion:

```sql
-- Check patient count (should be 0)
SELECT COUNT(*) as patient_count FROM patients;

-- Check patient queue count (should be 0)
SELECT COUNT(*) as queue_count FROM patient_queue;

-- Check vital signs count (should be 0)
SELECT COUNT(*) as vitals_count FROM vital_signs;

-- Check appointments count (should be 0)
SELECT COUNT(*) as appointments_count FROM appointments;

-- Check medical records count (should be 0)
SELECT COUNT(*) as records_count FROM medical_records;
```

## 🆘 Troubleshooting

### If you get foreign key constraint errors:
- The comprehensive script handles this automatically
- If using the simple script, run the commands in the exact order shown

### If some data remains:
- Check for any custom foreign key constraints
- Manually delete remaining records
- Verify the deletion with the verification commands

### If you need to restore data:
- **You cannot restore** after running these scripts
- Make sure you have backups if you need to restore data
- Consider exporting data before running the deletion scripts

## 📞 Support
If you encounter any issues:
1. Check the error messages in the SQL editor
2. Verify table names match your database schema
3. Ensure you have proper permissions to delete data
4. Contact support with specific error messages
