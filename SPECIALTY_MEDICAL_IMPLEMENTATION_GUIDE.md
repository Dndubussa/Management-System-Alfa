# Specialty Medical Tables Implementation Guide

## 📋 Overview

This guide provides step-by-step instructions for implementing specialized database tables and APIs for **Ophthalmology** and **Physical Therapy** departments in the Alfa Specialized Hospital Management System.

## 🗄️ Database Schema

### **👁️ Ophthalmology Tables**

| Table Name | Purpose | Key Fields |
|------------|---------|------------|
| `ophthalmology_records` | Main eye exam records | patient_id, doctor_id, visit_date, chief_complaint, diagnosis, treatment |
| `visual_acuity_tests` | Vision measurements | right_eye_near, right_eye_distance, left_eye_near, left_eye_distance |
| `refraction_data` | Prescription data | right_eye_sphere, right_eye_cylinder, right_eye_axis, left_eye_sphere |
| `intraocular_pressure` | IOP measurements | right_eye_pressure, left_eye_pressure, method |
| `ophthalmology_findings` | Exam findings | finding_type, description, image_url, severity |
| `ophthalmology_images` | Eye photos/scans | image_type, image_url, description, eye |

### **🏥 Physical Therapy Tables**

| Table Name | Purpose | Key Fields |
|------------|---------|------------|
| `physical_therapy_records` | Main PT records | patient_id, therapist_id, visit_date, chief_complaint, assessment |
| `therapy_plans` | Treatment plans | plan_name, description, goals, duration_weeks, frequency_per_week |
| `therapy_sessions` | Session tracking | session_date, session_duration_minutes, exercises_performed, progress_notes |
| `assessment_data` | PT evaluations | assessment_type, range_of_motion, muscle_strength, balance_tests |
| `exercise_prescriptions` | Prescribed exercises | exercise_name, description, sets, repetitions, frequency_per_day |

## 🚀 Implementation Steps

### **Step 1: Add Required Users (if needed)**

1. **Check if you have users with these roles:**
   ```sql
   SELECT name, email, role, department FROM users 
   WHERE role IN ('ophthalmologist', 'physical-therapist');
   ```

2. **If no users exist, run the user creation script:**
   ```sql
   -- Copy and paste the contents of add-specialty-users.sql
   -- This will add sample users for ophthalmology and physical therapy
   ```

### **Step 2: Create Database Tables**

1. **Go to Supabase Dashboard**
   - Navigate to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to **SQL Editor**

2. **Run the Schema Script**
   ```sql
   -- Copy and paste the contents of specialty-medical-tables-schema.sql
   -- This will create all necessary tables, indexes, and RLS policies
   ```

3. **Verify Table Creation**
   ```sql
   -- Check if tables were created
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN (
     'ophthalmology_records', 'visual_acuity_tests', 'refraction_data',
     'intraocular_pressure', 'ophthalmology_findings', 'ophthalmology_images',
     'physical_therapy_records', 'therapy_plans', 'therapy_sessions',
     'assessment_data', 'exercise_prescriptions'
   );
   ```

### **Step 3: Update Backend APIs**

The `server.js` file has been updated with new API endpoints:

#### **👁️ Ophthalmology APIs:**
- `GET /api/ophthalmology-records` - Get all ophthalmology records
- `GET /api/ophthalmology-records/:id` - Get specific record
- `POST /api/ophthalmology-records` - Create new record
- `PUT /api/ophthalmology-records/:id` - Update record
- `GET /api/visual-acuity-tests/:patientId` - Get visual acuity tests
- `POST /api/visual-acuity-tests` - Create visual acuity test
- `GET /api/refraction-data/:patientId` - Get refraction data
- `POST /api/refraction-data` - Create refraction data
- `GET /api/intraocular-pressure/:patientId` - Get IOP measurements
- `POST /api/intraocular-pressure` - Create IOP record
- `GET /api/ophthalmology-findings/:patientId` - Get findings
- `POST /api/ophthalmology-findings` - Create finding
- `GET /api/ophthalmology-images/:patientId` - Get images
- `POST /api/ophthalmology-images` - Create image record

