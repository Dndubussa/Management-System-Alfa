-- =====================================================
-- COMPLETE QUICK FIX: Delete all records that reference patients
-- =====================================================

-- Delete specialized medical records first
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

-- Delete notifications
DELETE FROM notifications;

-- Now delete patients (should work without foreign key errors)
DELETE FROM patients;

-- Reset MRN sequence
ALTER SEQUENCE mrn_sequence RESTART WITH 1;
