# Vercel Environment Setup Instructions

## Quick Setup Guide

### Step 1: Get Your Supabase Credentials

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings → API**
4. Copy these values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **anon key** (starts with `eyJ...`)

### Step 2: Configure Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Click **Settings** tab
3. Click **Environment Variables** in the left sidebar
4. Add these 2 variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_KEY=your_anon_key_here
```

### Step 3: Set Environment Scope

- Set both variables for **Production** environment
- Optionally set for **Preview** if you want to test

### Step 4: Redeploy

- Click **Deployments** tab
- Click **Redeploy** on your latest deployment
- Or push a new commit to trigger automatic deployment

## Security Notes

✅ **Safe to use:**
- `VITE_SUPABASE_URL` - Your project URL
- `VITE_SUPABASE_KEY` - Your anon key (public, safe for frontend)

❌ **DO NOT use:**
- `SUPABASE_SERVICE_ROLE_KEY` - Has full database access (security risk)
- Any service role keys in Vercel

## Troubleshooting

### If login still fails:

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Your Project → Functions tab
   - Look for any Supabase connection errors

2. **Verify Environment Variables:**
   - Make sure variables are set for Production environment
   - Check that values are correct (no extra spaces)

3. **Test Supabase Connection:**
   - Go to your Supabase project → SQL Editor
   - Run: `SELECT * FROM users LIMIT 1;`
   - Should return data without errors

4. **Check Row Level Security:**
   - Make sure you've run the `setup-vercel-rls.sql` script
   - This enables secure access without service role key

## Need Help?

If you're still having issues:
1. Check the Vercel deployment logs
2. Verify your Supabase project has the correct schema
3. Ensure RLS policies are properly configured
4. Test with a simple Supabase query in the SQL editor
