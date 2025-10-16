-- Check current data in pharmacy inventory tables
-- This script shows what data is currently in your tables

-- ==============================================
-- CHECK CURRENT INVENTORY ITEMS
-- ==============================================

select 'CURRENT INVENTORY ITEMS:' as info;
select 
  id,
  name,
  category,
  current_stock,
  min_stock,
  max_stock,
  unit,
  expiry_date,
  supplier,
  cost,
  selling_price,
  status,
  created_at
from inventory_items
order by created_at desc;

-- ==============================================
-- CHECK CURRENT MEDICATION INVENTORY
-- ==============================================

select 'CURRENT MEDICATION INVENTORY:' as info;
select 
  id,
  medication_name,
  generic_name,
  dosage_form,
  strength,
  manufacturer,
  batch_number,
  expiry_date,
  current_stock,
  min_stock,
  max_stock,
  unit_cost,
  selling_price,
  supplier,
  controlled_substance,
  prescription_required,
  status,
  created_at
from medication_inventory
order by created_at desc;

-- ==============================================
-- CHECK CURRENT TRANSACTIONS
-- ==============================================

select 'CURRENT INVENTORY TRANSACTIONS:' as info;
select 
  id,
  inventory_item_id,
  transaction_type,
  quantity,
  unit_cost,
  total_cost,
  reference_type,
  notes,
  created_at
from inventory_transactions
order by created_at desc;

select 'CURRENT MEDICATION TRANSACTIONS:' as info;
select 
  id,
  medication_inventory_id,
  transaction_type,
  quantity,
  unit_cost,
  total_cost,
  prescription_id,
  notes,
  created_at
from medication_transactions
order by created_at desc;

-- ==============================================
-- SUMMARY COUNTS
-- ==============================================

select 'SUMMARY COUNTS:' as info;
select 'inventory_items' as table_name, count(*) as count from inventory_items
union all
select 'inventory_transactions' as table_name, count(*) as count from inventory_transactions
union all
select 'medication_inventory' as table_name, count(*) as count from medication_inventory
union all
select 'medication_transactions' as table_name, count(*) as count from medication_transactions;
