-- Remove All Mock Data and Sample Data
-- This script removes all sample/mock data from the database

-- ==============================================
-- STEP 1: REMOVE SAMPLE PATIENTS
-- ==============================================

-- Remove sample patients (those with test data patterns)
DELETE FROM patients 
WHERE first_name IN ('John', 'Jane', 'Ahmed', 'Grace', 'Peter', 'Test', 'Sample')
   OR last_name IN ('Doe', 'Smith', 'Hassan', 'Mwangi', 'Kimani', 'Patient', 'User')
   OR mrn LIKE 'TEST%'
   OR mrn LIKE 'SAMPLE%'
   OR phone LIKE '+255123%'
   OR phone LIKE '+255987%'
   OR phone LIKE '+255555%'
   OR phone LIKE '+255444%'
   OR phone LIKE '+255333%';

-- ==============================================
-- STEP 2: REMOVE SAMPLE SERVICE PRICES
-- ==============================================

-- Remove sample service prices
DELETE FROM service_prices 
WHERE service_name IN (
  'General Consultation',
  'Specialist Consultation', 
  'Blood Test - Complete',
  'Blood Test - Sugar',
  'X-Ray Chest',
  'X-Ray Limb',
  'Ultrasound Abdomen',
  'ECG',
  'Urine Test',
  'Eye Examination'
) OR description LIKE '%sample%'
   OR description LIKE '%test%';

-- ==============================================
-- STEP 3: REMOVE SAMPLE BILLS
-- ==============================================

-- Remove bills for sample patients
DELETE FROM bills 
WHERE patient_id IN (
  SELECT id FROM patients 
  WHERE first_name IN ('John', 'Jane', 'Ahmed', 'Grace', 'Peter', 'Test', 'Sample')
     OR last_name IN ('Doe', 'Smith', 'Hassan', 'Mwangi', 'Kimani', 'Patient', 'User')
);

-- ==============================================
-- STEP 4: REMOVE SAMPLE INSURANCE CLAIMS
-- ==============================================

-- Remove insurance claims for sample patients
DELETE FROM insurance_claims 
WHERE patient_id IN (
  SELECT id FROM patients 
  WHERE first_name IN ('John', 'Jane', 'Ahmed', 'Grace', 'Peter', 'Test', 'Sample')
     OR last_name IN ('Doe', 'Smith', 'Hassan', 'Mwangi', 'Kimani', 'Patient', 'User')
);

-- ==============================================
-- STEP 5: REMOVE SAMPLE APPOINTMENTS
-- ==============================================

-- Remove appointments for sample patients
DELETE FROM appointments 
WHERE patient_id IN (
  SELECT id FROM patients 
  WHERE first_name IN ('John', 'Jane', 'Ahmed', 'Grace', 'Peter', 'Test', 'Sample')
     OR last_name IN ('Doe', 'Smith', 'Hassan', 'Mwangi', 'Kimani', 'Patient', 'User')
);

-- ==============================================
-- STEP 6: REMOVE SAMPLE INVENTORY DATA
-- ==============================================

-- Remove sample inventory items
DELETE FROM inventory_items 
WHERE name IN (
  'Paracetamol 500mg',
  'Amoxicillin 250mg',
  'Insulin Glargine',
  'Morphine 10mg'
) OR supplier IN (
  'MedPharm Ltd',
  'Antibio Corp', 
  'DiabetCare Inc',
  'ControlledMed Ltd'
);

-- Remove sample medication inventory
DELETE FROM medication_inventory 
WHERE medication_name IN (
  'Paracetamol',
  'Amoxicillin',
  'Insulin Glargine',
  'Morphine'
) OR manufacturer IN (
  'MedPharm Ltd',
  'Antibio Corp',
  'DiabetCare Inc', 
  'ControlledMed Ltd'
);

-- ==============================================
-- STEP 7: REMOVE SAMPLE TRANSACTIONS
-- ==============================================

-- Remove sample inventory transactions
DELETE FROM inventory_transactions 
WHERE notes LIKE '%Initial stock entry%'
   OR notes LIKE '%sample%'
   OR notes LIKE '%test%';

-- Remove sample medication transactions
DELETE FROM medication_transactions 
WHERE notes LIKE '%Initial stock entry%'
   OR notes LIKE '%sample%'
   OR notes LIKE '%test%';

-- ==============================================
-- STEP 8: REMOVE SAMPLE MEDICAL RECORDS
-- ==============================================

