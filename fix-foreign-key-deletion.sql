-- =====================================================
-- QUICK FIX: Delete specialized medical records first
-- =====================================================

-- Delete ophthalmology records that are causing foreign key constraint
DELETE FROM ophthalmology_records;

-- Delete other specialized medical records
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

-- Now delete patients (should work without foreign key errors)
DELETE FROM patients;

-- Reset MRN sequence
ALTER SEQUENCE mrn_sequence RESTART WITH 1;
