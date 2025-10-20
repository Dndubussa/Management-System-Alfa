# OT Coordinator Setup Guide

## Step-by-Step Instructions to Add Rogers Aluli as OT Coordinator

### Step 1: Find the User ID
Run this query in Supabase SQL Editor:

```sql
SELECT 
    id,
    email,
    created_at
FROM auth.users 
WHERE email = 'alulirogers@gmail.com';
```

**Copy the `id` value from the result** - it will look something like:
`123e4567-e89b-12d3-a456-426614174000`

### Step 2: Add User to Database
Replace `YOUR_ACTUAL_USER_ID_HERE` with the ID from Step 1 and run:

```sql
INSERT INTO users (
    id,
    name,
    email,
    role,
    department
) VALUES (
    'YOUR_ACTUAL_USER_ID_HERE', -- Replace with the actual user ID
    'Rogers Aluli',
    'alulirogers@gmail.com',
    'ot-coordinator',
    'Operating Theatre'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    department = EXCLUDED.department;
```

### Step 3: Verify Success
Run this query to confirm the user was added:

```sql
SELECT 
    id,
    name,
    email,
    role,
    department,
    created_at
FROM users 
WHERE email = 'alulirogers@gmail.com';
```

### Expected Result:
You should see Rogers Aluli with:
- **Role**: `ot-coordinator`
- **Department**: `Operating Theatre`
- **Email**: `alulirogers@gmail.com`

### Step 4: Test Login
1. Go to your application login page
2. Use email: `alulirogers@gmail.com`
3. Use the password you set when creating the user in Supabase Auth
4. You should be redirected to the OT Coordinator Dashboard

### Troubleshooting:
- If you get "User not found", make sure you copied the correct user ID from Step 1
- If you get a role error, verify the role is exactly `ot-coordinator`
- If the dashboard doesn't load, check that the OT Dashboard component exists

### Files Created:
- `find-user-id.sql` - Query to find the user ID
- `add-ot-coordinator-with-real-id.sql` - Complete setup script
- `OT-COORDINATOR-SETUP-GUIDE.md` - This guide
