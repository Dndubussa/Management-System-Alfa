// Test script to check if API endpoint is working correctly
// Run this in your browser console:

async function testApiEndpoint() {
  try {
    console.log('🔍 Testing API endpoint...');
    
    // Get the current origin
    const origin = window.location.origin;
    const apiUrl = `${origin}/api/vital-signs`;
    
    console.log('📍 Testing URL:', apiUrl);
    
    // Test OPTIONS request (preflight)
    console.log('🧪 Sending OPTIONS request...');
    const optionsResponse = await fetch(apiUrl, {
      method: 'OPTIONS'
    });
    
    console.log('📋 OPTIONS Response Status:', optionsResponse.status);
    console.log('📋 OPTIONS Response Headers:', Object.fromEntries(optionsResponse.headers.entries()));
    
    // Test POST request with minimal data
    console.log('🧪 Sending POST request...');
    const postResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        test: 'data'
      })
    });
    
    console.log('📋 POST Response Status:', postResponse.status);
    console.log('📋 POST Response Headers:', Object.fromEntries(postResponse.headers.entries()));
    
    const responseText = await postResponse.text();
    console.log('📋 POST Response Text (first 500 chars):', responseText.substring(0, 500));
    
    // Check if response is HTML (indicating routing issue)
    if (responseText.trim().startsWith('<!doctype') || responseText.trim().startsWith('<html') || responseText.trim().startsWith('<!DOCTYPE')) {
      console.error('❌ ERROR: Received HTML instead of JSON - This indicates a routing issue');
      console.error('📝 The API endpoint is not being handled by the Vercel function');
      return false;
    }
    
    // Try to parse as JSON
    try {
      const jsonResponse = JSON.parse(responseText);
      console.log('✅ Successfully parsed JSON response:', jsonResponse);
      
      if (jsonResponse.error) {
        console.log('✅ Vercel function is working (returned expected error response)');
      } else {
        console.log('✅ Vercel function is working correctly');
      }
      
      return true;
    } catch (parseError) {
      console.error('❌ ERROR: Could not parse response as JSON');
      console.error('📝 Response content:', responseText.substring(0, 200));
      return false;
    }
    
  } catch (error) {
    console.error('❌ Network error:', error);
    return false;
  }
}

// Run the test
testApiEndpoint().then(success => {
  if (success) {
    console.log('🎉 API endpoint test completed successfully');
  } else {
    console.log('💥 API endpoint test failed - check deployment and routing configuration');
  }
});