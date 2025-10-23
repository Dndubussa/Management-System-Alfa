-- Simple script to delete all patient data
-- WARNING: This will permanently delete all patient data!

-- Delete in reverse dependency order to avoid foreign key constraint errors

-- 1. Delete notifications that reference patients
DELETE FROM notifications WHERE patient_id IS NOT NULL;

-- 2. Delete insurance claims
DELETE FROM insurance_claims;

-- 3. Delete bills
DELETE FROM bills;

-- 4. Delete lab orders
DELETE FROM lab_orders;

-- 5. Delete prescriptions
DELETE FROM prescriptions;

-- 6. Delete appointments
DELETE FROM appointments;

-- 7. Delete medical records
DELETE FROM medical_records;

-- 8. Delete vital signs
DELETE FROM vital_signs;

-- 9. Delete patient queue
DELETE FROM patient_queue;

-- 10. Finally, delete patients
DELETE FROM patients;

-- Reset patient MRN sequence if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'patient_mrn_seq') THEN
        ALTER SEQUENCE patient_mrn_seq RESTART WITH 1;
        RAISE NOTICE 'Reset patient MRN sequence to start from P001';
    END IF;
END $$;

-- Success message
SELECT 'All patient data deleted successfully! System ready for fresh start.' as message;
