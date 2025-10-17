# 🚀 Vercel Deployment Guide for Alfa Hospital Management System

## 📋 Pre-Deployment Checklist

### ✅ 1. Supabase Configuration
- [ ] Supabase project is set up and running
- [ ] Database schema is deployed (run all SQL scripts)
- [ ] Row Level Security (RLS) policies are configured
- [ ] Users table has test users for login

### ✅ 2. Environment Variables Setup
- [ ] Get Supabase credentials from dashboard
- [ ] Configure Vercel environment variables
- [ ] Test connection before deployment

### ✅ 3. Database Migration
- [ ] Run `fix-notifications-read-status.sql` for notification system
- [ ] Verify all tables exist and have data
- [ ] Test authentication and data access

## 🔧 Step-by-Step Deployment

### Step 1: Get Supabase Credentials

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Get API Keys**
   - Go to **Settings → API**
   - Copy these values:
     - **Project URL**: `https://your-project-id.supabase.co`
     - **anon key**: `eyJ...` (starts with eyJ)

3. **⚠️ Security Note**
   - **DO NOT** use the service_role key in Vercel
   - Only use the anon key (safe for frontend)

### Step 2: Configure Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Add Environment Variables**
   - Go to **Settings → Environment Variables**
   - Add these 2 variables:

   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_KEY=your_anon_key_here
   ```

3. **Set Environment Scope**
   - Set both variables for **Production** environment
   - Optionally set for **Preview** for testing

### Step 3: Deploy to Vercel

1. **Connect Repository**
   - If not already connected, link your GitHub repository
   - Vercel will auto-deploy on every push

2. **Manual Deployment**
   - Go to **Deployments** tab
   - Click **Redeploy** on latest deployment
   - Or push a new commit to trigger deployment

### Step 4: Verify Deployment

1. **Test Login**
   - Visit your Vercel URL
   - Try logging in with test users
   - Verify dashboard loads correctly

2. **Test Core Features**
   - Patient registration
   - Medical records access (doctors only)
   - Notification system
   - Dotted menu actions

## 🔒 Security Configuration

### Production Security Features

✅ **Automatic Security**
- Service role key automatically disabled in production
- Uses anon key with RLS for secure access
- No sensitive keys exposed to client-side

✅ **Row Level Security (RLS)**
- All tables protected with RLS policies
- User-based access control
- Secure data isolation

✅ **Environment-Based Configuration**
- Development: Uses service role key (local only)
- Production: Uses anon key (Vercel safe)

## 🐛 Troubleshooting

### Common Issues

**1. Login Fails**
```
Error: Missing Supabase environment variables
```
**Solution:**
- Check Vercel environment variables are set
- Verify values are correct (no extra spaces)
- Ensure variables are set for Production environment

**2. Data Not Loading**
```
Error: Failed to fetch patients
```
**Solution:**
- Check RLS policies are configured
- Run `setup-vercel-rls.sql` in Supabase
- Verify user authentication is working

**3. Notifications Not Working**
```
Error: Cannot mark notification as read
```
**Solution:**
- Run `fix-notifications-read-status.sql` in Supabase
- Check notifications table has jsonb is_read column

### Debug Steps

1. **Check Vercel Function Logs**
   - Go to Vercel Dashboard → Functions tab
   - Look for Supabase connection errors

2. **Test Supabase Connection**
   - Go to Supabase → SQL Editor
   - Run: `SELECT * FROM users LIMIT 1;`
   - Should return data without errors

3. **Verify Environment Variables**
   - Check Vercel project settings
   - Ensure variables are set for correct environment

## 📊 Post-Deployment Verification

### ✅ Test Checklist

- [ ] **Authentication**: Login/logout works
- [ ] **Patient Management**: Can view/create patients
- [ ] **Medical Records**: Doctors can access (others cannot)
- [ ] **Notifications**: Can mark as read when clicked
- [ ] **Dotted Menu**: Three-dots menu works in patient list
- [ ] **Role-Based Access**: Different dashboards for different roles
- [ ] **Data Persistence**: Changes save to database
- [ ] **Responsive Design**: Works on mobile/tablet

### 🔍 Performance Check

- [ ] **Page Load Speed**: < 3 seconds
- [ ] **Database Queries**: Fast response times
- [ ] **Error Handling**: Graceful error messages
- [ ] **User Experience**: Smooth interactions

## 🚀 Production Optimizations

### Performance
- ✅ Automatic code splitting
- ✅ Optimized bundle size
- ✅ CDN delivery via Vercel
- ✅ Database connection pooling

### Security
- ✅ HTTPS enforced
- ✅ Secure headers
- ✅ Environment variable protection
- ✅ RLS-based data access

### Monitoring
- ✅ Vercel analytics
- ✅ Error tracking
- ✅ Performance monitoring
- ✅ Database query optimization

## 📞 Support

If you encounter issues:

1. **Check Vercel Logs**: Dashboard → Functions → View logs
2. **Check Supabase Logs**: Dashboard → Logs
3. **Test Locally**: Run `npm run dev` to test changes
4. **Verify Database**: Run SQL queries in Supabase editor

## 🎉 Success!

Once deployed successfully, your hospital management system will be:
- ✅ Secure and production-ready
- ✅ Accessible from anywhere
- ✅ Automatically updated on code changes
- ✅ Optimized for performance
- ✅ Compliant with security best practices

**Your Alfa Hospital Management System is now live on Vercel!** 🏥🚀
