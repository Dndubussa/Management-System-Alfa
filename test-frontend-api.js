// Test script to simulate frontend API call
const testFrontendApiCall = async () => {
  console.log('🔍 Testing Frontend API Call Simulation...\n');
  
  // Simulate the API configuration logic
  const hostname = 'localhost:5173'; // Simulate local development
  const isVercel = hostname.includes('vercel.app') || 
                   hostname.includes('alfasystem.vercel.app') ||
                   process.env.NODE_ENV === 'production';
  
  const baseUrl = isVercel
    ? '/api'  // Vercel serverless functions
    : 'https://alfasystem.vercel.app/api';  // Use Vercel API even for local development
  
  const apiUrl = `${baseUrl}/vital-signs`;
  
  console.log('Configuration:');
  console.log(`  Hostname: ${hostname}`);
  console.log(`  Is Vercel: ${isVercel}`);
  console.log(`  Base URL: ${baseUrl}`);
  console.log(`  API URL: ${apiUrl}\n`);
  
  // Test the API call
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        patientId: '4a0b7d4a-c55a-4818-8cd8-4cd6fdb7c186',
        recordedBy: '7bf4b117-1447-466d-ac52-c20e23927490',
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
        notes: 'Test vital signs'
      })
    });
    
    const responseText = await response.text();
    console.log(`Response Status: ${response.status}`);
    console.log(`Response Content-Type: ${response.headers.get('content-type')}`);
    console.log(`Response: ${responseText.substring(0, 200)}...`);
    
    if (response.ok) {
      console.log('✅ SUCCESS: API call working correctly');
    } else {
      console.log('❌ FAILED: API call failed');
    }
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }
};

testFrontendApiCall().catch(console.error);