#### **🏥 Physical Therapy APIs:**
- `GET /api/physical-therapy-records` - Get all PT records
- `GET /api/physical-therapy-records/:id` - Get specific record
- `POST /api/physical-therapy-records` - Create new record
- `PUT /api/physical-therapy-records/:id` - Update record
- `GET /api/therapy-plans/:patientId` - Get therapy plans
- `POST /api/therapy-plans` - Create therapy plan
- `GET /api/therapy-sessions/:patientId` - Get sessions
- `POST /api/therapy-sessions` - Create session
- `GET /api/assessment-data/:patientId` - Get assessments
- `POST /api/assessment-data` - Create assessment
- `GET /api/exercise-prescriptions/:patientId` - Get prescriptions
- `POST /api/exercise-prescriptions` - Create prescription

### **Step 4: Update Frontend Service Layer**

The `src/services/specialtyMedicalService.ts` file provides:

#### **👁️ Ophthalmology Functions:**
```typescript
// Records
getOphthalmologyRecords()
getOphthalmologyRecord(id)
createOphthalmologyRecord(data)
updateOphthalmologyRecord(id, data)

// Visual Acuity
getVisualAcuityTests(patientId)
createVisualAcuityTest(data)

// Refraction
getRefractionData(patientId)
createRefractionData(data)

// Intraocular Pressure
getIntraocularPressure(patientId)
createIntraocularPressure(data)

// Findings & Images
getOphthalmologyFindings(patientId)
createOphthalmologyFinding(data)
getOphthalmologyImages(patientId)
createOphthalmologyImage(data)
```

#### **🏥 Physical Therapy Functions:**
```typescript
// Records
getPhysicalTherapyRecords()
getPhysicalTherapyRecord(id)
createPhysicalTherapyRecord(data)
updatePhysicalTherapyRecord(id, data)

// Therapy Plans
getTherapyPlans(patientId)
createTherapyPlan(data)

// Sessions
getTherapySessions(patientId)
createTherapySession(data)

// Assessments
getAssessmentData(patientId)
createAssessmentData(data)

// Exercise Prescriptions
getExercisePrescriptions(patientId)
createExercisePrescription(data)
```

## 🔧 Integration with Existing Components

### **Step 5: Update EMR Forms**

#### **OphthalmologyEMRForm.tsx:**
```typescript
import { 
  createOphthalmologyRecord,
  createVisualAcuityTest,
  createRefractionData,
  createIntraocularPressure,
  createOphthalmologyFinding
} from '../../services/specialtyMedicalService';

// Update form submission to use specialized tables
const handleSubmit = async (formData) => {
  // Create main ophthalmology record
  const record = await createOphthalmologyRecord({
    patient_id: patientId,
    doctor_id: doctorId,
    visit_date: new Date().toISOString().split('T')[0],
    chief_complaint: formData.chiefComplaint,
    diagnosis: formData.diagnosis,
    treatment: formData.treatment,
    notes: formData.notes
  });

  // Create visual acuity test
  if (formData.visualAcuity) {
    await createVisualAcuityTest({
      ophthalmology_record_id: record.id,
      patient_id: patientId,
      test_date: new Date().toISOString().split('T')[0],
      right_eye_near: formData.visualAcuity.rightEye.near,
      right_eye_distance: formData.visualAcuity.rightEye.distance,
      left_eye_near: formData.visualAcuity.leftEye.near,
      left_eye_distance: formData.visualAcuity.leftEye.distance
    });
  }

  // Create refraction data
  if (formData.refraction) {
    await createRefractionData({
      ophthalmology_record_id: record.id,
      patient_id: patientId,
      test_date: new Date().toISOString().split('T')[0],
      right_eye_sphere: formData.refraction.rightEye.sphere,
      right_eye_cylinder: formData.refraction.rightEye.cylinder,
      right_eye_axis: formData.refraction.rightEye.axis,
      left_eye_sphere: formData.refraction.leftEye.sphere,
      left_eye_cylinder: formData.refraction.leftEye.cylinder,
      left_eye_axis: formData.refraction.leftEye.axis
    });
  }

  // Create intraocular pressure record
  if (formData.intraocularPressure) {
    await createIntraocularPressure({
      ophthalmology_record_id: record.id,
      patient_id: patientId,
      test_date: new Date().toISOString().split('T')[0],
      right_eye_pressure: formData.intraocularPressure.rightEye,
      left_eye_pressure: formData.intraocularPressure.leftEye,
      method: formData.intraocularPressure.method
    });
  }
};
```

