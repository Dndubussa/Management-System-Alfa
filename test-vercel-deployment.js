// Test script to verify Vercel deployment and API endpoints
async function testVercelDeployment() {
  try {
    console.log('🔍 Testing Vercel deployment and API endpoints...');
    
    // Get the current origin
    const origin = window.location.origin;
    console.log('📍 Current origin:', origin);
    
    // Test the vital signs API endpoint
    const vitalSignsUrl = `${origin}/api/vital-signs`;
    console.log('🧪 Testing vital signs endpoint:', vitalSignsUrl);
    
    // Test OPTIONS request (preflight)
    const optionsResponse = await fetch(vitalSignsUrl, {
      method: 'OPTIONS'
    });
    
    console.log('📋 OPTIONS response status:', optionsResponse.status);
    console.log('📋 OPTIONS response headers:', Object.fromEntries(optionsResponse.headers.entries()));
    
    // Test POST request with invalid data (should get JSON error, not HTML)
    const postResponse = await fetch(vitalSignsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        test: 'data'
      })
    });
    
    console.log('📤 POST response status:', postResponse.status);
    console.log('📤 POST response headers:', Object.fromEntries(postResponse.headers.entries()));
    
    const responseText = await postResponse.text();
    console.log('📤 POST response text (first 500 chars):', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
    
    // Check if response is HTML
    if (responseText.trim().startsWith('<!doctype') || responseText.trim().startsWith('<html') || responseText.trim().startsWith('<!DOCTYPE')) {
      console.error('❌ ERROR: Received HTML response instead of JSON');
      console.error('📝 This indicates the Vercel function is not deployed or misconfigured');
      return false;
    }
    
    // Try to parse as JSON
    try {
      const jsonResponse = JSON.parse(responseText);
      console.log('✅ Successfully parsed JSON response:', jsonResponse);
      console.log('✅ Vercel deployment appears to be working correctly');
      return true;
    } catch (parseError) {
      console.error('❌ ERROR: Could not parse response as JSON:', responseText.substring(0, 200));
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error testing Vercel deployment:', error.message);
    return false;
  }
}

// Run the test
testVercelDeployment().then(success => {
  if (success) {
    console.log('🎉 Vercel API test completed successfully');
  } else {
    console.log('💥 Vercel API test failed - check deployment and environment variables');
  }
});