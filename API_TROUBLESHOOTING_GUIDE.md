# 🔧 API Troubleshooting Guide

## Problem: "Unexpected token '<', "<!doctype "... is not valid JSON"

This error occurs when the frontend receives HTML instead of JSON from the API endpoint. This typically means:

1. **Server is not running** - The backend server is not started
2. **Wrong API URL** - The frontend is calling the wrong endpoint
3. **CORS issues** - Cross-origin requests are blocked
4. **Database table missing** - The `vital_signs` table doesn't exist

## 🚀 Quick Fix Steps

### Step 1: Start the Backend Server

```bash
# Navigate to project directory
cd G:\DEV\alfa-ms-new-main

# Start the server
node server.js

# OR use the startup script
node start-server.js
```

**Expected output:**
```
🚀 Starting Alfa Hospital Management System Server...
✅ server.js found
🌐 Server should be available at: http://localhost:3001
📊 API endpoints available at: http://localhost:3001/api/*
```

### Step 2: Verify Server is Running

Open your browser and go to: `http://localhost:3001/api/health`

You should see a JSON response, not HTML.

### Step 3: Create Missing Database Table

Run this SQL script in your Supabase SQL editor:

```sql
-- Create vital_signs table
CREATE TABLE IF NOT EXISTS vital_signs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    queue_id UUID REFERENCES patient_queue(id) ON DELETE SET NULL,
    recorded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    temperature DECIMAL(4,1),
    pulse INTEGER,
    respiratory_rate INTEGER,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    bmi DECIMAL(4,1),
    muac DECIMAL(4,1),
    oxygen_saturation INTEGER,
    pain_level INTEGER,
    urgency VARCHAR(20) DEFAULT 'normal',
    notes TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Step 4: Test the API Endpoint

```bash
# Test the vital signs endpoint
curl -X POST http://localhost:3001/api/vital-signs \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "test-patient-id",
    "recordedBy": "test-user-id",
    "temperature": 36.5,
    "pulse": 80,
    "respiratoryRate": 16,
    "bloodPressureSystolic": 120,
    "bloodPressureDiastolic": 80,
    "height": 170,
    "weight": 70,
    "bmi": 24.2,
    "oxygenSaturation": 98,
    "painLevel": null,
    "urgency": "normal",
    "notes": "Test vital signs"
  }'
```

## 🔍 Debugging Steps

### Check Server Status
```bash
# Check if port 3001 is in use
netstat -an | findstr :3001

# Check if node process is running
tasklist | findstr node
```

### Check Console Logs
Look for these messages in your browser console:
- `🔍 Attempting to save vital signs to: http://localhost:3001/api/vital-signs`
- `🔍 Response status: 200` (success) or `404` (not found)
- `✅ Vital signs saved successfully`

### Common Error Messages

1. **"Server not running"** - Start the backend server
2. **"404 Not Found"** - Check API endpoint URL
3. **"CORS error"** - Check server CORS configuration
4. **"Database error"** - Check if `vital_signs` table exists

## 🛠️ Advanced Troubleshooting

### Check Server Configuration
```javascript
// In server.js, verify these settings:
const PORT = process.env.PORT || 3001;
app.use(cors()); // CORS enabled
app.use(express.json()); // JSON parsing enabled
```

### Check Database Connection
```javascript
// Test Supabase connection
const { data, error } = await supabase
  .from('vital_signs')
  .select('count')
  .limit(1);
```

### Check Network Requests
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to save vital signs
4. Look for the `/api/vital-signs` request
5. Check the response status and content

## ✅ Success Indicators

When everything is working correctly, you should see:

1. **Server running**: `🌐 Server should be available at: http://localhost:3001`
2. **API responding**: JSON response from `/api/vital-signs`
3. **Database connected**: No Supabase connection errors
4. **Frontend working**: Vital signs save successfully
5. **Console logs**: `✅ Vital signs saved successfully`

## 🆘 Still Having Issues?

1. **Check the server logs** for any error messages
2. **Verify database connection** in Supabase dashboard
3. **Test with a simple API call** using curl or Postman
4. **Check browser console** for any JavaScript errors
5. **Restart both frontend and backend** servers

## 📞 Support

If you're still experiencing issues:
1. Share the complete error message
2. Include server console output
3. Include browser console output
4. Verify all steps in this guide were followed
