# 🔧 Vercel Environment Variables Setup

## Required Environment Variables

You need to set these environment variables in your Vercel dashboard:

### 1. Go to Vercel Dashboard
- Navigate to your project
- Go to **Settings** > **Environment Variables**

### 2. Add These Variables

#### For Serverless Functions (Backend):
```
SUPABASE_URL = https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key-here
```

#### For Frontend (Client-side):
```
VITE_SUPABASE_URL = https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key-here
```

### 3. Get Your Supabase Credentials

1. **Go to your Supabase project dashboard**
2. **Settings** > **API**
3. **Copy the values:**
   - **Project URL** → `SUPABASE_URL` and `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Deploy After Setting Variables

After adding the environment variables:
1. **Redeploy your project** in Vercel
2. **Test the vital signs form**
3. **Check Vercel function logs** for any errors

## Troubleshooting

### If you still get HTML responses:
1. **Check Vercel function logs** in the dashboard
2. **Verify environment variables** are set correctly
3. **Ensure the function is deployed** (check Functions tab)

### Common Issues:
- **Missing SUPABASE_SERVICE_ROLE_KEY** → Functions can't write to database
- **Wrong SUPABASE_URL** → Functions can't connect to database
- **Missing VITE_ variables** → Frontend can't connect to Supabase

## Success Indicators:
- ✅ API calls return JSON responses
- ✅ No more "SyntaxError" messages
- ✅ Vital signs save successfully
- ✅ Vercel function logs show successful database operations
