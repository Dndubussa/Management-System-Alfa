import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from 'crypto';
import { supabase } from './src/config/supabase.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Utility function to convert camelCase to snake_case
const convertCamelToSnake = (obj) => {
  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    converted[snakeKey] = value;
  }
  return converted;
};

// Enhanced error handling function
const handleSupabaseResponse = (data, error, res) => {
  if (error) {
    console.error('Supabase error:', error);
    res.status(500).json({ error: error.message, details: error });
  } else {
    res.json(data);
  }
};

// Test Supabase connection on startup
const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection test failed:', err.message);
    return false;
  }
};

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint for Vercel
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Helper function for Supabase queries

// Password hashing utilities
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, hashedPassword) => {
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
};

// API Routes

// Authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 1) Authenticate against Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !authData?.user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const authUser = authData.user;

    // 2) Fetch profile from public.users by email (preferred) or id
    let profile = null;
    let profileError = null;

    const { data: byEmail, error: byEmailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!byEmailError && byEmail) {
      profile = byEmail;
    } else {
      // If no profile by email, try by id
      const { data: byId, error: byIdError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      if (!byIdError && byId) {
        profile = byId;
      } else {
        profileError = byEmailError || byIdError;
      }
    }

    // 3) If no profile, create one using Auth user id and fallback metadata
    if (!profile) {
      const fallbackName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || email;
      const defaultRole = 'doctor';
      const defaultDepartment = 'General';

      const { data: upserted, error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: authUser.id,
          name: fallbackName,
          email,
          role: defaultRole,
          department: defaultDepartment,
        }, { onConflict: 'id' })
        .select()
        .single();

      if (upsertError) {
        return res.status(500).json({ error: upsertError.message || 'Failed to create user profile' });
      }
      profile = upserted;
    }

    // 4) Return combined user info
    const responseUser = {
      id: profile.id || authUser.id,
      name: profile.name || authUser.user_metadata?.full_name || authUser.email,
      email: profile.email || authUser.email,
      role: profile.role || 'doctor',
      department: profile.department || 'General',
    };

    return res.json({ success: true, user: responseUser, token: authData.session?.access_token || null });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  // In a real application, you would invalidate the token
  res.json({ success: true });
});

