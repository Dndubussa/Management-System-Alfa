-- Safe Pharmacy Inventory Management Schema for Alfa Specialized Hospital
-- This file safely creates the pharmacy inventory tracking system, handling existing tables

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ==============================================
-- PHARMACY INVENTORY MANAGEMENT TABLES
-- ==============================================

-- Inventory items table (general medical supplies and medications)
-- Use IF NOT EXISTS to avoid errors if table already exists
create table if not exists inventory_items (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text check (category in (
    'antibiotics', 'pain-relief', 'diabetes', 'cardiovascular', 
    'respiratory', 'gastrointestinal', 'neurological', 'dermatological',
    'equipment', 'surgical-supplies', 'medical-devices', 'consumables', 
    'wound-care', 'surgical', 'diagnostic', 'protective', 'vitamins'
  )) not null,
  current_stock integer not null default 0,
  min_stock integer not null default 0,
  max_stock integer not null default 0,
  unit text not null, -- tablets, capsules, ml, units, boxes, etc.
  expiry_date date,
  supplier text not null,
  cost numeric not null default 0,
  selling_price numeric not null default 0,
  description text,
  barcode text unique,
  location text, -- storage location (pharmacy, ward, etc.)
  status text check (status in ('active', 'inactive', 'discontinued')) not null default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Inventory transactions table (for tracking stock movements)
create table if not exists inventory_transactions (
  id uuid default uuid_generate_v4() primary key,
  inventory_item_id uuid references inventory_items(id) not null,
  transaction_type text check (transaction_type in ('in', 'out', 'adjustment', 'expired', 'damaged', 'returned')) not null,
  quantity integer not null,
  unit_cost numeric,
  total_cost numeric,
  reference_type text, -- 'prescription', 'surgery', 'purchase', 'adjustment', 'return'
  reference_id uuid, -- ID of the related record (prescription, purchase order, etc.)
  notes text,
  performed_by uuid not null, -- user who performed the transaction
  created_at timestamp with time zone default now()
);

-- Medication inventory table (dedicated medication tracking with batch info)
create table if not exists medication_inventory (
  id uuid default uuid_generate_v4() primary key,
  medication_name text not null,
  generic_name text,
  dosage_form text check (dosage_form in ('tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'patch', 'suppository')) not null,
  strength text not null, -- e.g., "500mg", "10ml", "2.5mg/ml"
  manufacturer text not null,
  batch_number text not null,
  expiry_date date not null,
  current_stock integer not null default 0,
  min_stock integer not null default 0,
  max_stock integer not null default 0,
  unit_cost numeric not null,
  selling_price numeric not null,
  supplier text not null,
  storage_conditions text, -- temperature, humidity requirements
  controlled_substance boolean default false,
  prescription_required boolean default true,
  status text check (status in ('active', 'inactive', 'recalled', 'expired')) not null default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Medication transactions table (for medication-specific stock movements)
create table if not exists medication_transactions (
  id uuid default uuid_generate_v4() primary key,
  medication_inventory_id uuid references medication_inventory(id) not null,
  transaction_type text check (transaction_type in ('dispensed', 'received', 'adjustment', 'expired', 'damaged', 'returned')) not null,
  quantity integer not null,
  unit_cost numeric,
  total_cost numeric,
  prescription_id uuid references prescriptions(id), -- link to prescription if dispensed
  notes text,
  performed_by uuid not null, -- user who performed the transaction
  created_at timestamp with time zone default now()
);

-- ==============================================
-- INDEXES FOR PERFORMANCE (CREATE IF NOT EXISTS)
-- ==============================================

-- Inventory items indexes
create index if not exists idx_inventory_items_category on inventory_items(category);
create index if not exists idx_inventory_items_status on inventory_items(status);
create index if not exists idx_inventory_items_expiry on inventory_items(expiry_date);
create index if not exists idx_inventory_items_stock on inventory_items(current_stock);

-- Inventory transactions indexes
create index if not exists idx_inventory_transactions_item on inventory_transactions(inventory_item_id);
create index if not exists idx_inventory_transactions_type on inventory_transactions(transaction_type);
create index if not exists idx_inventory_transactions_date on inventory_transactions(created_at);

-- Medication inventory indexes
create index if not exists idx_medication_inventory_name on medication_inventory(medication_name);
create index if not exists idx_medication_inventory_batch on medication_inventory(batch_number);
create index if not exists idx_medication_inventory_expiry on medication_inventory(expiry_date);
create index if not exists idx_medication_inventory_status on medication_inventory(status);

-- Medication transactions indexes
create index if not exists idx_medication_transactions_medication on medication_transactions(medication_inventory_id);
create index if not exists idx_medication_transactions_type on medication_transactions(transaction_type);
create index if not exists idx_medication_transactions_prescription on medication_transactions(prescription_id);

-- ==============================================
-- ROW LEVEL SECURITY (RLS) - DROP AND RECREATE POLICIES
-- ==============================================

-- Enable RLS on all tables
alter table inventory_items enable row level security;
alter table inventory_transactions enable row level security;
alter table medication_inventory enable row level security;
alter table medication_transactions enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view inventory items" on inventory_items;
drop policy if exists "Pharmacy and admin can manage inventory items" on inventory_items;
drop policy if exists "Users can view inventory transactions" on inventory_transactions;
drop policy if exists "Pharmacy and admin can manage inventory transactions" on inventory_transactions;
drop policy if exists "Users can view medication inventory" on medication_inventory;
drop policy if exists "Pharmacy and admin can manage medication inventory" on medication_inventory;
drop policy if exists "Users can view medication transactions" on medication_transactions;
drop policy if exists "Pharmacy and admin can manage medication transactions" on medication_transactions;

-- RLS Policies for inventory_items
create policy "Users can view inventory items" on inventory_items
  for select using (true);

create policy "Pharmacy and admin can manage inventory items" on inventory_items
  for all using (
    auth.jwt() ->> 'role' in ('pharmacy', 'admin', 'receptionist')
  );

-- RLS Policies for inventory_transactions
create policy "Users can view inventory transactions" on inventory_transactions
  for select using (true);

create policy "Pharmacy and admin can manage inventory transactions" on inventory_transactions
  for all using (
    auth.jwt() ->> 'role' in ('pharmacy', 'admin')
  );

-- RLS Policies for medication_inventory
create policy "Users can view medication inventory" on medication_inventory
  for select using (true);

create policy "Pharmacy and admin can manage medication inventory" on medication_inventory
  for all using (
    auth.jwt() ->> 'role' in ('pharmacy', 'admin')
  );

-- RLS Policies for medication_transactions
create policy "Users can view medication transactions" on medication_transactions
  for select using (true);

create policy "Pharmacy and admin can manage medication transactions" on medication_transactions
  for all using (
    auth.jwt() ->> 'role' in ('pharmacy', 'admin')
  );

-- ==============================================
-- TRIGGERS FOR UPDATED_AT (CREATE IF NOT EXISTS)
-- ==============================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Drop existing triggers if they exist
drop trigger if exists update_inventory_items_updated_at on inventory_items;
drop trigger if exists update_medication_inventory_updated_at on medication_inventory;

-- Triggers for updated_at
create trigger update_inventory_items_updated_at
  before update on inventory_items
  for each row execute function update_updated_at_column();

create trigger update_medication_inventory_updated_at
  before update on medication_inventory
  for each row execute function update_updated_at_column();

-- ==============================================
-- SAMPLE DATA FOR TESTING (INSERT ONLY IF NOT EXISTS)
-- ==============================================

-- Sample inventory items (only insert if table is empty)
insert into inventory_items (name, category, current_stock, min_stock, max_stock, unit, expiry_date, supplier, cost, selling_price, description, location) 
select * from (values
  ('Paracetamol 500mg', 'pain-relief', 1000, 100, 2000, 'tablets', '2025-12-31', 'MedPharm Ltd', 0.50, 1.00, 'Pain relief and fever reducer', 'Pharmacy A'),
  ('Amoxicillin 250mg', 'antibiotics', 500, 50, 1000, 'capsules', '2025-06-30', 'Antibio Corp', 2.00, 4.00, 'Broad spectrum antibiotic', 'Pharmacy A'),
  ('Insulin Glargine', 'diabetes', 50, 10, 100, 'vials', '2025-03-15', 'DiabetCare Inc', 25.00, 50.00, 'Long-acting insulin', 'Pharmacy Refrigerator'),
  ('Surgical Gloves', 'protective', 2000, 200, 5000, 'pairs', '2026-01-01', 'MedSupply Co', 0.25, 0.50, 'Disposable surgical gloves', 'Storage Room B'),
  ('Bandages 10cm', 'wound-care', 500, 50, 1000, 'rolls', '2027-01-01', 'WoundCare Ltd', 1.50, 3.00, 'Elastic bandages', 'Storage Room A'),
  ('Blood Pressure Cuff', 'diagnostic', 20, 5, 50, 'units', '2028-01-01', 'MedEquip Inc', 15.00, 30.00, 'Digital blood pressure monitor', 'Equipment Room'),
  ('Vitamin D3', 'vitamins', 300, 30, 600, 'tablets', '2025-08-31', 'VitHealth Ltd', 0.75, 1.50, 'Vitamin D3 supplement', 'Pharmacy A'),
  ('Morphine 10mg', 'pain-relief', 100, 10, 200, 'vials', '2025-04-30', 'ControlledMed Ltd', 5.00, 10.00, 'Controlled pain medication', 'Controlled Substances Safe')
) as sample_data(name, category, current_stock, min_stock, max_stock, unit, expiry_date, supplier, cost, selling_price, description, location)
where not exists (select 1 from inventory_items limit 1);

-- Sample medication inventory with batch tracking (only insert if table is empty)
insert into medication_inventory (medication_name, generic_name, dosage_form, strength, manufacturer, batch_number, expiry_date, current_stock, min_stock, max_stock, unit_cost, selling_price, supplier, storage_conditions, controlled_substance, prescription_required) 
select * from (values
  ('Paracetamol', 'Acetaminophen', 'tablet', '500mg', 'MedPharm Ltd', 'PAR2024001', '2025-12-31', 1000, 100, 2000, 0.50, 1.00, 'MedPharm Ltd', 'Room temperature', false, false),
  ('Amoxicillin', 'Amoxicillin', 'capsule', '250mg', 'Antibio Corp', 'AMX2024001', '2025-06-30', 500, 50, 1000, 2.00, 4.00, 'Antibio Corp', 'Room temperature', false, true),
  ('Insulin Glargine', 'Insulin Glargine', 'injection', '100 units/ml', 'DiabetCare Inc', 'INS2024001', '2025-03-15', 50, 10, 100, 25.00, 50.00, 'DiabetCare Inc', 'Refrigerated 2-8°C', false, true),
  ('Morphine', 'Morphine Sulfate', 'injection', '10mg/ml', 'ControlledMed Ltd', 'MOR2024001', '2025-04-30', 100, 10, 200, 5.00, 10.00, 'ControlledMed Ltd', 'Room temperature', true, true)
) as sample_data(medication_name, generic_name, dosage_form, strength, manufacturer, batch_number, expiry_date, current_stock, min_stock, max_stock, unit_cost, selling_price, supplier, storage_conditions, controlled_substance, prescription_required)
where not exists (select 1 from medication_inventory limit 1);

-- Sample inventory transactions (only insert if table is empty)
insert into inventory_transactions (inventory_item_id, transaction_type, quantity, unit_cost, total_cost, reference_type, notes, performed_by) 
select 
  ii.id,
  'in',
  ii.current_stock,
  ii.cost,
  ii.cost * ii.current_stock,
  'initial_stock',
  'Initial stock entry',
  u.id
from inventory_items ii
cross join (select id from users where role = 'admin' limit 1) u
where not exists (select 1 from inventory_transactions limit 1);

-- Sample medication transactions (only insert if table is empty)
insert into medication_transactions (medication_inventory_id, transaction_type, quantity, unit_cost, total_cost, notes, performed_by)
select 
  mi.id,
  'received',
  mi.current_stock,
  mi.unit_cost,
  mi.unit_cost * mi.current_stock,
  'Initial medication stock entry',
  u.id
from medication_inventory mi
cross join (select id from users where role = 'admin' limit 1) u
where not exists (select 1 from medication_transactions limit 1);

-- ==============================================
-- FUNCTIONS FOR INVENTORY MANAGEMENT (CREATE OR REPLACE)
-- ==============================================

-- Function to check low stock items
create or replace function get_low_stock_items()
returns table (
  id uuid,
  name text,
  category text,
  current_stock integer,
  min_stock integer,
  unit text
) as $$
begin
  return query
  select 
    ii.id,
    ii.name,
    ii.category,
    ii.current_stock,
    ii.min_stock,
    ii.unit
  from inventory_items ii
  where ii.current_stock <= ii.min_stock
  and ii.status = 'active'
  order by (ii.current_stock::float / ii.min_stock::float) asc;
end;
$$ language plpgsql;

-- Function to check expiring items (within 30 days)
create or replace function get_expiring_items()
returns table (
  id uuid,
  name text,
  category text,
  current_stock integer,
  expiry_date date,
  days_until_expiry integer
) as $$
begin
  return query
  select 
    ii.id,
    ii.name,
    ii.category,
    ii.current_stock,
    ii.expiry_date,
    (ii.expiry_date - current_date)::integer as days_until_expiry
  from inventory_items ii
  where ii.expiry_date is not null
  and ii.expiry_date <= current_date + interval '30 days'
  and ii.status = 'active'
  order by ii.expiry_date asc;
end;
$$ language plpgsql;

-- Function to update inventory stock
create or replace function update_inventory_stock(
  item_id uuid,
  transaction_type text,
  quantity integer,
  unit_cost numeric default null,
  reference_type text default null,
  reference_id uuid default null,
  notes text default null,
  performed_by_id uuid default null
)
returns void as $$
declare
  current_stock integer;
  new_stock integer;
begin
  -- Get current stock
  select current_stock into current_stock
  from inventory_items
  where id = item_id;
  
  -- Calculate new stock based on transaction type
  if transaction_type = 'in' then
    new_stock := current_stock + quantity;
  elsif transaction_type = 'out' then
    new_stock := current_stock - quantity;
  elsif transaction_type = 'adjustment' then
    new_stock := quantity; -- Direct adjustment
  else
    new_stock := current_stock; -- No change for other types
  end if;
  
  -- Update inventory item
  update inventory_items
  set current_stock = new_stock,
      updated_at = now()
  where id = item_id;
  
  -- Insert transaction record
  insert into inventory_transactions (
    inventory_item_id,
    transaction_type,
    quantity,
    unit_cost,
    total_cost,
    reference_type,
    reference_id,
    notes,
    performed_by
  ) values (
    item_id,
    transaction_type,
    quantity,
    unit_cost,
    case when unit_cost is not null then unit_cost * quantity else null end,
    reference_type,
    reference_id,
    notes,
    performed_by_id
  );
end;
$$ language plpgsql;

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================

-- This completes the pharmacy inventory management system setup
-- The system now includes:
-- 1. General inventory tracking (inventory_items)
-- 2. Medication-specific tracking (medication_inventory)
-- 3. Transaction history for both
-- 4. Low stock and expiry monitoring functions
-- 5. Stock update functions
-- 6. Proper RLS policies
-- 7. Sample data for testing (only if tables are empty)

-- ✅ SAFE TO RUN - This script handles existing tables gracefully!