#### **PTEMR.tsx:**
```typescript
import { 
  createPhysicalTherapyRecord,
  createTherapyPlan,
  createAssessmentData,
  createExercisePrescription
} from '../../services/specialtyMedicalService';

// Update form submission to use specialized tables
const handleSubmit = async (formData) => {
  // Create main PT record
  const record = await createPhysicalTherapyRecord({
    patient_id: patientId,
    therapist_id: therapistId,
    visit_date: new Date().toISOString().split('T')[0],
    chief_complaint: formData.chiefComplaint,
    assessment: formData.assessment,
    treatment_plan: formData.treatmentPlan,
    notes: formData.notes
  });

  // Create therapy plan
  if (formData.therapyPlan) {
    await createTherapyPlan({
      physical_therapy_record_id: record.id,
      patient_id: patientId,
      plan_name: formData.therapyPlan.name,
      description: formData.therapyPlan.description,
      goals: formData.therapyPlan.goals,
      duration_weeks: formData.therapyPlan.duration,
      frequency_per_week: formData.therapyPlan.frequency
    });
  }

  // Create assessment data
  if (formData.assessment) {
    await createAssessmentData({
      physical_therapy_record_id: record.id,
      patient_id: patientId,
      assessment_type: formData.assessment.type,
      assessment_date: new Date().toISOString().split('T')[0],
      range_of_motion: formData.assessment.rangeOfMotion,
      muscle_strength: formData.assessment.muscleStrength,
      balance_tests: formData.assessment.balanceTests,
      pain_assessment: formData.assessment.painAssessment
    });
  }
};
```

## 📊 Data Structure Examples

### **👁️ Ophthalmology Data:**

```typescript
// Visual Acuity Test
{
  patient_id: "uuid",
  ophthalmology_record_id: "uuid",
  test_date: "2024-01-15",
  right_eye_near: "20/20",
  right_eye_distance: "20/25",
  left_eye_near: "20/20",
  left_eye_distance: "20/20",
  right_eye_corrected: "20/20",
  left_eye_corrected: "20/20"
}

// Refraction Data
{
  patient_id: "uuid",
  ophthalmology_record_id: "uuid",
  test_date: "2024-01-15",
  right_eye_sphere: "+1.50",
  right_eye_cylinder: "-0.75",
  right_eye_axis: "90",
  right_eye_add: "+2.00",
  left_eye_sphere: "+1.25",
  left_eye_cylinder: "-0.50",
  left_eye_axis: "85",
  left_eye_add: "+2.00",
  pupillary_distance: "62mm"
}

// Intraocular Pressure
{
  patient_id: "uuid",
  ophthalmology_record_id: "uuid",
  test_date: "2024-01-15",
  right_eye_pressure: "14mmHg",
  left_eye_pressure: "16mmHg",
  method: "tonometry"
}
```

### **🏥 Physical Therapy Data:**

