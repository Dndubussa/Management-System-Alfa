# 🚨 Vital Signs API Troubleshooting Guide

## Error: `SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON`

This error occurs when the backend server is not running or the API endpoint is not available.

### 🔍 What This Error Means:
- The frontend is trying to call the API endpoint `/api/vital-signs`
- Instead of getting JSON data, it's receiving HTML (likely a 404 page)
- This indicates the backend server is not running

### 🛠️ How to Fix:

#### Option 1: Start the Backend Server (Recommended)
```bash
# In your terminal, run:
node server.js
```

#### Option 2: Use the Provided Scripts
- **Windows**: Double-click `start-backend-server.bat`
- **Mac/Linux**: Run `./start-backend-server.sh`

#### Option 3: Check if Server is Running
```bash
# Check if port 3001 is in use:
netstat -an | grep 3001
```

### 🔧 Additional Troubleshooting:

#### 1. Check if the API Endpoint Exists
The server should have this endpoint:
```
POST /api/vital-signs
```

#### 2. Verify Database Connection
Make sure your Supabase connection is working:
- Check your `.env` file
- Verify Supabase URL and API key
- Test database connection

#### 3. Check Server Logs
When you start the server, you should see:
```
Server running on port 3001
Database connected successfully
```

### 🚀 Quick Start Guide:

1. **Open Terminal** in your project directory
2. **Run**: `node server.js`
3. **Verify**: You should see "Server running on port 3001"
4. **Test**: Try saving vital signs again

### 📋 Common Issues:

#### Issue: "Cannot find module 'express'"
**Solution**: Install dependencies
```bash
npm install
```

#### Issue: "Port 3001 already in use"
**Solution**: Kill the process using port 3001
```bash
# Find the process:
netstat -ano | findstr :3001
# Kill it (replace PID with the actual process ID):
taskkill /PID <PID> /F
```

#### Issue: "Database connection failed"
**Solution**: Check your Supabase credentials in `.env` file

### ✅ Success Indicators:

When everything is working correctly, you should see:
- ✅ Server starts without errors
- ✅ Database connection successful
- ✅ Vital signs save without errors
- ✅ No more "SyntaxError" messages

### 🆘 Still Having Issues?

1. **Check the console** for any error messages
2. **Verify** your Node.js version: `node --version`
3. **Ensure** all dependencies are installed: `npm install`
4. **Check** your `.env` file has correct Supabase credentials

### 📞 Need Help?

If you're still experiencing issues:
1. Check the server logs for specific error messages
2. Verify your database schema includes the `vital_signs` table
3. Ensure your Supabase project is active and accessible
