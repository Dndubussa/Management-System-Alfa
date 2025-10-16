-- Template for adding real inventory data
-- Replace the sample data below with your actual hospital inventory

-- ==============================================
-- ADD REAL INVENTORY ITEMS
-- ==============================================

-- Example: Add your actual medications and supplies
-- Replace the examples below with your real data

insert into inventory_items (name, category, current_stock, min_stock, max_stock, unit, expiry_date, supplier, cost, selling_price, description, location) values
-- Add your medications here (examples):
-- ('Your Medication Name', 'category', current_stock, min_stock, max_stock, 'unit', 'expiry_date'::date, 'supplier', cost, selling_price, 'description', 'location'),
-- ('Another Medication', 'antibiotics', 100, 10, 200, 'tablets', '2025-12-31'::date, 'Your Supplier', 2.50, 5.00, 'Description', 'Pharmacy A'),

-- Add your medical supplies here (examples):
-- ('Surgical Gloves', 'protective', 1000, 100, 2000, 'pairs', '2026-01-01'::date, 'Medical Supply Co', 0.30, 0.60, 'Disposable gloves', 'Storage Room'),
-- ('Bandages', 'wound-care', 500, 50, 1000, 'rolls', '2027-01-01'::date, 'Supply Company', 1.00, 2.00, 'Elastic bandages', 'Storage Room'),

-- Add your equipment here (examples):
-- ('Blood Pressure Monitor', 'diagnostic', 5, 1, 10, 'units', '2028-01-01'::date, 'Equipment Supplier', 50.00, 100.00, 'Digital BP monitor', 'Equipment Room'),

-- Add your consumables here (examples):
-- ('Syringes 5ml', 'consumables', 200, 20, 500, 'units', '2026-06-30'::date, 'Medical Supplies', 0.50, 1.00, 'Disposable syringes', 'Pharmacy B');

-- ==============================================
-- ADD REAL MEDICATION INVENTORY
-- ==============================================

-- Example: Add your actual medications with batch tracking
-- Replace the examples below with your real medication data

insert into medication_inventory (medication_name, generic_name, dosage_form, strength, manufacturer, batch_number, expiry_date, current_stock, min_stock, max_stock, unit_cost, selling_price, supplier, storage_conditions, controlled_substance, prescription_required) values
-- Add your medications here (examples):
-- ('Your Medication Name', 'Generic Name', 'tablet', 'strength', 'Manufacturer', 'BATCH001', '2025-12-31'::date, current_stock, min_stock, max_stock, unit_cost, selling_price, 'Supplier', 'storage_conditions', false, true),
-- ('Paracetamol', 'Acetaminophen', 'tablet', '500mg', 'Your Pharma', 'PAR2024001', '2025-12-31'::date, 1000, 100, 2000, 0.50, 1.00, 'Your Supplier', 'Room temperature', false, false),
-- ('Amoxicillin', 'Amoxicillin', 'capsule', '250mg', 'Antibiotic Co', 'AMX2024001', '2025-06-30'::date, 500, 50, 1000, 2.00, 4.00, 'Pharma Supplier', 'Room temperature', false, true),
-- ('Insulin', 'Insulin Glargine', 'injection', '100 units/ml', 'Diabetic Care', 'INS2024001', '2025-03-15'::date, 50, 10, 100, 25.00, 50.00, 'Medical Supply', 'Refrigerated 2-8°C', false, true);

-- ==============================================
-- ADD INITIAL TRANSACTIONS
-- ==============================================

-- Create initial stock transactions for your inventory items
-- This will create a transaction record for the initial stock

insert into inventory_transactions (inventory_item_id, transaction_type, quantity, unit_cost, total_cost, reference_type, notes, performed_by) 
select 
  ii.id,
  'in',
  ii.current_stock,
  ii.cost,
  ii.cost * ii.current_stock,
  'initial_stock',
  'Initial stock entry - Real inventory',
  u.id
from inventory_items ii
cross join (select id from users where role = 'admin' limit 1) u
where ii.created_at > now() - interval '1 hour'; -- Only for recently added items

-- Create initial medication transactions
insert into medication_transactions (medication_inventory_id, transaction_type, quantity, unit_cost, total_cost, notes, performed_by)
select 
  mi.id,
  'received',
  mi.current_stock,
  mi.unit_cost,
  mi.unit_cost * mi.current_stock,
  'Initial medication stock entry - Real inventory',
  u.id
from medication_inventory mi
cross join (select id from users where role = 'admin' limit 1) u
where mi.created_at > now() - interval '1 hour'; -- Only for recently added items

-- ==============================================
-- CATEGORIES REFERENCE
-- ==============================================

-- Available categories for inventory_items:
-- 'antibiotics', 'pain-relief', 'diabetes', 'cardiovascular', 
-- 'respiratory', 'gastrointestinal', 'neurological', 'dermatological',
-- 'equipment', 'surgical-supplies', 'medical-devices', 'consumables', 
-- 'wound-care', 'surgical', 'diagnostic', 'protective', 'vitamins'

-- Available dosage forms for medication_inventory:
-- 'tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'patch', 'suppository'

-- ==============================================
-- INSTRUCTIONS
-- ==============================================

-- 1. Replace the example data above with your actual inventory
-- 2. Update the categories to match your items
-- 3. Set appropriate stock levels (current, min, max)
-- 4. Add real supplier information
-- 5. Set correct expiry dates
-- 6. Configure storage conditions for medications
-- 7. Mark controlled substances appropriately
-- 8. Set prescription requirements correctly

-- After adding your real data, you can:
-- - View inventory in the app's Inventory section
-- - Track stock levels and expiry dates
-- - Monitor low stock alerts
-- - Automatically deduct stock when dispensing prescriptions