```typescript
// Therapy Plan
{
  patient_id: "uuid",
  physical_therapy_record_id: "uuid",
  plan_name: "Lower Back Rehabilitation",
  description: "6-week program for lower back pain",
  goals: "Reduce pain, improve mobility, strengthen core",
  duration_weeks: 6,
  frequency_per_week: 3,
  start_date: "2024-01-15",
  end_date: "2024-02-26"
}

// Therapy Session
{
  patient_id: "uuid",
  therapy_plan_id: "uuid",
  therapist_id: "uuid",
  session_date: "2024-01-15",
  session_duration_minutes: 60,
  exercises_performed: "Core strengthening, stretching, balance exercises",
  progress_notes: "Patient showed improvement in balance",
  pain_level_before: 6,
  pain_level_after: 4,
  status: "completed"
}

// Assessment Data
{
  patient_id: "uuid",
  physical_therapy_record_id: "uuid",
  assessment_type: "initial",
  assessment_date: "2024-01-15",
  range_of_motion: {
    hip_flexion: "90 degrees",
    hip_extension: "20 degrees",
    lumbar_flexion: "45 degrees"
  },
  muscle_strength: {
    hip_flexors: "4/5",
    hip_extensors: "3/5",
    core_strength: "3/5"
  },
  balance_tests: {
    single_leg_stand: "15 seconds",
    tandem_walk: "10 steps"
  }
}
```

## 🔒 Security Features

### **Row Level Security (RLS)**
- All tables have RLS enabled
- Access control based on user roles
- Data isolation between departments

### **Data Validation**
- Check constraints on status fields
- Foreign key relationships
- Required field validation

### **Performance Optimization**
- Indexes on frequently queried columns
- Optimized queries for patient data
- Efficient data retrieval

## 🧪 Testing

### **Test Database Creation**
```sql
-- Test if tables exist
SELECT COUNT(*) FROM ophthalmology_records;
SELECT COUNT(*) FROM physical_therapy_records;

-- Test sample data insertion
INSERT INTO ophthalmology_records (patient_id, doctor_id, visit_date, chief_complaint, diagnosis, treatment)
VALUES ('test-patient-id', 'test-doctor-id', CURRENT_DATE, 'Blurred vision', 'Cataract', 'Surgery recommended');
```

### **Test API Endpoints**
```bash
# Test ophthalmology endpoints
curl -X GET http://localhost:3001/api/ophthalmology-records
curl -X POST http://localhost:3001/api/ophthalmology-records -H "Content-Type: application/json" -d '{"patient_id":"test","doctor_id":"test","visit_date":"2024-01-15","chief_complaint":"Blurred vision","diagnosis":"Cataract","treatment":"Surgery"}'

# Test physical therapy endpoints
curl -X GET http://localhost:3001/api/physical-therapy-records
curl -X POST http://localhost:3001/api/physical-therapy-records -H "Content-Type: application/json" -d '{"patient_id":"test","therapist_id":"test","visit_date":"2024-01-15","chief_complaint":"Back pain","assessment":"Muscle strain","treatment_plan":"Strengthening exercises"}'
```

## 🎯 Benefits

### **👁️ Ophthalmology Benefits:**
- ✅ **Specialized data storage** - Eye exam data properly structured
- ✅ **Visual acuity tracking** - Monitor vision changes over time
- ✅ **Prescription management** - Track refraction data
- ✅ **IOP monitoring** - Track intraocular pressure
- ✅ **Image management** - Store and organize eye photos
- ✅ **Specialized reporting** - Generate eye-specific reports

### **🏥 Physical Therapy Benefits:**
- ✅ **Treatment plan tracking** - Monitor therapy progress
- ✅ **Session management** - Track individual sessions
- ✅ **Assessment data** - Store detailed evaluations
- ✅ **Exercise prescriptions** - Manage prescribed exercises
- ✅ **Progress monitoring** - Track patient improvement
- ✅ **Outcome measurement** - Measure treatment effectiveness

## 🚀 Next Steps

1. **Run the database schema** in Supabase
2. **Test the API endpoints** to ensure they work
3. **Update the EMR forms** to use the new service functions
4. **Test the integration** with existing components
5. **Deploy to production** when ready

## 📞 Support

If you encounter any issues:
1. Check the Supabase logs for database errors
2. Verify the API endpoints are working
3. Ensure the service functions are properly imported
4. Check the browser console for frontend errors

The specialized medical tables provide a robust foundation for ophthalmology and physical therapy departments to manage their specialized data effectively! 🎉
