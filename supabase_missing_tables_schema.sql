-- Missing Tables Schema for Alfa Specialized Hospital Management System
-- This file contains all the tables that are referenced in the codebase but not yet implemented

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ==============================================
-- INVENTORY MANAGEMENT TABLES
-- ==============================================

-- Inventory items table
create table inventory_items (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text check (category in ('antibiotics', 'pain-relief', 'diabetes', 'equipment', 'surgical-supplies', 'medical-devices', 'consumables', 'wound-care', 'surgical', 'diagnostic', 'protective')) not null,
  current_stock integer not null default 0,
  min_stock integer not null default 0,
  max_stock integer not null default 0,
  unit text not null, -- tablets, units, pairs, ml, etc.
  expiry_date date,
  supplier text not null,
  cost numeric not null default 0,
  description text,
  barcode text unique,
  location text, -- storage location
  status text check (status in ('active', 'inactive', 'discontinued')) not null default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Inventory transactions table (for tracking stock movements)
create table inventory_transactions (
  id uuid default uuid_generate_v4() primary key,
  inventory_item_id uuid references inventory_items(id) not null,
  transaction_type text check (transaction_type in ('in', 'out', 'adjustment', 'expired', 'damaged')) not null,
  quantity integer not null,
  unit_cost numeric,
  total_cost numeric,
  reference_type text, -- 'prescription', 'surgery', 'purchase', 'adjustment'
  reference_id uuid, -- ID of the related record
  notes text,
  performed_by uuid not null, -- user who performed the transaction
  created_at timestamp with time zone default now()
);

-- ==============================================
-- INSURANCE PROVIDERS TABLES
-- ==============================================

-- Insurance providers table
create table insurance_providers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text unique not null,
  contact_person text not null,
  phone text not null,
  email text not null,
  address text not null,
  tariff_codes text[] not null default '{}',
  coverage_percentage numeric check (coverage_percentage >= 0 and coverage_percentage <= 100),
  max_annual_limit numeric,
  pre_authorization_required boolean default false,
  status text check (status in ('active', 'inactive', 'suspended')) not null default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Insurance provider contacts table (for multiple contacts per provider)
create table insurance_provider_contacts (
  id uuid default uuid_generate_v4() primary key,
  provider_id uuid references insurance_providers(id) not null,
  name text not null,
  position text,
  phone text,
  email text,
  is_primary boolean default false,
  created_at timestamp with time zone default now()
);

-- ==============================================
-- EQUIPMENT MANAGEMENT TABLES
-- ==============================================

-- Equipment table
create table equipment (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text check (category in ('surgical', 'diagnostic', 'monitoring', 'therapeutic', 'support')) not null,
  model text,
  serial_number text unique,
  manufacturer text,
  purchase_date date,
  warranty_expiry date,
  location text not null,
  status text check (status in ('operational', 'maintenance', 'out-of-service', 'retired')) not null default 'operational',
  last_maintenance_date date,
  next_maintenance_date date,
  maintenance_interval_days integer,
  cost numeric,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Equipment maintenance records table
create table equipment_maintenance (
  id uuid default uuid_generate_v4() primary key,
  equipment_id uuid references equipment(id) not null,
  maintenance_type text check (maintenance_type in ('preventive', 'corrective', 'calibration', 'inspection')) not null,
  maintenance_date date not null,
  performed_by text not null, -- technician or service provider
  description text not null,
  cost numeric,
  next_maintenance_date date,
  status text check (status in ('completed', 'pending', 'cancelled')) not null default 'completed',
  notes text,
  created_at timestamp with time zone default now()
);

-- ==============================================
-- SUPPLIES MANAGEMENT TABLES
-- ==============================================

-- Medical supplies table
create table medical_supplies (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text check (category in ('surgical', 'wound-care', 'diagnostic', 'protective', 'consumables')) not null,
  description text,
  unit text not null, -- pieces, boxes, rolls, etc.
  current_stock integer not null default 0,
  min_stock integer not null default 0,
  max_stock integer not null default 0,
  unit_cost numeric not null default 0,
  supplier text not null,
  expiry_date date,
  storage_conditions text, -- temperature, humidity requirements
  status text check (status in ('active', 'inactive', 'discontinued')) not null default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ==============================================
-- QUEUE MANAGEMENT TABLES
-- ==============================================

-- Patient queue table
create table patient_queue (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) not null,
  department text not null,
  priority text check (priority in ('normal', 'urgent', 'emergency')) not null default 'normal',
  status text check (status in ('waiting', 'in-progress', 'completed', 'cancelled')) not null default 'waiting',
  estimated_wait_time integer, -- in minutes
  actual_wait_time integer, -- in minutes
  called_at timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ==============================================
-- ROOM MANAGEMENT TABLES
-- ==============================================

-- Hospital rooms table
create table hospital_rooms (
  id uuid default uuid_generate_v4() primary key,
  room_number text unique not null,
  room_type text check (room_type in ('consultation', 'examination', 'procedure', 'recovery', 'isolation', 'emergency')) not null,
  department text not null,
  capacity integer not null default 1,
  status text check (status in ('available', 'occupied', 'maintenance', 'out-of-service')) not null default 'available',
  equipment_ids uuid[], -- array of equipment IDs in this room
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Room bookings table
create table room_bookings (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references hospital_rooms(id) not null,
  patient_id uuid references patients(id),
  doctor_id uuid not null,
  booking_type text check (booking_type in ('consultation', 'examination', 'procedure', 'surgery')) not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status text check (status in ('scheduled', 'in-progress', 'completed', 'cancelled')) not null default 'scheduled',
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ==============================================
-- VITAL SIGNS TRACKING TABLES
-- ==============================================

-- Vital signs table (for tracking patient vitals over time)
create table vital_signs (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) not null,
  record_id uuid references medical_records(id),
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  heart_rate integer,
  temperature numeric(4,1), -- in Celsius
  respiratory_rate integer,
  oxygen_saturation integer, -- percentage
  weight numeric(5,2), -- in kg
  height numeric(5,2), -- in cm
  bmi numeric(4,1), -- calculated BMI
  pain_level integer check (pain_level >= 0 and pain_level <= 10), -- 0-10 scale
  recorded_by uuid not null,
  recorded_at timestamp with time zone default now(),
  notes text
);

-- ==============================================
-- MEDICATION MANAGEMENT TABLES
-- ==============================================

-- Medication inventory table (separate from general inventory for medications)
create table medication_inventory (
  id uuid default uuid_generate_v4() primary key,
  medication_name text not null,
  generic_name text,
  dosage_form text check (dosage_form in ('tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler')) not null,
  strength text not null, -- e.g., "500mg", "10ml"
  manufacturer text not null,
  batch_number text,
  expiry_date date not null,
  current_stock integer not null default 0,
  min_stock integer not null default 0,
  max_stock integer not null default 0,
  unit_cost numeric not null,
  supplier text not null,
  storage_conditions text,
  controlled_substance boolean default false,
  status text check (status in ('active', 'inactive', 'recalled')) not null default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Medication interactions table
create table medication_interactions (
  id uuid default uuid_generate_v4() primary key,
  medication_1 text not null,
  medication_2 text not null,
  interaction_type text check (interaction_type in ('contraindicated', 'major', 'moderate', 'minor')) not null,
  description text not null,
  severity text check (severity in ('high', 'medium', 'low')) not null,
  created_at timestamp with time zone default now()
);

-- ==============================================
-- AUDIT AND LOGGING TABLES
-- ==============================================

-- System audit log table
create table audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null,
  action text not null, -- 'create', 'update', 'delete', 'view'
  table_name text not null,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone default now()
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Inventory items indexes
create index idx_inventory_items_category on inventory_items(category);
create index idx_inventory_items_status on inventory_items(status);
create index idx_inventory_items_expiry on inventory_items(expiry_date);
create index idx_inventory_items_supplier on inventory_items(supplier);

-- Inventory transactions indexes
create index idx_inventory_transactions_item_id on inventory_transactions(inventory_item_id);
create index idx_inventory_transactions_type on inventory_transactions(transaction_type);
create index idx_inventory_transactions_date on inventory_transactions(created_at);

-- Insurance providers indexes
create index idx_insurance_providers_code on insurance_providers(code);
create index idx_insurance_providers_status on insurance_providers(status);

-- Equipment indexes
create index idx_equipment_category on equipment(category);
create index idx_equipment_status on equipment(status);
create index idx_equipment_location on equipment(location);
create index idx_equipment_maintenance_date on equipment(next_maintenance_date);

-- Medical supplies indexes
create index idx_medical_supplies_category on medical_supplies(category);
create index idx_medical_supplies_status on medical_supplies(status);

-- Patient queue indexes
create index idx_patient_queue_department on patient_queue(department);
create index idx_patient_queue_status on patient_queue(status);
create index idx_patient_queue_priority on patient_queue(priority);
create index idx_patient_queue_created_at on patient_queue(created_at);

-- Hospital rooms indexes
create index idx_hospital_rooms_type on hospital_rooms(room_type);
create index idx_hospital_rooms_department on hospital_rooms(department);
create index idx_hospital_rooms_status on hospital_rooms(status);

-- Room bookings indexes
create index idx_room_bookings_room_id on room_bookings(room_id);
create index idx_room_bookings_start_time on room_bookings(start_time);
create index idx_room_bookings_status on room_bookings(status);

-- Vital signs indexes
create index idx_vital_signs_patient_id on vital_signs(patient_id);
create index idx_vital_signs_recorded_at on vital_signs(recorded_at);

-- Medication inventory indexes
create index idx_medication_inventory_name on medication_inventory(medication_name);
create index idx_medication_inventory_expiry on medication_inventory(expiry_date);
create index idx_medication_inventory_status on medication_inventory(status);

-- Audit logs indexes
create index idx_audit_logs_user_id on audit_logs(user_id);
create index idx_audit_logs_table_name on audit_logs(table_name);
create index idx_audit_logs_created_at on audit_logs(created_at);

-- ==============================================
-- TRIGGERS FOR UPDATED_AT
-- ==============================================

-- Create or replace the update_updated_at_column function if it doesn't exist
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
create trigger update_inventory_items_updated_at before update
    on inventory_items for each row
    execute procedure update_updated_at_column();

create trigger update_insurance_providers_updated_at before update
    on insurance_providers for each row
    execute procedure update_updated_at_column();

create trigger update_equipment_updated_at before update
    on equipment for each row
    execute procedure update_updated_at_column();

create trigger update_medical_supplies_updated_at before update
    on medical_supplies for each row
    execute procedure update_updated_at_column();

create trigger update_patient_queue_updated_at before update
    on patient_queue for each row
    execute procedure update_updated_at_column();

create trigger update_hospital_rooms_updated_at before update
    on hospital_rooms for each row
    execute procedure update_updated_at_column();

create trigger update_room_bookings_updated_at before update
    on room_bookings for each row
    execute procedure update_updated_at_column();

create trigger update_medication_inventory_updated_at before update
    on medication_inventory for each row
    execute procedure update_updated_at_column();

-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================

-- Enable RLS on all tables
alter table inventory_items enable row level security;
alter table inventory_transactions enable row level security;
alter table insurance_providers enable row level security;
alter table insurance_provider_contacts enable row level security;
alter table equipment enable row level security;
alter table equipment_maintenance enable row level security;
alter table medical_supplies enable row level security;
alter table patient_queue enable row level security;
alter table hospital_rooms enable row level security;
alter table room_bookings enable row level security;
alter table vital_signs enable row level security;
alter table medication_inventory enable row level security;
alter table medication_interactions enable row level security;
alter table audit_logs enable row level security;

-- Create RLS policies (allow authenticated users to read, specific roles to write)
-- Note: These are basic policies - you may want to customize based on your security requirements

-- Inventory items policies
create policy "Allow read access to inventory items" on inventory_items
    for select using (auth.role() = 'authenticated');

create policy "Allow write access to inventory items" on inventory_items
    for all using (auth.role() = 'authenticated');

-- Insurance providers policies
create policy "Allow read access to insurance providers" on insurance_providers
    for select using (auth.role() = 'authenticated');

create policy "Allow write access to insurance providers" on insurance_providers
    for all using (auth.role() = 'authenticated');

-- Equipment policies
create policy "Allow read access to equipment" on equipment
    for select using (auth.role() = 'authenticated');

create policy "Allow write access to equipment" on equipment
    for all using (auth.role() = 'authenticated');

-- Medical supplies policies
create policy "Allow read access to medical supplies" on medical_supplies
    for select using (auth.role() = 'authenticated');

create policy "Allow write access to medical supplies" on medical_supplies
    for all using (auth.role() = 'authenticated');

-- Patient queue policies
create policy "Allow read access to patient queue" on patient_queue
    for select using (auth.role() = 'authenticated');

create policy "Allow write access to patient queue" on patient_queue
    for all using (auth.role() = 'authenticated');

-- Hospital rooms policies
create policy "Allow read access to hospital rooms" on hospital_rooms
    for select using (auth.role() = 'authenticated');

create policy "Allow write access to hospital rooms" on hospital_rooms
    for all using (auth.role() = 'authenticated');

-- Room bookings policies
create policy "Allow read access to room bookings" on room_bookings
    for select using (auth.role() = 'authenticated');

create policy "Allow write access to room bookings" on room_bookings
    for all using (auth.role() = 'authenticated');

-- Vital signs policies
create policy "Allow read access to vital signs" on vital_signs
    for select using (auth.role() = 'authenticated');

create policy "Allow write access to vital signs" on vital_signs
    for all using (auth.role() = 'authenticated');

-- Medication inventory policies
create policy "Allow read access to medication inventory" on medication_inventory
    for select using (auth.role() = 'authenticated');

create policy "Allow write access to medication inventory" on medication_inventory
    for all using (auth.role() = 'authenticated');

-- Audit logs policies (read-only for most users)
create policy "Allow read access to audit logs" on audit_logs
    for select using (auth.role() = 'authenticated');

create policy "Allow insert access to audit logs" on audit_logs
    for insert with check (auth.role() = 'authenticated');

-- ==============================================
-- SAMPLE DATA (Optional - for testing)
-- ==============================================

-- Insert sample insurance providers
insert into insurance_providers (name, code, contact_person, phone, email, address, tariff_codes, coverage_percentage) values
('National Health Insurance Fund', 'NHIF', 'John Mwalimu', '+255 22 123 4567', 'info@nhif.or.tz', 'Dar es Salaam, Tanzania', '{"CONSULT", "LAB", "MED", "SURG"}', 100),
('Jubilee Health Insurance', 'JUB', 'Sarah Kimaro', '+255 22 234 5678', 'claims@jubilee.co.tz', 'Arusha, Tanzania', '{"CONSULT", "LAB", "MED", "SURG", "EMERG"}', 80),
('Britam Health Insurance', 'BRIT', 'Michael Mwamba', '+255 22 345 6789', 'support@britam.co.tz', 'Mwanza, Tanzania', '{"CONSULT", "LAB", "MED"}', 70);

-- Insert sample hospital rooms
insert into hospital_rooms (room_number, room_type, department, capacity) values
('C-101', 'consultation', 'Internal Medicine', 1),
('C-102', 'consultation', 'Internal Medicine', 1),
('E-201', 'examination', 'Emergency', 1),
('P-301', 'procedure', 'Ophthalmology', 1),
('R-401', 'recovery', 'Surgery', 4);

-- Insert sample equipment
insert into equipment (name, category, model, serial_number, manufacturer, location, status) values
('Blood Pressure Monitor', 'diagnostic', 'BP-200', 'BP200001', 'MedTech', 'C-101', 'operational'),
('ECG Machine', 'diagnostic', 'ECG-300', 'ECG300001', 'CardioTech', 'E-201', 'operational'),
('Surgical Table', 'surgical', 'ST-500', 'ST500001', 'SurgiTech', 'OT-1', 'operational'),
('Anesthesia Machine', 'surgical', 'AM-400', 'AM400001', 'AnesTech', 'OT-1', 'operational');

-- Insert sample inventory items
insert into inventory_items (name, category, current_stock, min_stock, max_stock, unit, supplier, cost, status) values
('Surgical Gloves', 'surgical-supplies', 500, 100, 1000, 'pairs', 'MedSupply Ltd', 0.50, 'active'),
('Syringes 5ml', 'consumables', 200, 50, 500, 'pieces', 'MedSupply Ltd', 0.25, 'active'),
('Bandages', 'wound-care', 100, 25, 200, 'rolls', 'MedSupply Ltd', 2.00, 'active'),
('Antiseptic Solution', 'consumables', 50, 10, 100, 'bottles', 'MedSupply Ltd', 5.00, 'active');

-- Insert sample medication inventory
insert into medication_inventory (medication_name, generic_name, dosage_form, strength, manufacturer, expiry_date, current_stock, min_stock, max_stock, unit_cost, supplier, status) values
('Amoxicillin', 'Amoxicillin', 'capsule', '500mg', 'PharmaCorp', '2025-12-31', 1000, 100, 2000, 0.25, 'PharmaSupply', 'active'),
('Paracetamol', 'Acetaminophen', 'tablet', '500mg', 'MediCorp', '2025-06-30', 2000, 200, 5000, 0.10, 'PharmaSupply', 'active'),
('Insulin', 'Insulin', 'injection', '100 units/ml', 'DiabetesCorp', '2024-08-31', 50, 10, 100, 45.00, 'PharmaSupply', 'active');
