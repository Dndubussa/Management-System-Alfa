# Vercel Environment Variables Setup

## Required Environment Variables for Vercel Deployment

Add these environment variables in your Vercel project dashboard:

### Frontend Variables (VITE_ prefix)
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_KEY=your_anon_key_here
```

### Backend Variables
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** tab
3. Click on **Environment Variables** in the left sidebar
4. Add each variable:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: Your Supabase project URL
   - **Environment**: Production (and Preview if needed)
5. Repeat for all 4 variables
6. Click **Save**
7. **Redeploy** your application

## Getting Your Supabase Credentials

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings > API**
4. Copy:
   - **Project URL** (use for both VITE_SUPABASE_URL and SUPABASE_URL)
   - **anon key** (use for VITE_SUPABASE_KEY)
   - **service_role key** (use for SUPABASE_SERVICE_ROLE_KEY)

## Important Notes

- The **service_role key** has full database access - keep it secure
- The **anon key** is safe to use in frontend code
- Make sure to set the environment for **Production**
- After adding variables, you must **redeploy** for changes to take effect

## Testing the Connection

After setting up the environment variables and redeploying:

1. Check your Vercel function logs for any Supabase connection errors
2. Try logging in with a test user
3. If still having issues, check that your Supabase project has the correct database schema
