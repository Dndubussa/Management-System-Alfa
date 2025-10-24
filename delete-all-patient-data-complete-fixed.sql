-- =====================================================
-- COMPLETE PATIENT DATA DELETION SCRIPT (FIXED)
-- Handles all foreign key relationships properly
-- =====================================================

-- Create helper function first
CREATE OR REPLACE FUNCTION table_exists(table_name text) RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = $1
    );
END;
$$ LANGUAGE plpgsql;

-- Main deletion script
DO $$
BEGIN
    RAISE NOTICE 'Starting complete patient data deletion...';
    
    -- =====================================================
    -- PHASE 1: DELETE SPECIALIZED MEDICAL RECORDS
    -- =====================================================
    
    -- Delete ophthalmology records
    IF table_exists('ophthalmology_records') THEN
        DELETE FROM ophthalmology_records;
        RAISE NOTICE 'Deleted all ophthalmology records';
    END IF;
    
    -- Delete visual acuity tests
    IF table_exists('visual_acuity_tests') THEN
        DELETE FROM visual_acuity_tests;
        RAISE NOTICE 'Deleted all visual acuity tests';
    END IF;
    
    -- Delete refraction data
    IF table_exists('refraction_data') THEN
        DELETE FROM refraction_data;
        RAISE NOTICE 'Deleted all refraction data';
    END IF;
    
    -- Delete intraocular pressure records
    IF table_exists('intraocular_pressure') THEN
        DELETE FROM intraocular_pressure;
        RAISE NOTICE 'Deleted all intraocular pressure records';
    END IF;
    
    -- Delete ophthalmology findings
    IF table_exists('ophthalmology_findings') THEN
        DELETE FROM ophthalmology_findings;
        RAISE NOTICE 'Deleted all ophthalmology findings';
    END IF;
    
    -- Delete ophthalmology images
    IF table_exists('ophthalmology_images') THEN
        DELETE FROM ophthalmology_images;
        RAISE NOTICE 'Deleted all ophthalmology images';
    END IF;
    
    -- Delete physical therapy records
    IF table_exists('physical_therapy_records') THEN
        DELETE FROM physical_therapy_records;
        RAISE NOTICE 'Deleted all physical therapy records';
    END IF;
    
    -- Delete therapy plans
    IF table_exists('therapy_plans') THEN
        DELETE FROM therapy_plans;
        RAISE NOTICE 'Deleted all therapy plans';
    END IF;
    
    -- Delete therapy sessions
    IF table_exists('therapy_sessions') THEN
        DELETE FROM therapy_sessions;
        RAISE NOTICE 'Deleted all therapy sessions';
    END IF;
    
    -- Delete assessment data
    IF table_exists('assessment_data') THEN
        DELETE FROM assessment_data;
        RAISE NOTICE 'Deleted all assessment data';
    END IF;
    
    -- Delete exercise prescriptions
    IF table_exists('exercise_prescriptions') THEN
        DELETE FROM exercise_prescriptions;
        RAISE NOTICE 'Deleted all exercise prescriptions';
    END IF;
    
    -- =====================================================
    -- PHASE 2: DELETE CORE MEDICAL RECORDS
    -- =====================================================
    
    -- Delete prescriptions
    IF table_exists('prescriptions') THEN
        DELETE FROM prescriptions;
        RAISE NOTICE 'Deleted all prescriptions';
    END IF;
    
    -- Delete lab orders
    IF table_exists('lab_orders') THEN
        DELETE FROM lab_orders;
        RAISE NOTICE 'Deleted all lab orders';
    END IF;
    
    -- Delete medical records
    IF table_exists('medical_records') THEN
        DELETE FROM medical_records;
        RAISE NOTICE 'Deleted all medical records';
    END IF;
    
    -- Delete vital signs
    IF table_exists('vital_signs') THEN
        DELETE FROM vital_signs;
        RAISE NOTICE 'Deleted all vital signs';
    END IF;
    
    -- Delete appointments
    IF table_exists('appointments') THEN
        DELETE FROM appointments;
        RAISE NOTICE 'Deleted all appointments';
    END IF;
    
    -- Delete patient queue
    IF table_exists('patient_queue') THEN
        DELETE FROM patient_queue;
        RAISE NOTICE 'Deleted all patient queue items';
    END IF;
    
    -- =====================================================
    -- PHASE 3: DELETE BILLING AND INSURANCE RECORDS
    -- =====================================================
    
    -- Delete bills
    IF table_exists('bills') THEN
        DELETE FROM bills;
        RAISE NOTICE 'Deleted all bills';
    END IF;
    
    -- Delete insurance claims
    IF table_exists('insurance_claims') THEN
        DELETE FROM insurance_claims;
        RAISE NOTICE 'Deleted all insurance claims';
    END IF;
    
    -- Delete NHIF claims
    IF table_exists('nhif_claims') THEN
        DELETE FROM nhif_claims;
        RAISE NOTICE 'Deleted all NHIF claims';
    END IF;
    
    -- Delete NHIF claim items
    IF table_exists('nhif_claim_items') THEN
        DELETE FROM nhif_claim_items;
        RAISE NOTICE 'Deleted all NHIF claim items';
    END IF;
    
    -- Delete NHIF member verification
    IF table_exists('nhif_member_verification') THEN
        DELETE FROM nhif_member_verification;
        RAISE NOTICE 'Deleted all NHIF member verification records';
    END IF;
    
    -- Delete NHIF service tariffs
    IF table_exists('nhif_service_tariffs') THEN
        DELETE FROM nhif_service_tariffs;
        RAISE NOTICE 'Deleted all NHIF service tariffs';
    END IF;
    
    -- Delete NHIF drug formulary
    IF table_exists('nhif_drug_formulary') THEN
        DELETE FROM nhif_drug_formulary;
        RAISE NOTICE 'Deleted all NHIF drug formulary records';
    END IF;
    
    -- =====================================================
    -- PHASE 4: DELETE NOTIFICATIONS AND AUDIT RECORDS
    -- =====================================================
    
    -- Delete notifications
    IF table_exists('notifications') THEN
        DELETE FROM notifications;
        RAISE NOTICE 'Deleted all notifications';
    END IF;
    
    -- Delete audit logs
    IF table_exists('audit_logs') THEN
        DELETE FROM audit_logs;
        RAISE NOTICE 'Deleted all audit logs';
    END IF;
    
    -- Delete medical record audit logs
    IF table_exists('medical_record_audit_logs') THEN
        DELETE FROM medical_record_audit_logs;
        RAISE NOTICE 'Deleted all medical record audit logs';
    END IF;
    
    -- Delete prescription audit logs
    IF table_exists('prescription_audit_logs') THEN
        DELETE FROM prescription_audit_logs;
        RAISE NOTICE 'Deleted all prescription audit logs';
    END IF;
    
    -- Delete inventory audit logs
    IF table_exists('inventory_audit_logs') THEN
        DELETE FROM inventory_audit_logs;
        RAISE NOTICE 'Deleted all inventory audit logs';
    END IF;
    
    -- Delete billing audit logs
    IF table_exists('billing_audit_logs') THEN
        DELETE FROM billing_audit_logs;
        RAISE NOTICE 'Deleted all billing audit logs';
    END IF;
    
    -- =====================================================
    -- PHASE 5: DELETE PATIENTS (FINAL STEP)
    -- =====================================================
    
    -- Delete patients (this should now work without foreign key errors)
    IF table_exists('patients') THEN
        DELETE FROM patients;
        RAISE NOTICE 'Deleted all patients';
    END IF;
    
    -- =====================================================
    -- PHASE 6: RESET SEQUENCES
    -- =====================================================
    
    -- Reset MRN sequence
    IF table_exists('patients') THEN
        -- Check if sequence exists
        IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'mrn_sequence') THEN
            ALTER SEQUENCE mrn_sequence RESTART WITH 1;
            RAISE NOTICE 'Reset MRN sequence to 1';
        END IF;
    END IF;
    
    -- Reset other sequences if they exist
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'appointment_id_seq') THEN
        ALTER SEQUENCE appointment_id_seq RESTART WITH 1;
        RAISE NOTICE 'Reset appointment sequence';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'medical_record_id_seq') THEN
        ALTER SEQUENCE medical_record_id_seq RESTART WITH 1;
        RAISE NOTICE 'Reset medical record sequence';
    END IF;
    
    RAISE NOTICE 'Complete patient data deletion finished successfully!';
    RAISE NOTICE 'All patient-related data has been removed from the system.';
    RAISE NOTICE 'The system is now ready for fresh patient data.';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during deletion: %', SQLERRM;
        RAISE NOTICE 'Some data may still exist. Please check foreign key constraints.';
        RAISE;
END $$;

-- Clean up the helper function
DROP FUNCTION IF EXISTS table_exists(text);
