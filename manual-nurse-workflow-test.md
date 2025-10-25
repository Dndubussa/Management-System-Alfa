# Manual Nurse Workflow Test

## 🧪 **Test Plan for Nurse Workflow**

### **Prerequisites:**
1. ✅ Supabase connection working
2. ✅ Database permissions fixed
3. ✅ Vercel deployment successful
4. ✅ Vital signs saving working

### **Test Steps:**

#### **1. Patient Registration Test**
- [ ] Go to Patient Registration
- [ ] Create new patient "TestPatient"
- [ ] Fill required fields:
  - Name: TestPatient
  - Age: 30
  - Phone: 1234567890
  - Address: Test Address
  - Assign to a doctor
- [ ] Complete registration
- [ ] **Expected**: Patient appears in database

#### **2. Patient Queue Test**
- [ ] Go to Nurse Dashboard
- [ ] Check Triage Queue
- [ ] **Expected**: TestPatient appears in queue
- [ ] **Expected**: Patient details are correct

#### **3. Triage Process Test**
- [ ] Click "Start Triage" for TestPatient
- [ ] **Expected**: Navigate to triage form
- [ ] **Expected**: Patient is pre-selected
- [ ] Fill vital signs:
  - Temperature: 36.5°C
  - Pulse: 80 bpm
  - Blood Pressure: 120/80
  - Height: 170 cm
  - Weight: 70 kg
  - Oxygen Saturation: 98%
- [ ] Click Save
- [ ] **Expected**: Success message appears
- [ ] **Expected**: No 403 Forbidden errors
- [ ] **Expected**: Vital signs saved to database

#### **4. Console Logs Test**
- [ ] Open browser console
- [ ] **Expected**: See success logs:
  ```
  ✅ Vital signs saved successfully via Supabase service: [data]
  🔍 Found queue ID: [queue_id]
  ✅ Queue status updated to doctor stage
  ```
- [ ] **Expected**: No error messages

### **Success Criteria:**
- ✅ Patient creation works
- ✅ Patient appears in queue
- ✅ Triage form loads correctly
- ✅ Vital signs save successfully
- ✅ No 403 Forbidden errors
- ✅ Complete workflow functional

### **If Issues Found:**
1. Check browser console for errors
2. Verify Supabase permissions
3. Check Vercel deployment status
4. Run SQL permission scripts if needed

## 🎯 **Expected Result:**
Complete nurse workflow should work end-to-end without any errors.
