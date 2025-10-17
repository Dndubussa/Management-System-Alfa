-- Add Sample Service Prices
-- This will populate your service_prices table

-- Add sample service prices
INSERT INTO service_prices (
    id,
    service_name,
    category,
    price,
    description,
    created_at,
    updated_at
) VALUES
(
    gen_random_uuid(),
    'General Consultation',
    'consultation',
    50000,
    'General medical consultation with doctor',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Specialist Consultation',
    'consultation',
    80000,
    'Specialist medical consultation',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Blood Test - Complete',
    'lab-test',
    25000,
    'Complete blood count (CBC)',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Blood Test - Sugar',
    'lab-test',
    15000,
    'Blood sugar level test',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'X-Ray Chest',
    'imaging',
    75000,
    'Chest X-ray examination',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'X-Ray Limb',
    'imaging',
    45000,
    'Limb X-ray examination',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Ultrasound Abdomen',
    'imaging',
    120000,
    'Abdominal ultrasound scan',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'ECG',
    'diagnostic',
    30000,
    'Electrocardiogram',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Urine Test',
    'lab-test',
    10000,
    'Urine analysis',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Eye Examination',
    'consultation',
    40000,
    'Comprehensive eye examination',
    NOW(),
    NOW()
);

-- Verify the data was inserted
SELECT 'Sample service prices inserted successfully!' as status;

-- Check the count
SELECT COUNT(*) as total_service_prices FROM service_prices;

-- Show the inserted service prices
SELECT 
    service_name,
    category,
    price,
    description
FROM service_prices 
ORDER BY category, service_name;
