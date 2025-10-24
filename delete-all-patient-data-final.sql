-- =====================================================
-- FINAL PATIENT DATA DELETION SCRIPT
-- No helper functions, direct deletion to avoid ambiguity
-- =====================================================

-- Delete specialized medical records first (to avoid foreign key constraints)
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

-- Delete core medical records that reference patients
DELETE FROM prescriptions;
DELETE FROM lab_orders;
DELETE FROM medical_records;
DELETE FROM vital_signs;
DELETE FROM appointments;
DELETE FROM patient_queue;

-- Delete billing and insurance records
DELETE FROM bills;
DELETE FROM insurance_claims;

-- Delete NHIF records (if they exist)
DELETE FROM nhif_claims;
DELETE FROM nhif_claim_items;
DELETE FROM nhif_member_verification;
DELETE FROM nhif_service_tariffs;
DELETE FROM nhif_drug_formulary;

-- Delete notifications and audit records
DELETE FROM notifications;
DELETE FROM audit_logs;
DELETE FROM medical_record_audit_logs;
DELETE FROM prescription_audit_logs;
DELETE FROM inventory_audit_logs;
DELETE FROM billing_audit_logs;

-- Delete patients (now safe)
DELETE FROM patients;

-- Reset MRN sequence (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'mrn_sequence') THEN
        ALTER SEQUENCE mrn_sequence RESTART WITH 1;
        RAISE NOTICE 'Reset MRN sequence to 1';
    ELSE
        RAISE NOTICE 'MRN sequence does not exist, skipping reset';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not reset MRN sequence: %', SQLERRM;
END $$;
