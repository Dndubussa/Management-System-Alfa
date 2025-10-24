# 🛠️ Vital Signs API Fix for Vercel Deployment

## Problem Summary

The error `SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON` occurs when saving triage and vitals form. This happens because:

1. The frontend expects JSON responses from API calls
2. Instead, it receives HTML (likely a 404 error page)
3. This indicates the API endpoint is not properly configured or accessible

## Root Causes Identified

### 1. Environment Variable Mismatch
- Vercel serverless functions were trying to access `VITE_*` environment variables
- VITE variables are only available in the frontend, not in serverless functions
- Serverless functions need `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

### 2. Vercel Configuration Issues
- API routes were not properly configured in [vercel.json](file:///G:/DEV/alfa-ms-new-main/vercel.json)
- Missing environment configuration for production deployment

### 3. Error Handling in Frontend
- Inadequate error handling for HTML responses
- Missing detailed debugging information

## Fixes Applied

### 1. Updated Vercel Function ([api\vital-signs.js](file:///G:/DEV/alfa-ms-new-main/api/vital-signs.js))
```javascript
// Use server-side environment variables for Vercel functions
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
```

### 2. Added Environment Configuration ([.env.production](file:///G:/DEV/alfa-ms-new-main/.env.production))
```
# Supabase Configuration for Vercel Serverless Functions
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Frontend Supabase Configuration (anon key)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Fixed Vercel Routing ([vercel.json](file:///G:/DEV/alfa-ms-new-main/vercel.json))
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 4. Enhanced Frontend Error Handling ([NurseTriageVitals.tsx](file:///G:/DEV/alfa-ms-new-main/src/components/Nurse/NurseTriageVitals.tsx))
- Added detailed response logging
- Improved HTML response detection
- Better error messages for debugging

## Testing the Fix

### 1. Local Development Testing
```bash
# Start the backend server
npm run server

# In another terminal, start the frontend
npm run dev
```

### 2. Test the API Endpoint
```bash
curl -X POST http://localhost:3001/api/vital-signs \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "valid-uuid",
    "recordedBy": "valid-uuid",
    "temperature": 36.5,
    "pulse": 80
  }'
```

### 3. Check Server Logs
Look for these messages in your terminal:
- `🔍 Attempting to save vital signs to: http://localhost:3001/api/vital-signs`
- `✅ Vital signs saved successfully`

## Vercel Deployment Checklist

### 1. Environment Variables
In your Vercel dashboard, add these environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `VITE_SUPABASE_URL` - Your Supabase project URL (for frontend)
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key (for frontend)

### 2. Verify API Routes
After deployment, test:
- `https://your-app.vercel.app/api/vital-signs` should return a JSON error (not HTML)
- The endpoint should properly handle POST requests

### 3. Check Vercel Logs
In the Vercel dashboard:
- Go to your deployment
- Check the Functions tab for any errors
- Look for environment variable issues

## Common Issues and Solutions

### Issue: "Missing Supabase credentials"
**Solution**: Ensure all required environment variables are set in Vercel dashboard

### Issue: "Supabase error: invalid input syntax for type uuid"
**Solution**: Make sure you're using valid UUIDs for patientId and recordedBy

### Issue: Still getting HTML responses
**Solution**: 
1. Check Vercel function logs
2. Verify environment variables are correctly set
3. Ensure [vercel.json](file:///G:/DEV/alfa-ms-new-main/vercel.json) routing is correct

## Success Indicators

When the fix is working correctly, you should see:
1. ✅ No more "SyntaxError" in console
2. ✅ Vital signs save successfully
3. ✅ JSON responses from API endpoints
4. ✅ No error messages in the UI
5. ✅ Server logs show successful API calls

## Need Help?

If you're still experiencing issues:
1. Check the server logs for specific error messages
2. Verify your database schema includes the `vital_signs` table
3. Ensure your Supabase project is active and accessible
4. Confirm all environment variables are correctly set