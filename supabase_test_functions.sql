-- Simple test script to validate the functions work correctly

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Function to check if a table exists (fixed version)
create or replace function table_exists(tbl_name text)
returns boolean as $$
begin
    return exists (
        select 1 
        from information_schema.tables 
        where table_schema = 'public' 
        and table_name = tbl_name
    );
end;
$$ language plpgsql;

-- Test the function
select table_exists('patients') as patients_table_exists;
select table_exists('nonexistent_table') as nonexistent_table_exists;

-- Clean up test function (optional)
-- drop function if exists table_exists(text);