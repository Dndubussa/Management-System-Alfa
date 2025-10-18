-- Debug script to check doctor patients and appointments
-- Run this in Supabase SQL editor to diagnose the issue

-- 1. Check if the doctor exists in the users table
SELECT id, name, email, role, department 
FROM users 
WHERE role = 'doctor' 
AND department = 'Internal Medicine';

-- 2. Check if there are any appointments for this doctor
SELECT 
    a.id,
    a.patient_id,
    a.doctor_id,
    a.date_time,
    a.status,
    a.type,
    u.name as doctor_name,
    p.first_name,
    p.last_name
FROM appointments a
LEFT JOIN users u ON a.doctor_id = u.id
LEFT JOIN patients p ON a.patient_id = p.id
WHERE a.doctor_id = 'e4bf9d1b-33d5-47a5-ab51-0be00b3e130b';

-- 3. Check all appointments in the system
SELECT COUNT(*) as total_appointments FROM appointments;

-- 4. Check all patients in the system
SELECT COUNT(*) as total_patients FROM patients;

-- 5. Check if there are any appointments at all
SELECT 
    a.id,
    a.patient_id,
    a.doctor_id,
    a.date_time,
    a.status,
    u.name as doctor_name,
    u.role,
    u.department
FROM appointments a
LEFT JOIN users u ON a.doctor_id = u.id
LIMIT 10;

-- 6. Check if there are any patients at all
SELECT 
    id,
    first_name,
    last_name,
    mrn,
    created_at
FROM patients
LIMIT 10;

-- 7. Check the appointments table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;

-- 8. Check if there are any medical records for this doctor
SELECT 
    mr.id,
    mr.patient_id,
    mr.doctor_id,
    mr.visit_date,
    mr.diagnosis,
    u.name as doctor_name,
    p.first_name,
    p.last_name
FROM medical_records mr
LEFT JOIN users u ON mr.doctor_id = u.id
LEFT JOIN patients p ON mr.patient_id = p.id
WHERE mr.doctor_id = 'e4bf9d1b-33d5-47a5-ab51-0be00b3e130b';
