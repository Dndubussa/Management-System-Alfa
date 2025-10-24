# 🔐 Vercel Environment Variables Setup Guide

## Your Current Configuration

Based on your setup, you're correctly using `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` for your Vercel deployment. This is the right approach for your application.

## Required Environment Variables

### Variables You're Already Using (Correct)
These variables are safe and working in your Vercel deployment:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_KEY=your-anon-key
```

## Vercel Dashboard Configuration

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Ensure these variables are set:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | All |
| `VITE_SUPABASE_KEY` | Your Supabase anon key | All |

## Why This Works

1. **Security**: The anon key has limited permissions and is safe to use in frontend applications
2. **Compatibility**: Your Vercel functions are correctly configured to use these same variables
3. **Simplicity**: Using the same variables for both frontend and backend reduces configuration complexity

## Troubleshooting Your Current Issue

Since you're already using the correct environment variables, the issue is likely related to:

1. **Vercel Function Deployment**: The serverless function may not be deployed correctly
2. **CORS Configuration**: Missing CORS headers in the Vercel function
3. **API Route Configuration**: Incorrect routing in vercel.json

## Testing Your Configuration

After verifying your environment variables:

1. Check that your Vercel function is deployed
2. Verify CORS headers are set in the function
3. Test the API endpoint directly in your browser:
   ```
   https://your-app.vercel.app/api/vital-signs
   ```
   You should see a JSON response like `{"error":"Method not allowed"}` instead of HTML.

## Need Help?

If you're still experiencing issues:
1. Check Vercel function logs for specific error messages
2. Verify your Supabase project is active and accessible
3. Confirm your database RLS policies are properly configured
4. Check that your vercel.json routing is correct