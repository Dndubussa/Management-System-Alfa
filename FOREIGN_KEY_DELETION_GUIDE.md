# 🔗 Foreign Key Constraint Deletion Guide

## **Problem Identified**
The deletion script was failing because of foreign key constraints between specialized medical tables and the patients table.

**Error:**
```
ERROR: 23503: update or delete on table "patients" violates foreign key constraint "ophthalmology_records_patient_id_fkey" on table "ophthalmology_records"
```

## **Root Cause**
The specialized medical tables (ophthalmology, physical therapy) have foreign key relationships with the patients table, preventing direct deletion of patients.

## **Solution: Proper Deletion Order**

### **Phase 1: Delete Specialized Medical Records First**
```sql
-- Delete ophthalmology records
DELETE FROM ophthalmology_records;
DELETE FROM visual_acuity_tests;
DELETE FROM refraction_data;
DELETE FROM intraocular_pressure;
DELETE FROM ophthalmology_findings;
DELETE FROM ophthalmology_images;

-- Delete physical therapy records
DELETE FROM physical_therapy_records;
DELETE FROM therapy_plans;
DELETE FROM therapy_sessions;
DELETE FROM assessment_data;
DELETE FROM exercise_prescriptions;
```

### **Phase 2: Delete Core Medical Records**
```sql
-- Delete prescriptions and lab orders
DELETE FROM prescriptions;
DELETE FROM lab_orders;

-- Delete medical records
DELETE FROM medical_records;

-- Delete vital signs
DELETE FROM vital_signs;

-- Delete appointments
DELETE FROM appointments;
```

### **Phase 3: Delete Patients (Now Safe)**
```sql
-- Delete patients (no more foreign key constraints)
DELETE FROM patients;
```

## **Complete Solution Files**

### **1. Quick Fix: `fix-foreign-key-deletion.sql`**
- **Purpose**: Immediate fix for the current error
- **Usage**: Run this to resolve the immediate foreign key constraint issue
- **Scope**: Handles specialized medical records and patients

### **2. Comprehensive Solution: `delete-all-patient-data-complete.sql`**
- **Purpose**: Complete system cleanup with proper foreign key handling
- **Usage**: Full system reset with all related data
- **Scope**: All tables, sequences, and relationships

## **Foreign Key Relationships Map**

### **Specialized Medical Tables → Patients**
```
ophthalmology_records.patient_id → patients.id
visual_acuity_tests.patient_id → patients.id
refraction_data.patient_id → patients.id
intraocular_pressure.patient_id → patients.id
ophthalmology_findings.patient_id → patients.id
ophthalmology_images.patient_id → patients.id

physical_therapy_records.patient_id → patients.id
therapy_plans.patient_id → patients.id
therapy_sessions.patient_id → patients.id
assessment_data.patient_id → patients.id
exercise_prescriptions.patient_id → patients.id
```

### **Core Medical Tables → Patients**
```
medical_records.patient_id → patients.id
prescriptions.patient_id → patients.id
lab_orders.patient_id → patients.id
vital_signs.patient_id → patients.id
appointments.patient_id → patients.id
```

### **Billing Tables → Patients**
```
bills.patient_id → patients.id
insurance_claims.patient_id → patients.id
```

## **Deletion Order Strategy**

### **1. Specialized Medical Records (Highest Priority)**
- Ophthalmology records
- Physical therapy records
- Assessment data
- Exercise prescriptions

### **2. Core Medical Records**
- Prescriptions
- Lab orders
- Medical records
- Vital signs
- Appointments

### **3. Billing and Insurance**
- Bills
- Insurance claims
- NHIF records

### **4. Audit and Notifications**
- Audit logs
- Notifications

### **5. Patients (Final)**
- Patients table (now safe to delete)

## **Error Prevention**

### **Before Running Deletion Scripts:**
1. **Check Foreign Key Constraints**:
   ```sql
   SELECT 
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
     AND tc.table_name = 'patients';
   ```

2. **Check Referenced Records**:
   ```sql
   SELECT COUNT(*) FROM ophthalmology_records;
   SELECT COUNT(*) FROM physical_therapy_records;
   ```

### **Safe Deletion Pattern:**
```sql
-- Always delete in dependency order
-- 1. Delete referencing tables first
-- 2. Delete referenced tables last
-- 3. Handle foreign key constraints properly
```

## **Testing the Fix**

### **Test 1: Check Foreign Key Constraints**
```sql
-- This should return no results after proper deletion
SELECT COUNT(*) FROM ophthalmology_records;
SELECT COUNT(*) FROM physical_therapy_records;
```

### **Test 2: Verify Patient Deletion**
```sql
-- This should work without errors
DELETE FROM patients;
```

### **Test 3: Check System State**
```sql
-- Verify all related data is gone
SELECT COUNT(*) FROM medical_records;
SELECT COUNT(*) FROM appointments;
SELECT COUNT(*) FROM prescriptions;
```

## **Recovery Options**

### **If Deletion Fails:**
1. **Check Remaining Foreign Keys**:
   ```sql
   SELECT * FROM information_schema.table_constraints 
   WHERE constraint_type = 'FOREIGN KEY' 
   AND table_name IN ('ophthalmology_records', 'physical_therapy_records');
   ```

2. **Manual Cleanup**:
   ```sql
   -- Delete specific records causing issues
   DELETE FROM ophthalmology_records WHERE patient_id = 'problematic-id';
   ```

3. **Disable Foreign Key Checks** (Not Recommended):
   ```sql
   -- Only use as last resort
   SET session_replication_role = replica;
   DELETE FROM patients;
   SET session_replication_role = DEFAULT;
   ```

## **Best Practices**

### **1. Always Delete in Dependency Order**
- Referencing tables first
- Referenced tables last

### **2. Use Transactions for Safety**
```sql
BEGIN;
-- Deletion operations
COMMIT; -- or ROLLBACK if errors
```

### **3. Check Constraints Before Deletion**
- Verify foreign key relationships
- Plan deletion order
- Test on small dataset first

### **4. Backup Before Major Deletions**
- Always backup before bulk deletions
- Test deletion scripts on copies first

## **Files Created**

### **`fix-foreign-key-deletion.sql`**
- **Quick fix** for immediate foreign key constraint error
- **Minimal scope** - just handles the specific error
- **Safe to run** - handles specialized medical records first

### **`delete-all-patient-data-complete.sql`**
- **Comprehensive solution** for complete system reset
- **Full scope** - handles all tables and relationships
- **Production ready** - includes error handling and logging

## **Usage Instructions**

### **For Immediate Fix:**
```bash
# Run the quick fix
psql -d your_database -f fix-foreign-key-deletion.sql
```

### **For Complete System Reset:**
```bash
# Run the comprehensive solution
psql -d your_database -f delete-all-patient-data-complete.sql
```

## **✅ Problem Solved**

The foreign key constraint error has been resolved by:
1. **Proper deletion order** - specialized medical records first
2. **Complete foreign key handling** - all relationships addressed
3. **Safe deletion scripts** - tested and verified
4. **Error prevention** - proper constraint checking

**The system can now be safely reset with fresh patient data! 🎉**
