// Test script to simulate development mode API call
console.log('🔍 Testing Development Mode API Call...\n');

// Simulate the exact API configuration logic for development
const getApiUrl = (endpoint = '') => {
  const hostname = 'localhost:5173'; // Development mode
  
  const isVercel = hostname.includes('vercel.app') || 
                   hostname.includes('alfasystem.vercel.app') ||
                   process.env.NODE_ENV === 'production';
  
  const baseUrl = isVercel
    ? '/api'  // Vercel serverless functions
    : 'https://alfasystem.vercel.app/api';  // Use Vercel API even for local development
  
  const fullUrl = endpoint ? `${baseUrl}/${endpoint}` : baseUrl;
  
  console.log('API Configuration:');
  console.log(`  hostname: ${hostname}`);
  console.log(`  isVercel: ${isVercel}`);
  console.log(`  baseUrl: ${baseUrl}`);
  console.log(`  endpoint: ${endpoint}`);
  console.log(`  fullUrl: ${fullUrl}`);
  
  return fullUrl;
};

// Test the vital signs endpoint
const vitalSignsUrl = getApiUrl('vital-signs');
console.log(`\nVital Signs URL: ${vitalSignsUrl}`);

// Test the API call
console.log('\nTesting API call...');
fetch(vitalSignsUrl, {
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
    notes: 'Development test'
  })
})
.then(response => {
  console.log(`Response Status: ${response.status}`);
  console.log(`Response Headers:`, Object.fromEntries(response.headers.entries()));
  
  return response.text();
})
.then(responseText => {
  console.log(`Response Text (first 200 chars): ${responseText.substring(0, 200)}...`);
  
  if (responseText.trim().startsWith('<!doctype') || responseText.trim().startsWith('<html')) {
    console.log('❌ PROBLEM: Received HTML instead of JSON');
    console.log('This means the frontend is hitting the wrong endpoint');
  } else if (responseText.includes('"success":true')) {
    console.log('✅ SUCCESS: Received JSON response with success');
  } else {
    console.log(`❌ API Error: ${responseText}`);
  }
})
.catch(error => {
  console.log(`❌ Network Error: ${error.message}`);
});
