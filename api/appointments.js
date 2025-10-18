// Vercel serverless function for appointments
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Get all appointments
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date_time', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      // Create new appointment
      const appointmentData = req.body;
      
      // Convert camelCase to snake_case
      const snakeCaseData = {
        patient_id: appointmentData.patientId,
        doctor_id: appointmentData.doctorId,
        date_time: appointmentData.dateTime,
        duration: appointmentData.duration || 30,
        type: appointmentData.type || 'consultation',
        status: appointmentData.status || 'scheduled',
        notes: appointmentData.notes || ''
      };

      console.log('Creating appointment with data:', snakeCaseData);

      const { data, error } = await supabase
        .from('appointments')
        .insert([snakeCaseData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating appointment:', error);
        return res.status(400).json({ 
          error: error.message,
          details: error.details,
          hint: error.hint
        });
      }

      if (!data) {
        return res.status(500).json({ error: 'No data returned from database' });
      }

      // Convert back to camelCase
      const camelCaseData = {
        id: data.id,
        patientId: data.patient_id,
        doctorId: data.doctor_id,
        dateTime: data.date_time,
        duration: data.duration,
        type: data.type,
        status: data.status,
        notes: data.notes
      };

      return res.status(201).json(camelCaseData);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
