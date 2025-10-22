# Workflow Implementation Guide

This guide provides step-by-step instructions for implementing the "registration → triage → doctor" workflow in the Alfa Specialized Hospital Management System.

## 📋 **Prerequisites**

- Supabase database access
- Admin privileges to modify database schema
- Backup of current database (recommended)

## 🚀 **Implementation Steps**

### **Step 1: Verify Current State**

First, check what's already in your database:

```sql
-- Run the verification script
\i workflow-verification-schema.sql
```

This will show you:
- Which tables already exist
- Current constraints and columns
- Data counts
- What needs to be implemented

### **Step 2: Implement Workflow Schema**

If the verification shows missing components, run the implementation script:

```sql
-- Run the implementation script
\i workflow-implementation-schema.sql
```

This will:
- ✅ Create `patient_queue` table
- ✅ Create `vital_signs` table
- ✅ Update `users` table to include 'nurse' and 'hr' roles
- ✅ Update `notifications` table with new columns and types
- ✅ Add indexes for performance
- ✅ Create views for common queries
- ✅ Set up Row Level Security (RLS) policies
- ✅ Add triggers for automatic updates

### **Step 3: Verify Implementation**

Run the verification script again to confirm everything was created successfully:

```sql
\i workflow-verification-schema.sql
```

You should see:
- ✅ All workflow tables exist
- ✅ All constraints updated
- ✅ All indexes created
- ✅ RLS policies enabled

### **Step 4: Test the Implementation**

Test the new workflow with sample data:

```sql
-- Insert a test patient (if you don't have one)
INSERT INTO patients (mrn, first_name, last_name, date_of_birth, gender, phone, address, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, insurance_provider, insurance_membership_number)
VALUES ('P001', 'Test', 'Patient', '1990-01-01', 'male', '123456789', 'Test Address', 'Emergency Contact', '987654321', 'spouse', 'Direct', '');

-- Add patient to queue
INSERT INTO patient_queue (patient_id, department, priority, status, workflow_stage)
SELECT id, 'general', 'normal', 'waiting', 'reception' FROM patients WHERE mrn = 'P001';

-- Check the queue
SELECT * FROM active_queue_with_patients;
```

## 🔄 **Rollback Instructions**

If you need to undo the changes:

```sql
-- Run the rollback script
\i workflow-rollback-schema.sql
```

This will:
- ❌ Remove workflow tables
- ❌ Revert constraint changes
- ❌ Remove new columns
- ❌ Clean up indexes and triggers

## 📊 **New Database Structure**

### **patient_queue Table**
```sql
- id (uuid, primary key)
- patient_id (uuid, foreign key to patients)
- department (text)
- priority (normal, urgent, emergency)
- status (waiting, in-progress, completed, cancelled)
- workflow_stage (reception, triage, doctor, lab, pharmacy, completed)
- estimated_wait_time (integer, minutes)
- actual_wait_time (integer, minutes)
- called_at (timestamp)
- started_at (timestamp)
- completed_at (timestamp)
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### **vital_signs Table**
```sql
- id (uuid, primary key)
- patient_id (uuid, foreign key to patients)
- queue_id (uuid, foreign key to patient_queue)
- recorded_by (uuid, nurse user id)
- recorded_at (timestamp)
- temperature (numeric)
- pulse (integer)
- respiratory_rate (integer)
- blood_pressure_systolic (integer)
- blood_pressure_diastolic (integer)
- height (numeric)
- weight (numeric)
- bmi (numeric)
- oxygen_saturation (integer)
- pain_level (integer, 0-10)
- urgency (critical, urgent, normal)
- notes (text)
```

### **Updated notifications Table**
```sql
-- New columns added:
- priority (low, normal, high, urgent)
- workflow_stage (text)
- patient_id (uuid, foreign key to patients)

-- New notification types:
- triage
- workflow
```

## 🎯 **Workflow Process**

After implementation, the workflow will be:

1. **Patient Registration** → Creates patient record
2. **Automatic Queue Entry** → Adds patient to queue with status 'waiting'
3. **Nurse Triage** → Nurse records vitals and updates queue status
4. **Doctor Assignment** → System notifies doctors of ready patients
5. **Doctor Consultation** → Doctor sees patient with triage data
6. **Workflow Continuation** → Patient proceeds through remaining stages

## 🔧 **Next Steps for Frontend Integration**

After database implementation, you'll need to:

1. **Update Backend API** (`server.js`)
   - Add queue management endpoints
   - Add vital signs endpoints
   - Update notification handling

2. **Update Frontend Components**
   - Modify `PatientForm` to create queue entries
   - Integrate `NurseTriageVitals` into workflow
   - Create queue management dashboard
   - Update notification system

3. **Update Hospital Context**
   - Add queue management functions
   - Add vital signs management
   - Update notification handling

## 📝 **Important Notes**

- **Backup First**: Always backup your database before running schema changes
- **Test Environment**: Test in a development environment first
- **Gradual Rollout**: Consider implementing in phases
- **Monitor Performance**: Watch for any performance issues with new indexes
- **User Training**: Train staff on the new workflow

## 🆘 **Troubleshooting**

### Common Issues:

1. **Permission Errors**: Ensure you have admin privileges
2. **Constraint Violations**: Check existing data before adding constraints
3. **Foreign Key Errors**: Ensure referenced tables exist
4. **RLS Policy Issues**: Test policies with different user roles

### Getting Help:

- Check the verification script output for specific issues
- Review error messages in the implementation script
- Use the rollback script if needed
- Check Supabase logs for detailed error information

## ✅ **Success Criteria**

The implementation is successful when:

- ✅ All tables are created without errors
- ✅ All constraints are updated
- ✅ Verification script shows "WORKFLOW IMPLEMENTATION IS READY!"
- ✅ Sample data can be inserted and queried
- ✅ Views return expected results
- ✅ RLS policies are working correctly

---

**Ready to implement? Start with Step 1 and follow the guide!** 🚀
