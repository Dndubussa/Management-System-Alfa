-- Step-by-step Audit Trail Setup for Alfa Specialized Hospital
-- This script creates the audit trail system in the correct order

-- ==============================================
-- STEP 1: CREATE AUDIT TRAIL TABLES FIRST
-- ==============================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Main audit log table for all system activities
create table if not exists audit_logs (
  id uuid default uuid_generate_v4() primary key,
  table_name text not null, -- Which table was affected
  record_id uuid not null, -- ID of the affected record
  operation text check (operation in ('INSERT', 'UPDATE', 'DELETE', 'SELECT', 'LOGIN', 'LOGOUT', 'EXPORT', 'PRINT')) not null,
  old_values jsonb, -- Previous values (for updates/deletes)
  new_values jsonb, -- New values (for inserts/updates)
  user_id uuid references users(id), -- Who performed the action
  user_name text, -- User name for quick reference
  user_role text, -- User role for context
  ip_address inet, -- IP address of the user
  user_agent text, -- Browser/client information
  session_id text, -- Session identifier
  timestamp timestamp with time zone default now(),
  reason text, -- Reason for the action (if applicable)
  notes text, -- Additional notes
  severity text check (severity in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) default 'LOW',
  department text, -- Department context
  patient_id uuid references patients(id), -- If action relates to a patient
  created_at timestamp with time zone default now()
);

-- Audit log for prescription activities (HIPAA/medical compliance)
create table if not exists prescription_audit_logs (
  id uuid default uuid_generate_v4() primary key,
  prescription_id uuid references prescriptions(id) not null,
  patient_id uuid references patients(id) not null,
  doctor_id uuid references users(id) not null,
  action text check (action in ('CREATED', 'MODIFIED', 'DISPENSED', 'CANCELLED', 'VIEWED', 'PRINTED', 'EXPORTED')) not null,
  old_status text,
  new_status text,
  medication_name text not null,
  dosage text,
  quantity integer,
  notes text,
  performed_by uuid references users(id) not null,
  performed_by_name text not null,
  performed_by_role text not null,
  ip_address inet,
  timestamp timestamp with time zone default now(),
  reason text,
  compliance_notes text -- For regulatory compliance
);

-- Audit log for patient data access (HIPAA compliance)
create table if not exists patient_access_logs (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) not null,
  patient_name text not null, -- For quick reference
  accessed_by uuid references users(id) not null,
  accessed_by_name text not null,
  accessed_by_role text not null,
  access_type text check (access_type in ('VIEW', 'EDIT', 'CREATE', 'DELETE', 'EXPORT', 'PRINT')) not null,
  data_accessed text[], -- Array of data fields accessed
  purpose text, -- Purpose of access (treatment, billing, etc.)
  ip_address inet,
  user_agent text,
  session_id text,
  timestamp timestamp with time zone default now(),
  duration_seconds integer, -- How long the session lasted
  notes text
);

-- Audit log for medical records access
create table if not exists medical_record_audit_logs (
  id uuid default uuid_generate_v4() primary key,
  medical_record_id uuid references medical_records(id) not null,
  patient_id uuid references patients(id) not null,
  doctor_id uuid references users(id) not null,
  action text check (action in ('CREATED', 'MODIFIED', 'VIEWED', 'PRINTED', 'EXPORTED', 'DELETED')) not null,
  record_type text, -- Type of medical record
  diagnosis text,
  treatment text,
  notes text,
  performed_by uuid references users(id) not null,
  performed_by_name text not null,
  performed_by_role text not null,
  ip_address inet,
  timestamp timestamp with time zone default now(),
  reason text,
  compliance_notes text
);

-- Audit log for inventory transactions (pharmacy compliance)
create table if not exists inventory_audit_logs (
  id uuid default uuid_generate_v4() primary key,
  inventory_item_id uuid references inventory_items(id),
  medication_inventory_id uuid references medication_inventory(id),
  transaction_type text check (transaction_type in ('IN', 'OUT', 'ADJUSTMENT', 'EXPIRED', 'DAMAGED', 'RETURNED', 'DISPENSED')) not null,
  item_name text not null,
  quantity integer not null,
  unit_cost numeric,
  total_cost numeric,
  batch_number text,
  expiry_date date,
  prescription_id uuid references prescriptions(id),
  patient_id uuid references patients(id),
  performed_by uuid references users(id) not null,
  performed_by_name text not null,
  performed_by_role text not null,
  ip_address inet,
  timestamp timestamp with time zone default now(),
  reason text,
  compliance_notes text,
  controlled_substance boolean default false
);

-- Audit log for billing and financial transactions
create table if not exists billing_audit_logs (
  id uuid default uuid_generate_v4() primary key,
  bill_id uuid references bills(id) not null,
  patient_id uuid references patients(id) not null,
  action text check (action in ('CREATED', 'MODIFIED', 'PAID', 'CANCELLED', 'REFUNDED', 'VIEWED', 'PRINTED', 'EXPORTED')) not null,
  amount numeric not null,
  payment_method text,
  old_status text,
  new_status text,
  insurance_claim_id uuid references insurance_claims(id),
  performed_by uuid references users(id) not null,
  performed_by_name text not null,
  performed_by_role text not null,
  ip_address inet,
  timestamp timestamp with time zone default now(),
  reason text,
  compliance_notes text
);

