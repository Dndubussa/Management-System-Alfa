-- Clean up sample data from pharmacy inventory tables
-- This script removes all sample data to prepare for real inventory

-- ==============================================
-- CLEAN UP SAMPLE DATA
-- ==============================================

-- Delete sample inventory transactions first (due to foreign key constraints)
delete from inventory_transactions 
where reference_type = 'initial_stock' 
   or notes like '%Initial stock entry%';

-- Delete sample medication transactions first (due to foreign key constraints)
delete from medication_transactions 
where notes like '%Initial medication stock entry%';

-- Delete sample inventory items
delete from inventory_items 
where name in (
  'Paracetamol 500mg',
  'Amoxicillin 250mg', 
  'Insulin Glargine',
  'Surgical Gloves',
  'Bandages 10cm',
  'Blood Pressure Cuff',
  'Vitamin D3',
  'Morphine 10mg'
);

-- Delete sample medication inventory
delete from medication_inventory 
where medication_name in (
  'Paracetamol',
  'Amoxicillin',
  'Insulin Glargine', 
  'Morphine'
);

-- ==============================================
-- VERIFY CLEANUP
-- ==============================================

-- Check remaining data counts
select 'inventory_items' as table_name, count(*) as remaining_count from inventory_items
union all
select 'inventory_transactions' as table_name, count(*) as remaining_count from inventory_transactions
union all
select 'medication_inventory' as table_name, count(*) as remaining_count from medication_inventory
union all
select 'medication_transactions' as table_name, count(*) as remaining_count from medication_transactions;

-- ==============================================
-- RESET SEQUENCES (if using serial columns)
-- ==============================================

-- Note: Since we're using UUID primary keys, no sequence reset is needed
-- But if you have any serial columns, you would reset them here

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================

-- ✅ Sample data has been removed from:
-- - inventory_items (8 sample items removed)
-- - inventory_transactions (sample transactions removed)
-- - medication_inventory (4 sample medications removed)  
-- - medication_transactions (sample transactions removed)

-- Your tables are now clean and ready for real inventory data!
-- You can now add your actual hospital medications and supplies.
