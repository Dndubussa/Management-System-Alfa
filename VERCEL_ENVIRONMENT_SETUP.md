# 🔐 Vercel Environment Variables Setup Guide

## Security Best Practices

For security reasons, we should never expose the Supabase service role key to the frontend. Here's how to properly configure environment variables for Vercel deployment:

## Required Environment Variables

### 1. Frontend Variables (Public)
These variables are safe to expose to the frontend:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_KEY=your-anon-key
```

### 2. Backend Variables (Server-side Only)
These variables should ONLY be available on the server-side:

```
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Vercel Dashboard Configuration

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | All |
| `VITE_SUPABASE_KEY` | Your Supabase anon key | All |
| `SUPABASE_URL` | Your Supabase project URL | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Production & Preview Only |

## Why This Approach?

1. **Security**: The service role key has full access to your database and should never be exposed to the frontend
2. **Functionality**: Serverless functions need the service role key to perform backend operations
3. **Separation**: Frontend uses anon key for limited, user-authenticated access
4. **Flexibility**: Backend operations use service role key for full access when needed

## Environment Variable Availability

- **Development**: Both frontend and backend variables available
- **Preview**: Both frontend and backend variables available
- **Production**: Both frontend and backend variables available

## Testing Your Configuration

After setting up the environment variables:

1. Redeploy your application
2. Test the vital signs form
3. Check Vercel function logs for any errors

## Troubleshooting

### Issue: "Missing Supabase credentials"
**Solution**: Ensure all required environment variables are set in Vercel dashboard

### Issue: "Supabase error: permission denied"
**Solution**: The service role key is not properly configured for backend operations

### Issue: Functions not deploying
**Solution**: Check that your API routes follow the correct Vercel function structure

## Need Help?

If you're still experiencing issues:
1. Check Vercel function logs for specific error messages
2. Verify your Supabase project is active and accessible
3. Confirm all environment variables are correctly set
4. Ensure your database RLS policies are properly configured