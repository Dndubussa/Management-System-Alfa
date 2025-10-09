# Supabase Setup Instructions

This document provides detailed instructions for setting up Supabase for the Alfa Specialized Hospital Management System.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your Project URL and API Keys from the project settings

## Getting Your Supabase Credentials

1. Log in to your Supabase dashboard
2. Select your project
3. Go to Project Settings > API
4. Copy the following values:
   - Project URL (SUPABASE_URL)
   - anon key (SUPABASE_KEY) - for frontend use
   - service_role key (SUPABASE_SERVICE_ROLE_KEY) - for backend use

## Environment Variables

Update your `.env` file with your Supabase credentials:

```
# Frontend Supabase Configuration (anon key)
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_KEY=your_anon_key

# Backend Supabase Configuration (service role key)
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_service_role_key

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3001/api
```

## Database Schema Setup

1. Log in to your Supabase project dashboard
2. Go to the SQL editor
3. Run the `supabase_schema.sql` script from the project root
4. This will create all the required tables with proper relationships

## Permissions Issue Resolution

If you encounter permission denied errors, it's likely because:

1. You're using the anon key instead of the service role key for backend operations
2. Row Level Security (RLS) is enabled on your tables

### Solution 1: Use Service Role Key (Recommended for Development)

Update your `.env` file to use the service_role key for the `SUPABASE_KEY` variable.

### Solution 2: Configure Row Level Security

If you want to keep RLS enabled, you'll need to configure policies for each table. In the Supabase SQL editor, run:

```sql
-- Example policy for patients table
CREATE POLICY "Enable read access for all users" ON "public"."patients"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- Example policy for authenticated users to insert patients
CREATE POLICY "Enable insert for authenticated users only" ON "public"."patients"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);
```

## Testing the Connection

After setting up your credentials, test the connection:

```bash
# Test schema verification
npm run verify:schema

# Test simple connection
npm run test:supabase:simple

# Test comprehensive operations
npm run test:supabase:full
```

## Seeding the Database

To populate the database with sample data:

```bash
npm run seed
```

## Troubleshooting

### "permission denied for schema public" Error

This error occurs when using the anon key with RLS enabled. Solutions:

1. Use the service_role key for backend operations
2. Configure appropriate RLS policies
3. Disable RLS for development (not recommended for production)

### "Invalid supabaseUrl" Error

Ensure your SUPABASE_URL is a valid HTTPS URL:
```
# Correct format
SUPABASE_URL=https://your-project.supabase.co

# Incorrect formats
SUPABASE_URL=your-project.supabase.co
SUPABASE_URL=http://your-project.supabase.co
```

### Environment Variables Not Loading

If environment variables are not loading:

1. Ensure the `.env` file is in the project root
2. Restart your development server
3. Check that variable names match exactly

## Production Considerations

For production deployment:

1. Use environment variables provided by your hosting platform
2. Never expose the service_role key in frontend code
3. Configure proper RLS policies
4. Use connection pooling for better performance
5. Set up database backups

## Security Best Practices

1. Use the anon key for frontend operations
2. Use the service_role key only for backend operations
3. Implement proper authentication and authorization
4. Regularly rotate your API keys
5. Monitor database access logs