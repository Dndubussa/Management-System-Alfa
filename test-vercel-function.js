// Test script to check if the Vercel vital signs function is working
async function testVercelFunction() {
  try {
    console.log('🔍 Testing Vercel vital signs function...');
    
    // Get the current origin
    const origin = window.location.origin;
    const testUrl = `${origin}/api/vital-signs`;
    
    console.log('📍 Testing URL:', testUrl);
    
    // Test with OPTIONS request (preflight)
    console.log('🧪 Sending OPTIONS request...');
    const optionsResponse = await fetch(testUrl, { method: 'OPTIONS' });
    console.log('📋 OPTIONS response status:', optionsResponse.status);
    console.log('📋 OPTIONS response headers:', Object.fromEntries(optionsResponse.headers.entries()));
    
    // Test with POST request with invalid data (should get JSON error, not HTML)
    console.log('🧪 Sending POST request with invalid data...');
    const postResponse = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        test: 'data'
      })
    });
    
    console.log('📋 POST response status:', postResponse.status);
    console.log('📋 POST response headers:', Object.fromEntries(postResponse.headers.entries()));
    
    const responseText = await postResponse.text();
    console.log('📋 POST response text (first 200 chars):', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
    
    // Check if it's JSON or HTML
    if (responseText.trim().startsWith('<!doctype') || responseText.trim().startsWith('<html') || responseText.trim().startsWith('<!DOCTYPE')) {
      console.error('❌ ERROR: Received HTML instead of JSON - Vercel function not deployed correctly');
      return false;
    }
    
    try {
      const jsonResult = JSON.parse(responseText);
      console.log('✅ Successfully parsed JSON:', jsonResult);
      if (jsonResult.error) {
        console.log('✅ Vercel function is deployed and working correctly (returned expected error)');
        return true;
      }
    } catch (e) {
      console.error('❌ ERROR: Could not parse response as JSON');
      return false;
    }
    
    console.log('🎉 Vercel function test completed successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error testing Vercel function:', error);
    return false;
  }
}

// Run the test
testVercelFunction().then(success => {
  if (success) {
    console.log('✅ Vercel function is working correctly');
  } else {
    console.log('💥 Vercel function test failed - check deployment');
  }
});