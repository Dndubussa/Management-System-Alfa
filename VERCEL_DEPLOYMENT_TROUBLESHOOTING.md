# Vercel Deployment Troubleshooting Guide

## Current Issue
The Vercel deployment is returning `DEPLOYMENT_NOT_FOUND` error, which means the serverless functions are not properly deployed.

## Steps to Fix

### 1. Check Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project: `alfa-ms-new-main`
3. Check the deployment status
4. Look for any failed deployments

### 2. Verify Environment Variables
In your Vercel project settings, ensure these environment variables are set:

**Required Environment Variables:**
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**To set environment variables:**
1. Go to your project in Vercel dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables"
4. Add each variable with the correct values

### 3. Redeploy the Project
If environment variables are missing or incorrect:
1. Update the environment variables in Vercel dashboard
2. Go to "Deployments" tab
3. Click "Redeploy" on the latest deployment
4. Or trigger a new deployment by pushing to GitHub

### 4. Check Build Logs
1. Go to the latest deployment in Vercel dashboard
2. Click on "View Function Logs" or "Build Logs"
3. Look for any errors related to:
   - Missing environment variables
   - Build failures
   - Function deployment issues

### 5. Test the Deployment
Once redeployed, test the API endpoint:
```bash
curl -X POST "https://alfa-ms-new-main.vercel.app/api/vital-signs" \
  -H "Content-Type: application/json" \
  -d '{"patientId":"test","temperature":37.5}'
```

### 6. Alternative: Manual Deployment
If automatic deployment isn't working:
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel login`
3. Run `vercel --prod` in your project directory

## Expected Behavior
- ✅ Main site loads: `https://alfa-ms-new-main.vercel.app/`
- ✅ API endpoint responds: `https://alfa-ms-new-main.vercel.app/api/vital-signs`
- ✅ Environment variables are accessible to serverless functions

## Common Issues
1. **Missing Environment Variables**: Serverless functions can't connect to Supabase
2. **Build Failures**: TypeScript/JavaScript errors preventing deployment
3. **Function Timeout**: API calls taking too long (max 10 seconds)
4. **CORS Issues**: Frontend can't call API endpoints

## Next Steps
1. Check Vercel dashboard for deployment status
2. Verify all environment variables are set
3. Redeploy if necessary
4. Test the API endpoint
5. If still failing, check Vercel function logs for specific errors