-- Remove medical records for sample patients
DELETE FROM medical_records 
WHERE patient_id IN (
  SELECT id FROM patients 
  WHERE first_name IN ('John', 'Jane', 'Ahmed', 'Grace', 'Peter', 'Test', 'Sample')
     OR last_name IN ('Doe', 'Smith', 'Hassan', 'Mwangi', 'Kimani', 'Patient', 'User')
);

-- ==============================================
-- STEP 9: REMOVE SAMPLE PRESCRIPTIONS
-- ==============================================

-- Remove prescriptions for sample patients
DELETE FROM prescriptions 
WHERE patient_id IN (
  SELECT id FROM patients 
  WHERE first_name IN ('John', 'Jane', 'Ahmed', 'Grace', 'Peter', 'Test', 'Sample')
     OR last_name IN ('Doe', 'Smith', 'Hassan', 'Mwangi', 'Kimani', 'Patient', 'User')
);

-- ==============================================
-- STEP 10: REMOVE SAMPLE LAB ORDERS
-- ==============================================

-- Remove lab orders for sample patients
DELETE FROM lab_orders 
WHERE patient_id IN (
  SELECT id FROM patients 
  WHERE first_name IN ('John', 'Jane', 'Ahmed', 'Grace', 'Peter', 'Test', 'Sample')
     OR last_name IN ('Doe', 'Smith', 'Hassan', 'Mwangi', 'Kimani', 'Patient', 'User')
);

-- ==============================================
-- STEP 11: REMOVE SAMPLE REFERRALS
-- ==============================================

-- Remove referrals for sample patients
DELETE FROM referrals 
WHERE patient_id IN (
  SELECT id FROM patients 
  WHERE first_name IN ('John', 'Jane', 'Ahmed', 'Grace', 'Peter', 'Test', 'Sample')
     OR last_name IN ('Doe', 'Smith', 'Hassan', 'Mwangi', 'Kimani', 'Patient', 'User')
);

-- ==============================================
-- STEP 12: REMOVE SAMPLE SURGERY REQUESTS
-- ==============================================

-- Remove surgery requests for sample patients
DELETE FROM surgery_requests 
WHERE patient_id IN (
  SELECT id FROM patients 
  WHERE first_name IN ('John', 'Jane', 'Ahmed', 'Grace', 'Peter', 'Test', 'Sample')
     OR last_name IN ('Doe', 'Smith', 'Hassan', 'Mwangi', 'Kimani', 'Patient', 'User')
);

-- ==============================================
-- STEP 13: CLEAN UP AUDIT LOGS
-- ==============================================

-- Remove audit logs for deleted sample data
DELETE FROM audit_logs 
WHERE table_name IN ('patients', 'service_prices', 'bills', 'insurance_claims', 'appointments', 'inventory_items', 'medication_inventory')
  AND (old_values::text LIKE '%John%' 
    OR old_values::text LIKE '%Jane%'
    OR old_values::text LIKE '%Ahmed%'
    OR old_values::text LIKE '%Grace%'
    OR old_values::text LIKE '%Peter%'
    OR new_values::text LIKE '%John%'
    OR new_values::text LIKE '%Jane%'
    OR new_values::text LIKE '%Ahmed%'
    OR new_values::text LIKE '%Grace%'
    OR new_values::text LIKE '%Peter%');

-- ==============================================
-- STEP 14: VERIFY CLEANUP
-- ==============================================

-- Check remaining data counts
SELECT 'Data cleanup completed!' as status;

SELECT 'Remaining data counts:' as info;
SELECT 'patients' as table_name, COUNT(*) as count FROM patients
UNION ALL
SELECT 'service_prices', COUNT(*) FROM service_prices
UNION ALL
SELECT 'bills', COUNT(*) FROM bills
UNION ALL
SELECT 'insurance_claims', COUNT(*) FROM insurance_claims
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'inventory_items', COUNT(*) FROM inventory_items
UNION ALL
SELECT 'medication_inventory', COUNT(*) FROM medication_inventory
UNION ALL
SELECT 'medical_records', COUNT(*) FROM medical_records
UNION ALL
SELECT 'prescriptions', COUNT(*) FROM prescriptions
UNION ALL
SELECT 'lab_orders', COUNT(*) FROM lab_orders
UNION ALL
SELECT 'referrals', COUNT(*) FROM referrals
UNION ALL
SELECT 'surgery_requests', COUNT(*) FROM surgery_requests
ORDER BY table_name;
