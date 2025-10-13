# 🚀 Deployment Guide for Alfa Hospital Management System

## 📋 Prerequisites

- GitHub repository with your code
- Supabase project set up
- Railway account (free tier available)

## 🎯 Step-by-Step Deployment

### 1. Prepare Your Repository

✅ **Already Done:**
- Production build scripts added to `package.json`
- Railway configuration file created (`railway.json`)
- Backend server configured for production

### 2. Set Up Railway Account

1. Go to [https://railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Authorize Railway to access your repositories

### 3. Deploy Your Application

1. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `Management-System-Alfa` repository

2. **Configure Environment Variables:**
   In Railway dashboard, go to Variables tab and add:
   ```
   NODE_ENV=production
   PORT=3001
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Deploy:**
   - Railway will automatically detect your Node.js app
   - It will run `npm install` and `npm start`
   - Your app will be available at `https://your-app-name.railway.app`

### 4. Configure Supabase

1. **Update Supabase Settings:**
   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Add your Railway domain to allowed origins:
     ```
     https://your-app-name.railway.app
     ```

2. **Database Setup:**
   - Ensure all tables are created in Supabase
   - Run the SQL scripts from your repository if needed

### 5. Test Your Deployment

1. **Health Check:**
   - Visit `https://your-app-name.railway.app/api/health`
   - Should return 200 OK

2. **Frontend:**
   - Visit `https://your-app-name.railway.app`
   - Test login and navigation

3. **API Endpoints:**
   - Test service prices: `https://your-app-name.railway.app/api/service-prices`
   - Should return your 1000 services

## 🔧 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3001` |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## 🚨 Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check that all dependencies are in `package.json`
   - Ensure `npm run build` works locally

2. **Environment Variables:**
   - Double-check all variables are set in Railway
   - Ensure no typos in variable names

3. **CORS Issues:**
   - Add Railway domain to Supabase allowed origins
   - Check backend CORS configuration

4. **Database Connection:**
   - Verify Supabase URL and keys are correct
   - Check if tables exist in Supabase

## 📊 Monitoring

Railway provides:
- **Logs:** View application logs in real-time
- **Metrics:** CPU, memory, and network usage
- **Deployments:** Track deployment history
- **Health Checks:** Automatic health monitoring

## 🔄 Continuous Deployment

Railway automatically deploys when you push to your main branch:
1. Push changes to GitHub
2. Railway detects changes
3. Automatically builds and deploys
4. Your app updates live

## 💰 Cost

- **Free Tier:** 500 hours/month, 1GB RAM, 1GB storage
- **Pro Plan:** $5/month for more resources
- **Perfect for:** Small to medium applications

## 🎉 Success!

Once deployed, your hospital management system will be available at:
`https://your-app-name.railway.app`

Share this URL with your team and start using your production system!
