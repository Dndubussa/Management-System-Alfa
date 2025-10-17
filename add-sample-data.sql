-- Add Sample Data to Test the System
-- This script adds sample patients and service prices to test the receptionist dashboard

-- Add sample patients
INSERT INTO patients (id, first_name, last_name, email, phone, date_of_birth, gender, address, insurance_provider, insurance_number, created_at, updated_at) VALUES
('1', 'John', 'Doe', 'john.doe@example.com', '+255123456789', '1990-01-01', 'Male', 'Dar es Salaam, Tanzania', 'NHIF', 'NHIF123456', NOW(), NOW()),
('2', 'Jane', 'Smith', 'jane.smith@example.com', '+255987654321', '1985-05-15', 'Female', 'Arusha, Tanzania', 'AAR', 'AAR789012', NOW(), NOW()),
('3', 'Ahmed', 'Hassan', 'ahmed.hassan@example.com', '+255555123456', '1992-08-20', 'Male', 'Mwanza, Tanzania', 'NHIF', 'NHIF789456', NOW(), NOW()),
('4', 'Grace', 'Mwangi', 'grace.mwangi@example.com', '+255444987654', '1988-12-10', 'Female', 'Dodoma, Tanzania', 'AAR', 'AAR456789', NOW(), NOW()),
('5', 'Peter', 'Kimani', 'peter.kimani@example.com', '+255333555777', '1995-03-25', 'Male', 'Kilimanjaro, Tanzania', 'NHIF', 'NHIF555777', NOW(), NOW());

-- Add sample service prices
INSERT INTO service_prices (id, service_name, category, price, description, created_at, updated_at) VALUES
('1', 'General Consultation', 'consultation', 50000, 'General medical consultation with doctor', NOW(), NOW()),
('2', 'Specialist Consultation', 'consultation', 80000, 'Specialist medical consultation', NOW(), NOW()),
('3', 'Blood Test - Complete', 'lab-test', 25000, 'Complete blood count (CBC)', NOW(), NOW()),
('4', 'Blood Test - Sugar', 'lab-test', 15000, 'Blood sugar level test', NOW(), NOW()),
('5', 'X-Ray Chest', 'imaging', 75000, 'Chest X-ray examination', NOW(), NOW()),
('6', 'X-Ray Limb', 'imaging', 45000, 'Limb X-ray examination', NOW(), NOW()),
('7', 'Ultrasound Abdomen', 'imaging', 120000, 'Abdominal ultrasound scan', NOW(), NOW()),
('8', 'ECG', 'diagnostic', 30000, 'Electrocardiogram', NOW(), NOW()),
('9', 'Urine Test', 'lab-test', 10000, 'Urine analysis', NOW(), NOW()),
('10', 'Eye Examination', 'consultation', 40000, 'Comprehensive eye examination', NOW(), NOW());

-- Add sample bills
INSERT INTO bills (id, patient_id, items, subtotal, tax, discount, total, status, payment_method, created_at, updated_at) VALUES
('1', '1', '[{"id":"1","serviceId":"1","serviceName":"General Consultation","category":"consultation","unitPrice":50000,"quantity":1,"totalPrice":50000}]', 50000, 0, 0, 50000, 'pending', NULL, NOW(), NOW()),
('2', '2', '[{"id":"2","serviceId":"3","serviceName":"Blood Test - Complete","category":"lab-test","unitPrice":25000,"quantity":1,"totalPrice":25000}]', 25000, 0, 0, 25000, 'paid', 'cash', NOW(), NOW()),
('3', '3', '[{"id":"3","serviceId":"5","serviceName":"X-Ray Chest","category":"imaging","unitPrice":75000,"quantity":1,"totalPrice":75000}]', 75000, 0, 0, 75000, 'pending', NULL, NOW(), NOW());

-- Add sample insurance claims
INSERT INTO insurance_claims (id, bill_id, patient_id, insurance_provider, membership_number, claim_amount, claimed_amount, nhif_claim_number, submission_date, status, notes, created_at, updated_at) VALUES
('1', '1', '1', 'NHIF', 'NHIF123456', 50000, 50000, 'NHIF-2024-001', NOW(), 'submitted', 'General consultation claim', NOW(), NOW()),
('2', '3', '3', 'NHIF', 'NHIF789456', 75000, 75000, 'NHIF-2024-002', NOW(), 'approved', 'X-ray examination claim', NOW(), NOW());

-- Add sample appointments
INSERT INTO appointments (id, patient_id, doctor_id, date_time, type, status, notes, created_at, updated_at) VALUES
('1', '1', '1', NOW() + INTERVAL '1 day', 'consultation', 'scheduled', 'Follow-up appointment', NOW(), NOW()),
('2', '2', '2', NOW() + INTERVAL '2 days', 'consultation', 'scheduled', 'Initial consultation', NOW(), NOW()),
('3', '3', '1', NOW() + INTERVAL '3 days', 'consultation', 'scheduled', 'Specialist consultation', NOW(), NOW());

-- Verify the data was inserted
SELECT 'Sample data inserted successfully!' as status;

-- Check counts after insertion
SELECT 'patients' as table_name, COUNT(*) as record_count FROM patients
UNION ALL
SELECT 'service_prices' as table_name, COUNT(*) as record_count FROM service_prices
UNION ALL
SELECT 'bills' as table_name, COUNT(*) as record_count FROM bills
UNION ALL
SELECT 'insurance_claims' as table_name, COUNT(*) as record_count FROM insurance_claims
UNION ALL
SELECT 'appointments' as table_name, COUNT(*) as record_count FROM appointments;
