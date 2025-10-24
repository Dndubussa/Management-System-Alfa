import fetch from 'node-fetch';

async function testVitalSignsAPI() {
  try {
    console.log('🧪 Testing vital signs API endpoint...');
    
    const testData = {
      patientId: 'test-patient-id',
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
    } else {
      console.log('❌ Vital signs API returned an error');
    }
    
  } catch (error) {
    console.error('❌ Error testing vital signs API:', error.message);
    console.error('❌ Full error:', error);
  }
}

testVitalSignsAPI();
