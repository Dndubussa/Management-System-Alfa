# Check and Add Database Data

## 🔍 **Step 1: Check Current Data**

Run this SQL script in your Supabase SQL Editor to check what data exists:

```sql
-- Copy and paste the contents of check-database-tables.sql
```

**Expected Results:**
- If tables are empty, you'll see `record_count: 0` for most tables
- If there's data, you'll see the actual counts

## 📊 **Step 2: Add Sample Data (If Tables Are Empty)**

If your tables are empty, run this SQL script to add sample data:

```sql
-- Copy and paste the contents of add-sample-data.sql
```

**This will add:**
- ✅ **5 sample patients** with different insurance providers
- ✅ **10 sample service prices** for consultations, lab tests, imaging
- ✅ **3 sample bills** with different statuses
- ✅ **2 sample insurance claims**
- ✅ **3 sample appointments**

## 🎯 **Step 3: Verify Data After Adding**

After running the sample data script, refresh your application and check:

### **Browser Console Should Show:**
```javascript
✅ "Supabase: Got patients: 5"
✅ "Supabase: Got service prices: 10"
✅ "Supabase: Got bills: 3"
✅ "Supabase: Got insurance claims: 2"
```

### **Receptionist Dashboard Should Show:**
- ✅ **5 patients** in the system
- ✅ **10 service prices** in price lookup
- ✅ **3 bills** (2 pending, 1 paid)
- ✅ **2 insurance claims**
- ✅ **Summary cards** with actual totals

## 🔧 **How to Run the Scripts**

### **Option 1: Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Click on **SQL Editor**
3. Copy and paste the SQL script
4. Click **Run**

### **Option 2: Command Line (if you have psql)**
```bash
psql -d your_database -f check-database-tables.sql
psql -d your_database -f add-sample-data.sql
```

## 📋 **What Each Script Does**

### **check-database-tables.sql**
- Counts records in all main tables
- Shows which tables are empty
- Helps identify data issues

### **add-sample-data.sql**
- Adds realistic sample data
- Includes patients with different insurance providers
- Includes various service types and prices
- Creates bills and claims for testing

## 🚨 **Troubleshooting**

### **If Scripts Fail:**
1. **Check table structure** - Make sure all tables exist
2. **Check RLS policies** - Ensure you can insert data
3. **Check permissions** - Make sure you have insert permissions

### **If Data Still Doesn't Show:**
1. **Refresh the browser** after adding data
2. **Check browser console** for data loading messages
3. **Verify RLS policies** are not blocking data access

## 🎯 **Expected Results After Adding Sample Data**

### **Receptionist Dashboard:**
- **Patient Bills Section**: Shows 3 bills (2 pending, 1 paid)
- **Insurance Claims Section**: Shows 2 claims (1 submitted, 1 approved)
- **Price Lookup**: Shows 10 different services
- **Summary Cards**: Show actual totals instead of zeros

### **Data Counts:**
- **Patients**: 5
- **Service Prices**: 10
- **Bills**: 3
- **Insurance Claims**: 2
- **Appointments**: 3

---

**After adding sample data, your receptionist dashboard will be fully functional with real data to display!** 🏥✅
