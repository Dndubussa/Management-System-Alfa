import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testVitalSignsWithRealPatient() {
  try {
    console.log('🔍 Getting real patient ID from database...');
    
    // Get a real patient ID
    const { data: patients, error: patientError } = await supabase
      .from('patients')
      .select('id, first_name, last_name')
      .limit(1);
    
    if (patientError || !patients || patients.length === 0) {
      console.error('❌ No patients found in database:', patientError?.message);
      return;
    }
    
    const patient = patients[0];
    console.log('✅ Found patient:', `${patient.first_name} ${patient.last_name} (${patient.id})`);
    
    // Get a real user ID (nurse)
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('role', 'nurse')
      .limit(1);
    
    if (userError || !users || users.length === 0) {
      console.error('❌ No nurses found in database:', userError?.message);
      return;
    }
    
    const user = users[0];
    console.log('✅ Found nurse:', `${user.name} (${user.id})`);
    
    // Test vital signs API with real IDs
    console.log('🧪 Testing vital signs API with real patient and nurse...');
    
    const testData = {
      patientId: patient.id,
      recordedBy: user.id,
      temperature: '36.5',
      pulse: '80',
      respiratoryRate: '16',
      bloodPressure: '120/80',
      height: '170',
      weight: '70',
      oxygenSaturation: '98',
      urgency: 'normal'
    };
    
    console.log('📤 Sending request to:', 'http://localhost:3001/api/vital-signs');
    console.log('📤 Request data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3001/api/vital-signs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📥 Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Vital signs API is working correctly!');
      console.log('🎉 You can now save vital signs in your application!');
    } else {
      console.log('❌ Vital signs API returned an error');
    }
    
  } catch (error) {
    console.error('❌ Error testing vital signs API:', error.message);
    console.error('❌ Full error:', error);
  }
}

testVitalSignsWithRealPatient();