// Patients
app.get('/api/patients', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('mrn', { ascending: true });
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/patients/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Patient not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    // Generate MRN using P001 format
    const { data: lastPatient } = await supabase
      .from('patients')
      .select('mrn')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let nextNumber = 1;
    if (lastPatient && lastPatient.mrn) {
      // Check for new P001 format first
      const newFormatMatch = lastPatient.mrn.match(/P(\d+)/);
      if (newFormatMatch) {
        nextNumber = parseInt(newFormatMatch[1]) + 1;
      } else {
        // Check for old ALFA-YYYY-XXXXX format
        const oldFormatMatch = lastPatient.mrn.match(/ALFA-\d{4}-(\d+)/);
        if (oldFormatMatch) {
          nextNumber = parseInt(oldFormatMatch[1]) + 1;
        }
      }
    }

    const mrn = `P${String(nextNumber).padStart(3, '0')}`;

    // Use the snake_case data from the API service (already mapped)
    const patientData = {
      mrn: mrn,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      date_of_birth: req.body.date_of_birth,
      gender: req.body.gender,
      phone: req.body.phone,
      address: req.body.address,
      emergency_contact_name: req.body.emergency_contact_name || '',
      emergency_contact_phone: req.body.emergency_contact_phone || '',
      emergency_contact_relationship: req.body.emergency_contact_relationship || '',
      insurance_provider: req.body.insurance_provider || '',
      insurance_membership_number: req.body.insurance_membership_number || ''
    };

    console.log('Backend received patient data:', req.body);
    console.log('Backend mapped patient data:', patientData);

    const { data, error } = await supabase
      .from('patients')
      .insert([patientData])
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/patients/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Patient not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/patients/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .delete()
      .eq('id', req.params.id);
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data && data.length > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Patient not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Medical Records
app.get('/api/medical-records', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*');
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/medical-records/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Medical record not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/medical-records', async (req, res) => {
  try {
    // Convert camelCase to snake_case for database
    const recordData = {
      patient_id: req.body.patientId,
      doctor_id: req.body.doctorId,
      visit_date: req.body.visitDate,
      chief_complaint: req.body.chiefComplaint,
      diagnosis: req.body.diagnosis,
      treatment: req.body.treatment,
      notes: req.body.notes,
      blood_pressure: req.body.vitals?.bloodPressure || '',
      heart_rate: req.body.vitals?.heartRate || '',
      temperature: req.body.vitals?.temperature || '',
      weight: req.body.vitals?.weight || '',
      height: req.body.vitals?.height || '',
      status: req.body.status || 'active'
    };

    const { data, error } = await supabase
      .from('medical_records')
      .insert([recordData])
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/medical-records/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('medical_records')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Medical record not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Prescriptions
app.get('/api/prescriptions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*');
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/prescriptions', async (req, res) => {
  try {
    const prescriptionData = convertCamelToSnake(req.body);
    const { data, error } = await supabase
      .from('prescriptions')
      .insert([prescriptionData])
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/prescriptions/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Prescription not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/prescriptions/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabase
      .from('prescriptions')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Prescription not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Lab Orders
app.get('/api/lab-orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('lab_orders')
      .select('*');
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/lab-orders', async (req, res) => {
  try {
    const labOrderData = convertCamelToSnake(req.body);
    const { data, error } = await supabase
      .from('lab_orders')
      .insert([labOrderData])
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/lab-orders/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('lab_orders')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Lab order not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/lab-orders/:id/status', async (req, res) => {
  try {
    const { status, results } = req.body;
    const updateData = { status };
    if (results) updateData.results = results;
    if (status === 'completed') updateData.completed_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('lab_orders')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Lab order not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*');
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/appointments/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Appointment not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    console.log('Received appointment data:', req.body);
    
    // Validate required fields
    if (!req.body.patientId || !req.body.doctorId || !req.body.dateTime) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        details: 'patientId, doctorId, and dateTime are required' 
      });
    }
    
    // Convert camelCase to snake_case for database
    const appointmentData = {
      patient_id: req.body.patientId,
      doctor_id: req.body.doctorId,
      date_time: req.body.dateTime,
      duration: req.body.duration || 30, // Default to 30 minutes
      type: req.body.type || 'consultation',
      status: req.body.status || 'scheduled',
      notes: req.body.notes || ''
    };

    console.log('Inserting appointment data:', appointmentData);
    
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error creating appointment:', error);
      return res.status(400).json({ 
        error: 'Database error', 
        details: error.message,
        hint: error.hint
      });
    }
    
    console.log('Appointment created successfully:', data);
    
    // Ensure we return the created appointment data
    if (data) {
      return res.status(201).json(data);
    } else {
      return res.status(500).json({ error: 'Failed to create appointment - no data returned' });
    }
  } catch (error) {
    console.error('Server error creating appointment:', error);
    res.status(500).json({ 
      error: 'Server error', 
      details: error.message 
    });
  }
});

app.put('/api/appointments/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Appointment not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Users
app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const userData = convertCamelToSnake(req.body);
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data && data.length > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*');
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/notifications/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([req.body])
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const { userId } = req.body;
    // For Supabase, we'll need to handle the is_read field differently
    // This is a simplified implementation
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==============================================
// VITAL SIGNS ENDPOINTS
// ==============================================

// Get vital signs for a patient
app.get('/api/vital-signs/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const { data, error } = await supabase
      .from('vital_signs')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false });
    
    if (error) {
      return handleSupabaseResponse(null, error, res);
    }
    
    res.json(data || []);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get latest vital signs for a patient
app.get('/api/vital-signs/:patientId/latest', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const { data, error } = await supabase
      .from('vital_signs')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return handleSupabaseResponse(null, error, res);
    }
    
    res.json(data || null);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create new vital signs record