-- Audit log for user authentication and authorization
create table if not exists auth_audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id),
  username text,
  action text check (action in ('LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_CHANGE', 'ACCOUNT_LOCKED', 'PERMISSION_GRANTED', 'PERMISSION_REVOKED')) not null,
  success boolean not null,
  failure_reason text,
  ip_address inet,
  user_agent text,
  session_id text,
  timestamp timestamp with time zone default now(),
  location text, -- Geographic location if available
  device_info text
);

-- ==============================================
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- ==============================================

-- Main audit log indexes
create index if not exists idx_audit_logs_table_record on audit_logs(table_name, record_id);
create index if not exists idx_audit_logs_user on audit_logs(user_id);
create index if not exists idx_audit_logs_timestamp on audit_logs(timestamp);
create index if not exists idx_audit_logs_operation on audit_logs(operation);
create index if not exists idx_audit_logs_patient on audit_logs(patient_id);

-- Prescription audit indexes
create index if not exists idx_prescription_audit_prescription on prescription_audit_logs(prescription_id);
create index if not exists idx_prescription_audit_patient on prescription_audit_logs(patient_id);
create index if not exists idx_prescription_audit_doctor on prescription_audit_logs(doctor_id);
create index if not exists idx_prescription_audit_timestamp on prescription_audit_logs(timestamp);

-- Patient access audit indexes
create index if not exists idx_patient_access_patient on patient_access_logs(patient_id);
create index if not exists idx_patient_access_user on patient_access_logs(accessed_by);
create index if not exists idx_patient_access_timestamp on patient_access_logs(timestamp);
create index if not exists idx_patient_access_type on patient_access_logs(access_type);

-- Medical record audit indexes
create index if not exists idx_medical_audit_record on medical_record_audit_logs(medical_record_id);
create index if not exists idx_medical_audit_patient on medical_record_audit_logs(patient_id);
create index if not exists idx_medical_audit_doctor on medical_record_audit_logs(doctor_id);
create index if not exists idx_medical_audit_timestamp on medical_record_audit_logs(timestamp);

-- Inventory audit indexes
create index if not exists idx_inventory_audit_item on inventory_audit_logs(inventory_item_id);
create index if not exists idx_inventory_audit_medication on inventory_audit_logs(medication_inventory_id);
create index if not exists idx_inventory_audit_patient on inventory_audit_logs(patient_id);
create index if not exists idx_inventory_audit_timestamp on inventory_audit_logs(timestamp);
create index if not exists idx_inventory_audit_controlled on inventory_audit_logs(controlled_substance);

-- Billing audit indexes
create index if not exists idx_billing_audit_bill on billing_audit_logs(bill_id);
create index if not exists idx_billing_audit_patient on billing_audit_logs(patient_id);
create index if not exists idx_billing_audit_timestamp on billing_audit_logs(timestamp);

-- Auth audit indexes
create index if not exists idx_auth_audit_user on auth_audit_logs(user_id);
create index if not exists idx_auth_audit_timestamp on auth_audit_logs(timestamp);
create index if not exists idx_auth_audit_action on auth_audit_logs(action);
create index if not exists idx_auth_audit_success on auth_audit_logs(success);

-- ==============================================
-- STEP 3: ENABLE ROW LEVEL SECURITY
-- ==============================================

-- Enable RLS on all audit tables
alter table audit_logs enable row level security;
alter table prescription_audit_logs enable row level security;
alter table patient_access_logs enable row level security;
alter table medical_record_audit_logs enable row level security;
alter table inventory_audit_logs enable row level security;
alter table billing_audit_logs enable row level security;
alter table auth_audit_logs enable row level security;

-- RLS Policies - Only admin and audit roles can view audit logs
create policy "Admin can view all audit logs" on audit_logs
  for select using (
    auth.jwt() ->> 'role' in ('admin', 'audit', 'compliance')
  );

create policy "Admin can view prescription audit logs" on prescription_audit_logs
  for select using (
    auth.jwt() ->> 'role' in ('admin', 'audit', 'compliance', 'pharmacy')
  );

create policy "Admin can view patient access logs" on patient_access_logs
  for select using (
    auth.jwt() ->> 'role' in ('admin', 'audit', 'compliance')
  );

create policy "Admin can view medical record audit logs" on medical_record_audit_logs
  for select using (
    auth.jwt() ->> 'role' in ('admin', 'audit', 'compliance', 'doctor')
  );

create policy "Admin can view inventory audit logs" on inventory_audit_logs
  for select using (
    auth.jwt() ->> 'role' in ('admin', 'audit', 'compliance', 'pharmacy')
  );

create policy "Admin can view billing audit logs" on billing_audit_logs
  for select using (
    auth.jwt() ->> 'role' in ('admin', 'audit', 'compliance', 'cashier', 'receptionist')
  );

create policy "Admin can view auth audit logs" on auth_audit_logs
  for select using (
    auth.jwt() ->> 'role' in ('admin', 'audit', 'compliance')
  );

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================

-- ✅ STEP 1 COMPLETE: AUDIT TRAIL TABLES CREATED
-- 
-- Your audit trail tables are now created with:
-- 
-- **Database Tables:**
-- ✅ 7 specialized audit tables created
-- ✅ All indexes for performance optimization
-- ✅ Row Level Security enabled
-- ✅ RLS policies configured
-- 
-- **Next Steps:**
-- 1. Run setup-audit-trail-functions.sql to create the functions
-- 2. Run setup-audit-trail-triggers.sql to add triggers
-- 3. Test the complete system
-- 
-- **Ready for Functions!** 🏥📋✅
