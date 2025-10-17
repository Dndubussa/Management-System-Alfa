-- Add Sample Patients - Corrected for Your Table Structure
-- This matches your exact patients table columns

-- Add sample patients with correct column names
INSERT INTO patients (
    id, 
    mrn, 
    first_name, 
    last_name, 
    date_of_birth, 
    gender, 
    phone, 
    address, 
    emergency_contact_name, 
    emergency_contact_phone, 
    emergency_contact_relationship, 
    insurance_provider, 
    insurance_membership_number, 
    created_at, 
    updated_at
) VALUES
(
    gen_random_uuid(), 
    'ALFA-2024-00001', 
    'John', 
    'Doe', 
    '1990-01-15', 
    'Male', 
    '+255123456789', 
    'Dar es Salaam, Tanzania', 
    'Jane Doe', 
    '+255123456790', 
    'Spouse', 
    'NHIF', 
    'NHIF123456', 
    NOW(), 
    NOW()
),
(
    gen_random_uuid(), 
    'ALFA-2024-00002', 
    'Grace', 
    'Mwangi', 
    '1985-05-20', 
    'Female', 
    '+255987654321', 
    'Arusha, Tanzania', 
    'Peter Mwangi', 
    '+255987654322', 
    'Husband', 
    'AAR', 
    'AAR789012', 
    NOW(), 
    NOW()
),
(
    gen_random_uuid(), 
    'ALFA-2024-00003', 
    'Ahmed', 
    'Hassan', 
    '1992-08-10', 
    'Male', 
    '+255555123456', 
    'Mwanza, Tanzania', 
    'Fatima Hassan', 
    '+255555123457', 
    'Sister', 
    'NHIF', 
    'NHIF789456', 
    NOW(), 
    NOW()
),
(
    gen_random_uuid(), 
    'ALFA-2024-00004', 
    'Mary', 
    'Kimani', 
    '1988-12-05', 
    'Female', 
    '+255444987654', 
    'Dodoma, Tanzania', 
    'James Kimani', 
    '+255444987655', 
    'Brother', 
    'AAR', 
    'AAR456789', 
    NOW(), 
    NOW()
),
(
    gen_random_uuid(), 
    'ALFA-2024-00005', 
    'Peter', 
    'Mwalimu', 
    '1995-03-25', 
    'Male', 
    '+255333555777', 
    'Kilimanjaro, Tanzania', 
    'Sarah Mwalimu', 
    '+255333555778', 
    'Mother', 
    'NHIF', 
    'NHIF555777', 
    NOW(), 
    NOW()
);

-- Verify the data was inserted
SELECT 'Sample patients inserted successfully!' as status;

-- Check the count
SELECT COUNT(*) as total_patients FROM patients;

-- Show the inserted patients
SELECT 
    mrn,
    first_name,
    last_name,
    phone,
    insurance_provider,
    insurance_membership_number,
    created_at
FROM patients 
ORDER BY created_at DESC;
