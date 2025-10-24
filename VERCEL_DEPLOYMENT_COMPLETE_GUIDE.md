# 🚀 Vercel Deployment Complete Guide

## ✅ Current Status
- **Local Backend:** Working perfectly (localhost:3001)
- **Vercel Functions:** Ready for deployment
- **API Logic:** Tested and confirmed working
- **Database:** Connected and RLS policies fixed

## 🔧 Deployment Steps

### 1. Environment Variables Setup
In your Vercel dashboard, go to **Settings** > **Environment Variables** and add:

```
SUPABASE_URL = https://hwsdzfqmpqypkexosdza.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3c2R6ZnFtcHF5cGtleG9zZHphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYyMjg4MiwiZXhwIjoyMDcxMTk4ODgyfQ.EevC460SW4wRn9fggQHNQCkqtHwPvppnoDzSGA9W-og

VITE_SUPABASE_URL = https://hwsdzfqmpqypkexosdza.supabase.co
VITE_SUPABASE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3c2R6ZnFtcHF5cGtleG9zZHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MjI4ODIsImV4cCI6MjA3MTE5ODg4Mn0.hqegAhaA_hMiP1kekdHqINCtYzrYx1K4I6IIZTYS1gk
```

### 2. Deploy to Vercel
```bash
git add .
git commit -m "🚀 Switch back to Vercel deployment backend"
git push origin master
```

### 3. Verify Deployment
After deployment, test the API endpoint:
```bash
curl -X POST https://alfa-ms-new-main.vercel.app/api/vital-signs \
  -H "Content-Type: application/json" \
  -d '{"patientId":"4a0b7d4a-c55a-4818-8cd8-4cd6fdb7c186","temperature":37.5,"pulse":80,"respiratoryRate":16,"bloodPressureSystolic":120,"bloodPressureDiastolic":80,"height":170,"weight":70,"bmi":24.2,"muac":null,"oxygenSaturation":98,"painLevel":null,"urgency":"normal","notes":"Test vital signs","recordedBy":"7bf4b117-1447-466d-ac52-c20e23927490"}'
```

## 🔍 Troubleshooting

### If API returns HTML instead of JSON:
1. **Check Vercel Functions tab** - ensure functions are deployed
2. **Check Environment Variables** - ensure all are set correctly
3. **Check Function Logs** - look for errors in Vercel dashboard

### If RLS policy errors:
- The RLS policies are already fixed in the database
- Should work automatically in production

### If foreign key errors:
- Use real user IDs from the database
- The user ID `7bf4b117-1447-466d-ac52-c20e23927490` is confirmed working

## ✅ Success Indicators
- ✅ API returns JSON (not HTML)
- ✅ Status 200 OK
- ✅ Vital signs save to database
- ✅ No console errors in frontend

## 🎯 Production Workflow
```
Frontend → /api/vital-signs → Vercel Function → Supabase → Database
```

## 📋 Files Ready for Deployment
- ✅ `api/vital-signs.js` - Vital signs serverless function
- ✅ `api/auth/login.js` - Authentication serverless function  
- ✅ `vercel.json` - Proper routing configuration
- ✅ `src/config/api.ts` - Production API URLs
- ✅ Database RLS policies fixed

**Ready for production deployment! 🚀**
