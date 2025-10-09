-- Supabase schema for Alfa Specialized Hospital Management System

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Patients table
create table patients (
  id uuid default uuid_generate_v4() primary key,
  mrn text unique not null,
  first_name text not null,
  last_name text not null,
  date_of_birth date not null,
  gender text check (gender in ('male', 'female', 'other')) not null,
  phone text not null,
  address text not null,
  emergency_contact_name text not null,
  emergency_contact_phone text not null,
  emergency_contact_relationship text not null,
  insurance_provider text not null,
  insurance_membership_number text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Medical records table
create table medical_records (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) not null,
  doctor_id uuid not null,
  visit_date date not null,
  chief_complaint text not null,
  diagnosis text not null,
  treatment text not null,
  notes text not null,
  blood_pressure text not null,
  heart_rate text not null,
  temperature text not null,
  weight text not null,
  height text not null,
  status text check (status in ('active', 'completed', 'cancelled')) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Prescriptions table
create table prescriptions (
  id uuid default uuid_generate_v4() primary key,
  record_id uuid references medical_records(id) not null,
  patient_id uuid references patients(id) not null,
  doctor_id uuid not null,
  medication text not null,
  dosage text not null,
  frequency text not null,
  duration text not null,
  instructions text not null,
  status text check (status in ('pending', 'dispensed', 'cancelled')) not null,
  created_at timestamp with time zone default now()
);

-- Lab orders table
create table lab_orders (
  id uuid default uuid_generate_v4() primary key,
  record_id uuid references medical_records(id) not null,
  patient_id uuid references patients(id) not null,
  doctor_id uuid not null,
  test_name text not null,
  instructions text not null,
  status text check (status in ('ordered', 'in-progress', 'completed', 'cancelled')) not null,
  results text,
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

-- Appointments table
create table appointments (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) not null,
  doctor_id uuid not null,
  date_time timestamp with time zone not null,
  duration integer not null,
  type text check (type in ('consultation', 'follow-up', 'emergency')) not null,
  status text check (status in ('scheduled', 'in-progress', 'completed', 'cancelled')) not null,
  notes text
);

-- Users table
create table users (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text unique not null,
  role text check (role in ('receptionist', 'doctor', 'lab', 'pharmacy', 'radiologist', 'ophthalmologist', 'admin', 'ot-coordinator')) not null,
  department text not null
);

-- Notifications table
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_ids uuid[] not null,
  type text check (type in ('prescription', 'lab-order', 'appointment', 'general', 'queue', 'billing')) not null,
  title text not null,
  message text not null,
  is_read boolean default false,
  department text,
  created_at timestamp with time zone default now()
);

-- Service prices table
create table service_prices (
  id uuid default uuid_generate_v4() primary key,
  category text check (category in ('consultation', 'lab-test', 'medication', 'procedure')) not null,
  service_name text not null,
  price numeric not null,
  description text not null
);

-- Bills table
create table bills (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) not null,
  subtotal numeric not null,
  tax numeric not null,
  discount numeric not null,
  total numeric not null,
  status text check (status in ('pending', 'paid', 'cancelled')) not null,
  payment_method text,
  created_at timestamp with time zone default now(),
  paid_at timestamp with time zone
);

-- Bill items table
create table bill_items (
  id uuid default uuid_generate_v4() primary key,
  bill_id uuid references bills(id) not null,
  service_id uuid not null,
  service_name text not null,
  category text not null,
  unit_price numeric not null,
  quantity integer not null,
  total_price numeric not null
);

-- Departments table
create table departments (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  doctors uuid[] not null
);

-- Referrals table
create table referrals (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) not null,
  referring_doctor_id uuid not null,
  specialist text not null,
  reason text not null,
  status text check (status in ('pending', 'accepted', 'rejected', 'completed')) not null,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Insurance claims table
