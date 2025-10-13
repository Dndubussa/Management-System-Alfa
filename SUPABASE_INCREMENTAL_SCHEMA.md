# Supabase Incremental Schema Management

This document explains the incremental schema management approach for the ASH HMS system.

## Files Overview

1. **[supabase_schema.sql](file:///g%3A/DEV/alfa-ms-new-main/supabase_schema.sql)** - Original schema file (full creation)
2. **supabase_schema_incremental.sql** - Incremental version using `IF NOT EXISTS` clauses
3. **supabase_migration_check.sql** - Advanced migration script with comprehensive checks
4. **supabase_test_functions.sql** - Test script to validate functions

## Usage Guidelines

### For New Installations
Use the original [supabase_schema.sql](file:///g%3A/DEV/alfa-ms-new-main/supabase_schema.sql) file for fresh installations.

### For Existing Databases
Use either:
1. **supabase_schema_incremental.sql** - Simpler approach using `IF NOT EXISTS`
2. **supabase_migration_check.sql** - More comprehensive approach with custom functions

## Key Features

### supabase_schema_incremental.sql
- Uses `CREATE TABLE IF NOT EXISTS` for all tables
- Uses `CREATE EXTENSION IF NOT EXISTS` for extensions
- Uses conditional logic for triggers

### supabase_migration_check.sql
- Custom functions to check table, column, constraint, and trigger existence
- Conditional creation based on existence checks
- More granular control over schema updates

### supabase_test_functions.sql
- Simple test functions to validate the approach works correctly
- Example usage of the validation functions

## Best Practices

1. **Always backup** your database before running schema updates
2. **Test** migration scripts in a development environment first
3. **Review** the output of migration scripts for any warnings or errors
4. **Document** any custom changes made to the schema

## Running the Scripts

In the Supabase SQL editor or using psql:

```sql
-- For incremental schema update
\i supabase_schema_incremental.sql

-- For advanced migration with checks
\i supabase_migration_check.sql

-- For testing functions
\i supabase_test_functions.sql
```

## Schema Validation

To check what currently exists in your database:

```sql
-- List all tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- List columns in a specific table
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'patients';

-- List constraints
SELECT constraint_name, constraint_type FROM information_schema.table_constraints WHERE table_name = 'users';
```

## Troubleshooting

### Common Issues

1. **Column reference ambiguous errors** - This occurs when function parameter names conflict with column names. All functions have been fixed to use distinct parameter names.
2. **Function already exists errors** - Use `CREATE OR REPLACE FUNCTION` to update existing functions.
3. **Permission denied errors** - Ensure you're running with appropriate database privileges.

### Function Naming Conventions

All validation functions use distinct parameter names to avoid conflicts:
- `table_exists(tbl_name text)` - Uses `tbl_name` instead of `table_name`
- `column_exists(tbl_name text, col_name text)` - Uses `tbl_name` and `col_name`
- `constraint_exists(con_name text)` - Uses `con_name` instead of `constraint_name`
- `trigger_exists(trigger_name text)` - Uses `trigger_name` parameter