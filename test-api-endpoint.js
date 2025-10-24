// Test script to check if the vital signs API endpoint is working
const fetch = require('node-fetch');

async function testVitalSignsAPI() {
  try {
    console.log('Testing vital signs API endpoint...');
    
    const testData = {
      patientId: 'test-patient-id',
      recordedBy: 'test-user-id',
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

    const response = await fetch('http://localhost:3001/api/vital-signs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
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

testVitalSignsAPI();
