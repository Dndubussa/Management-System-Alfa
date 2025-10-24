// Debug script to test API calls from frontend perspective
const testApiCall = async () => {
  console.log('🔍 Testing API call from frontend perspective...\n');
  
  // Test different possible URLs
  const testUrls = [
    'http://localhost:3001/api/vital-signs',  // Local backend
    '/api/vital-signs',                        // Vercel relative
    'https://alfasystem.vercel.app/api/vital-signs'  // Vercel absolute
  ];
  
  for (const url of testUrls) {
    console.log(`Testing: ${url}`);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId: '4a0b7d4a-c55a-4818-8cd8-4cd6fdb7c186',
          temperature: 37.5,
          pulse: 80
        })
      });
      
      const responseText = await response.text();
      console.log(`  Status: ${response.status}`);
      console.log(`  Content-Type: ${response.headers.get('content-type')}`);
      console.log(`  Response: ${responseText.substring(0, 100)}...`);
      console.log(`  ✅ ${response.ok ? 'SUCCESS' : 'FAILED'}\n`);
      
    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}\n`);
    }
  }
};

testApiCall().catch(console.error);
