-- =====================================================
-- SAFE PATIENT DATA DELETION SCRIPT
-- Handles missing tables gracefully
-- =====================================================

-- Delete specialized medical records (with error handling)
DO $$
BEGIN
    -- Delete ophthalmology records
    BEGIN
        DELETE FROM ophthalmology_records;
        RAISE NOTICE 'Deleted all ophthalmology records';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'ophthalmology_records table does not exist, skipping...';
    END;
    
    -- Delete visual acuity tests
    BEGIN
        DELETE FROM visual_acuity_tests;
        RAISE NOTICE 'Deleted all visual acuity tests';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'visual_acuity_tests table does not exist, skipping...';
    END;
    
    -- Delete refraction data
    BEGIN
        DELETE FROM refraction_data;
        RAISE NOTICE 'Deleted all refraction data';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'refraction_data table does not exist, skipping...';
    END;
    
    -- Delete intraocular pressure records
    BEGIN
        DELETE FROM intraocular_pressure;
        RAISE NOTICE 'Deleted all intraocular pressure records';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'intraocular_pressure table does not exist, skipping...';
    END;
    
    -- Delete ophthalmology findings
    BEGIN
        DELETE FROM ophthalmology_findings;
        RAISE NOTICE 'Deleted all ophthalmology findings';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'ophthalmology_findings table does not exist, skipping...';
    END;
    
    -- Delete ophthalmology images
    BEGIN
        DELETE FROM ophthalmology_images;
        RAISE NOTICE 'Deleted all ophthalmology images';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'ophthalmology_images table does not exist, skipping...';
    END;
    
    -- Delete physical therapy records
    BEGIN
        DELETE FROM physical_therapy_records;
        RAISE NOTICE 'Deleted all physical therapy records';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'physical_therapy_records table does not exist, skipping...';
    END;
    
    -- Delete therapy plans
    BEGIN
        DELETE FROM therapy_plans;
        RAISE NOTICE 'Deleted all therapy plans';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'therapy_plans table does not exist, skipping...';
    END;
    
    -- Delete therapy sessions
    BEGIN
        DELETE FROM therapy_sessions;
        RAISE NOTICE 'Deleted all therapy sessions';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'therapy_sessions table does not exist, skipping...';
    END;
    
    -- Delete assessment data
    BEGIN
        DELETE FROM assessment_data;
        RAISE NOTICE 'Deleted all assessment data';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'assessment_data table does not exist, skipping...';
    END;
    
    -- Delete exercise prescriptions
    BEGIN
        DELETE FROM exercise_prescriptions;
        RAISE NOTICE 'Deleted all exercise prescriptions';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'exercise_prescriptions table does not exist, skipping...';
    END;
    
    -- Delete core medical records
    BEGIN
        DELETE FROM prescriptions;
        RAISE NOTICE 'Deleted all prescriptions';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'prescriptions table does not exist, skipping...';
    END;
    
    BEGIN
        DELETE FROM lab_orders;
        RAISE NOTICE 'Deleted all lab orders';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'lab_orders table does not exist, skipping...';
    END;
    
    BEGIN
        DELETE FROM medical_records;
        RAISE NOTICE 'Deleted all medical records';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'medical_records table does not exist, skipping...';
    END;
    
    BEGIN
        DELETE FROM vital_signs;
        RAISE NOTICE 'Deleted all vital signs';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'vital_signs table does not exist, skipping...';
    END;
    
    BEGIN
        DELETE FROM appointments;
        RAISE NOTICE 'Deleted all appointments';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'appointments table does not exist, skipping...';
    END;
    
    BEGIN
        DELETE FROM patient_queue;
        RAISE NOTICE 'Deleted all patient queue items';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'patient_queue table does not exist, skipping...';
    END;
    
    -- Delete billing and insurance records
    BEGIN
        DELETE FROM bills;
        RAISE NOTICE 'Deleted all bills';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'bills table does not exist, skipping...';
    END;
    
    BEGIN
        DELETE FROM insurance_claims;
        RAISE NOTICE 'Deleted all insurance claims';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'insurance_claims table does not exist, skipping...';
    END;
    
    -- Delete notifications
    BEGIN
        DELETE FROM notifications;
        RAISE NOTICE 'Deleted all notifications';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'notifications table does not exist, skipping...';
    END;
    
    -- Delete patients (final step)
    BEGIN
        DELETE FROM patients;
        RAISE NOTICE 'Deleted all patients';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'patients table does not exist, skipping...';
    END;
    
    -- Reset MRN sequence
    BEGIN
        ALTER SEQUENCE mrn_sequence RESTART WITH 1;
        RAISE NOTICE 'Reset MRN sequence to 1';
    EXCEPTION
        WHEN undefined_object THEN
            RAISE NOTICE 'mrn_sequence does not exist, skipping...';
    END;
    
    RAISE NOTICE 'Patient data deletion completed successfully!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during deletion: %', SQLERRM;
        RAISE;
END $$;
