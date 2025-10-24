-- =====================================================
-- ROBUST PATIENT DATA DELETION SCRIPT
-- Handles missing tables gracefully
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Starting patient data deletion...';
    
    -- Delete specialized medical records with error handling
    BEGIN
        DELETE FROM ophthalmology_records;
        RAISE NOTICE 'Deleted ophthalmology records';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'ophthalmology_records table does not exist, skipping...';
    END;
    
    BEGIN
        DELETE FROM visual_acuity_tests;
        RAISE NOTICE 'Deleted visual acuity tests';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'visual_acuity_tests table does not exist, skipping...';
    END;
    
    BEGIN
        DELETE FROM refraction_data;
        RAISE NOTICE 'Deleted refraction data';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'refraction_data table does not exist, skipping...';
    END;
    
    BEGIN
        DELETE FROM intraocular_pressure;
        RAISE NOTICE 'Deleted intraocular pressure records';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'intraocular_pressure table does not exist, skipping...';
    END;
    
    BEGIN
        DELETE FROM ophthalmology_findings;
        RAISE NOTICE 'Deleted ophthalmology findings';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'ophthalmology_findings table does not exist, skipping...';
    END;
    
    BEGIN
        DELETE FROM ophthalmology_images;
        RAISE NOTICE 'Deleted ophthalmology images';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'ophthalmology_images table does not exist, skipping...';
    END;
    
    BEGIN
        DELETE FROM physical_therapy_records;
        RAISE NOTICE 'Deleted physical therapy records';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'physical_therapy_records table does not exist, skipping...';
    END;
    
    BEGIN
        DELETE FROM therapy_plans;
        RAISE NOTICE 'Deleted therapy plans';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'therapy_plans table does not exist, skipping...';
    END;
    
    BEGIN
        DELETE FROM therapy_sessions;
        RAISE NOTICE 'Deleted therapy sessions';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'therapy_sessions table does not exist, skipping...';
    END;
    
    BEGIN
        DELETE FROM assessment_data;
        RAISE NOTICE 'Deleted assessment data';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'assessment_data table does not exist, skipping...';
    END;
    
    BEGIN
        DELETE FROM exercise_prescriptions;
        RAISE NOTICE 'Deleted exercise prescriptions';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'exercise_prescriptions table does not exist, skipping...';
    END;
    
    -- Delete core medical records
    BEGIN
        DELETE FROM prescriptions;
        RAISE NOTICE 'Deleted prescriptions';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'prescriptions table does not exist, skipping...';
    END;
    
    BEGIN
        DELETE FROM lab_orders;
        RAISE NOTICE 'Deleted lab orders';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'lab_orders table does not exist, skipping...';
    END;
    
    BEGIN
        DELETE FROM medical_records;
        RAISE NOTICE 'Deleted medical records';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'medical_records table does not exist, skipping...';
    END;
    
    BEGIN
        DELETE FROM vital_signs;
        RAISE NOTICE 'Deleted vital signs';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'vital_signs table does not exist, skipping...';
    END;
    
    BEGIN
        DELETE FROM appointments;
        RAISE NOTICE 'Deleted appointments';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'appointments table does not exist, skipping...';
    END;
    
    BEGIN
        DELETE FROM patient_queue;
        RAISE NOTICE 'Deleted patient queue';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'patient_queue table does not exist, skipping...';
    END;
    
    -- Delete billing and insurance records
    BEGIN
        DELETE FROM bills;
        RAISE NOTICE 'Deleted bills';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'bills table does not exist, skipping...';
    END;
    
    BEGIN
        DELETE FROM insurance_claims;
        RAISE NOTICE 'Deleted insurance claims';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'insurance_claims table does not exist, skipping...';
    END;
    
    -- Delete notifications
    BEGIN
        DELETE FROM notifications;
        RAISE NOTICE 'Deleted notifications';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'notifications table does not exist, skipping...';
    END;
    
    -- Delete patients (final step)
    BEGIN
        DELETE FROM patients;
        RAISE NOTICE 'Deleted patients';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'patients table does not exist, skipping...';
    END;
    
    -- Reset MRN sequence if it exists
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
    END;
    
    RAISE NOTICE 'Patient data deletion completed successfully!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during deletion: %', SQLERRM;
        RAISE;
END $$;
