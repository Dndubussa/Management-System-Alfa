// Test Vercel API endpoints directly
import fetch from 'node-fetch';

const testVercelAPI = async () => {
  console.log('🔍 Testing Vercel API endpoints...');
  
  // Test vital signs endpoint
  const vitalSignsUrl = 'https://alfa-ms-new-main.vercel.app/api/vital-signs';
  console.log('🔍 Testing:', vitalSignsUrl);
  
  try {
    const response = await fetch(vitalSignsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId: 'test-patient-id',
        temperature: 37.5,
        pulse: 80,
        respiratoryRate: 16,
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        height: 170,
        weight: 70,
        bmi: 24.2,
        muac: null,
        oxygenSaturation: 98,
        painLevel: null,
        urgency: 'normal',
        notes: 'Test vital signs',
        recordedBy: 'test-nurse-id'
      })
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📊 Response text (first 200 chars):', responseText.substring(0, 200));
    
    if (responseText.includes('<!doctype') || responseText.includes('<html')) {
      console.log('❌ API endpoint returning HTML - function not deployed or misconfigured');
    } else {
      console.log('✅ API endpoint returning JSON - function working');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
};

testVercelAPI();
