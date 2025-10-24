# 🚨 Vercel Deployment Troubleshooting Guide

## Problem Summary

You're getting the error `SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON` when saving triage forms. This indicates that:

1. The frontend expects JSON responses from API calls
2. Instead, it receives HTML (likely a 404 error page or Vercel error page)
3. This suggests the Vercel serverless functions are not properly deployed or configured

## Root Causes

### 1. Vercel Function Not Deployed
- The [api\vital-signs.js](file:///G:/DEV/alfa-ms-new-main/api/vital-signs.js) function may not be deployed
- File naming or structure issues preventing deployment

### 2. Missing Environment Variables
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` not set in Vercel dashboard
- Incorrect environment variable values

### 3. API URL Configuration Issues
- Hardcoded URLs pointing to incorrect domains
- CORS issues with API requests

## Diagnostic Steps

### 1. Check Vercel Dashboard
1. Go to your Vercel project dashboard
2. Check the "Functions" tab to see if `api/vital-signs.js` is deployed
3. Check the "Logs" for any deployment errors

### 2. Verify Environment Variables
In your Vercel dashboard:
1. Go to Settings → Environment Variables
2. Ensure these variables are set:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
3. Make sure they're available for the correct environments (Production, Preview, Development)

### 3. Test API Endpoint Directly
Visit your API endpoint directly in the browser:
```
https://your-app.vercel.app/api/vital-signs
```

You should see a JSON error message like:
```json
{"error":"Method not allowed"}
```

If you see HTML, the function is not deployed correctly.

## Solutions

### 1. Fix API URL Configuration
The [src\config\api.ts](file:///G:/DEV/alfa-ms-new-main/src/config/api.ts) file should use dynamic URLs based on the current origin:

```typescript
export const getApiUrl = (endpoint: string = '') => {
  // Use the current hostname for API calls to ensure consistency with deployment
  const baseUrl = `${window.location.origin}/api`;
  return endpoint ? `${baseUrl}/${endpoint}` : baseUrl;
};
```

### 2. Verify Vercel Function Structure
Ensure your [api\vital-signs.js](file:///G:/DEV/alfa-ms-new-main/api/vital-signs.js) file follows the correct format:

```javascript
export default async function handler(req, res) {
  // Your function code here
}
```

### 3. Check Vercel Configuration
Your [vercel.json](file:///G:/DEV/alfa-ms-new-main/vercel.json) should properly route API requests:

```json
{
  "functions": {
    "api/vital-signs.js": {
      "maxDuration": 10
    }
  },
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

## Testing Your Fix

### 1. Redeploy to Vercel
After making changes:
1. Push your code to your Git repository
2. Wait for Vercel to automatically deploy
3. Check the deployment logs for any errors

### 2. Test the API Endpoint
After deployment, test directly in your browser:
```
https://your-app.vercel.app/api/vital-signs
```

Should return JSON: `{"error":"Method not allowed"}`

### 3. Test with cURL
```bash
curl -X POST https://your-app.vercel.app/api/vital-signs \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

Should return a JSON error, not HTML.

## Common Vercel Issues and Solutions

### Issue: "FUNCTIONS CONFIGURATION MISSED"
**Solution**: Ensure your [vercel.json](file:///G:/DEV/alfa-ms-new-main/vercel.json) is properly configured with the functions section.

### Issue: "MODULE_NOT_FOUND" in function logs
**Solution**: Check that all dependencies are in [package.json](file:///G:/DEV/alfa-ms-new-main/package.json) and that you're not using devDependencies in serverless functions.

### Issue: Environment variables showing as "undefined"
**Solution**: 
1. Check that variables are added in Vercel dashboard
2. Ensure they're available for the correct environments
3. Redeploy after adding environment variables

## Success Indicators

When the fix is working correctly:
1. ✅ Visiting `https://your-app.vercel.app/api/vital-signs` returns JSON, not HTML
2. ✅ Saving vital signs in the form works without errors
3. ✅ No more "SyntaxError: Unexpected token '<'" errors in the console
4. ✅ Vercel function logs show successful executions

## Need Help?

If you're still experiencing issues:

1. **Check Vercel Logs**: Look for specific error messages in function logs
2. **Verify Supabase Connection**: Ensure your Supabase project is active and credentials are correct
3. **Test Locally**: Run `vercel dev` locally to test functions before deploying
4. **Contact Support**: If the issue persists, Vercel support can help diagnose deployment issues

## Quick Verification Script

Run this in your browser console to test the API endpoint:

```javascript
fetch('/api/vital-signs')
  .then(response => response.text())
  .then(text => {
    if (text.startsWith('<!doctype') || text.startsWith('<html')) {
      console.error('❌ ERROR: Received HTML instead of JSON');
    } else {
      try {
        JSON.parse(text);
        console.log('✅ SUCCESS: Received valid JSON response');
      } catch (e) {
        console.error('❌ ERROR: Response is not valid JSON:', text.substring(0, 100));
      }
    }
  });
```