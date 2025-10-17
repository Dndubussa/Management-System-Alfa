-- Check Database Tables for Data
-- This script checks if there's data in your main tables

-- Check patients table
SELECT 'patients' as table_name, COUNT(*) as record_count FROM patients;

-- Check service_prices table
SELECT 'service_prices' as table_name, COUNT(*) as record_count FROM service_prices;

-- Check bills table
SELECT 'bills' as table_name, COUNT(*) as record_count FROM bills;

-- Check insurance_claims table
SELECT 'insurance_claims' as table_name, COUNT(*) as record_count FROM insurance_claims;

-- Check appointments table
SELECT 'appointments' as table_name, COUNT(*) as record_count FROM appointments;

-- Check medical_records table
SELECT 'medical_records' as table_name, COUNT(*) as record_count FROM medical_records;

-- Check prescriptions table
SELECT 'prescriptions' as table_name, COUNT(*) as record_count FROM prescriptions;

-- Check users table
SELECT 'users' as table_name, COUNT(*) as record_count FROM users;

-- Check inventory_items table
SELECT 'inventory_items' as table_name, COUNT(*) as record_count FROM inventory_items;

-- Check medication_inventory table
SELECT 'medication_inventory' as table_name, COUNT(*) as record_count FROM medication_inventory;

-- If you want to see actual patient data (if any exists):
-- SELECT id, first_name, last_name, email, phone, created_at FROM patients LIMIT 10;

-- If you want to see actual service prices (if any exists):
-- SELECT id, service_name, category, price FROM service_prices LIMIT 10;
