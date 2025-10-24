// Vercel serverless function for vital signs
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
    const { createClient } = await import('@supabase/supabase-js');
    
    // Use server-side environment variables for Vercel functions
    // These should be configured in Vercel dashboard
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    // Use service role key only on the server side
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials');
      console.error('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
      console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING');
      return res.status(500).json({ 
        error: 'Missing Supabase credentials. Please check server configuration.',
        details: 'Server-side service role key is required for backend operations.'
      });
    }
    
    // Create Supabase client with service role key for full access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
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
      muac: req.body.muac,
      oxygen_saturation: req.body.oxygenSaturation,
      pain_level: req.body.painLevel,
      urgency: req.body.urgency,
      notes: req.body.notes,
      recorded_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('vital_signs')
      .insert([vitalData])
      .select();
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(200).json({ 
      success: true, 
      data: data[0],
      message: 'Vital signs recorded successfully' 
    });
    
  } catch (error) {
    console.error('Error saving vital signs:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}