-- Minimal script to add Rogers Aluli as OT Coordinator
-- This script only does the essential INSERT without any verification queries

INSERT INTO users (
    id,
    name,
    email,
    role,
    department
) VALUES (
    '12d8b35f-0905-4d45-8aea-f0e1448f55de',
    'Rogers Aluli',
    'alulirogers@gmail.com',
    'ot-coordinator',
    'Operating Theatre'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    department = EXCLUDED.department;