app.post('/api/vital-signs', async (req, res) => {
  try {
    const vitalData = {
      patient_id: req.body.patientId,
      queue_id: req.body.queueId,
      recorded_by: req.body.recordedBy,
      temperature: req.body.temperature,
      pulse: req.body.pulse,
      respiratory_rate: req.body.respiratoryRate,
      blood_pressure_systolic: req.body.bloodPressureSystolic,
      blood_pressure_diastolic: req.body.bloodPressureDiastolic,
      height: req.body.height,
      weight: req.body.weight,
      bmi: req.body.bmi,
      oxygen_saturation: req.body.oxygenSaturation,
      pain_level: req.body.painLevel,
      urgency: req.body.urgency,
      notes: req.body.notes,
      recorded_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('vital_signs')
      .insert([vitalData])
      .select()
      .single();
    
    if (error) {
      return handleSupabaseResponse(null, error, res);
    }
    
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update vital signs record
app.put('/api/vital-signs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      temperature: req.body.temperature,
      pulse: req.body.pulse,
      respiratory_rate: req.body.respiratoryRate,
      blood_pressure_systolic: req.body.bloodPressureSystolic,
      blood_pressure_diastolic: req.body.bloodPressureDiastolic,
      height: req.body.height,
      weight: req.body.weight,
      bmi: req.body.bmi,
      oxygen_saturation: req.body.oxygenSaturation,
      pain_level: req.body.painLevel,
      urgency: req.body.urgency,
      notes: req.body.notes
    };

    const { data, error } = await supabase
      .from('vital_signs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return handleSupabaseResponse(null, error, res);
    }
    
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==============================================
// PATIENT QUEUE ENDPOINTS
// ==============================================

// Get patient queue
app.get('/api/patient-queue', async (req, res) => {
  try {
    const { department, status, workflow_stage } = req.query;
    
    let query = supabase
      .from('patient_queue')
      .select(`
        *,
        patients (
          id,
          mrn,
          first_name,
          last_name,
          phone,
          insurance_provider
        )
      `)
      .order('created_at', { ascending: true });
    
    if (department) {
      query = query.eq('department', department);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (workflow_stage) {
      query = query.eq('workflow_stage', workflow_stage);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return handleSupabaseResponse(null, error, res);
    }
    
    res.json(data || []);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add patient to queue
app.post('/api/patient-queue', async (req, res) => {
  try {
    const queueData = {
      patient_id: req.body.patientId,
      department: req.body.department || 'general',
      priority: req.body.priority || 'normal',
      status: 'waiting',
      workflow_stage: 'reception',
      assigned_doctor_id: req.body.assignedDoctorId || null,
      assigned_doctor_name: req.body.assignedDoctorName || null,
      assignment_reason: req.body.assignmentReason || null,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('patient_queue')
      .insert([queueData])
      .select()
      .single();
    
    if (error) {
      return handleSupabaseResponse(null, error, res);
    }
    
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update queue status
app.put('/api/patient-queue/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, workflowStage } = req.body;
    
    const updateData = {
      status,
      workflow_stage: workflowStage,
      updated_at: new Date().toISOString()
    };

    if (status === 'in-progress') {
      updateData.started_at = new Date().toISOString();
    } else if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('patient_queue')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return handleSupabaseResponse(null, error, res);
    }
    
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Assign doctor to patient in queue
app.put('/api/patient-queue/:id/assign-doctor', async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedDoctorId, assignedDoctorName, assignmentReason } = req.body;
    
    const updateData = {
      assigned_doctor_id: assignedDoctorId,
      assigned_doctor_name: assignedDoctorName,
      assignment_reason: assignmentReason,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('patient_queue')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return handleSupabaseResponse(null, error, res);
    }
    
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Service Prices
app.get('/api/service-prices', async (req, res) => {
  try {
    // Get all services using pagination to overcome Supabase's 1000 row limit
    let allServices = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;
    
    while (hasMore) {
      const { data, error } = await supabase
        .from('service_prices')
        .select('*')
        .order('service_name')
        .range(from, from + pageSize - 1);
      
      if (error) {
        return handleSupabaseResponse(null, error, res);
      }
      
      if (data && data.length > 0) {
        allServices = allServices.concat(data);
        from += pageSize;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }
    
    console.log(`Retrieved ${allServices.length} services from database`);
    res.json(allServices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/service-prices/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('service_prices')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Service price not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/service-prices', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('service_prices')
      .insert([req.body])
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/service-prices/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('service_prices')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Service price not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Bills
app.get('/api/bills', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('*');
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bills/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Bill not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bills', async (req, res) => {
  try {
    const billData = convertCamelToSnake(req.body);
    const { data, error } = await supabase
      .from('bills')
      .insert([billData])
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/bills/:id/status', async (req, res) => {
  try {
    const { status, paymentMethod } = req.body;
    const updateData = { status };
    if (paymentMethod) updateData.payment_method = paymentMethod;
    if (status === 'paid') updateData.paid_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('bills')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Bill not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Departments
app.get('/api/departments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*');
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/departments/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Department not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/departments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .insert([req.body])
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/departments/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Department not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Referrals
app.get('/api/referrals', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*');
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/referrals/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Referral not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/referrals', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .insert([req.body])
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/referrals/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabase
      .from('referrals')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Referral not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Insurance Claims
app.get('/api/insurance-claims', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('insurance_claims')
      .select('*');
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/insurance-claims/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('insurance_claims')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Insurance claim not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/insurance-claims', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('insurance_claims')
      .insert([req.body])
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/insurance-claims/:id/status', async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const updateData = { status, rejection_reason: rejectionReason };
    if (status === 'approved') updateData.approval_date = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('insurance_claims')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Insurance claim not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Surgery Requests
app.get('/api/surgery-requests', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('surgery_requests')
      .select('*');
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/surgery-requests/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('surgery_requests')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Surgery request not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/surgery-requests', async (req, res) => {
  try {
    const surgeryData = convertCamelToSnake(req.body);
    const { data, error } = await supabase
      .from('surgery_requests')
      .insert([surgeryData])
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/surgery-requests/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('surgery_requests')
      .update({ 
        ...req.body, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Surgery request not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// OT Slots
app.get('/api/ot-slots', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ot_slots')
      .select('*');
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ot-slots/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ot_slots')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'OT slot not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ot-slots', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ot_slots')
      .insert([req.body])
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/ot-slots/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ot_slots')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'OT slot not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// OT Resources
app.get('/api/ot-resources', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ot_resources')
      .select('*');
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ot-resources/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ot_resources')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'OT resource not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ot-resources', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ot_resources')
      .insert([req.body])
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/ot-resources/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ot_resources')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'OT resource not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// OT Checklists
app.get('/api/ot-checklists', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ot_checklists')
      .select('*');
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ot-checklists/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ot_checklists')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'OT checklist not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ot-checklists', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ot_checklists')
      .insert([req.body])
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/ot-checklists/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ot_checklists')
      .update({ 
        ...req.body, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'OT checklist not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Surgery Progress
app.get('/api/surgery-progress', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('surgery_progress')
      .select('*');
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/surgery-progress/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('surgery_progress')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Surgery progress not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/surgery-progress', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('surgery_progress')
      .insert([req.body])
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/surgery-progress/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('surgery_progress')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Surgery progress not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// OT Reports
app.get('/api/ot-reports', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ot_reports')
      .select('*');
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ot-reports/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ot_reports')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'OT report not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ot-reports', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ot_reports')
      .insert([req.body])
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/ot-reports/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ot_reports')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'OT report not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ICD-10 Codes
app.get('/api/icd10', async (req, res) => {
  try {
    const { search, category, chapter, limit = 50, offset = 0 } = req.query;
    
    let query = supabase
      .from('icd10_codes')
      .select('*')
      .eq('is_active', true)
      .order('code')
      .range(offset, offset + limit - 1);
    
    if (search) {
      query = query.or(`code.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (chapter) {
      query = query.eq('chapter', chapter);
    }
    
    const { data, error } = await query;
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/icd10/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }
    
    const { data, error } = await supabase
      .from('icd10_codes')
      .select('code, description, category')
      .eq('is_active', true)
      .or(`code.ilike.%${q}%,description.ilike.%${q}%`)
      .order('code')
      .limit(limit);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/icd10/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('icd10_codes')
      .select('category')
      .eq('is_active', true)
      .not('category', 'is', null);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    const categories = [...new Set(data.map(item => item.category))].sort();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/icd10/chapters', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('icd10_chapters')
      .select('*')
      .order('chapter_number');
    
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/icd10/:code', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('icd10_codes')
      .select('*')
      .eq('code', req.params.code)
      .eq('is_active', true)
      .single();
    
    if (error) {
      return handleSupabaseResponse(data, error, res);
    }
    
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'ICD-10 code not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Service Estimates API endpoints
app.get('/api/estimates', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('service_estimates')
      .select('*')
      .order('created_at', { ascending: false });
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/estimates/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('service_estimates')
      .select('*')
      .eq('id', req.params.id)
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/estimates', async (req, res) => {
  try {
    // Generate estimate number
    const currentYear = new Date().getFullYear();
    const { data: lastEstimate } = await supabase
      .from('service_estimates')
      .select('estimate_number')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let nextNumber = 1;
    if (lastEstimate && lastEstimate.estimate_number) {
      const match = lastEstimate.estimate_number.match(/EST-(\d{4})-(\d+)/);
      if (match && match[1] === currentYear.toString()) {
        nextNumber = parseInt(match[2]) + 1;
      }
    }

    const estimateNumber = `EST-${currentYear}-${nextNumber.toString().padStart(4, '0')}`;

    // Convert camelCase to snake_case for database
    const estimateData = {
      estimate_number: estimateNumber,
      patient_name: req.body.patientName || null,
      patient_phone: req.body.patientPhone || null,
      patient_email: req.body.patientEmail || null,
      services: JSON.stringify(req.body.services || []),
      subtotal: req.body.subtotal || 0,
      discount: req.body.discount || 0,
      discount_reason: req.body.discountReason || null,
      total: req.body.total || 0,
      valid_until: req.body.validUntil,
      status: req.body.status || 'draft',
      created_by: req.body.createdBy,
      notes: req.body.notes || null
    };

    const { data, error } = await supabase
      .from('service_estimates')
      .insert([estimateData])
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/estimates/:id', async (req, res) => {
  try {
    const updateData = {
      patient_name: req.body.patientName,
      patient_phone: req.body.patientPhone,
      patient_email: req.body.patientEmail,
      services: JSON.stringify(req.body.services),
      subtotal: req.body.subtotal,
      discount: req.body.discount,
      discount_reason: req.body.discountReason,
      total: req.body.total,
      valid_until: req.body.validUntil,
      status: req.body.status,
      notes: req.body.notes,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('service_estimates')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/estimates/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('service_estimates')
      .delete()
      .eq('id', req.params.id);
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ICD-10 Codes endpoints
app.get('/api/icd10-codes', async (req, res) => {
  try {
    const { search, category, limit = 1000 } = req.query;
    let query = supabase
      .from('icd10_codes')
      .select('*')
      .eq('is_active', true)
      .order('code');

    if (search) {
      query = query.or(`code.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ICD-11 Codes endpoints
app.get('/api/icd11-codes', async (req, res) => {
  try {
    const { search, category, limit = 1000 } = req.query;
    let query = supabase
      .from('icd11_codes')
      .select('*')
      .eq('is_active', true)
      .order('code');

    if (search) {
      query = query.or(`code.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CPT-4 Codes endpoints
app.get('/api/cpt4-codes', async (req, res) => {
  try {
    const { search, category, limit = 1000 } = req.query;
    let query = supabase
      .from('cpt4_codes')
      .select('*')
      .eq('is_active', true)
      .order('code');

    if (search) {
      query = query.or(`code.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tanzania Service Codes endpoints
app.get('/api/tanzania-service-codes', async (req, res) => {
  try {
    const { search, category, limit = 1000 } = req.query;
    let query = supabase
      .from('tanzania_service_codes')
      .select('*')
      .eq('is_active', true)
      .order('sha_code');

    if (search) {
      query = query.or(`sha_code.ilike.%${search}%,service_name.ilike.%${search}%,category.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Medical Record Diagnoses endpoints
app.get('/api/medical-record-diagnoses/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    const { data, error } = await supabase
      .from('medical_record_diagnoses')
      .select(`
        *,
        icd10_codes!icd10_code(code, description),
        icd11_codes!icd11_code(code, description)
      `)
      .eq('medical_record_id', recordId)
      .order('diagnosis_type', { ascending: true });
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/medical-record-diagnoses', async (req, res) => {
  try {
    const diagnosisData = {
      medical_record_id: req.body.medicalRecordId,
      icd10_code: req.body.icd10Code,
      icd11_code: req.body.icd11Code,
      diagnosis_type: req.body.diagnosisType || 'primary',
      diagnosis_date: req.body.diagnosisDate || new Date().toISOString(),
      notes: req.body.notes,
      created_by: req.body.createdBy
    };

    const { data, error } = await supabase
      .from('medical_record_diagnoses')
      .insert([diagnosisData])
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Prescription Diagnoses endpoints
app.get('/api/prescription-diagnoses/:prescriptionId', async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const { data, error } = await supabase
      .from('prescription_diagnoses')
      .select(`
        *,
        icd10_codes!icd10_code(code, description),
        icd11_codes!icd11_code(code, description)
      `)
      .eq('prescription_id', prescriptionId)
      .order('diagnosis_type', { ascending: true });
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/prescription-diagnoses', async (req, res) => {
  try {
    const diagnosisData = {
      prescription_id: req.body.prescriptionId,
      icd10_code: req.body.icd10Code,
      icd11_code: req.body.icd11Code,
      diagnosis_type: req.body.diagnosisType || 'primary'
    };

    const { data, error } = await supabase
      .from('prescription_diagnoses')
      .insert([diagnosisData])
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Bill Item Diagnoses endpoints
app.get('/api/bill-item-diagnoses/:billItemId', async (req, res) => {
  try {
    const { billItemId } = req.params;
    const { data, error } = await supabase
      .from('bill_item_diagnoses')
      .select(`
        *,
        icd10_codes!icd10_code(code, description),
        icd11_codes!icd11_code(code, description)
      `)
      .eq('bill_item_id', billItemId)
      .order('diagnosis_type', { ascending: true });
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bill-item-diagnoses', async (req, res) => {
  try {
    const diagnosisData = {
      bill_item_id: req.body.billItemId,
      icd10_code: req.body.icd10Code,
      icd11_code: req.body.icd11Code,
      diagnosis_type: req.body.diagnosisType || 'primary'
    };

    const { data, error } = await supabase
      .from('bill_item_diagnoses')
      .insert([diagnosisData])
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Service Code Mappings endpoints
app.get('/api/service-code-mappings', async (req, res) => {
  try {
    const { servicePriceId, mappingType } = req.query;
    let query = supabase
      .from('service_code_mappings')
      .select('*')
      .order('created_at', { ascending: false });

    if (servicePriceId) {
      query = query.eq('service_price_id', servicePriceId);
    }

    if (mappingType) {
      query = query.eq('mapping_type', mappingType);
    }

    const { data, error } = await query;
    
    if (error) {
      handleSupabaseResponse(data, error, res);
      return;
    }

    // Manually join the related data since foreign keys might not exist yet
    if (data && data.length > 0) {
      const enrichedData = await Promise.all(data.map(async (mapping) => {
        const enriched = { ...mapping };
        
        // Get service price info
        if (mapping.service_price_id) {
          const { data: serviceData } = await supabase
            .from('service_prices')
            .select('service_name, category, price')
            .eq('id', mapping.service_price_id)
            .single();
          if (serviceData) {
            enriched.service_prices = serviceData;
          }
        }
        
        // Get ICD-10 info
        if (mapping.icd10_code) {
          const { data: icd10Data } = await supabase
            .from('icd10_codes')
            .select('code, description')
            .eq('code', mapping.icd10_code)
            .single();
          if (icd10Data) {
            enriched.icd10_codes = icd10Data;
          }
        }
        
        // Get ICD-11 info
        if (mapping.icd11_code) {
          const { data: icd11Data } = await supabase
            .from('icd11_codes')
            .select('code, description')
            .eq('code', mapping.icd11_code)
            .single();
          if (icd11Data) {
            enriched.icd11_codes = icd11Data;
          }
        }
        
        // Get CPT-4 info
        if (mapping.cpt4_code) {
          const { data: cpt4Data } = await supabase
            .from('cpt4_codes')
            .select('code, description')
            .eq('code', mapping.cpt4_code)
            .single();
          if (cpt4Data) {
            enriched.cpt4_codes = cpt4Data;
          }
        }
        
        // Get Tanzania service code info
        if (mapping.sha_code) {
          const { data: shaData } = await supabase
            .from('tanzania_service_codes')
            .select('sha_code, service_name, nhif_tariff')
            .eq('sha_code', mapping.sha_code)
            .single();
          if (shaData) {
            enriched.tanzania_service_codes = shaData;
          }
        }
        
        return enriched;
      }));
      
      res.json(enrichedData);
    } else {
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/service-code-mappings', async (req, res) => {
  try {
    const mappingData = {
      service_price_id: req.body.servicePriceId,
      icd10_code: req.body.icd10Code,
      icd11_code: req.body.icd11Code,
      cpt4_code: req.body.cpt4Code,
      sha_code: req.body.shaCode,
      mapping_type: req.body.mappingType || 'diagnosis',
      is_primary: req.body.isPrimary || false
    };

    const { data, error } = await supabase
      .from('service_code_mappings')
      .insert([mappingData])
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Insurance Providers endpoints
app.get('/api/insurance-providers', async (req, res) => {
  try {
    const { search, is_active } = req.query;
    let query = supabase
      .from('insurance_providers')
      .select('*')
      .order('name', { ascending: true });

    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,contact_person.ilike.%${search}%`);
    }

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data, error } = await query;
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/insurance-providers/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('insurance_providers')
      .select('*')
      .eq('id', req.params.id)
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/insurance-providers', async (req, res) => {
  try {
    const providerData = {
      name: req.body.name,
      code: req.body.code,
      contact_person: req.body.contactPerson,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      tariff_codes: req.body.tariffCodes || [],
      is_active: req.body.isActive !== undefined ? req.body.isActive : true
    };

    const { data, error } = await supabase
      .from('insurance_providers')
      .insert(providerData)
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/insurance-providers/:id', async (req, res) => {
  try {
    const providerData = {
      name: req.body.name,
      code: req.body.code,
      contact_person: req.body.contactPerson,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      tariff_codes: req.body.tariffCodes || [],
      is_active: req.body.isActive !== undefined ? req.body.isActive : true
    };

    const { data, error } = await supabase
      .from('insurance_providers')
      .update(providerData)
      .eq('id', req.params.id)
      .select()
      .single();
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/insurance-providers/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('insurance_providers')
      .delete()
      .eq('id', req.params.id);
    handleSupabaseResponse(data, error, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API health/info root
app.get('/api', (req, res) => {
  res.json({ status: 'ok', name: 'Alfa Hospital API', version: 1 });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// This is essential for SPA routing to work properly
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve index.html for all other routes (SPA routing)
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Start server with Supabase connection test (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API endpoints are available at http://localhost:${PORT}/api`);
    
    // Test Supabase connection
    const connectionOk = await testSupabaseConnection();
    if (!connectionOk) {
      console.log('⚠️  Warning: Supabase connection failed. Some features may not work.');
      console.log('Please check your .env.local file and Supabase credentials.');
    }
  });
} else {
  // For Vercel deployment, export the app
  module.exports = app;
}