-- SQL script to delete all patient-related data for a fresh start
-- WARNING: This will permanently delete all patient data!

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function to check if table exists
CREATE OR REPLACE FUNCTION table_exists(tbl_name text) RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = tbl_name
    );
END;
$$ LANGUAGE plpgsql;

-- Start deletion process
DO $$
DECLARE
    patient_count INTEGER;
    queue_count INTEGER;
    vitals_count INTEGER;
    records_count INTEGER;
    appointments_count INTEGER;
    prescriptions_count INTEGER;
    lab_orders_count INTEGER;
    bills_count INTEGER;
    claims_count INTEGER;
    notifications_count INTEGER;
BEGIN
    -- Get counts before deletion
    IF table_exists('patients') THEN
        SELECT COUNT(*) INTO patient_count FROM patients;
        RAISE NOTICE 'Found % patients to delete', patient_count;
    END IF;
    
    IF table_exists('patient_queue') THEN
        SELECT COUNT(*) INTO queue_count FROM patient_queue;
        RAISE NOTICE 'Found % patient queue items to delete', queue_count;
    END IF;
    
    IF table_exists('vital_signs') THEN
        SELECT COUNT(*) INTO vitals_count FROM vital_signs;
        RAISE NOTICE 'Found % vital signs records to delete', vitals_count;
    END IF;
    
    IF table_exists('medical_records') THEN
        SELECT COUNT(*) INTO records_count FROM medical_records;
        RAISE NOTICE 'Found % medical records to delete', records_count;
    END IF;
    
    IF table_exists('appointments') THEN
        SELECT COUNT(*) INTO appointments_count FROM appointments;
        RAISE NOTICE 'Found % appointments to delete', appointments_count;
    END IF;
    
    IF table_exists('prescriptions') THEN
        SELECT COUNT(*) INTO prescriptions_count FROM prescriptions;
        RAISE NOTICE 'Found % prescriptions to delete', prescriptions_count;
    END IF;
    
    IF table_exists('lab_orders') THEN
        SELECT COUNT(*) INTO lab_orders_count FROM lab_orders;
        RAISE NOTICE 'Found % lab orders to delete', lab_orders_count;
    END IF;
    
    IF table_exists('bills') THEN
        SELECT COUNT(*) INTO bills_count FROM bills;
        RAISE NOTICE 'Found % bills to delete', bills_count;
    END IF;
    
    IF table_exists('insurance_claims') THEN
        SELECT COUNT(*) INTO claims_count FROM insurance_claims;
        RAISE NOTICE 'Found % insurance claims to delete', claims_count;
    END IF;
    
    IF table_exists('notifications') THEN
        SELECT COUNT(*) INTO notifications_count FROM notifications;
        RAISE NOTICE 'Found % notifications to delete', notifications_count;
    END IF;
    
    RAISE NOTICE 'Starting deletion process...';
    
    -- Delete in reverse dependency order to avoid foreign key constraint errors
    
    -- 1. Delete all notifications (they don't have patient_id column)
    IF table_exists('notifications') THEN
        DELETE FROM notifications;
        RAISE NOTICE 'Deleted all notifications';
    END IF;
    
    -- 2. Delete insurance claims
    IF table_exists('insurance_claims') THEN
        DELETE FROM insurance_claims;
        RAISE NOTICE 'Deleted all insurance claims';
    END IF;
    
    -- 3. Delete bills
    IF table_exists('bills') THEN
        DELETE FROM bills;
        RAISE NOTICE 'Deleted all bills';
    END IF;
    
    -- 4. Delete lab orders
    IF table_exists('lab_orders') THEN
        DELETE FROM lab_orders;
        RAISE NOTICE 'Deleted all lab orders';
    END IF;
    
    -- 5. Delete prescriptions
    IF table_exists('prescriptions') THEN
        DELETE FROM prescriptions;
        RAISE NOTICE 'Deleted all prescriptions';
    END IF;
    
    -- 6. Delete appointments
    IF table_exists('appointments') THEN
        DELETE FROM appointments;
        RAISE NOTICE 'Deleted all appointments';
    END IF;
    
    -- 7. Delete medical records
    IF table_exists('medical_records') THEN
        DELETE FROM medical_records;
        RAISE NOTICE 'Deleted all medical records';
    END IF;
    
    -- 8. Delete vital signs
    IF table_exists('vital_signs') THEN
        DELETE FROM vital_signs;
        RAISE NOTICE 'Deleted all vital signs';
    END IF;
    
    -- 9. Delete patient queue
    IF table_exists('patient_queue') THEN
        DELETE FROM patient_queue;
        RAISE NOTICE 'Deleted all patient queue items';
    END IF;
    
    -- 10. Finally, delete patients
    IF table_exists('patients') THEN
        DELETE FROM patients;
        RAISE NOTICE 'Deleted all patients';
    END IF;
    
    -- Reset sequences if they exist
    IF table_exists('patients') THEN
        -- Reset patient MRN sequence if it exists
        IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'patient_mrn_seq') THEN
            ALTER SEQUENCE patient_mrn_seq RESTART WITH 1;
            RAISE NOTICE 'Reset patient MRN sequence';
        END IF;
    END IF;
    
    RAISE NOTICE '✅ All patient data deleted successfully!';
    RAISE NOTICE 'The system is now ready for fresh patient data.';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during deletion: %', SQLERRM;
        RAISE;
END $$;

-- Clean up helper functions
DROP FUNCTION IF EXISTS table_exists(text);

-- Final verification
DO $$
DECLARE
    remaining_patients INTEGER;
    remaining_queue INTEGER;
    remaining_vitals INTEGER;
BEGIN
    -- Check if any patient data remains
    IF table_exists('patients') THEN
        SELECT COUNT(*) INTO remaining_patients FROM patients;
        IF remaining_patients > 0 THEN
            RAISE NOTICE '⚠️ Warning: % patients still remain', remaining_patients;
        ELSE
            RAISE NOTICE '✅ All patients deleted successfully';
        END IF;
    END IF;
    
    IF table_exists('patient_queue') THEN
        SELECT COUNT(*) INTO remaining_queue FROM patient_queue;
        IF remaining_queue > 0 THEN
            RAISE NOTICE '⚠️ Warning: % patient queue items still remain', remaining_queue;
        ELSE
            RAISE NOTICE '✅ All patient queue items deleted successfully';
        END IF;
    END IF;
    
    IF table_exists('vital_signs') THEN
        SELECT COUNT(*) INTO remaining_vitals FROM vital_signs;
        IF remaining_vitals > 0 THEN
            RAISE NOTICE '⚠️ Warning: % vital signs records still remain', remaining_vitals;
        ELSE
            RAISE NOTICE '✅ All vital signs records deleted successfully';
        END IF;
    END IF;
    
    RAISE NOTICE '🎉 System is ready for fresh start!';
END $$;
