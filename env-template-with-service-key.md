# Environment Variables Template with Service Role Key

## For Local Development (.env.local)

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: Force Supabase usage in development
VITE_USE_SUPABASE=true
```

## For Vercel Deployment

Add these environment variables in your Vercel dashboard:

1. **VITE_SUPABASE_URL** = `your_supabase_project_url`
2. **VITE_SUPABASE_KEY** = `your_supabase_anon_key` 
3. **VITE_SUPABASE_SERVICE_ROLE_KEY** = `your_supabase_service_role_key`

## How to Get Your Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (not the anon key)
4. **⚠️ IMPORTANT**: The service role key bypasses RLS policies and has full database access
5. **🔒 SECURITY**: Never expose this key in client-side code in production

## Security Notes

- **Service Role Key**: Has full database access, bypasses RLS
- **Anon Key**: Limited access, respects RLS policies
- **Use Case**: Service role key for backend operations, anon key for client authentication
