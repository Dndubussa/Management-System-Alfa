// Test script to check if the Vercel vital signs API endpoint is working
import fetch from 'node-fetch';

async function testVercelVitalSignsAPI() {
  try {
    console.log('Testing Vercel vital signs API endpoint...');
    
    // Test data - in a real scenario, you would use valid UUIDs
    const testData = {
      patientId: '00000000-0000-0000-0000-000000000000',
      recordedBy: '00000000-0000-0000-0000-000000000000',
      temperature: 36.5,
      pulse: 80,
      respiratoryRate: 16,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      height: 170,
      weight: 70,
      bmi: 24.2,
      oxygenSaturation: 98,
      painLevel: null,
      urgency: 'normal',
      notes: 'Test vital signs'
    };

    // Test the Vercel function endpoint
    const response = await fetch('http://localhost:3001/api/vital-signs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (response.ok) {
      console.log('✅ API endpoint is working');
    } else {
      console.log('❌ API endpoint returned error:', response.status);
    }
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testVercelVitalSignsAPI();