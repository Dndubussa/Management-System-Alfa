// Test script to verify Vercel deployment

const testVercelDeployment = async () => {
  const baseUrl = 'https://alfasystem.vercel.app';
  
  console.log('🔍 Testing Vercel Deployment...\n');
  
  // Test 1: Main site
  console.log('1. Testing main site...');
  try {
    const response = await fetch(`${baseUrl}/`);
    console.log(`   ✅ Main site: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.log(`   ❌ Main site: ${error.message}`);
  }
  
  // Test 2: API endpoint (GET)
  console.log('\n2. Testing API endpoint (GET)...');
  try {
    const response = await fetch(`${baseUrl}/api/vital-signs`);
    console.log(`   ✅ API endpoint: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.log(`   ❌ API endpoint: ${error.message}`);
  }
  
  // Test 3: API endpoint (POST)
  console.log('\n3. Testing API endpoint (POST)...');
  try {
    const response = await fetch(`${baseUrl}/api/vital-signs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        patientId: 'test-patient-id',
        temperature: 37.5,
        pulse: 80
      })
    });
    
    const data = await response.text();
    console.log(`   ✅ API POST: ${response.status} ${response.statusText}`);
    console.log(`   Response: ${data.substring(0, 100)}...`);
  } catch (error) {
    console.log(`   ❌ API POST: ${error.message}`);
  }
  
  console.log('\n📋 Summary:');
  console.log('- If main site fails: Deployment not found or build failed');
  console.log('- If API GET fails: Serverless functions not deployed');
  console.log('- If API POST fails: Check environment variables in Vercel dashboard');
};

// Run the test
testVercelDeployment().catch(console.error);
