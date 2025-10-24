// Comprehensive test to diagnose Vercel function issues
async function comprehensiveVercelTest() {
  try {
    console.log('🔍 Comprehensive Vercel Function Test');
    console.log('📍 Current origin:', window.location.origin);
    
    const testUrl = `${window.location.origin}/api/vital-signs`;
    console.log('🧪 Testing URL:', testUrl);
    
    // Test 1: OPTIONS request (preflight)
    console.log('\n📋 Test 1: OPTIONS request');
    const optionsResponse = await fetch(testUrl, { method: 'OPTIONS' });
    console.log('Status:', optionsResponse.status);
    console.log('Headers:', Object.fromEntries(optionsResponse.headers.entries()));
    
    // Test 2: GET request (should return 405)
    console.log('\n📋 Test 2: GET request');
    const getResponse = await fetch(testUrl, { method: 'GET' });
    console.log('Status:', getResponse.status);
    const getText = await getResponse.text();
    console.log('Response (first 200 chars):', getText.substring(0, 200));
    
    // Test 3: POST request with proper JSON
    console.log('\n📋 Test 3: POST request with JSON');
    const postResponse = await fetch(testUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId: 'test-patient',
        recordedBy: 'test-user',
        temperature: 36.5,
        pulse: 80
      })
    });
    
    console.log('Status:', postResponse.status);
    console.log('Headers:', Object.fromEntries(postResponse.headers.entries()));
    const postText = await postResponse.text();
    console.log('Response (first 500 chars):', postText.substring(0, 500));
    
    // Check if response is HTML
    if (postText.trim().startsWith('<!doctype') || postText.trim().startsWith('<html') || postText.trim().startsWith('<!DOCTYPE')) {
      console.error('❌ ERROR: Received HTML instead of JSON');
      return false;
    }
    
    // Try to parse as JSON
    try {
      const jsonResponse = JSON.parse(postText);
      console.log('✅ Successfully parsed JSON response:', jsonResponse);
      return true;
    } catch (parseError) {
      console.error('❌ ERROR: Could not parse response as JSON');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Network error:', error);
    return false;
  }
}

// Run the test
comprehensiveVercelTest().then(success => {
  if (success) {
    console.log('\n🎉 Vercel function test completed successfully');
  } else {
    console.log('\n💥 Vercel function test failed');
  }
});