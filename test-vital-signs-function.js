// Test script to check if the Vercel vital signs function is working
async function testVitalSignsFunction() {
  try {
    console.log('🔍 Testing Vercel vital signs function...');
    
    // Get the current origin
    const origin = window.location.origin;
    const testUrl = `${origin}/api/vital-signs`;
    
    console.log('📍 Testing URL:', testUrl);
    
    // First, test with OPTIONS request
    console.log('🧪 Sending OPTIONS request...');
    const optionsResponse = await fetch(testUrl, { method: 'OPTIONS' });
    console.log('📋 OPTIONS response status:', optionsResponse.status);
    console.log('📋 OPTIONS response headers:', Object.fromEntries(optionsResponse.headers.entries()));
    
    // Then test with POST request (should get method not allowed for GET)
    console.log('🧪 Sending GET request...');
    const getResponse = await fetch(testUrl, { method: 'GET' });
    console.log('📋 GET response status:', getResponse.status);
    
    const getText = await getResponse.text();
    console.log('📋 GET response text (first 200 chars):', getText.substring(0, 200) + (getText.length > 200 ? '...' : ''));
    
    // Check if it's JSON or HTML
    if (getText.trim().startsWith('<!doctype') || getText.trim().startsWith('<html') || getText.trim().startsWith('<!DOCTYPE')) {
      console.error('❌ ERROR: Received HTML instead of JSON - Vercel function not deployed correctly');
      return false;
    }
    
    try {
      const jsonResult = JSON.parse(getText);
      console.log('✅ Successfully parsed JSON:', jsonResult);
      if (jsonResult.error === 'Method not allowed') {
        console.log('✅ Vercel function is deployed and working correctly');
        return true;
      }
    } catch (e) {
      console.error('❌ ERROR: Could not parse response as JSON');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error testing Vercel function:', error);
    return false;
  }
}

// Run the test
testVitalSignsFunction().then(success => {
  if (success) {
    console.log('🎉 Vercel function test completed successfully');
  } else {
    console.log('💥 Vercel function test failed - check deployment');
  }
});