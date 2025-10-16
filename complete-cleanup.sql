-- Complete cleanup of all sample data from pharmacy inventory tables
-- This script removes ALL data to ensure a clean start

-- ==============================================
-- COMPLETE CLEANUP - REMOVE ALL DATA
-- ==============================================

-- Delete ALL inventory transactions first (due to foreign key constraints)
delete from inventory_transactions;

-- Delete ALL medication transactions first (due to foreign key constraints)
delete from medication_transactions;

-- Delete ALL inventory items
delete from inventory_items;

-- Delete ALL medication inventory
delete from medication_inventory;

-- ==============================================
-- VERIFY COMPLETE CLEANUP
-- ==============================================

-- Check that all tables are now empty
select 'inventory_items' as table_name, count(*) as remaining_count from inventory_items
union all
select 'inventory_transactions' as table_name, count(*) as remaining_count from inventory_transactions
union all
select 'medication_inventory' as table_name, count(*) as remaining_count from medication_inventory
union all
select 'medication_transactions' as table_name, count(*) as remaining_count from medication_transactions;

-- ==============================================
-- RESET AUTO-INCREMENT SEQUENCES (if any)
-- ==============================================

-- Note: Since we're using UUID primary keys, no sequence reset is needed
-- But if you have any serial columns, you would reset them here

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================

-- ✅ ALL data has been removed from:
-- - inventory_items (should now be 0)
-- - inventory_transactions (should now be 0)
-- - medication_inventory (should now be 0)  
-- - medication_transactions (should now be 0)

-- Your tables are now completely clean and ready for real inventory data!
-- You can now add your actual hospital medications and supplies using the template script.
