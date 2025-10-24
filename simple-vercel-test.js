// Simple test to check if Vercel function is working
// Run this in your browser console:

async function testVercelFunction() {
  try {
    console.log('📍 Current origin:', window.location.origin);
    const testUrl = `${window.location.origin}/api/vital-signs`;
    console.log('🧪 Testing URL:', testUrl);

    // Test OPTIONS request
    console.log('📋 Sending OPTIONS request...');
    const optionsResponse = await fetch(testUrl, { method: 'OPTIONS' });
    console.log('📋 OPTIONS status:', optionsResponse.status);
    console.log('📋 OPTIONS headers:', Object.fromEntries(optionsResponse.headers.entries()));

    // Test POST request
    console.log('📤 Sending POST request...');
    const postResponse = await fetch(testUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' })
    });
    
    console.log('📤 POST status:', postResponse.status);
    console.log('📤 POST headers:', Object.fromEntries(postResponse.headers.entries()));
    
    const responseText = await postResponse.text();
    console.log('📤 Response (first 300 chars):', responseText.substring(0, 300));
    
    // Check response type
    if (responseText.trim().startsWith('<!doctype') || responseText.trim().startsWith('<html') || responseText.trim().startsWith('<!DOCTYPE')) {
      console.error('❌ ERROR: Received HTML instead of JSON - Vercel function not deployed or misconfigured');
      return false;
    }
    
    try {
      const json = JSON.parse(responseText);
      console.log('✅ Successfully parsed JSON:', json);
      if (json.error) {
        console.log('✅ Vercel function is working (returned expected error)');
      } else {
        console.log('✅ Vercel function is working correctly');
      }
      return true;
    } catch (e) {
      console.error('❌ ERROR: Could not parse response as JSON');
      return false;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return false;
  }
}

// Run the test
testVercelFunction().then(success => {
  if (success) {
    console.log('🎉 Vercel function test completed successfully');
  } else {
    console.log('💥 Vercel function test failed');
  }
});