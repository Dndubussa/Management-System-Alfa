-- Create test data for Internal Medicine doctor
-- Run this in Supabase SQL editor to create test patients and appointments

-- 1. First, let's check if the doctor exists
SELECT id, name, email, role, department 
FROM users 
WHERE id = 'e4bf9d1b-33d5-47a5-ab51-0be00b3e130b';

-- 2. Create a test patient if none exist
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
) VALUES (
    gen_random_uuid(),
    'P001',
    'John',
    'Doe',
    '1985-06-15',
    'Male',
    '+255123456789',
    '123 Main Street, Dar es Salaam',
    'Jane Doe',
    '+255987654321',
    'Spouse',
    'NHIF',
    'NHIF123456',
    NOW(),
    NOW()
) ON CONFLICT (mrn) DO NOTHING;

-- 3. Create another test patient
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
) VALUES (
    gen_random_uuid(),
    'P002',
    'Mary',
    'Smith',
    '1990-03-22',
    'Female',
    '+255111222333',
    '456 Oak Avenue, Dar es Salaam',
    'John Smith',
    '+255444555666',
    'Husband',
    'AAR Insurance',
    'AAR789012',
    NOW(),
    NOW()
) ON CONFLICT (mrn) DO NOTHING;

-- 4. Get the patient IDs we just created
SELECT id, mrn, first_name, last_name FROM patients WHERE mrn IN ('P001', 'P002');

-- 5. Create appointments for the Internal Medicine doctor
-- Replace the patient IDs with actual IDs from step 4
INSERT INTO appointments (
    id,
    patient_id,
    doctor_id,
    date_time,
    duration,
    type,
    status,
    notes,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM patients WHERE mrn = 'P001' LIMIT 1),
    'e4bf9d1b-33d5-47a5-ab51-0be00b3e130b',
    NOW() + INTERVAL '1 day',
    30,
    'consultation',
    'scheduled',
    'Regular checkup appointment',
    NOW(),
    NOW()
);

INSERT INTO appointments (
    id,
    patient_id,
    doctor_id,
    date_time,
    duration,
    type,
    status,
    notes,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM patients WHERE mrn = 'P002' LIMIT 1),
    'e4bf9d1b-33d5-47a5-ab51-0be00b3e130b',
    NOW() + INTERVAL '2 days',
    45,
    'follow-up',
    'scheduled',
    'Follow-up for diabetes management',
    NOW(),
    NOW()
);

-- 6. Create a medical record for one of the patients
INSERT INTO medical_records (
    id,
    patient_id,
    doctor_id,
    visit_date,
    diagnosis,
    treatment,
    notes,
    status,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM patients WHERE mrn = 'P001' LIMIT 1),
    'e4bf9d1b-33d5-47a5-ab51-0be00b3e130b',
    NOW() - INTERVAL '1 day',
    'Hypertension',
    'Lifestyle modifications and medication',
    'Patient shows good response to treatment',
    'active',
    NOW(),
    NOW()
);

-- 7. Verify the data was created
SELECT 
    a.id,
    a.patient_id,
    a.doctor_id,
    a.date_time,
    a.status,
    a.type,
    u.name as doctor_name,
    p.first_name,
    p.last_name,
    p.mrn
FROM appointments a
LEFT JOIN users u ON a.doctor_id = u.id
LEFT JOIN patients p ON a.patient_id = p.id
WHERE a.doctor_id = 'e4bf9d1b-33d5-47a5-ab51-0be00b3e130b';

-- 8. Check medical records
SELECT 
    mr.id,
    mr.patient_id,
    mr.doctor_id,
    mr.visit_date,
    mr.diagnosis,
    mr.treatment,
    mr.status,
    u.name as doctor_name,
    p.first_name,
    p.last_name,
    p.mrn
FROM medical_records mr
LEFT JOIN users u ON mr.doctor_id = u.id
LEFT JOIN patients p ON mr.patient_id = p.id
WHERE mr.doctor_id = 'e4bf9d1b-33d5-47a5-ab51-0be00b3e130b';
