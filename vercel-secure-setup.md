# Secure Vercel Deployment Setup

## ❌ DON'T Use Service Role Key in Vercel

The service role key has **full database access** and should never be exposed in client-side code or public deployments.

## ✅ Recommended: Use Row Level Security (RLS)

### Step 1: Configure Supabase RLS

1. Go to your Supabase project dashboard
2. Go to **SQL Editor**
3. Run the `setup-vercel-rls.sql` script
4. This sets up secure policies that allow authenticated users to access data

### Step 2: Vercel Environment Variables

**Only use these 2 variables in Vercel:**

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_KEY=your_anon_key_here
```

**DO NOT add:**
- ❌ `SUPABASE_SERVICE_ROLE_KEY` (security risk)
- ❌ `SUPABASE_URL` (not needed for frontend)

### Step 3: Update Your Backend Code

Since you can't use the service role key in Vercel, you need to modify your backend to work with RLS:

1. **Option A: Use Supabase Client-Side (Recommended)**
   - Move database operations to the frontend
   - Use the anon key with RLS policies
   - More secure and follows Supabase best practices

2. **Option B: Use Vercel Serverless Functions**
   - Create API routes in your Vercel project
   - Use the anon key with proper RLS policies
   - Keep backend logic in serverless functions

### Step 4: Test the Setup

1. Deploy with only the 2 environment variables above
2. Test login functionality
3. Verify that authenticated users can access data
4. Check that unauthenticated users are blocked

## Security Benefits

✅ **No service role key exposure**
✅ **Row-level security protection**
✅ **Proper authentication flow**
✅ **Follows Supabase best practices**

## Alternative: Hybrid Approach

If you need some backend operations, consider:

1. **Frontend**: Use Supabase client with anon key + RLS
2. **Backend**: Use Vercel serverless functions with anon key + RLS
3. **Admin operations**: Use service role key only in secure admin environments

This approach gives you the security of RLS while maintaining the flexibility of backend operations.
