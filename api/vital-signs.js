// Vercel serverless function for vital signs
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 Vital signs request received:', {
      method: req.method,
      headers: req.headers,
      bodyType: typeof req.body
    });
    
    // In Vercel functions, the body should already be parsed if Content-Type is application/json
    // But let's add some defensive parsing
    let body = req.body;
    if (typeof req.body === 'string') {
      try {
        body = JSON.parse(req.body);
      } catch (parseError) {
        console.error('❌ Error parsing request body:', parseError);
        return res.status(400).json({ error: 'Invalid JSON in request body' });
      }
    }
    
    // Try to get environment variables - Vercel functions need non-VITE variables
    // But we'll fallback to VITE variables for compatibility
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_KEY;
    
    console.log('🔍 Environment variables check:');
    console.log('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
    console.log('VITE_SUPABASE_SERVICE_ROLE_KEY:', process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
    console.log('VITE_SUPABASE_KEY:', process.env.VITE_SUPABASE_KEY ? 'SET' : 'MISSING');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase credentials');
      return res.status(500).json({ 
        error: 'Missing Supabase credentials. Please check server configuration.',
        details: {
          supabaseUrl: supabaseUrl ? 'SET' : 'MISSING',
          supabaseKey: supabaseKey ? 'SET' : 'MISSING'
        }
      });
    }
    
    // Create Supabase client with the available credentials
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const vitalData = {
      patient_id: body.patientId,
      queue_id: body.queueId,
      recorded_by: body.recordedBy,
      temperature: body.temperature,
      pulse: body.pulse,
      respiratory_rate: body.respiratoryRate,
      blood_pressure_systolic: body.bloodPressureSystolic,
      blood_pressure_diastolic: body.bloodPressureDiastolic,
      height: body.height,
      weight: body.weight,
      bmi: body.bmi,
      muac: body.muac,
      oxygen_saturation: body.oxygenSaturation,
      pain_level: body.painLevel,
      urgency: body.urgency,
      notes: body.notes,
      recorded_at: new Date().toISOString()
    };
    
    console.log('📥 Inserting vital signs data:', vitalData);
    
    const { data, error } = await supabase
      .from('vital_signs')
      .insert([vitalData])
      .select();
    
    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    console.log('✅ Vital signs inserted successfully:', data[0]);
    
    return res.status(200).json({ 
      success: true, 
      data: data[0],
      message: 'Vital signs recorded successfully' 
    });
    
  } catch (error) {
    console.error('❌ Error saving vital signs:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}