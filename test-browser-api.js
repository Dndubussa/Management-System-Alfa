// Test script to simulate browser API call
const testBrowserApiCall = async () => {
  console.log('🔍 Testing Browser API Call...\n');
  
  // Test the exact URL that should be generated
  const apiUrl = 'https://alfasystem.vercel.app/api/vital-signs';
  
  console.log(`Testing URL: ${apiUrl}`);
  
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
        notes: 'Browser test'
      })
    });
    
    console.log(`Response Status: ${response.status}`);
    console.log(`Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log(`Response Text (first 200 chars): ${responseText.substring(0, 200)}...`);
    
    if (responseText.trim().startsWith('<!doctype') || responseText.trim().startsWith('<html')) {
      console.log('❌ PROBLEM: Received HTML instead of JSON');
      console.log('This means the frontend is hitting the wrong endpoint');
    } else if (response.ok) {
      console.log('✅ SUCCESS: Received JSON response');
    } else {
      console.log(`❌ API Error: ${response.status} - ${responseText}`);
    }
    
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
  }
};

testBrowserApiCall().catch(console.error);