create table insurance_claims (
  id uuid default uuid_generate_v4() primary key,
  bill_id uuid references bills(id) not null,
  patient_id uuid references patients(id) not null,
  insurance_provider text not null,
  membership_number text not null,
  claim_amount numeric not null,
  claimed_amount numeric not null,
  status text check (status in ('pending', 'submitted', 'approved', 'rejected', 'paid')) not null,
  submission_date timestamp with time zone not null,
  approval_date timestamp with time zone,
  rejection_reason text,
  nhif_claim_number text,
  notes text
);

-- Surgery requests table
create table surgery_requests (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) not null,
  requesting_doctor_id uuid not null,
  surgery_type text not null,
  urgency text check (urgency in ('routine', 'urgent', 'emergency')) not null,
  requested_date date not null,
  status text check (status in ('pending', 'reviewed', 'scheduled', 'pre-op', 'in-progress', 'post-op', 'completed', 'cancelled', 'postponed')) not null,
  diagnosis text not null,
  notes text,
  emr_summary text,
  lab_results text,
  radiology_results text,
  asa_classification text,
  anesthesia_plan text,
  fasting_status text,
  pre_op_medications text,
  ot_room_id uuid,
  consent_form_signed boolean,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- OT slots table
create table ot_slots (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  start_time time not null,
  end_time time not null,
  ot_room_id uuid not null,
  surgery_request_id uuid references surgery_requests(id),
  status text check (status in ('available', 'booked', 'blocked', 'maintenance')) not null,
  notes text
);

-- OT resources table
create table ot_resources (
  id uuid default uuid_generate_v4() primary key,
  type text check (type in ('surgeon', 'anesthesiologist', 'nurse', 'ot-room', 'equipment', 'instrument')) not null,
  name text not null,
  specialty text,
  availability jsonb,
  notes text
);

-- OT checklists table
create table ot_checklists (
  id uuid default uuid_generate_v4() primary key,
  surgery_request_id uuid references surgery_requests(id) not null,
  status text check (status in ('pending', 'in-progress', 'completed')) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- OT checklist items table
create table ot_checklist_items (
  id uuid default uuid_generate_v4() primary key,
  checklist_id uuid references ot_checklists(id) not null,
  category text not null,
  description text not null,
  checked boolean not null,
  checked_by uuid,
  checked_at timestamp with time zone
);

-- Surgery progress table
create table surgery_progress (
  id uuid default uuid_generate_v4() primary key,
  surgery_request_id uuid references surgery_requests(id) not null,
  status text check (status in ('pre-op', 'in-progress', 'closed', 'post-op', 'completed')) not null,
  timestamp timestamp with time zone not null,
  notes text,
  updated_by uuid not null
);

-- OT reports table
create table ot_reports (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  type text check (type in ('daily', 'weekly', 'monthly')) not null,
  total_surgeries integer not null,
  emergency_surgeries integer not null,
  elective_surgeries integer not null,
  cancelled_surgeries integer not null,
  postponed_surgeries integer not null,
  complications integer not null,
  mortality integer not null,
  created_at timestamp with time zone default now()
);

-- OT report surgeries table
create table ot_report_surgeries (
  id uuid default uuid_generate_v4() primary key,
  report_id uuid references ot_reports(id) not null,
  surgery_request_id uuid references surgery_requests(id) not null,
  surgery_type text not null,
  status text check (status in ('completed', 'cancelled', 'postponed')) not null,
  complications text,
  notes text
);

-- Set up automatic updated_at updates
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_patients_updated_at before update
    on patients for each row
    execute procedure update_updated_at_column();

create trigger update_medical_records_updated_at before update
    on medical_records for each row
    execute procedure update_updated_at_column();

create trigger update_referrals_updated_at before update
    on referrals for each row
    execute procedure update_updated_at_column();

create trigger update_surgery_requests_updated_at before update
    on surgery_requests for each row
    execute procedure update_updated_at_column();

create trigger update_ot_checklists_updated_at before update
    on ot_checklists for each row
    execute procedure update_updated_at_column();